import { charKind, describeMix, readPassword } from '../lib/password';

/**
 * How the pieces pair up into one password.
 *
 * The vault door in Passworld P4–P6 asks the child to pick pieces out of
 * their bag, and until now the only answer they got back was "the door
 * opened" (components/PlatformerStoryRealm.jsx). Teachers reported that
 * children finished the level without seeing what they had actually built,
 * or why a letter next to a number next to a symbol is harder to guess than
 * a word. This is the missing picture: the pieces on one line, joined into
 * a single password on the next, with every character coloured by what it
 * is, so the pairing is something you can point at.
 *
 * It is used twice: live under the keypad while the child ticks pieces, so
 * the password grows in front of them, and again on the reveal once the
 * door opens, where `animate` walks the characters in one at a time.
 */
export default function PasswordBuild({ pieces = [], animate = false, empty = 'Nothing ticked yet.' }) {
  const { joined, chars, counts, length } = readPassword(pieces);

  if (pieces.length === 0) {
    return <p className="muted pw-empty">{empty}</p>;
  }

  // One running index across the whole strip so the walk-in reads left to
  // right rather than restarting inside every piece.
  let step = 0;

  return (
    <div className={`pw-build${animate ? ' is-building' : ''}`}>
      <ol className="pw-pieces" aria-hidden="true">
        {pieces.map((piece, i) => (
          <li key={piece.id}>
            {i > 0 && <span className="pw-plus">+</span>}
            <span className="pw-piece">
              {[...piece.label].map((ch, j) => (
                <span key={j} className={`pw-char is-${charKind(ch)}`} style={{ '--step': step++ }}>
                  {ch}
                </span>
              ))}
            </span>
          </li>
        ))}
      </ol>

      <p className="pw-arrow" aria-hidden="true">
        joined together
      </p>

      <p className="pw-joined" aria-label={`Your password is ${joined}`}>
        {chars.map((c, i) => (
          <span key={i} className={`pw-char is-${c.kind}`} style={{ '--step': i }}>
            {c.ch}
          </span>
        ))}
      </p>

      <p className="pw-mix">
        {length} characters long: {describeMix(counts)}.
      </p>
    </div>
  );
}

/**
 * What the three colours in the strip mean. Kept out of the live preview,
 * where it would crowd the keypad, and shown on the reveal instead.
 */
export function PasswordLegend() {
  return (
    <ul className="pw-legend" aria-label="What the colours mean">
      <li>
        <span className="pw-swatch is-letter" aria-hidden="true" />
        Letters
      </li>
      <li>
        <span className="pw-swatch is-number" aria-hidden="true" />
        Numbers
      </li>
      <li>
        <span className="pw-swatch is-symbol" aria-hidden="true" />
        Symbols
      </li>
    </ul>
  );
}

/**
 * The side-by-side that answers "why is that stronger?": the weak piece the
 * child carried up here next to the password they just built, each with a
 * bar showing how much work it is to guess. The bars are a picture of the
 * point, not a measurement: something off a list of common passwords is one
 * guess, a long mixed password is millions. The weak side is whichever decoy
 * they picked up, so the wording stays true whether that is `password` or
 * `123456`.
 */
export function PasswordCompare({ weak, strong }) {
  return (
    <div className="pw-compare">
      <div className="pw-compare-row">
        <p className="pw-compare-label">{weak}</p>
        <div className="pw-bar" aria-hidden="true">
          <span className="pw-bar-fill is-weak" style={{ width: '14%' }} />
        </div>
        <p className="pw-compare-note">
          One of the most common passwords there is. A guessing machine keeps a list of these and
          tries the whole list first.
        </p>
      </div>
      <div className="pw-compare-row">
        <p className="pw-compare-label">{strong}</p>
        <div className="pw-bar" aria-hidden="true">
          <span className="pw-bar-fill is-strong" style={{ width: '100%' }} />
        </div>
        <p className="pw-compare-note">
          Long, mixed, and not on any list. The machine has to try many millions of guesses instead.
        </p>
      </div>
    </div>
  );
}
