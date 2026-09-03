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
    // Eight characters is the length the vault's own advice settles on, and
    // "mixed" means all three kinds are in there, not merely two.
    isLong: joined.length >= 8,
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
