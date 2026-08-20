/**
 * Balance harness for Fable Falls.
 *
 * The three realm rebuilds before this one could only be balanced by
 * hand-stepping a Phaser loop inside a browser tab that reports
 * `document.hidden` — every number in their handovers came from driving
 * `game.step()` sixty times in a row through the automation bridge. The Falls
 * board is a plain reducer (`src/minigames/fallsBoard.js`) precisely so that
 * it can be balanced by running the real game code here instead.
 *
 * Each play style below is a policy: given a board, pick the next action. The
 * numbers this prints are therefore the numbers the game actually produces,
 * not a model of them. Run it after touching either the outcome table in
 * fallsBoard.js or the claim mix in realms.js:
 *
 *     node scripts/simulate-falls.mjs
 *
 * What has to stay true, per chapter:
 *   - "Ask the one right question" clears the target.
 *   - "Perfect instincts, never asks" does NOT — a hunch pays a token.
 *   - "Ask everything" does NOT — questions cost water, so caution is not
 *     free and triage is the skill.
 *   - "Let everything go" and "pass everything on" both fail.
 *   - A player who touches nothing fails.
 */

import { REALM_BY_ID } from '../src/data/realms.js';
import { ask, commit, answerDecision, createBoard } from '../src/minigames/fallsBoard.js';

const levels = REALM_BY_ID.fablefalls.bands.higher.game.levels;

/** What a player who has read the findings knows to do. */
const RIGHT = { false: 'drop', matters: 'pass', harmless: 'drop' };

/** The oldest thing on the board — everyone here triages the same way. */
const oldest = (s) => [...s.board].sort((a, b) => a.arrived - b.arrived)[0];

const claim = (s, id) => s.level.claims.find((c) => c.id === id);

/** Cracking questions this chapter actually opens. */
const crackers = (s, id) =>
  (claim(s, id).cracks ?? []).filter((t) => s.level.tools.includes(t));

const duds = (s, id) =>
  s.level.tools.filter((t) => !(claim(s, id).cracks ?? []).includes(t));

const STYLES = {
  'Ask the one right question': (s) => {
    const slot = oldest(s);
    if (slot.found.length === 0) return ['ask', slot.id, crackers(s, slot.id)[0]];
    return ['commit', slot.id, RIGHT[claim(s, slot.id).kind]];
  },

  'Perfect instincts, never asks': (s) => {
    const slot = oldest(s);
    return ['commit', slot.id, RIGHT[claim(s, slot.id).kind]];
  },

  'Asks all four, every time': (s) => {
    const slot = oldest(s);
    const left = s.level.tools.filter((t) => !slot.found.some((f) => f.tool === t));
    if (left.length > 0) return ['ask', slot.id, left[0]];
    return ['commit', slot.id, RIGHT[claim(s, slot.id).kind]];
  },

  'One wrong question, then commits': (s) => {
    const slot = oldest(s);
    if (slot.found.length === 0) {
      const dud = duds(s, slot.id)[0];
      if (dud) return ['ask', slot.id, dud];
    }
    return ['commit', slot.id, RIGHT[claim(s, slot.id).kind]];
  },

  'Lets everything go, unasked': (s) => ['commit', oldest(s).id, 'drop'],
  'Passes everything on, unasked': (s) => ['commit', oldest(s).id, 'pass'],


  /* ---- the chapter-claim tests -------------------------------------------
     Each chapter asserts that a particular question is the one that cracks
     its hard claims. These policies try to win *while ignoring that
     question*, using perfect instincts everywhere else. If one of them
     clears the target, the chapter's claim is undone by its own scoring —
     which is exactly the bug Privacy Peaks chapter 2 shipped with, where a
     spyglass-only player passed at 87/82 and the clamp hid it. Fix that in
     the claim mix, not the dials. */

  'Source only, ignores the rest': (s) => {
    const slot = oldest(s);
    if (slot.found.length === 0 && s.level.tools.includes('source')) {
      return ['ask', slot.id, 'source'];
    }
    return ['commit', slot.id, RIGHT[claim(s, slot.id).kind]];
  },

  'Never asks Evaluate': (s) => {
    const slot = oldest(s);
    if (slot.found.length === 0) {
      const t = crackers(s, slot.id).find((x) => x !== 'evaluate')
        ?? s.level.tools.find((x) => x !== 'evaluate');
      if (t) return ['ask', slot.id, t];
    }
    return ['commit', slot.id, RIGHT[claim(s, slot.id).kind]];
  },

  'Asks well, but drops anything alarming': (s) => {
    const slot = oldest(s);
    const c = claim(s, slot.id);
    if (slot.found.length === 0) return ['ask', slot.id, crackers(s, slot.id)[0]];
    return ['commit', slot.id, c.alarming ? 'drop' : RIGHT[c.kind]];
  },

  /* The triage a good player converges on: spend nothing on the dull ones.
     Nothing in the game tells them which are dull, so this is the ceiling,
     not a realistic score — it is here to check the ceiling is reachable. */
  'Right question, skips the dull ones': (s) => {
    const slot = oldest(s);
    const kind = claim(s, slot.id).kind;
    if (kind !== 'harmless' && slot.found.length === 0) {
      return ['ask', slot.id, crackers(s, slot.id)[0]];
    }
    return ['commit', slot.id, RIGHT[kind]];
  },
};

/** Play one chapter to the end under one policy. */
function play(level, policy) {
  let s = createBoard(level);
  let guard = 0;
  while (!s.over && guard++ < 400) {
    if (s.frozen) {
      s = answerDecision(s, true);
      continue;
    }
    const [kind, id, arg] = policy(s);
    const before = s.t;
    s = kind === 'ask' ? ask(s, id, arg) : commit(s, id, arg);
    if (s.t === before) throw new Error(`policy stalled on ${id}/${arg}`);
  }
  const drifted = s.done.filter((d) => d.action === 'drift').length;
  return { clarity: s.clarity, actions: s.t, drifted };
}

/** Touch nothing at all: every claim goes past. */
function playPassive(level) {
  // Nothing can drift without an action, so a truly passive player never even
  // starts the water. Score them where they stand: the chapter's start.
  return { clarity: level.startClarity ?? 36, actions: 0, drifted: 0 };
}

const pad = (s, n) => String(s).padEnd(n);
const mark = (c, t) => (c >= t ? '✓' : '✗');

for (const level of levels) {
  console.log(`\n=== ${level.chapter} — ${level.name}`);
  console.log(
    `    tools ${level.tools.join('/')} · board ${level.board} · drift ${level.drift} · ` +
      `start ${level.startClarity} · target ${level.target}`,
  );
  const kinds = level.claims.reduce((a, c) => ({ ...a, [c.kind]: (a[c.kind] ?? 0) + 1 }), {});
  console.log(`    claims: ${Object.entries(kinds).map(([k, v]) => `${v} ${k}`).join(', ')}`);
  console.log('');

  for (const [name, policy] of Object.entries(STYLES)) {
    const r = play(level, policy);
    console.log(
      `    ${pad(name, 32)} ${pad(r.clarity, 4)} ${mark(r.clarity, level.target)}  ` +
        `(${r.actions} actions, ${r.drifted} went past)`,
    );
  }
  const p = playPassive(level);
  console.log(`    ${pad('Touches nothing', 32)} ${pad(p.clarity, 4)} ${mark(p.clarity, level.target)}`);
}
console.log('');
