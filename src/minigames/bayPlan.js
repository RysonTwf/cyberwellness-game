/**
 * Balance Bay P1–P3: "The Promise" — the rules, with no React in them.
 *
 * The realm used to end in a planner: six slots between school and bed, tap
 * cards in, watch a scale tip. The P4–P6 rebuild's handover named the fault in
 * that board as *plan a tidy day from a god's-eye view* against a rule about
 * noticing things in the moment — and then replaced it with an in-the-moment
 * mechanic, which is the right answer for eleven-year-olds.
 *
 * It is not the right answer here, and this file is the argument for why.
 *
 * The P1–P3 rule is a different sentence: **"decide when you'll stop before
 * you start."** Planning is not the wrong idea for this band — planning is
 * *the* idea. The board's fault was narrower than the higher band's: it let
 * you plan, and then it graded the plan and stopped. Nothing ever came along
 * and asked you to break it. A promise that is never tested is not a promise;
 * it is a drawing of one, and the Glimmer — a character whose entire written
 * personality is asking you for one more — was standing right there unused.
 *
 * So the planner stays, and then **the evening actually happens.** You lay out
 * six blocks. You commit. Then you walk through them one at a time, and at
 * every screen block the Glimmer asks for one more, and you answer it against
 * a plan you made when the Glimmer was not talking to you.
 *
 * The arithmetic, which is the whole design:
 *
 *  - The plan is scored, and a balanced one scores best — but a perfect plan
 *    is worth **under half** of what you need. You cannot win by planning.
 *  - The evening is scored as *the fraction of the Glimmer's asks you held to*.
 *    A fraction, not a count, so a modest plan is not punished for giving the
 *    Glimmer fewer chances to ask.
 *  - **A plan with no screens in it earns nothing from the evening at all**,
 *    because the Glimmer never has to ask. That is not a loophole; it is the
 *    realm's second sentence made arithmetic — screens aren't the enemy, and
 *    cutting them out is not what winning looks like here. The debrief says
 *    so by name.
 *  - **"One more" is never one more.** Saying yes does not extend the current
 *    block, it *eats the next thing that wasn't a screen* — and that block,
 *    now a screen block, gets asked about too when you reach it. A player who
 *    says yes every time ends the night with six screen blocks whatever they
 *    planned, and watches homework, then dinner, then reading, then sleep go
 *    one at a time. Nothing in the scoring does that; the mechanic does it.
 *
 * The consequence is that "made a good plan and gave in every time" fails,
 * which is the single number this realm exists to produce.
 * `scripts/simulate-lower.mjs` checks it.
 */

const clamp = (n) => Math.max(0, Math.min(100, n));

/**
 * What the plan itself is worth, by how many of the six blocks are screens.
 * Peaks in the middle and never reaches the target on its own — the most a
 * plan can be is a good start.
 */
export const PLAN_SCORE = [18, 30, 44, 48, 40, 12, 4];

/** The most the evening can add, when every ask is held to. */
export const KEPT_MAX = 42;

export function createEvening(level) {
  return {
    level,
    phase: 'plan', // plan | evening | done
    picked: [], // item ids, in the order they go into the night
    blocks: [],
    at: 0,
    asking: false,
    asks: 0,
    stuck: 0,
    displaced: [], // what "one more" ate, in order
    pastBedtime: false,
    log: [],
    over: false,
  };
}

const itemById = (state, id) => state.level.items.find((i) => i.id === id);

/** Put a card into the night. */
export function pick(prev, id) {
  if (prev.phase !== 'plan') return prev;
  if (prev.picked.includes(id)) return prev;
  if (prev.picked.length >= (prev.level.slots ?? 6)) return prev;
  return { ...prev, picked: [...prev.picked, id] };
}

/** Take one back out. */
export function unpick(prev, index) {
  if (prev.phase !== 'plan') return prev;
  return { ...prev, picked: prev.picked.filter((_, i) => i !== index) };
}

export const planFull = (state) => state.picked.length === (state.level.slots ?? 6);
export const plannedScreens = (state) =>
  state.picked.filter((id) => itemById(state, id)?.screen).length;

/**
 * Lock the plan in and start the evening.
 *
 * This is the moment the realm is about, so it is a real one-way door: once
 * the night starts you cannot go back and rearrange it, any more than you can
 * at half past eight.
 */
export function commitPlan(prev) {
  if (prev.phase !== 'plan' || !planFull(prev)) return prev;
  const blocks = prev.picked.map((id) => {
    const item = itemById(prev, id);
    return { id: item.id, text: item.text, screen: item.screen, glimmer: false };
  });
  const state = { ...prev, phase: 'evening', blocks, at: 0 };
  return settle(state);
}

/** Walk forward until we hit a screen block the Glimmer wants to ask about. */
function settle(prev) {
  const state = { ...prev };
  while (state.at < state.blocks.length) {
    if (state.blocks[state.at].screen) {
      state.asking = true;
      return state;
    }
    state.log = [...state.log, { block: state.blocks[state.at], kind: 'quiet' }];
    state.at += 1;
  }
  state.asking = false;
  state.phase = 'done';
  state.over = true;
  return state;
}

export const currentBlock = (state) => state.blocks[state.at] ?? null;

/** The Glimmer's line for this ask, cycling if the night runs long. */
export const currentAsk = (state) =>
  state.level.asks[state.asks % state.level.asks.length];

/**
 * Answer the Glimmer: `true` to stick to the plan, `false` for one more.
 */
export function answerGlimmer(prev, stick) {
  if (prev.phase !== 'evening' || !prev.asking) return prev;
  const state = { ...prev, blocks: prev.blocks.map((b) => ({ ...b })) };
  state.asks += 1;

  if (stick) {
    state.stuck += 1;
    state.log = [...state.log, { block: state.blocks[state.at], kind: 'stuck' }];
  } else {
    // "One more" eats the next thing that wasn't a screen. If there is
    // nothing left to eat, it eats bedtime.
    const next = state.blocks.findIndex((b, i) => i > state.at && !b.screen);
    if (next === -1) {
      state.pastBedtime = true;
      state.log = [...state.log, { block: state.blocks[state.at], kind: 'bedtime' }];
    } else {
      const eaten = state.blocks[next];
      state.displaced = [...state.displaced, eaten.text];
      state.blocks[next] = {
        id: `${eaten.id}-glimmer`,
        text: state.level.oneMoreLabel ?? 'One more, with the Glimmer',
        screen: true,
        glimmer: true,
        ate: eaten.text,
      };
      state.log = [...state.log, { block: state.blocks[state.at], kind: 'gavein', ate: eaten.text }];
    }
  }

  state.asking = false;
  state.at += 1;
  return settle(state);
}

/** Plan half and evening half, as separate numbers so the debrief can say both. */
export function eveningScore(state) {
  const screens = state.blocks.length
    ? state.blocks.filter((b) => b.screen && !b.glimmer).length
    : plannedScreens(state);
  const plan = PLAN_SCORE[Math.min(screens, PLAN_SCORE.length - 1)];
  const kept = state.asks > 0 ? Math.round(KEPT_MAX * (state.stuck / state.asks)) : 0;
  return { plan, kept, total: clamp(plan + kept - (state.pastBedtime ? 6 : 0)) };
}

export const eveningPassed = (state, score = eveningScore(state)) =>
  score.total >= (state.level.target ?? 80);
