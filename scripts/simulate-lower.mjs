/**
 * Balance harness for all five P1–P3 realms.
 *
 * Same trick as `simulate-falls.mjs`, five times over: each lower-band
 * mini-game is a plain reducer with no React and no DOM in it, so the numbers
 * printed here come from running the actual game code rather than from a
 * model of it. Run it after touching any outcome table or any claim/knock/
 * comment/tale list:
 *
 *     node scripts/simulate-lower.mjs
 *
 * Each realm below carries a CLAIMS block: the things that realm's rebuild
 * asserts, written as policies that must pass or must fail. A rebuild that
 * cannot state its claims as arithmetic hasn't got a mechanic, it has a
 * decorated quiz — and the two chapter-3 bugs the Fable Falls rebuild caught
 * were both cases of a claim quietly failing while the clamp at 100 hid it.
 * `node scripts/simulate-lower.mjs` exits non-zero if any claim breaks.
 *
 * The claim that matters most, across the whole band, is the one named
 * "Sorts by the old card list" in Passworld. It plays the exact strategy the
 * mechanic it replaced rewarded. If it ever clears the target again, the
 * rebuild has come undone.
 */

import { REALM_BY_ID } from '../src/data/realms.js';
import { answer, createDoor, currentKnock, doorPassed } from '../src/minigames/vaultDoor.js';
import { chatPassed, createChat, currentMessage, respond } from '../src/minigames/fogChat.js';
import { act, createWater, waterPassed, waterScore } from '../src/minigames/bogWater.js';
import {
  answerGlimmer,
  commitPlan,
  createEvening,
  eveningPassed,
  eveningScore,
  pick,
} from '../src/minigames/bayPlan.js';
import { createFalls, currentTale, decide, fallsPassed, runCheck } from '../src/minigames/fallsCheck.js';

const RESULTS = [];
let broken = 0;

/* ---------------------------------------------------------------- Passworld */

const doorLevel = REALM_BY_ID.passworld.bands.lower.game;

/** The old two-bin sort's answer key, as a strategy. */
const OLD_SHARE_LIST = ['your nickname', 'your favourite game', 'your favourite colour'];

const DOOR_STYLES = {
  'Reads who is asking': (s) => (currentKnock(s).ok ? 'give' : 'lock'),

  /* The rebuild's reason for existing. This is precisely what the two-bin
     sort rewarded: five scary words locked, four safe words shared, asker
     ignored. It has to fail, or the sort was fine and this was all noise. */
  'Sorts by the old card list': (s) =>
    OLD_SHARE_LIST.includes(currentKnock(s).wants) ? 'give' : 'lock',

  'Tells anyone they recognise': (s) => {
    const k = currentKnock(s);
    const known = ['Mum', 'Dad', 'Gran', 'The school nurse', 'Ade, your best friend'];
    return known.includes(k.who) ? 'give' : 'lock';
  },

  'Recognises faces, but never a password': (s) => {
    const k = currentKnock(s);
    if (k.secret) return 'lock';
    const known = ['Mum', 'Dad', 'Gran', 'The school nurse', 'Ade, your best friend'];
    return known.includes(k.who) ? 'give' : 'lock';
  },

  'Locks everything': () => 'lock',
  'Tells everyone everything': () => 'give',
};

function playDoor(policy) {
  let s = createDoor(doorLevel);
  let guard = 0;
  while (!s.over && guard++ < 200) s = answer(s, policy(s));
  const slips = s.done.filter((d) => d.secret && d.action === 'give').length;
  return { score: s.strength, passed: doorPassed(s), extra: `${slips} password slip(s)` };
}

/* ------------------------------------------------------------ Privacy Peaks */

const chatLevel = REALM_BY_ID.privacy.bands.lower.game;

const CHAT_STYLES = {
  'Answers the friendly ones, stops, tells': (s) => {
    const m = currentMessage(s);
    if (!m.flag) return 'reply';
    return s.seenFlag ? 'tell' : 'ignore';
  },
  'Stops and tells the moment it turns': (s) => (currentMessage(s).flag ? 'tell' : 'reply'),
  'Spots everything, tells nobody': (s) => (currentMessage(s).flag ? 'ignore' : 'reply'),
  'Replies to absolutely everything': () => 'reply',
  'Says nothing to anyone, ever': () => 'ignore',
  /* Never punished, by design — see the header of fogChat.js. It fails by
     scoring little, not by being marked wrong, and the game says so. */
  'Tells an adult on the very first hello': () => 'tell',
};

function playChat(policy) {
  let s = createChat(chatLevel);
  let guard = 0;
  while (!s.over && guard++ < 200) s = respond(s, policy(s));
  const last = s.done[s.done.length - 1];
  return {
    score: s.trust,
    passed: chatPassed(s),
    extra: s.told ? 'told an adult' : `never told (${last?.action})`,
  };
}

/* ---------------------------------------------------------------- Bully Bog */

const waterLevel = REALM_BY_ID.bullybog.bands.lower.game;

const WATER_STYLES = {
  'One kind word, then tells': (s) => (s.t === 0 ? 'kind' : s.told ? 'kind' : 'tell'),
  'Tells first, then talks to Pockets': (s) => (s.told ? 'kind' : 'tell'),
  /* Both halves, in either order, must clear it — order is not the lesson. */
  'Two kind words, then tells': (s) => (s.t < 2 ? 'kind' : s.told ? 'kind' : 'tell'),
  'Only ever says something kind': () => 'kind',
  'Only ever tells, says nothing else': (s) => (s.told ? 'watch' : 'tell'),
  'Gives them a taste of it': () => 'back',
  'Watches': () => 'watch',
};

function playWater(policy) {
  let s = createWater(waterLevel);
  let guard = 0;
  while (!s.over && guard++ < 200) s = act(s, policy(s));
  return {
    score: waterScore(s),
    passed: waterPassed(s),
    extra: `water ${s.water}, Pockets ${s.pockets}`,
  };
}

/* -------------------------------------------------------------- Balance Bay */

const bayLevel = REALM_BY_ID.balance.bands.lower.game;
const screenIds = bayLevel.items.filter((i) => i.screen).map((i) => i.id);
const lifeIds = bayLevel.items.filter((i) => !i.screen).map((i) => i.id);

/** Build a plan with `n` screen blocks, alternating so the night interleaves. */
function planOf(n) {
  const out = [];
  for (let i = 0; i < 6; i += 1) {
    const wantScreen = out.filter((id) => screenIds.includes(id)).length < n;
    const wantLife = out.filter((id) => lifeIds.includes(id)).length < 6 - n;
    if (wantScreen && (i % 2 === 0 || !wantLife)) out.push(screenIds[out.filter((id) => screenIds.includes(id)).length]);
    else out.push(lifeIds[out.filter((id) => lifeIds.includes(id)).length]);
  }
  return out;
}

function playBay(screens, stickPolicy) {
  let s = createEvening(bayLevel);
  for (const id of planOf(screens)) s = pick(s, id);
  s = commitPlan(s);
  let guard = 0;
  while (!s.over && guard++ < 60) {
    if (s.asking) s = answerGlimmer(s, stickPolicy(s));
    else break;
  }
  const score = eveningScore(s);
  return {
    score: score.total,
    passed: eveningPassed(s, score),
    extra: `plan ${score.plan} + kept ${score.kept} · ${s.stuck}/${s.asks} held · ate ${s.displaced.length}`,
  };
}

const BAY_STYLES = {
  'Balanced plan, holds to it': () => playBay(3, () => true),
  'Two screens, holds to it': () => playBay(2, () => true),
  'Four screens, holds to it': () => playBay(4, () => true),
  /* The number this realm exists to produce. */
  'Balanced plan, gives in every time': () => playBay(3, () => false),
  'Balanced plan, gives in about half': () => playBay(3, (s) => s.asks % 2 === 0),
  'All screens, holds to it': () => playBay(6, () => true),
  'No screens at all': () => playBay(0, () => true),
  'Five screens, holds to it': () => playBay(5, () => true),
};

/* -------------------------------------------------------------- Fable Falls */

const fallsLevel = REALM_BY_ID.fablefalls.bands.lower.game;
const RIGHT = { false: 'drop', true: 'pass' };

function playFalls(policy) {
  let s = createFalls(fallsLevel);
  let guard = 0;
  while (!s.over && guard++ < 200) {
    const [kind, arg] = policy(s);
    s = kind === 'check' ? runCheck(s, arg) : decide(s, arg);
  }
  return { score: s.water, passed: fallsPassed(s) };
}

const FALLS_STYLES = {
  'Picks the check that fits': (s) => {
    const t = currentTale(s);
    if (!s.checks.includes(t.settledBy)) return ['check', t.settledBy];
    return ['decide', RIGHT[t.kind]];
  },
  /* Thoroughness must CLEAR the target. Triage is the P4–P6 lesson; failing
     an eight-year-old for checking twice would teach the opposite of this
     realm's own rule. See the header of fallsCheck.js. */
  'Checks both ways, every time': (s) => {
    const t = currentTale(s);
    if (s.checks.length < 2) return ['check', s.checks.includes('adult') ? 'elsewhere' : 'adult'];
    return ['decide', RIGHT[t.kind]];
  },
  /* The rule names two checks. Each of these ignores one of them, plays
     perfectly otherwise, and has to fail. */
  'Only ever asks a grown-up': (s) => {
    const t = currentTale(s);
    if (!s.checks.includes('adult')) return ['check', 'adult'];
    return ['decide', RIGHT[t.kind]];
  },
  'Only ever looks somewhere else': (s) => {
    const t = currentTale(s);
    if (!s.checks.includes('elsewhere')) return ['check', 'elsewhere'];
    return ['decide', RIGHT[t.kind]];
  },
  'Never checks, guesses perfectly': (s) => ['decide', RIGHT[currentTale(s).kind]],
  'Never checks, passes everything on': () => ['decide', 'pass'],
  'Never checks, lets everything go': () => ['decide', 'drop'],
};

/* ------------------------------------------------------------------ running */

const pad = (s, n) => String(s).padEnd(n);

/**
 * `claims` maps a policy name to whether it MUST clear the target. Anything
 * listed there is checked; anything not listed is printed for information.
 */
function report(title, meta, rows, claims) {
  console.log(`\n=== ${title}`);
  console.log(`    ${meta}\n`);
  for (const [name, r] of rows) {
    const want = claims[name];
    let flag = ' ';
    if (want !== undefined && want !== r.passed) {
      flag = '!';
      broken += 1;
      RESULTS.push(`${title}: "${name}" should ${want ? 'pass' : 'fail'} and did not (${r.score})`);
    }
    console.log(
      `  ${flag} ${pad(name, 40)} ${pad(r.score, 4)} ${r.passed ? '✓' : '✗'}` +
        (r.extra ? `   ${r.extra}` : ''),
    );
  }
}

report(
  'Passworld P1–P3 — Who’s Knocking',
  `${doorLevel.knocks.length} knocks · start ${doorLevel.startStrength} · target ${doorLevel.target}`,
  Object.entries(DOOR_STYLES).map(([n, p]) => [n, playDoor(p)]),
  {
    'Reads who is asking': true,
    'Sorts by the old card list': false,
    'Tells anyone they recognise': false,
    'Recognises faces, but never a password': false,
    'Locks everything': false,
    'Tells everyone everything': false,
  },
);

report(
  'Privacy Peaks P1–P3 — The Conversation',
  `${chatLevel.messages.length} messages · start ${chatLevel.startTrust} · target ${chatLevel.target}`,
  Object.entries(CHAT_STYLES).map(([n, p]) => [n, playChat(p)]),
  {
    'Answers the friendly ones, stops, tells': true,
    'Stops and tells the moment it turns': true,
    'Spots everything, tells nobody': false,
    'Replies to absolutely everything': false,
    'Says nothing to anyone, ever': false,
    'Tells an adult on the very first hello': false,
  },
);

report(
  'Bully Bog P1–P3 — The Water',
  `${waterLevel.turns} turns · ${waterLevel.comments.length} comments · target ${waterLevel.target}`,
  Object.entries(WATER_STYLES).map(([n, p]) => [n, playWater(p)]),
  {
    'One kind word, then tells': true,
    'Tells first, then talks to Pockets': true,
    'Two kind words, then tells': true,
    'Only ever says something kind': false,
    'Only ever tells, says nothing else': false,
    'Gives them a taste of it': false,
    Watches: false,
  },
);

report(
  'Balance Bay P1–P3 — The Promise',
  `${bayLevel.slots} blocks · target ${bayLevel.target}`,
  Object.entries(BAY_STYLES).map(([n, p]) => [n, p()]),
  {
    'Balanced plan, holds to it': true,
    'Two screens, holds to it': true,
    'Four screens, holds to it': true,
    'Balanced plan, gives in every time': false,
    'Balanced plan, gives in about half': false,
    'All screens, holds to it': false,
    'No screens at all': false,
    'Five screens, holds to it': false,
  },
);

report(
  'Fable Falls P1–P3 — Stop and Check',
  `${fallsLevel.tales.length} tales · start ${fallsLevel.startWater} · target ${fallsLevel.target}`,
  Object.entries(FALLS_STYLES).map(([n, p]) => [n, playFalls(p)]),
  {
    'Picks the check that fits': true,
    'Checks both ways, every time': true,
    'Only ever asks a grown-up': false,
    'Only ever looks somewhere else': false,
    'Never checks, guesses perfectly': false,
    'Never checks, passes everything on': false,
    'Never checks, lets everything go': false,
  },
);

console.log('');
if (broken) {
  console.log(`${broken} claim(s) broken:`);
  for (const line of RESULTS) console.log(`  - ${line}`);
  process.exit(1);
}
console.log('All claims hold.\n');
