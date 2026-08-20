/**
 * Bully Bog P1–P3: "The Water" — the rules, with no React in them.
 *
 * The realm used to end in a two-bin sort: eight comments, drop each into
 * "Send It" or "Leave It". The P4–P6 rebuild threw the same board out and its
 * handover named the reason in one line — *sorting comments into two tidy
 * piles* against a rule that says *acting is hard and doing nothing is easy*.
 * That verdict applies here word for word. It was never a P4–P6 problem.
 *
 * Being unkind is not hard to identify. Every child in P1 can tell you that
 * "lol that was so bad 💀" is mean; not one of them needs a drag-and-drop to
 * find out. What is hard — the actual thing this realm exists to teach — is
 * **saying something while it is happening**, when it is easier to scroll, and
 * when whatever you say is going to be read by the people doing it.
 *
 * So nothing is sorted. Pockets is in the water, comments are landing, and
 * they keep landing whether or not you do anything. Two meters, both of which
 * the story already describes in its own words: the **water** goes dark, and
 * **Pockets sinks lower in it**. You have four things you can do, and each
 * takes one turn, and a comment lands every turn regardless — so you cannot
 * out-type a pile-on, which is the truest thing in the whole realm.
 *
 * The arithmetic, and the one design decision worth defending:
 *
 *  - **Watching is free and it is the losing line.** Every turn spent
 *    watching, the water darkens by exactly what the next comment weighs.
 *    Nothing punishes you. Nothing needs to.
 *  - **One kind sentence really is enough** — `kind` is the only thing that
 *    lifts Pockets, and one of them lifts a lot. The rule says "as small as
 *    one kind sentence" and the numbers had better agree with the rule.
 *  - **Being mean back darkens the water too.** It is not scored as a smaller
 *    wrong or a wash; it is the same water. Pockets is also watching.
 *  - **Telling an adult ends the comments — and does nothing at all for
 *    Pockets.** This is the piece the sort board could not contain, and it is
 *    why there are two meters rather than one. Telling is always right, is
 *    never penalised, and stops the pile-on cold; but a player who tells
 *    immediately and does nothing else finishes with a clear pond and a frog
 *    still sitting at the bottom of it, below target, and the debrief says
 *    precisely that. Both halves of the rule, or neither.
 *
 * Order is deliberately *not* the lesson: kind-then-tell and tell-then-kind
 * both clear it. `scripts/simulate-lower.mjs` checks that they do.
 */

const clamp = (n) => Math.max(0, Math.min(100, n));

/** What each thing you can do is worth. */
export const MOVES = {
  kind: { water: 4, pockets: 0, ok: true }, // pockets comes from KIND_LADDER
  back: { water: -11, pockets: -5, ok: false },
  tell: { water: 14, pockets: 0, ok: true },
  watch: { water: 0, pockets: 0, ok: null },
};

/**
 * What the first kind sentence is worth, then the second, then the rest.
 *
 * The rule says standing up "can be as small as one kind sentence", so the
 * first one has to be worth most — otherwise the winning strategy is to say
 * six of them, and the game would be teaching that saying something once
 * isn't enough. It is. The ladder is shallow rather than a cliff, though: a
 * child who wants to keep talking to Pockets is not doing anything wrong, and
 * shouldn't watch the meter punish them for it.
 */
export const KIND_LADDER = [16, 12, 9, 7, 6];

export function createWater(level) {
  const state = {
    level,
    t: 0,
    i: 0, // how many comments have landed
    water: level.startWater ?? 62,
    pockets: level.startPockets ?? 34,
    told: false,
    saidKind: 0,
    done: [],
    last: null,
    over: false,
  };
  return state;
}

/** The comment that lands at the end of this turn, if the pile-on is still on. */
export const nextComment = (state) =>
  state.told ? null : (state.level.comments[state.i] ?? null);

/** Comments already in the water, newest last. */
export const landed = (state) => state.level.comments.slice(0, state.i);

/**
 * Take one turn: 'kind', 'back', 'tell', or 'watch'.
 *
 * Everything costs the same — one turn — which is the point. Saying something
 * kind is not slower than scrolling past, it is just harder.
 */
export function act(prev, move) {
  if (prev.over) return prev;
  const m = MOVES[move];
  if (!m) return prev;

  const state = { ...prev };
  const lift =
    move === 'kind'
      ? KIND_LADDER[Math.min(state.saidKind, KIND_LADDER.length - 1)]
      : m.pockets;
  state.water = clamp(state.water + m.water);
  state.pockets = clamp(state.pockets + lift);
  if (move === 'tell') state.told = true;
  if (move === 'kind') state.saidKind += 1;

  const note =
    move === 'kind'
      ? (state.level.kindNotes?.[Math.min(state.saidKind - 1, (state.level.kindNotes?.length ?? 1) - 1)]
        ?? state.level.kindNote)
      : state.level[`${move}Note`];
  state.done = [...state.done, { turn: state.t, move, note, ok: m.ok }];
  state.last = { ok: m.ok, note, water: m.water, pockets: lift };

  // Then the bog carries on being the bog.
  const comment = nextComment(state);
  if (comment) {
    state.water = clamp(state.water - comment.weight);
    state.pockets = clamp(state.pockets - comment.sting);
    state.i += 1;
    state.last = { ...state.last, comment };
  }

  state.t += 1;
  if (state.t >= (state.level.turns ?? 8)) state.over = true;
  return state;
}

/**
 * Stop here.
 *
 * Only offered once the comments have actually stopped. It is safe to give
 * the player this button because leaving early can never *gain* them
 * anything — kindness only ever lifts Pockets, so every turn they hand back
 * is a turn they could have scored in. Without it, a child who did both
 * halves correctly on turn two spends the rest of the round clicking "say
 * something kind" into a silent pond, which is a dead patch a seven-year-old
 * does not deserve. Found by playing it.
 */
export function finish(prev) {
  if (prev.over) return prev;
  return { ...prev, over: true };
}

/**
 * One number out of two meters, because the passport stamp needs one. They
 * are weighted evenly on purpose: a clear pond with a sunk frog and a cheerful
 * frog in black water are the same failure seen from two sides.
 */
export const waterScore = (state) => Math.round((state.water + state.pockets) / 2);
export const waterPassed = (state) => waterScore(state) >= (state.level.target ?? 72);
