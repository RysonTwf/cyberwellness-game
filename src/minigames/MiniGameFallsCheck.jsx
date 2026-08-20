import { useState } from 'react';
import { Send, XCircle, Search, Waves } from 'lucide-react';
import {
  CHECKS,
  createFalls,
  currentTale,
  decide,
  fallsPassed,
  foundSoFar,
  runCheck,
} from './fallsCheck';
import { Meter, Note, LogRow, Outcome } from './LowerBandKit';

/**
 * Fable Falls P1–P3: "Stop and Check".
 *
 * Rules and arithmetic in `fallsCheck.js`, including why this one has no
 * clock on it when its P4–P6 sibling is built entirely out of one.
 *
 * The rendering decision that carries the lesson, kept verbatim from the
 * P4–P6 board: **nothing on this screen ever says a finding settled it.** A
 * check comes back as a fact in a box. Half of them are perfectly true and
 * settle nothing — "two other people in your class have heard it as well" —
 * and telling those apart is the game. The moment the UI puts a tick on the
 * decisive one, the realm is over.
 *
 * The two commit buttons are also deliberately equal in weight, for the same
 * reason the P4–P6 board's are: passing on something true and useful is the
 * right answer three times out of seven here, so a bright "pass it on" would
 * be a thumb on a scale this realm wants level.
 */
export default function MiniGameFallsCheck({ game, onComplete }) {
  const [state, setState] = useState(() => createFalls(game));
  const tale = currentTale(state);
  const found = foundSoFar(state);
  const passed = fallsPassed(state);

  return (
    <div className="stack">
      <div className="game-head">
        <h3>{game.title}</h3>
        <p className="instruction">{game.instruction}</p>
      </div>

      <Meter label={game.meterLabel ?? 'Clear water'} value={state.water} target={game.target} />

      {!state.over && tale && (
        <>
          <div className="lg-card falls-tale">
            <div className="vault-who">
              <span className="badge-ic">
                <Waves size={20} strokeWidth={2.2} />
              </span>
              <div>
                <strong>{tale.from}</strong>
                <span className="vault-where">coming down the Falls</span>
              </div>
            </div>
            <p className="vault-ask">“{tale.text}”</p>

            {found.length > 0 && (
              <ul className="falls-found-list">
                {found.map((f) => (
                  <li key={f.id}>
                    <span className="lg-tag">{f.label}</span>
                    {f.text}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="lg-actions">
            {CHECKS.map((c) => (
              <button
                key={c.id}
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={state.checks.includes(c.id)}
                onClick={() => setState((s) => runCheck(s, c.id))}
                title={c.hint}
              >
                <Search size={15} />
                {c.label}
              </button>
            ))}
          </div>

          <div className="lg-actions">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setState((s) => decide(s, 'pass'))}>
              <Send size={15} />
              Pass it on
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setState((s) => decide(s, 'drop'))}>
              <XCircle size={15} />
              Let it go
            </button>
          </div>

          {state.last && (
            <Note ok={state.last.ok} delta={state.last.delta}>
              {state.last.note}
            </Note>
          )}

          <p className="lg-progress">
            {state.i} of {game.tales.length} decided
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
                head={`${d.from} — you ${d.action === 'pass' ? 'passed it on' : 'let it go'}`}
                sub={`“${d.text}”`}
                tail={
                  d.band === 'raw'
                    ? `${d.note} You never checked it, though — that was a guess.`
                    : d.band === 'looked'
                      ? `${d.note} ${d.why}`
                      : d.note
                }
              />
            ))}
          </ul>

          <Outcome
            passed={passed}
            score={state.water}
            target={game.target}
            pass={game.pass}
            retry={game.retry}
            onRetry={() => setState(createFalls(game))}
            onDone={() => onComplete(state.water)}
          />
        </div>
      )}
    </div>
  );
}
