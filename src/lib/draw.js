/**
 * Shuffling and round-drawing, shared by every mini-game.
 *
 * The draw exists to close the "rote loophole" (thingstoimproveon.md): every
 * gated game used to re-ask the *same items in the same words* after a wrong
 * run, so one blind attempt bought a guaranteed clean one. Games now author
 * more items than a round uses and take a random subset each time, which
 * makes a clean run mean "I can tell these apart" rather than "I remember
 * what it said last time."
 *
 * Authoring rule: every item in the pool must be answerable on its own. The
 * draw is random, so no item may depend on another being in the same round.
 */

export function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * `size` items from `pool`, shuffled. Falls back to the whole pool (still
 * shuffled) when a game hasn't authored spares yet or asks for more than it
 * has, so adding `roundSize` to a realm is always safe.
 */
export function drawRound(pool, size) {
  const shuffled = shuffle(pool);
  if (!size || size >= shuffled.length) return shuffled;
  return shuffled.slice(0, size);
}

/**
 * A balanced draw: takes `size` items while keeping the pool's own split
 * across `key` as even as the numbers allow, then shuffles the result.
 *
 * Sort games need this. A flat random draw over a 14-item pile that happens
 * to be 6 "send" and 8 "leave" can deal a round of 8 that is 7 "leave": and
 * a child who spots the lopsided round can clear it by pattern rather than by
 * judgement, which is the exact thing the draw was added to prevent.
 */
export function drawBalanced(pool, size, key) {
  if (!size || size >= pool.length) return shuffle(pool);

  const groups = new Map();
  pool.forEach((item) => {
    const g = item[key];
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(item);
  });

  const buckets = shuffle([...groups.values()]).map((items) => shuffle(items));
  const picked = [];
  // Round-robin across the groups so the round mirrors the pool's own balance.
  for (let i = 0; picked.length < size; i += 1) {
    let tookAny = false;
    for (const bucket of buckets) {
      if (picked.length >= size) break;
      if (i < bucket.length) {
        picked.push(bucket[i]);
        tookAny = true;
      }
    }
    if (!tookAny) break; // pool exhausted, shouldn't happen given the guard
  }
  return shuffle(picked);
}
