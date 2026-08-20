/**
 * Fable Falls P1–P3: "Stop and Check" — the rules, with no React in them.
 *
 * The realm used to end in the Detective/Compare board: the trusted original
 * in the left column, the version going round in the right, click every line
 * that doesn't match. The P4–P6 rebuild threw that board out and its handover
 * spelled out why — **it hands you the verified original for free**, and going
 * and getting the original is the check. The board pre-completed the lesson
 * and left a text diff.
 *
 * That fault is, if anything, sharper down here, because this band's rule is
 * shorter and says the quiet part out loud: 🛑 STOP, then ✅ **CHECK — ask a
 * trusted adult, or see if you can find it from another place.** The Compare
 * board printed the result of the check across the left-hand side of the
 * screen, labelled "you can go and read it", before the child had done
 * anything at all.
 *
 * So: tales come down the Falls one at a time, and you get the two checks the
 * rule actually names, as two buttons.
 *
 *   Ask a grown-up      — the check that settles things about *people*
 *   Look somewhere else — the check that settles things about *the world*
 *
 * Then you decide: pass it on, or let it go.
 *
 * How this differs from the P4–P6 board on purpose, because the two are now
 * the same idea at two sizes and the split should be deliberate:
 *
 *  - **There is no clock, and checking costs nothing.** Up in P4–P6, questions
 *    spend the water and checking everything four ways fails as hard as
 *    checking nothing — because triage is that band's lesson, stated in its
 *    chapter 2 by name. Triage is *not* this band's lesson, and a game that
 *    fails an eight-year-old for being thorough would be teaching the exact
 *    opposite of its own rule. Checking both ways here scores 9 against the
 *    right check's 10 and clears the target comfortably. The gradient is a
 *    nudge, never a punishment.
 *  - **Two checks, not four.** They are the two the rule names, and each is
 *    the one that settles roughly half the tales.
 *  - **A check hands back a fact, not a verdict** — the one thing kept
 *    verbatim from upstairs. "Mrs Tan says she asked Mia to help" settles it.
 *    "Two people in your class have heard it as well" does not settle
 *    anything, and it is true, and it is the most tempting line in the game.
 *    Nothing on screen ever says which is which.
 *
 * The arithmetic:
 *
 *  - Committing a tale you never checked scores +2 **even when you are
 *    right**, against +10 for the same call made after the check that settles
 *    it. Guessing well is worth a fifth of knowing.
 *  - Some tales are true and worth passing on. Letting everything go is not
 *    the safe answer and does not clear the water.
 *  - A wrong call costs the same whether or not you checked. Finding out and
 *    doing it anyway is not better than not knowing.
 *
 * The pair of policies that matter are "Only ever asks a grown-up" and "Only
 * ever looks somewhere else": each ignores half of the rule, plays perfectly
 * otherwise, and has to fail. See `scripts/simulate-lower.mjs`.
 */

const clamp = (n) => Math.max(0, Math.min(100, n));

/** The two checks the realm's rule names, in the order the rule names them. */
export const CHECKS = [
  {
    id: 'adult',
    label: 'Ask a grown-up',
    hint: 'A teacher, or someone at home — somebody who would actually know.',
  },
  {
    id: 'elsewhere',
    label: 'Look somewhere else',
    hint: 'The noticeboard, the school page — anywhere that isn’t whoever told you.',
  },
];

export const CHECK_BY_ID = Object.fromEntries(CHECKS.map((c) => [c.id, c]));

/**
 * What a decision is worth.
 *
 * `settled` — you had done the check that actually settles this one.
 * `both`    — you did both checks, so you got there, just not straight there.
 * `looked`  — you checked, but only with the one that doesn't settle this.
 * `raw`     — you never checked at all.
 */
export const TALE_SCORES = {
  right: { settled: 10, both: 9, looked: 2, raw: 2 },
  wrong: { settled: -9, both: -9, looked: -9, raw: -9 },
};

/** What the tale actually was, and therefore what the right call is. */
export const RIGHT_CALL = { false: 'drop', true: 'pass' };

export function createFalls(level) {
  return {
    level,
    i: 0,
    water: level.startWater ?? 24,
    checks: [], // check ids run on the tale currently in front of you
    done: [],
    last: null,
    over: level.tales.length === 0,
  };
}

export const currentTale = (state) => state.level.tales[state.i] ?? null;

/**
 * Run one of the two checks on the tale in front of you. Free, repeatable
 * across tales, and it never tells you what the finding means.
 */
export function runCheck(prev, checkId) {
  if (prev.over) return prev;
  const tale = currentTale(prev);
  if (!tale || prev.checks.includes(checkId)) return prev;
  if (!CHECK_BY_ID[checkId]) return prev;
  return { ...prev, checks: [...prev.checks, checkId], last: null };
}

/** Findings revealed so far on the tale in front of you. */
export function foundSoFar(state) {
  const tale = currentTale(state);
  if (!tale) return [];
  return state.checks.map((id) => ({ id, label: CHECK_BY_ID[id].label, text: tale.findings[id] }));
}

/** Decide: 'pass' it on, or 'drop' it. */
export function decide(prev, action) {
  if (prev.over) return prev;
  const tale = currentTale(prev);
  if (!tale) return prev;

  const right = RIGHT_CALL[tale.kind] === action;
  const band = prev.checks.includes(tale.settledBy)
    ? prev.checks.length > 1
      ? 'both'
      : 'settled'
    : prev.checks.length > 0
      ? 'looked'
      : 'raw';
  const d = TALE_SCORES[right ? 'right' : 'wrong'][band];

  const state = { ...prev };
  state.water = clamp(state.water + d);
  state.done = [
    ...state.done,
    {
      id: tale.id,
      from: tale.from,
      text: tale.text,
      kind: tale.kind,
      action,
      band,
      checks: prev.checks,
      delta: d,
      ok: right,
      note: right ? tale.rightNote : tale.wrongNote,
      why: tale.why,
    },
  ];
  state.last = state.done[state.done.length - 1];
  state.checks = [];
  state.i += 1;
  if (state.i >= state.level.tales.length) state.over = true;
  return state;
}

export const fallsPassed = (state) => state.water >= (state.level.target ?? 80);
