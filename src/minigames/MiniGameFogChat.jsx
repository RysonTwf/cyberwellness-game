import { useState } from 'react';
import { CornerUpLeft, EyeOff, ShieldAlert } from 'lucide-react';
import { chatPassed, createChat, currentMessage, respond } from './fogChat';
import { Meter, Note, LogRow, Outcome } from './LowerBandKit';

/**
 * Privacy Peaks P1–P3: "The Conversation".
 *
 * Rules and arithmetic in `fogChat.js`, including why telling an adult is
 * never scored as a mistake at any point in the conversation.
 *
 * Two rendering decisions that are really design decisions:
 *
 *  1. **The three buttons never change and never grey out.** Not when the
 *     conversation is friendly, not after it turns. "Tell an adult" being
 *     permanently available, in the same place, from the first hello, is the
 *     thing this screen is for; a button that appears only once the game has
 *     decided something is wrong would be doing the noticing for them.
 *  2. **Messages stay on screen as they accumulate.** You can scroll back and
 *     see that it started with "hii!! 😊", which is the whole shape of the
 *     lesson — it did not start bad.
 */
export default function MiniGameFogChat({ game, onComplete }) {
  const [state, setState] = useState(() => createChat(game));
  const msg = currentMessage(state);
  const passed = chatPassed(state);
  const shown = game.messages.slice(0, Math.min(state.i + 1, game.messages.length));

  return (
    <div className="stack">
      <div className="game-head">
        <h3>{game.title}</h3>
        <p className="instruction">{game.instruction}</p>
      </div>

      <Meter label={game.meterLabel ?? 'Clear sky'} value={state.trust} target={game.target} />

      {/* The live chat goes away at the debrief. Leaving it up put three
          nested scroll areas on screen at once — the panel, this, and the
          log — and the log quotes every message anyway. Found in a browser;
          it is invisible until the conversation actually ends. */}
      {!state.over && (
      <div className="chat fog-chat">
        <p className="fog-from">{game.who}</p>
        {shown.map((m, i) => {
          const answered = state.done.find((d) => d.id === m.id);
          return (
            <div
              key={m.id}
              className={`fog-msg${i === state.i && !state.over ? ' now' : ''}${
                answered ? ` done ${answered.action}` : ''
              }`}
            >
              <p>{m.text}</p>
              {answered && (
                <span className="fog-tag">
                  {answered.action === 'reply'
                    ? 'you replied'
                    : answered.action === 'tell'
                      ? 'you told an adult'
                      : 'you didn’t reply'}
                </span>
              )}
            </div>
          );
        })}
      </div>
      )}

      {!state.over && msg && (
        <>
          <div className="lg-actions three">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setState((s) => respond(s, 'reply'))}>
              <CornerUpLeft size={15} />
              Reply
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setState((s) => respond(s, 'ignore'))}>
              <EyeOff size={15} />
              Don’t reply
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setState((s) => respond(s, 'tell'))}>
              <ShieldAlert size={15} />
              Tell an adult
            </button>
          </div>

          {state.last && (
            <Note ok={state.last.ok} delta={state.last.delta}>
              {state.last.note}
            </Note>
          )}
        </>
      )}

      {state.over && (
        <div className="stack">
          <ul className="lg-log">
            {state.done.map((d, i) => (
              <LogRow
                key={`${d.id}-${i}`}
                ok={d.ok}
                delta={d.delta}
                head={
                  d.action === 'tell'
                    ? 'You went and told an adult'
                    : d.action === 'never-told'
                      ? 'You never told anyone'
                      : d.action === 'reply'
                        ? 'You replied'
                        : 'You didn’t reply'
                }
                sub={d.text ? `“${d.text}”` : null}
                tail={d.note}
              />
            ))}
          </ul>

          <Outcome
            passed={passed}
            score={state.trust}
            target={game.target}
            pass={game.pass}
            retry={game.retry}
            onRetry={() => setState(createChat(game))}
            onDone={() => onComplete(state.trust)}
          />
        </div>
      )}
    </div>
  );
}
