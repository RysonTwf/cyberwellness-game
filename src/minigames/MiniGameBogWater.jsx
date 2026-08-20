import { useState } from 'react';
import { Heart, Flame, ShieldAlert, Hand, Check } from 'lucide-react';
import { act, createWater, finish, landed, waterPassed, waterScore } from './bogWater';
import { Meter, Note, Outcome } from './LowerBandKit';

const MOVE_ICONS = { kind: Heart, back: Flame, tell: ShieldAlert, watch: Hand };
const MOVE_ORDER = ['kind', 'back', 'tell', 'watch'];

/**
 * Bully Bog P1–P3: "The Water".
 *
 * Rules and arithmetic in `bogWater.js`, including why there are two meters
 * rather than one and why "say nothing" is a real button.
 *
 * Two rendering decisions worth defending:
 *
 *  1. **"Say nothing for now" sits with the other three, styled exactly like
 *     them.** It is the losing move and the game must not warn you off it —
 *     the whole lesson is that doing nothing feels like a normal option in
 *     the moment, because it is one, and the water tells you afterwards.
 *  2. **The comments keep their own list and the count is visible.** A child
 *     needs to see that one landed on the turn they spent deciding; that is
 *     the "you cannot out-type a pile-on" beat, and it only lands if you can
 *     watch the pile grow while you act.
 */
export default function MiniGameBogWater({ game, onComplete }) {
  const [state, setState] = useState(() => createWater(game));
  const score = waterScore(state);
  const passed = waterPassed(state);
  const here = landed(state);
  const turnsLeft = (game.turns ?? 6) - state.t;

  const verdict = state.told
    ? state.saidKind > 0
      ? game.verdicts.both
      : game.verdicts.toldOnly
    : state.saidKind > 0
      ? game.verdicts.kindOnly
      : game.verdicts.neither;

  return (
    <div className="stack">
      <div className="game-head">
        <h3>{game.title}</h3>
        <p className="instruction">{game.instruction}</p>
      </div>

      <div className="bog-meters">
        <Meter label="The water" value={state.water} target={game.target} />
        <Meter label="Pockets" value={state.pockets} target={game.target} />
      </div>

      <div className={`bog-pond${state.water < 40 ? ' dark' : ''}`}>
        {here.length === 0 ? (
          <p className="bog-quiet">Nothing new yet.</p>
        ) : (
          <ul className="bog-comments">
            {here.map((c) => (
              <li key={c.id}>{c.text}</li>
            ))}
          </ul>
        )}
        {state.told && <p className="bog-stopped">The comments stopped.</p>}
      </div>

      {!state.over && (
        <>
          <div className="lg-actions stack-actions">
            {MOVE_ORDER.map((id) => {
              const Icon = MOVE_ICONS[id];
              const m = game.moves[id];
              return (
                <button
                  key={id}
                  type="button"
                  className="btn btn-ghost btn-sm bog-move"
                  onClick={() => setState((s) => act(s, id))}
                >
                  <Icon size={15} />
                  <span>
                    {m.label}
                    <em>{m.hint}</em>
                  </span>
                </button>
              );
            })}
          </div>

          {state.last && (
            <Note ok={state.last.ok}>
              {state.last.note}
              {state.last.comment && ` Then another one landed: “${state.last.comment.text}”`}
            </Note>
          )}

          {/* Only once the comments have stopped — see finish() in
              bogWater.js for why this cannot be used to game the score. */}
          {state.told && (
            <div className="center">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setState(finish)}>
                <Check size={15} />
                That’s enough — leave it there
              </button>
            </div>
          )}

          <p className="lg-progress">
            {turnsLeft} {turnsLeft === 1 ? 'turn' : 'turns'} left
          </p>
        </>
      )}

      {state.over && (
        <div className="stack">
          <p className={`lg-callout${state.told && state.saidKind > 0 ? ' good' : ''}`}>{verdict}</p>
          <Outcome
            passed={passed}
            score={score}
            target={game.target}
            pass={game.pass}
            retry={game.retry}
            onRetry={() => setState(createWater(game))}
            onDone={() => onComplete(score)}
          />
        </div>
      )}
    </div>
  );
}
