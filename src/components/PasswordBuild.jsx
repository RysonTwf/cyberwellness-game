import { charKind, describeGuessTime, describeMix, gradePassword, readPassword } from '../lib/password';

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
export default function PasswordBuild({
  pieces = [],
  animate = false,
  strengthNote = false,
  empty = 'Nothing ticked yet.',
}) {
  const reading = readPassword(pieces);
  const { joined, chars, counts, length } = reading;

  if (pieces.length === 0) {
    return <p className="muted pw-empty">{empty}</p>;
  }

  // One running index across the whole strip so the walk-in reads left to
  // right rather than restarting inside every piece.
  let step = 0;

  return (
    <div className={`pw-build${animate ? ' is-building' : ''}`}>
      <p className="pw-caption">
        {pieces.length === 1 ? 'The piece you picked' : `The ${pieces.length} pieces you picked`}
      </p>

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

      <p className="pw-caption">Your password</p>

      {/* Numbered slots, not a run of characters: the empty outline of every
          space shows through until its character lands in it, so a child can
          see the password filling up and can count how long it came out. */}
      <ol className="pw-joined" aria-label={`Your password is ${joined}`}>
        {chars.map((c, i) => (
          <li key={i} className="pw-slot">
            <span className={`pw-char is-${c.kind}`} style={{ '--step': i }}>
              {c.ch}
            </span>
            <span className="pw-slot-n" aria-hidden="true">
              {i + 1}
            </span>
          </li>
        ))}
      </ol>

      <p className="pw-mix">
        {length} characters long: {describeMix(counts)}.
      </p>

      <PasswordStrength reading={reading} note={strengthNote} />
    </div>
  );
}

/**
 * The strength gauge, four segments and a word. It moves as pieces go in and
 * out, so the child can see a short single piece read as weak and the whole
 * mixed set read as strong, which is the lesson the door is teaching.
 *
 * See `gradePassword` for why it measures length and mix only, and why the
 * note beside it says so out loud while the child is still choosing.
 */
export function PasswordStrength({ reading, note = false }) {
  const { score, max, label, tone } = gradePassword(reading);

  return (
    <div className="pw-strength">
      <p className="pw-strength-top">
        <span className="pw-caption">Keypad gauge</span>
        <strong className={`pw-strength-label is-${tone}`}>{label}</strong>
      </p>
      <div className="pw-strength-bar" role="img" aria-label={`Password strength: ${label}`}>
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={`pw-seg${i < score ? ` on is-${tone}` : ''}`} />
        ))}
      </div>
      {note && (
        <p className="pw-strength-note">
          This gauge measures length and mix only. Whether a piece is a real word, or something
          about you, is for you to judge.
        </p>
      )}
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
          One of the most common passwords there is. A guessing machine starts with that list, so
          this one falls straight away, however long it looks.
        </p>
      </div>
      <div className="pw-compare-row">
        <p className="pw-compare-label">{strong}</p>
        <div className="pw-bar" aria-hidden="true">
          <span className="pw-bar-fill is-strong" style={{ width: '100%' }} />
        </div>
        <p className="pw-compare-note">
          {strong.length} characters, mixed, and on no list. The same machine would need{' '}
          {describeGuessTime(strong.length)}.
        </p>
      </div>
    </div>
  );
}

/**
 * Why a mixed password is harder to guess, as a picture rather than a
 * paragraph: how many different characters could sit in a single space of
 * the password, counted three ways. The numbers are the real ones a keyboard
 * offers, so the jump from 26 to about 94 is the lesson, and the closing line
 * ties it back to how many spaces the child's own password has.
 */
export function PasswordChoices({ length }) {
  const rows = [
    { name: 'Small letters only', n: 26 },
    { name: 'Add capitals and numbers', n: 62 },
    { name: 'Add symbols as well', n: 94, best: true },

  ];
  const most = rows[rows.length - 1].n;

  return (
    <div className="pw-choices">
      <p className="pw-caption">How many things could go in one space</p>
      <ul>
        {rows.map((row) => (
          <li key={row.name}>
            <span className="pw-choices-name">{row.name}</span>
            <span className="pw-bar">
              <span className="pw-bar-fill" style={{ width: `${(row.n / most) * 100}%` }} />
            </span>
            {/* Fixed-width so every bar above runs to the same finish line and
                the three lengths can be compared at a glance. */}
            <span className="pw-choices-n">
              {row.best && <em>about</em>}
              {row.n}
            </span>
          </li>
        ))}
      </ul>
      <p className="pw-mix">
        Every space you add multiplies the guessing by about 94. Your password has {length} of
        them, so a machine making a hundred billion guesses every second would need{' '}
        {describeGuessTime(length)}.
      </p>
    </div>
  );
}
