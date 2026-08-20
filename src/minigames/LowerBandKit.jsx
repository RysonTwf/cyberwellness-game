import { RotateCcw, ArrowRight } from 'lucide-react';

/**
 * The few pieces every rebuilt P1–P3 mini-game needs, in one place.
 *
 * The five lower-band games are five different mechanics on purpose — the
 * whole argument of this band's rebuild is that a mechanic which fits every
 * realm teaches none of them. What they *can* share is the furniture: a
 * meter, a feedback line, a debrief list, and the two buttons at the end. So
 * a seven-year-old walking from Passworld into Privacy Peaks meets one new
 * idea rather than one new idea and a new set of controls.
 *
 * Everything here is presentational. All five reducers live next door with no
 * React in them, which is what lets `scripts/simulate-lower.mjs` balance them
 * by running the real game rather than a model of it.
 */

/** A labelled bar. `tone` colours it once things are going well or badly. */
export function Meter({ label, value, target, tone }) {
  const pct = Math.max(0, Math.min(100, value));
  const state = tone ?? (value >= target ? 'good' : value <= 25 ? 'low' : null);
  return (
    <div className="lg-meter">
      <div className="row-between">
        <span className="stamp-label">{label}</span>
        <span className="lg-meter-num">{Math.round(value)}</span>
      </div>
      <div
        className="lg-meter-track"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className={`lg-meter-fill${state ? ` ${state}` : ''}`} style={{ width: `${pct}%` }} />
        {/* Where the realm decides you've got there. Visible from the first
            turn on purpose: a target you only learn about at the end is a
            mark out of ten, not a goal. */}
        <div className="lg-meter-target" style={{ left: `${target}%` }} aria-hidden="true" />
      </div>
    </div>
  );
}

/**
 * The line that says what just happened.
 *
 * `ok` is deliberately three-valued: true, false, and null for a move that
 * was neither — watching the bog, running a check. Not everything a child
 * does needs to be marked.
 */
export function Note({ ok, children, delta }) {
  if (!children) return null;
  return (
    <p className={`lg-note${ok === true ? ' good' : ok === false ? ' weak' : ''}`} aria-live="polite">
      {children}
      {typeof delta === 'number' && delta !== 0 && (
        <em className="lg-delta">{delta > 0 ? `+${delta}` : delta}</em>
      )}
    </p>
  );
}

/** One row of the end-of-game debrief. */
export function LogRow({ ok, head, sub, tail, delta }) {
  return (
    <li className={`lg-log-row${ok === true ? ' good' : ok === false ? ' weak' : ''}`}>
      <div className="lg-log-head">
        <span>{head}</span>
        {typeof delta === 'number' && (
          <em className="lg-delta">{delta > 0 ? `+${delta}` : delta}</em>
        )}
      </div>
      {sub && <p className="lg-log-sub">{sub}</p>}
      {tail && <p className="lg-log-tail">{tail}</p>}
    </li>
  );
}

/**
 * How every one of these ends.
 *
 * A cleared game offers only "carry on"; a game short of target offers only
 * "have another go". That asymmetry is on purpose and matches the P4–P6
 * realms: there is no fail state here — you cannot lose the realm, you can
 * only be sent round again — but neither is there a way to shrug past a
 * mechanic you haven't actually done yet (design.md §8).
 */
export function Outcome({ passed, score, target, pass, retry, onRetry, onDone, doneLabel }) {
  return (
    <div className="stack">
      <div className={`lg-outcome${passed ? ' good' : ''}`}>
        <p>{passed ? pass : retry}</p>
        {!passed && (
          <p className="lg-outcome-score">
            {score} — you need {target}.
          </p>
        )}
      </div>
      <div className="center">
        {passed ? (
          <button type="button" className="btn btn-accent" onClick={onDone}>
            {doneLabel ?? 'Carry on'}
            <ArrowRight size={19} />
          </button>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={onRetry}>
            <RotateCcw size={17} />
            Have another go
          </button>
        )}
      </div>
    </div>
  );
}
