/**
 * Passworld P1–P3: "Who's Knocking" — the rules, with no React in them.
 *
 * The realm used to end in a two-bin sort: nine cards, drag each into "Keep
 * It Locked" or "Safe to Share". It is a tidy little game and it teaches the
 * wrong model of the world.
 *
 * The fault is precise. That board says **danger is a property of the fact** —
 * that the word "address" is hazardous and the word "nickname" is not — when
 * the realm's own story is about *a person asking*. Keeper Vex is a friendly
 * stranger with a clipboard; the whole beat is that the same question is fine
 * from one mouth and not from another. Sorting cards throws the mouth away
 * and leaves a vocabulary test, and a child who learns the vocabulary learns
 * the wrong lesson twice over: they will not tell the school nurse their own
 * name, and they will happily type their school into a game chat on a day
 * when "school" wasn't on the list they memorised.
 *
 * So the cards stay and the asker comes back. Someone knocks at the vault and
 * asks you for one thing. You tell them, or you keep it locked. The **same
 * card comes round more than once from different people** — your mum wants
 * the address for a form, a stranger in a game wants it too — and that is the
 * entire mechanic, because that is the entire rule.
 *
 * The arithmetic, and why it is shaped like this:
 *
 *  - Telling a safe asker scores as well as locking out an unsafe one. A
 *    player who locks *everything* cannot clear the vault. Refusing your own
 *    family is not the skill, and the realm's rule already says so out loud —
 *    "your favourite colour, your nickname, the games you love — share away".
 *  - But the penalties are **not** symmetrical: over-sharing costs about twice
 *    what over-locking does. Erring careful is genuinely better than erring
 *    open, and the numbers say so without pretending the two are equal.
 *  - **Passwords are absolute.** Every `secret: true` knock is wrong to answer
 *    no matter who is asking, including the askers a child would trust with
 *    anything else. That is the one line in this realm with no "it depends",
 *    and it is enforced by making the friendliest faces in the deck ask for
 *    it — so "tell anyone I know" is a losing strategy, measurably, rather
 *    than a strategy the game happens not to test.
 *
 * See `scripts/simulate-lower.mjs`, which plays this file. The policy called
 * "Sorts by the old card list" is the one that matters most: it plays the
 * mechanic this one replaced — lock the five scary words, share the four safe
 * ones — and it has to fail, or nothing here was worth changing.
 */

const clamp = (n) => Math.max(0, Math.min(100, n));

/**
 * What a knock is worth.
 *
 * `give` is the player telling them; `lock` is keeping it shut. Each knock in
 * the data says whether telling was the right call (`ok: true`), and the four
 * cells below are the whole scoring table.
 */
export const KNOCK_OUTCOMES = {
  // Telling someone who really did need it, and had a reason you could see.
  giveOk: { d: 5, ok: true },
  // Locking out someone safe. A cost, but a small one — see the header.
  lockOk: { d: -6, ok: false },
  // Telling someone who had no business asking. The expensive mistake.
  giveBad: { d: -9, ok: false },
  // Keeping it shut. What the realm is for.
  lockBad: { d: 5, ok: true },
};

export function createDoor(level) {
  return {
    level,
    i: 0,
    strength: level.startStrength ?? 40,
    done: [],
    last: null,
    over: level.knocks.length === 0,
  };
}

export const currentKnock = (state) => state.level.knocks[state.i] ?? null;

/**
 * Answer the knock at the door.
 *
 * `action` is 'give' or 'lock'. Nothing here is hidden from the player before
 * they choose — there is no information to buy, no question to spend. At this
 * age the judgement *is* the game, and the only thing on screen is who is
 * asking and what for.
 */
export function answer(prev, action) {
  if (prev.over) return prev;
  const knock = currentKnock(prev);
  if (!knock) return prev;

  const gave = action === 'give';
  const right = knock.ok === true;
  const cell = gave
    ? right
      ? KNOCK_OUTCOMES.giveOk
      : KNOCK_OUTCOMES.giveBad
    : right
      ? KNOCK_OUTCOMES.lockOk
      : KNOCK_OUTCOMES.lockBad;

  const state = { ...prev };
  state.strength = clamp(state.strength + cell.d);
  state.done = [
    ...state.done,
    {
      id: knock.id,
      who: knock.who,
      wants: knock.wants,
      ask: knock.ask,
      secret: Boolean(knock.secret),
      action,
      delta: cell.d,
      ok: cell.ok,
      // The debrief says *why this asker*, never "address is private" — the
      // realm has spent the whole mechanic saying that isn't the question.
      note: gave ? knock.gaveNote : knock.lockNote,
    },
  ];
  state.last = { ok: cell.ok, delta: cell.d, note: state.done[state.done.length - 1].note };
  state.i += 1;
  if (state.i >= state.level.knocks.length) state.over = true;
  return state;
}

export const doorPassed = (state) => state.strength >= (state.level.target ?? 80);
