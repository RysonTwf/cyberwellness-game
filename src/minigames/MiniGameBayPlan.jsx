import { useState } from 'react';
import { Sunset, Sparkles, Check, Moon } from 'lucide-react';
import {
  answerGlimmer,
  commitPlan,
  createEvening,
  currentAsk,
  currentBlock,
  eveningPassed,
  eveningScore,
  pick,
  planFull,
  plannedScreens,
  unpick,
} from './bayPlan';
import { Meter, Outcome } from './LowerBandKit';

/**
 * Balance Bay P1–P3: "The Promise".
 *
 * Rules and arithmetic in `bayPlan.js`, including the argument for keeping a
 * planner here when the P4–P6 band threw one out.
 *
 * The rendering decision that carries the lesson: **once the evening starts,
 * the plan is still on screen and still cannot be touched.** Watching your own
 * six blocks sit there, greyed, while the Glimmer talks, is the entire point —
 * the plan is a thing you made earlier and now have to live with, which is
 * what "decide before you start" means.
 */
export default function MiniGameBayPlan({ game, onComplete }) {
  const [state, setState] = useState(() => createEvening(game));
  const score = eveningScore(state);
  const passed = eveningPassed(state, score);
  const screens = plannedScreens(state);

  const verdict =
    screens === 0
      ? game.verdicts.noScreen
      : screens >= 5
        ? game.verdicts.allScreen
        : state.stuck === state.asks && state.asks > 0
          ? game.verdicts.won
          : game.verdicts.gaveIn.replace(
              '{eaten}',
              state.displaced.length
                ? state.displaced.map((t) => t.toLowerCase()).join(', then ')
                : 'your bedtime',
            );

  /* ------------------------------------------------------------ planning -- */
  if (state.phase === 'plan') {
    return (
      <div className="stack">
        <div className="game-head">
          <h3>{game.title}</h3>
          <p className="instruction">{game.instruction}</p>
        </div>

        <div className="bay-slots">
          {Array.from({ length: game.slots }).map((_, i) => {
            const id = state.picked[i];
            const item = id ? game.items.find((x) => x.id === id) : null;
            return (
              <button
                key={i}
                type="button"
                className={`bay-slot${item ? ' filled' : ''}${item?.screen ? ' screen' : ''}`}
                onClick={() => item && setState((s) => unpick(s, i))}
                disabled={!item}
              >
                {item ? item.text : <span className="bay-empty">block {i + 1}</span>}
              </button>
            );
          })}
        </div>

        <div className="bay-tray">
          {game.items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`bay-card${item.screen ? ' screen' : ''}`}
              onClick={() => setState((s) => pick(s, item.id))}
              disabled={state.picked.includes(item.id) || planFull(state)}
            >
              {item.text}
            </button>
          ))}
        </div>

        <p className="lg-progress">{game.planHint}</p>

        <div className="center">
          <button
            type="button"
            className="btn btn-accent"
            disabled={!planFull(state)}
            onClick={() => setState((s) => commitPlan(s))}
          >
            <Check size={19} />
            {game.commitLabel}
          </button>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- evening -- */
  const block = currentBlock(state);
  const ask = currentAsk(state);
  const lastLog = state.log[state.log.length - 1];

  return (
    <div className="stack">
      <div className="game-head">
        <h3>{state.over ? 'How the evening went' : 'The evening'}</h3>
        {!state.over && <p className="instruction">This is the plan you made. Here it comes.</p>}
      </div>

      <Meter label="The tide" value={score.total} target={game.target} />

      {/* The plan, locked. Deliberately never editable from here. */}
      <ol className="bay-night">
        {state.blocks.map((b, i) => (
          <li
            key={`${b.id}-${i}`}
            className={`bay-night-block${b.screen ? ' screen' : ''}${b.glimmer ? ' glimmer' : ''}${
              i < state.at ? ' past' : i === state.at ? ' now' : ''
            }`}
          >
            <span>{b.text}</span>
            {b.ate && <em>instead of {b.ate.toLowerCase()}</em>}
          </li>
        ))}
      </ol>

      {!state.over && state.asking && block && (
        <div className="lg-card bay-glimmer">
          <div className="vault-who">
            <span className="badge-ic">
              <Sparkles size={20} strokeWidth={2.2} />
            </span>
            <div>
              <strong>The Glimmer</strong>
              <span className="vault-where">while you’re on “{block.text.toLowerCase()}”</span>
            </div>
          </div>
          <p className="vault-ask">“{ask.text}”</p>
          <div className="lg-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setState((s) => answerGlimmer(s, true))}>
              <Moon size={17} />
              {ask.stick}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setState((s) => answerGlimmer(s, false))}>
              <Sparkles size={17} />
              Go on then, one more
            </button>
          </div>
        </div>
      )}

      {!state.over && lastLog && lastLog.kind !== 'quiet' && (
        <p className={`lg-note${lastLog.kind === 'stuck' ? ' good' : ' weak'}`} aria-live="polite">
          {lastLog.kind === 'stuck'
            ? game.stickNote
            : lastLog.kind === 'bedtime'
              ? game.bedtimeNote
              : `${game.giveInNote} It came out of ${lastLog.ate.toLowerCase()}.`}
        </p>
      )}

      {state.over && (
        <div className="stack">
          <p className={`lg-callout${passed ? ' good' : ''}`}>{verdict}</p>
          <p className="lg-progress">
            <Sunset size={13} /> The plan was worth {score.plan}. Holding to it was worth {score.kept}
            {state.asks > 0 ? ` (${state.stuck} of ${state.asks})` : ' — the Glimmer never had to ask'}.
          </p>
          <Outcome
            passed={passed}
            score={score.total}
            target={game.target}
            pass={game.pass}
            retry={game.retry}
            onRetry={() => setState(createEvening(game))}
            onDone={() => onComplete(score.total)}
          />
        </div>
      )}
    </div>
  );
}
