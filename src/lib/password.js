/**
 * What a password is actually made of, character by character.
 *
 * Passworld P4–P6 asks the child to pick pieces at the vault door and then
 * shows them what those pieces build (components/PasswordBuild.jsx). Both
 * the picking and the reveal need the same reading of the string: which
 * characters are letters, which are numbers, which are symbols, and how
 * many of each. That reading lives here so the two never disagree.
 */

/** 'letter' | 'number' | 'symbol' for a single character. */
export function charKind(ch) {
  if (/[a-z]/i.test(ch)) return 'letter';
  if (/[0-9]/.test(ch)) return 'number';
  return 'symbol';
}

/**
 * Reads a run of collected pieces as one password.
 *
 * Pieces are the tiles as the level hands them over ({ id, label, ... }),
 * in the order the child ticked them, and they are joined in that order:
 * the point of the reveal is that six small pickups become one long
 * password, so the joining has to be the visible part.
 *
 * Returns the joined string, the per-character reading the visual paints
 * from, how many of each kind there are, and the two facts the L.M.N.
 * method asks about a set of pieces: is it long, and is it mixed.
 */
export function readPassword(pieces = []) {
  const joined = pieces.map((p) => p.label).join('');
  const chars = [...joined].map((ch) => ({ ch, kind: charKind(ch) }));
  const counts = {
    letter: chars.filter((c) => c.kind === 'letter').length,
    number: chars.filter((c) => c.kind === 'number').length,
    symbol: chars.filter((c) => c.kind === 'symbol').length,
  };
  return {
    joined,
    chars,
    counts,
    length: joined.length,
    // Twelve, not eight. Eight was the old minimum everywhere, and a machine
    // guessing offline now works through every eight-character mix in about a
    // day, so current advice asks for twelve or more. "Mixed" means all three
    // kinds are in there, not merely two.
    isLong: joined.length >= 12,
    isMixed: counts.letter > 0 && counts.number > 0 && counts.symbol > 0,
  };
}

/**
 * "3 letters, 2 numbers and 2 symbols" — the mix in words, for the line
 * under the strip and for the screen reader. Kinds that are not there at
 * all are left out rather than reported as zero.
 */
export function describeMix(counts) {
  const parts = [];
  const say = (n, one, many) => (n === 1 ? `1 ${one}` : `${n} ${many}`);
  if (counts.letter) parts.push(say(counts.letter, 'letter', 'letters'));
  if (counts.number) parts.push(say(counts.number, 'number', 'numbers'));
  if (counts.symbol) parts.push(say(counts.symbol, 'symbol', 'symbols'));
  if (parts.length === 0) return 'nothing yet';
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

/**
 * The keypad's own gauge, out of four.
 *
 * Built from length and mix alone, which is what actually decides how long a
 * password takes to guess. A word from a common list buried inside a long
 * mixed password does not weaken it much (`iLoveyou123'z'z.` really is a
 * strong password), so the gauge does not go hunting for words, and it cannot
 * know that a piece is the child's own name either. That is the vault's own
 * rule to enforce, and the N of L.M.N.: see `aboutMe` in the tile data and
 * `answerDoor` in components/PlatformerStoryRealm.jsx.
 */
export function gradePassword({ length, counts }) {
  const kinds = [counts.letter, counts.number, counts.symbol].filter(Boolean).length;
  // Length carries most of the weight, the way it does in real life: a short
  // password with one of everything in it is still guessed quickly, while a
  // long one is hard work whatever it is made of. The mix earns a point on
  // top, and only once there is some length for it to matter to.
  let score = 0;
  if (length >= 8) score += 1; // the old minimum, and no longer enough on its own
  if (length >= 12) score += 1; // what current advice asks for
  if (length >= 16) score += 1;
  if (kinds >= 2 && length >= 8) score += 1;
  score = Math.min(score, 4);

  // A piece off the most-guessed list caps the gauge however long the rest of
  // it is, because that is what happens for real: the machine tries the list
  // first, so the length behind it never gets tested.
  // What the gauge is still waiting for, so the keypad never just says no.
  const reason = length < 12
    ? 'Twelve characters or more is what the keypad wants.'
    : kinds < 2
      ? 'Mix letters, numbers and symbols together.'
      : null;

  const label = ['Too short', 'Weak', 'Getting stronger', 'Strong', 'Very strong'][score];
  const tone = score <= 1 ? 'low' : score === 2 ? 'mid' : 'high';
  // What the vault door opens for. The gauge is the promise on screen, so the
  // door has to keep it: anything the gauge calls Strong gets through.
  return { score, max: 4, label, tone, reason, strong: score >= 3 };
}

// How a guessing machine is pictured in this realm: a fast offline attacker
// making about a hundred billion tries a second, against the 94 characters a
// keyboard offers. Both are round numbers chosen to be defensible rather than
// dramatic. Real rigs reach this rate against weakly hashed passwords, and a
// well-hashed one is far slower to attack, so the estimate errs towards making
// passwords look weaker than they are, never stronger.
const GUESSES_PER_SECOND = 1e11;
export const KEYBOARD_CHARACTERS = 94;

/**
 * Roughly how long that machine would need for a password of this length,
 * in words a child can hold on to. Only honest for a password that is not on
 * a list of common ones: anything off such a list falls immediately, however
 * long it is, which is the whole point of the comparison it sits in.
 */
export function describeGuessTime(length) {
  if (!length) return 'no time at all';
  const year = 60 * 60 * 24 * 365;
  // Half the possible combinations, on average, before the right one lands.
  const seconds = KEYBOARD_CHARACTERS ** length / 2 / GUESSES_PER_SECOND;
  if (seconds < 60) return 'less than a minute';
  if (seconds < 60 * 60) return 'a few minutes';
  if (seconds < 24 * 60 * 60) return 'a few hours';
  if (seconds < 30 * 24 * 60 * 60) return 'a few weeks';
  if (seconds < year) return 'months';
  if (seconds < 100 * year) return 'years';
  if (seconds < 1000 * year) return 'hundreds of years';
  if (seconds < 10000 * year) return 'thousands of years';
  if (seconds < 1e6 * year) return 'many thousands of years';
  return 'millions of years';
}
