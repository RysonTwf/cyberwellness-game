/**
 * Privacy Peaks P1–P3: "The Conversation" — the rules, with no React in them.
 *
 * The realm used to end in a Spot board: six lines from one nasty message,
 * already split apart into six separate cards, mark the bad ones, exact match
 * to pass. Three things wrong with it, in order of how much they matter.
 *
 *  1. **The hard part was already done.** Real messages do not arrive as a
 *     tidy list of six atoms with one tell in each. The skill is noticing a
 *     tell inside something that is flowing past you; the board had cut the
 *     message up and laid the pieces out, which is the work.
 *  2. **The rule's verbs never happened.** The Peaks rule is "stop, don't
 *     reply, and show it to an adult you trust" — three actions, none of
 *     which the mini-game contained. You marked things. Marking is not one of
 *     the verbs.
 *  3. **It opened already-bad.** The message on the board was obviously a
 *     scam from its first word, so the game was "can you read", not "can you
 *     notice". Nobody grooming a child opens with "what is your address".
 *     They open with "what game do you play?", and that is the whole point.
 *
 * So: one conversation, arriving one message at a time, and it starts
 * genuinely friendly. Three buttons, always the same three, always available:
 * **reply**, **don't reply**, **tell an adult**. Those are the rule's verbs,
 * and they are the only controls in the game.
 *
 * The arithmetic:
 *
 *  - The early messages are *safe*, and replying to them **scores**. This is
 *    load-bearing. A game where clamming up is always right teaches a child
 *    that talking to anyone is dangerous, and Passworld has already told them
 *    their favourite game is fine to share. It also means the turn, when it
 *    comes, is a turn — you have to have been enjoying the conversation for
 *    stopping to cost you anything.
 *  - Once it turns, replying costs and stopping pays.
 *  - **Telling an adult is never punished. Not once, not at any point.** A
 *    child who tells someone on the very first friendly hello gets a warm
 *    line and a clean, small score — they simply end the conversation before
 *    there was much to score. It is not the winning line and it is not a
 *    mistake; the game says exactly that. Building it any other way would
 *    teach "don't bother a grown-up unless you're sure", which is the single
 *    most dangerous thing this realm could possibly teach.
 *  - **Never telling is what costs.** Reach the end of the conversation
 *    having spotted everything and said nothing to anybody, and the chat does
 *    not end — it is still there tomorrow, and the score says so. Noticing is
 *    half the rule. The Spot board only ever asked for that half.
 *
 * Played by `scripts/simulate-lower.mjs`.
 */

const clamp = (n) => Math.max(0, Math.min(100, n));

export const CHAT_OUTCOMES = {
  /* Before it turns — an ordinary friendly exchange. */
  replySafe: { d: 8, ok: true },
  ignoreSafe: { d: -2, ok: false },
  /* After a tell has landed. */
  replyFlagged: { d: -10, ok: false },
  ignoreFlagged: { d: 7, ok: true },
  /* Reaching the last message without ever showing anyone. */
  neverTold: { d: -14, ok: false },
};

/** Telling an adult, scored by how much there was to show. Never negative. */
export const TELL = {
  // Nothing had gone wrong yet. Warm, small, and explicitly not a mistake.
  early: { d: 4, ok: true },
  // At least one tell had landed and they went and got someone. The ceiling.
  right: { d: 28, ok: true },
};

export function createChat(level) {
  return {
    level,
    i: 0,
    trust: level.startTrust ?? 30,
    seenFlag: false, // has anything worth stopping at arrived yet?
    told: false,
    done: [],
    last: null,
    over: level.messages.length === 0,
  };
}

export const currentMessage = (state) => state.level.messages[state.i] ?? null;

function record(state, msg, action, cell, note) {
  state.trust = clamp(state.trust + cell.d);
  state.done = [
    ...state.done,
    {
      id: msg?.id ?? 'end',
      text: msg?.text ?? null,
      flag: Boolean(msg?.flag),
      action,
      delta: cell.d,
      ok: cell.ok,
      note,
    },
  ];
  state.last = { ok: cell.ok, delta: cell.d, note };
  return state;
}

/**
 * Answer the message on screen: 'reply', 'ignore', or 'tell'.
 *
 * 'tell' ends the conversation wherever it has got to — which is true to
 * life, and is also why the score for it depends on what had already
 * happened rather than on how far through the list you are.
 */
export function respond(prev, action) {
  if (prev.over) return prev;
  const msg = currentMessage(prev);
  if (!msg) return prev;
  const state = { ...prev };

  if (action === 'tell') {
    // The message on screen counts. Telling someone the *instant* the
    // conversation turns is the single most correct thing a child can do
    // here, and an earlier cut of this scored it as a jumpy false alarm
    // (4 points instead of 28) because `seenFlag` was only set once a
    // flagged message had been answered some other way. Whatever they can
    // see, they have seen.
    const real = state.seenFlag || Boolean(msg.flag);
    const cell = real ? TELL.right : TELL.early;
    record(state, msg, 'tell', cell, real ? state.level.toldNote : state.level.earlyNote);
    state.told = true;
    state.over = true;
    return state;
  }

  const flagged = Boolean(msg.flag);
  const cell = flagged
    ? action === 'reply'
      ? CHAT_OUTCOMES.replyFlagged
      : CHAT_OUTCOMES.ignoreFlagged
    : action === 'reply'
      ? CHAT_OUTCOMES.replySafe
      : CHAT_OUTCOMES.ignoreSafe;

  record(state, msg, action, cell, action === 'reply' ? msg.replyNote : msg.ignoreNote);
  if (flagged) state.seenFlag = true;

  state.i += 1;
  if (state.i >= state.level.messages.length) {
    // Ran out of conversation without ever showing anyone. The other half of
    // the rule never happened, so the chat is still open tomorrow.
    //
    // Two different players end up here and they need different sentences: one
    // who stopped replying but told nobody has done half the job, and one who
    // answered every last message has done none of it. An earlier cut told
    // both of them "you spotted every single one of them", which was flatly
    // untrue for the second and let them off. Found by playing the bad line.
    const stopped = state.done.some((d) => d.flag && d.action === 'ignore');
    record(
      state,
      null,
      'never-told',
      CHAT_OUTCOMES.neverTold,
      stopped ? state.level.neverToldNote : state.level.neverNoticedNote,
    );
    state.over = true;
  }
  return state;
}

export const chatPassed = (state) => state.trust >= (state.level.target ?? 80);
