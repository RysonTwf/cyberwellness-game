/**
 * Fable Falls P4–P6: "The Falls" — the rules, with no React and no Phaser in
 * them.
 *
 * The realm used to be one Detective/Compare board: the trusted original in
 * the left column, the version going round in the right, mark every line that
 * doesn't match. That mechanic quietly teaches the wrong thing, and it's a
 * specific wrong thing: **it hands you the verified original for free.**
 *
 * Going and getting the original *is* Research — one of the four letters the
 * realm's own rule is built on — and the board pre-completed it. With both
 * columns on screen the task collapses into diffing two texts, which is
 * reading comprehension, not media literacy. S.U.R.E. ended up as four labels
 * printed on the debrief notes rather than four things you do. And the rule
 * says S.U.R.E. is for the moment something *makes you want to react fast*,
 * while the board could be studied forever at no cost at all.
 *
 * So the comparison stays and the free answer goes. Claims come down the
 * Falls one at a time. You see only what a claim says about itself. The right
 * column starts **empty**, and you fill it in by spending questions:
 *
 *   Source     who actually posted this, and have they ever posted before?
 *   Understand what is it claiming, exactly — all of it, not the caption?
 *   Research   can you find this anywhere else you already trust?
 *   Evaluate   does it add up, or is it too perfect, too shocking, too timely?
 *
 * Then you commit: pass it on, or let it go.
 *
 * Why it's built this way — the mechanic is the lesson, not decoration:
 *
 *  - Committing a claim you never cracked scores a token +3 **even when you
 *    are right**. Committing after the question that actually settles it
 *    scores +10. A player who trusts their gut and never asks anything
 *    mathematically cannot clear the water, however good their instincts are.
 *  - Only one or two of the four questions settle any given claim. The others
 *    return findings that are perfectly *true and not decisive* — the same
 *    wording pattern Privacy Peaks uses for a spyglass line that proves
 *    nothing. Asking the wrong question is not punished with a buzzer; it is
 *    punished with the thing it actually costs you, below.
 *  - **Time is the only currency, and your own questions spend it.** Every
 *    action — a question or a commit — moves the Falls one step. A claim left
 *    on the board too long goes downstream: it spread while you were busy,
 *    and it is scored as such. So checking everything four ways fails just as
 *    hard as checking nothing, and the real skill is picking *which one
 *    question* cracks *this* claim.
 *  - Being suspicious of everything fails too. Some claims are true and
 *    matter — a real notice, a real correction — and letting one of those go
 *    costs you. "Trust nothing" is not media literacy either.
 *
 * Nothing here tells the player which claim is which until the debrief. A
 * finding is a fact, never a verdict, and the board never says "solved" —
 * that would be the answer sheet. `cracks` exists for the scoring, not for
 * the display. See FallsStoryRealm.jsx, which owns every pixel of this.
 *
 * Being a plain reducer is deliberate and load-bearing: the last three realm
 * rebuilds could only be balanced by hand-stepping a Phaser loop through a
 * browser tab that reports `document.hidden`, and every number in their
 * handovers came from that. This one is balanced by running *the actual game
 * code* in Node — see `scripts/simulate-falls.mjs`. Keep it free of React and
 * of the DOM, or that goes away.
 */

/** The four questions, in S.U.R.E. order. Chapters open them one at a time. */
export const TOOLS = [
  {
    id: 'source',
    letter: 'S',
    name: 'Source',
    ask: 'Who actually posted this, and have they ever posted anything before?',
  },
  {
    id: 'understand',
    letter: 'U',
    name: 'Understand',
    ask: 'What is it claiming, exactly — the whole thing, not just the caption?',
  },
  {
    id: 'research',
    letter: 'R',
    name: 'Research',
    ask: 'Can I find this anywhere else I already trust?',
  },
  {
    id: 'evaluate',
    letter: 'E',
    name: 'Evaluate',
    ask: 'Does it add up, or is it a bit too perfect, too shocking, too timely?',
  },
];

export const TOOL_BY_ID = Object.fromEntries(TOOLS.map((t) => [t.id, t]));

/**
 * What a commit is worth.
 *
 * `cracked` is the branch taken when the player had already asked a question
 * that settles this claim; `raw` when they hadn't. The gap between the two
 * columns *is* the curriculum — being right by luck is worth under a third of
 * being right on purpose, and you cannot do luck again tomorrow.
 *
 * `false`    — untrue, or twisted far enough that passing it on does harm.
 * `matters`  — true, and somebody is better off for you passing it on.
 * `harmless` — true, and nothing much rides on it either way. The realm needs
 *              these: without them "is it interesting?" would be a winning
 *              strategy, and a player would learn to treat every dull true
 *              thing as a trick.
 */
export const OUTCOMES = {
  false: {
    drop: {
      cracked: { d: 10, ok: true, note: 'You found out what it was, and then you let it go.' },
      raw: { d: 3, ok: true, note: 'Right call — but that was a hunch, not a question.' },
    },
    pass: {
      cracked: {
        d: -6,
        ok: false,
        note: 'You had already found the hole in it, and you passed it on anyway.',
      },
      raw: { d: -6, ok: false, note: 'That one was not true, and now it is downstream with your name on it.' },
    },
  },
  matters: {
    pass: {
      cracked: { d: 10, ok: true, note: 'You checked, it held up, and you passed on something that helped.' },
      raw: { d: 3, ok: true, note: 'It was genuine — but you did not know that when you sent it.' },
    },
    drop: {
      cracked: {
        d: -6,
        ok: false,
        note: 'You checked, saw it was real and mattered, and sat on it anyway.',
      },
      raw: { d: -5, ok: false, note: 'That one was true and worth passing on. Doubting everything is not the skill either.' },
    },
  },
  harmless: {
    drop: {
      cracked: { d: 4, ok: true, note: 'True, and nothing rode on it. Letting it go was fine.' },
      raw: { d: 4, ok: true, note: 'True, and nothing rode on it. Letting it go was fine.' },
    },
    pass: {
      cracked: { d: 4, ok: true, note: 'True and harmless. Passing it on did no damage.' },
      raw: { d: 4, ok: true, note: 'True and harmless. Passing it on did no damage.' },
    },
  },
};

/**
 * What it costs when a claim ages off the board — it kept travelling without
 * you. Note that a *false* one costs most: while you were busy asking a
 * fourth question about something else, it spread.
 */
export const DRIFT = {
  false: { d: -4, ok: false, note: 'Gone downstream unchecked. It is still spreading, and now nobody stopped it.' },
  matters: { d: -3, ok: false, note: 'It went past you. Something true and useful never got passed on.' },
  harmless: { d: 0, ok: true, note: 'Drifted off. Nothing was riding on that one.' },
};

const clamp = (n) => Math.max(0, Math.min(100, n));

/**
 * A fresh board for one chapter.
 *
 * `level.board` claims are visible at once; a claim is carried away once it
 * has been on the board for more than `level.drift` actions. Those two were
 * chosen together and must stay that way — see `scripts/simulate-falls.mjs`.
 * With board 3 and two actions per claim (one right question, then commit),
 * the oldest claim on the board is six actions old when you reach it, so
 * `drift` under 7 makes perfect play impossible and `drift` far above it
 * makes asking all four questions free.
 */
export function createBoard(level) {
  const state = {
    level,
    t: 0,
    queue: level.claims.map((c) => c.id),
    board: [],
    done: [],
    clarity: level.startClarity ?? 36,
    frozen: false,
    decisionDue: false,
    decisionSettled: false,
    over: false,
    lastNote: null,
  };
  return refill(state);
}

const claimById = (state, id) => state.level.claims.find((c) => c.id === id);

/** Bring claims down the Falls until the board is full or the queue is dry. */
function refill(state) {
  const size = state.level.board ?? 3;
  while (state.board.length < size && state.queue.length > 0) {
    const id = state.queue[0];
    state.queue = state.queue.slice(1);
    state.board = [...state.board, { id, arrived: state.t, found: [], cracked: false }];

    // The realm's decision fires on a named claim rather than a count, so it
    // lands on the one the story is about (Privacy Peaks does the same). The
    // Falls stop dead while it is open — the claim is still sitting there.
    if (id === state.level.decisionOn && !state.decisionSettled) {
      state.frozen = true;
      state.decisionDue = true;
    }
  }
  if (state.board.length === 0 && state.queue.length === 0) state.over = true;
  return state;
}

/** Resolve one claim off the board, scoring it, and record what happened. */
function resolve(state, slot, action, outcome) {
  const claim = claimById(state, slot.id);
  state.clarity = clamp(state.clarity + outcome.d);
  state.board = state.board.filter((s) => s !== slot);
  state.done = [
    ...state.done,
    {
      id: claim.id,
      from: claim.from,
      text: claim.text,
      kind: claim.kind,
      action,
      cracked: slot.cracked,
      asked: slot.found.map((f) => f.tool),
      delta: outcome.d,
      ok: outcome.ok,
      note: outcome.note,
      why: claim.why,
    },
  ];
  state.lastNote = { note: outcome.note, ok: outcome.ok, delta: outcome.d };
  return state;
}

/** Carry away anything that has been sitting on the board too long. */
function drift(state) {
  const limit = state.level.drift ?? 9;
  for (const slot of [...state.board]) {
    if (state.t - slot.arrived <= limit) continue;
    resolve(state, slot, 'drift', DRIFT[claimById(state, slot.id).kind]);
  }
  return state;
}

/** One action: the Falls move, then anything left too long goes with them. */
function tick(state) {
  state.t += 1;
  drift(state);
  return refill(state);
}

const copy = (state) => ({ ...state, board: state.board.map((s) => ({ ...s })) });

/**
 * Ask one question of one claim. Costs an action, reveals one finding, and
 * never says whether the finding settled anything — that is the player's job,
 * and telling them would hand back the free answer this realm exists to take
 * away.
 */
export function ask(prev, id, tool) {
  if (prev.frozen || prev.over) return prev;
  const state = copy(prev);
  const slot = state.board.find((s) => s.id === id);
  if (!slot) return prev;
  if (!(state.level.tools ?? []).includes(tool)) return prev;
  if (slot.found.some((f) => f.tool === tool)) return prev;

  const claim = claimById(state, id);
  slot.found = [...slot.found, { tool, text: claim.findings[tool] }];
  if ((claim.cracks ?? []).includes(tool)) slot.cracked = true;
  state.lastNote = null;
  return tick(state);
}

/** Commit a claim: pass it on, or let it go. Costs an action. */
export function commit(prev, id, action) {
  if (prev.frozen || prev.over) return prev;
  const state = copy(prev);
  const slot = state.board.find((s) => s.id === id);
  if (!slot) return prev;

  const claim = claimById(state, id);
  const outcome = OUTCOMES[claim.kind][action][slot.cracked ? 'cracked' : 'raw'];
  resolve(state, slot, action, outcome);
  return tick(state);
}

/**
 * Answer the realm's decision. The safe answer starts the Falls again; the
 * unsafe one costs and hands the question straight back **without**
 * unfreezing, so it is never a dead end and never a way through either.
 */
export function answerDecision(prev, safe, cost = 10) {
  const state = copy(prev);
  if (!safe) {
    state.clarity = clamp(state.clarity - cost);
    return state;
  }
  state.frozen = false;
  state.decisionDue = false;
  state.decisionSettled = true;
  return state;
}

/** True once every claim in the chapter has been resolved one way or another. */
export const isOver = (state) => state.over;

/** Did this run clear the chapter? */
export const passed = (state) => state.clarity >= (state.level.target ?? 82);
