import { useState } from 'react';
import { Lock, LockOpen, KeyRound, DoorClosed } from 'lucide-react';
import { answer, createDoor, currentKnock, doorPassed } from './vaultDoor';
import { Meter, Note, LogRow, Outcome } from './LowerBandKit';

/**
 * Passworld P1–P3: "Who's Knocking".
 *
 * All the rules are in `vaultDoor.js`, including the argument for why the
 * two-bin sort this replaced was teaching the wrong model. This file owns the
 * pixels and nothing else.
 *
 * The one thing here that is a design decision rather than a rendering
 * decision: **who is asking is the biggest thing on the card, and what they
 * want is underneath it.** The old board put the fact first and the asker
 * nowhere; putting the name in the heading is the entire lesson, laid out.
 */
export default function MiniGameVaultDoor({ game, onComplete }) {
  const [state, setState] = useState(() => createDoor(game));
  const knock = currentKnock(state);
  const passed = doorPassed(state);
  const slips = state.done.filter((d) => d.secret && d.action === 'give').length;
  const secrets = state.done.filter((d) => d.secret).length;

  return (
    <div className="stack">
      <div className="game-head">
        <h3>{game.title}</h3>
        <p className="instruction">{game.instruction}</p>
      </div>

      <Meter label={game.meterLabel ?? 'Vault'} value={state.strength} target={game.target} />

      {!state.over && knock && (
        <>
          <div className="lg-card vault-knock">
            <div className="vault-who">
              <span className="badge-ic">
                <DoorClosed size={20} strokeWidth={2.2} />
              </span>
              <div>
                <strong>{knock.who}</strong>
                {knock.where && <span className="vault-where">{knock.where}</span>}
              </div>
            </div>

            <p className="vault-ask">“{knock.ask}”</p>

            <p className="vault-wants">
              <KeyRound size={14} />
              They want {knock.wants}.
            </p>
          </div>

          <div className="lg-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setState((s) => answer(s, 'give'))}>
              <LockOpen size={17} />
              Tell them
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setState((s) => answer(s, 'lock'))}>
              <Lock size={17} />
              Keep it locked
            </button>
          </div>

          {state.last && (
            <Note ok={state.last.ok} delta={state.last.delta}>
              {state.last.note}
            </Note>
          )}

          <p className="lg-progress">
            {state.i} of {game.knocks.length} answered
          </p>
        </>
      )}

      {state.over && (
        <div className="stack">
          <ul className="lg-log">
            {state.done.map((d) => (
              <LogRow
                key={d.id}
                ok={d.ok}
                delta={d.delta}
                head={`${d.who} — ${d.wants}`}
                sub={d.action === 'give' ? 'You told them.' : 'You kept it locked.'}
                tail={d.note}
              />
            ))}
          </ul>

          {/* The password line gets its own paragraph, separate from the
              score, because it is the one thing in this realm with no "it
              depends" and burying it inside a list of twelve would rank it
              level with the rest. */}
          {secrets > 0 && (
            <p className={`lg-callout${slips === 0 ? ' good' : ''}`}>
              {slips === 0 ? game.secretPerfect : game.secretSlip}
            </p>
          )}

          <Outcome
            passed={passed}
            score={state.strength}
            target={game.target}
            pass={game.pass}
            retry={game.retry}
            onRetry={() => setState(createDoor(game))}
            onDone={() => onComplete(state.strength)}
          />
        </div>
      )}
    </div>
  );
}
