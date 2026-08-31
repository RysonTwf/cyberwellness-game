import { Check } from 'lucide-react';

/**
 * The named method a game is teaching, shown on screen *while* you play.
 *
 * Fable Falls P4–P6 was the only game in the product that explained its own
 * purpose (thingstoimproveon.md, "The purpose question"): it names a
 * transferable method, keeps it on screen the whole time, and makes naming
 * the check part of the answer. Everything else had only an `instruction`
 * line, which says what to *do*, not what skill is being built. This is that
 * S.U.R.E. track lifted out so every realm can use it.
 *
 *   game.purpose: {
 *     name: 'T.H.I.N.K.',
 *     why: 'Five checks before you send anything about someone.',
 *     checks: [{ key: 'T', name: 'True', sub: 'Is it actually true?' }],
 *     nameTheCheck: true,   // P4–P6 only, see below
 *   }
 *
 * `nameTheCheck` turns the method from something shown into something used:
 * the child has to say *which* check an item falls foul of, not just which
 * bin it goes in. It's opt-in per game because the P1–P3 band (7–9) is held
 * to shorter, plainer interactions by the school's revision pass: those
 * bands get the track to read, and the older bands get the track plus the
 * naming step.
 */
export default function MethodTrack({ purpose, cleared }) {
  if (!purpose) return null;
  const done = cleared ?? new Set();

  return (
    <div className="method">
      <p className="method-name">
        <strong>{purpose.name}</strong>
        {purpose.why && <span className="method-why">{purpose.why}</span>}
      </p>
      <ol className="sure-track" aria-label={`The checks in ${purpose.name}`}>
        {purpose.checks.map((c) => {
          const ticked = done.has(c.key);
          return (
            <li key={c.key} className={`sure-chip${ticked ? ' done' : ''}`} title={c.sub}>
              <span className="sure-letter">{ticked ? <Check size={13} /> : c.key}</span>
              {c.name}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * "Which check is this?": the naming step.
 *
 * The anti-luck rule is the one S.U.R.E. proved out: a key you've already
 * tried on this item is spent and disabled, so you can't tap along the row
 * until one sticks. The parent owns the state (which key is showing, which
 * are spent) because it also owns what a miss *costs*: in S.U.R.E. the clue
 * comes back for a second look, in Sort and Stones the round doesn't count.
 */
export function CheckPrompt({ checks, prompt, spent = [], onPick, disabled = false }) {
  return (
    <>
      <h3>{prompt}</h3>
      <div className="sure-keys">
        {checks.map((c) => {
          const used = spent.includes(c.key);
          return (
            <button
              key={c.key}
              type="button"
              className={`sure-key${used ? ' spent' : ''}`}
              onClick={() => onPick(c.key)}
              disabled={used || disabled}
            >
              <span className="sure-letter">{c.key}</span>
              <span className="sure-key-name">{c.name}</span>
              <span className="sure-key-sub">{c.sub}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}
