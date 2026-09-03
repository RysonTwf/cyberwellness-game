/**
 * Tap-to-move pathfinding for the walkable scenes (world/useWalker.js).
 *
 * Only two scenes have obstacles at all — the Traveler's Room's furniture
 * and Balance Bay's two beach props — and each has a handful of axis-aligned
 * rectangles, so a coarse grid A* is more than enough. Without it a tap
 * behind a chair walked the Traveler straight into the chair and stopped;
 * a tap *on* a chair walked them into its face and pressed there.
 *
 * Everything is in the same 0-100 world units as the rest of the movement
 * code. Obstacles are `{ x, y, w, h }` — centre and full size, already
 * inflated for the Traveler's body where they're defined — and "blocked"
 * is a single-point test against them, matching useWalker's own `blocked`.
 */

const CELL = 1.5; // grid resolution in world units

/** Is this point inside any obstacle rectangle? */
export function blockedAt(x, y, obstacles) {
  for (const o of obstacles) {
    if (Math.abs(x - o.x) < o.w / 2 && Math.abs(y - o.y) < o.h / 2) return true;
  }
  return false;
}

/** Is the straight segment a->b clear of every obstacle? Sampled, not exact. */
export function segmentClear(a, b, obstacles, step = 0.7) {
  if (!obstacles.length) return true;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy);
  const n = Math.max(1, Math.ceil(len / step));
  for (let i = 0; i <= n; i += 1) {
    const t = i / n;
    if (blockedAt(a.x + dx * t, a.y + dy * t, obstacles)) return false;
  }
  return true;
}

const clampToBounds = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * The nearest point to `p` that is inside `bounds` and not inside any
 * obstacle. Used to keep a tap that lands on a chair (or off the edge) from
 * asking the Traveler to walk somewhere they can't stand.
 */
export function snapToClear(p, obstacles, bounds) {
  let x = clampToBounds(p.x, bounds.minX, bounds.maxX);
  let y = clampToBounds(p.y, bounds.minY, bounds.maxY);
  if (!blockedAt(x, y, obstacles)) return { x, y };

  // Push out of whichever rectangle it landed in, to that rect's nearest edge.
  for (const o of obstacles) {
    if (Math.abs(x - o.x) < o.w / 2 && Math.abs(y - o.y) < o.h / 2) {
      const left = x - (o.x - o.w / 2);
      const right = o.x + o.w / 2 - x;
      const up = y - (o.y - o.h / 2);
      const down = o.y + o.h / 2 - y;
      const m = Math.min(left, right, up, down);
      const pad = 0.4;
      if (m === left) x = o.x - o.w / 2 - pad;
      else if (m === right) x = o.x + o.w / 2 + pad;
      else if (m === up) y = o.y - o.h / 2 - pad;
      else y = o.y + o.h / 2 + pad;
    }
  }
  x = clampToBounds(x, bounds.minX, bounds.maxX);
  y = clampToBounds(y, bounds.minY, bounds.maxY);

  // Overlapping rectangles can leave the pushed-out point still blocked —
  // spiral outward on the grid for the closest free cell as a fallback.
  if (blockedAt(x, y, obstacles)) {
    for (let r = 1; r <= 20; r += 1) {
      for (let a = 0; a < 8 * r; a += 1) {
        const ang = (a / (8 * r)) * Math.PI * 2;
        const nx = clampToBounds(p.x + Math.cos(ang) * r * CELL, bounds.minX, bounds.maxX);
        const ny = clampToBounds(p.y + Math.sin(ang) * r * CELL, bounds.minY, bounds.maxY);
        if (!blockedAt(nx, ny, obstacles)) return { x: nx, y: ny };
      }
    }
  }
  return { x, y };
}

/** Min-heap keyed by `f`, small enough that this stays comfortably fast. */
function makeHeap() {
  const a = [];
  const up = (i) => {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p].f <= a[i].f) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  };
  const down = (i) => {
    for (;;) {
      const l = i * 2 + 1;
      const r = l + 1;
      let s = i;
      if (l < a.length && a[l].f < a[s].f) s = l;
      if (r < a.length && a[r].f < a[s].f) s = r;
      if (s === i) break;
      [a[s], a[i]] = [a[i], a[s]];
      i = s;
    }
  };
  return {
    get size() {
      return a.length;
    },
    push(n) {
      a.push(n);
      up(a.length - 1);
    },
    pop() {
      const top = a[0];
      const last = a.pop();
      if (a.length) {
        a[0] = last;
        down(0);
      }
      return top;
    },
  };
}

/**
 * A path of `{ x, y }` waypoints from `start` to `goal` that stays out of
 * every obstacle, or `null` if `start` and `goal` are in separate pockets.
 * `goal` is snapped to the nearest standable point first, so a tap on an
 * obstacle routes to its edge rather than into it. When there is nothing in
 * the way this returns `[goal]` and never builds the grid.
 */
export function findPath(start, goal, obstacles, bounds) {
  const dest = snapToClear(goal, obstacles, bounds);

  if (segmentClear(start, dest, obstacles)) return [dest];

  const w = Math.max(2, Math.round((bounds.maxX - bounds.minX) / CELL) + 1);
  const h = Math.max(2, Math.round((bounds.maxY - bounds.minY) / CELL) + 1);
  const cx = (gx) => bounds.minX + (gx * (bounds.maxX - bounds.minX)) / (w - 1);
  const cy = (gy) => bounds.minY + (gy * (bounds.maxY - bounds.minY)) / (h - 1);

  const free = new Uint8Array(w * h);
  for (let gy = 0; gy < h; gy += 1) {
    for (let gx = 0; gx < w; gx += 1) {
      free[gy * w + gx] = blockedAt(cx(gx), cy(gy), obstacles) ? 0 : 1;
    }
  }

  const toCell = (p) => {
    let gx = Math.round(((p.x - bounds.minX) / (bounds.maxX - bounds.minX)) * (w - 1));
    let gy = Math.round(((p.y - bounds.minY) / (bounds.maxY - bounds.minY)) * (h - 1));
    gx = Math.min(w - 1, Math.max(0, gx));
    gy = Math.min(h - 1, Math.max(0, gy));
    // A start/goal cell can be blocked (rounded onto a rect edge); walk out
    // to the nearest free cell so A* has somewhere to begin/end.
    if (!free[gy * w + gx]) {
      let best = -1;
      let bestD = Infinity;
      for (let y = 0; y < h; y += 1) {
        for (let x = 0; x < w; x += 1) {
          if (!free[y * w + x]) continue;
          const d = (x - gx) ** 2 + (y - gy) ** 2;
          if (d < bestD) {
            bestD = d;
            best = y * w + x;
          }
        }
      }
      if (best < 0) return null;
      return best;
    }
    return gy * w + gx;
  };

  const startI = toCell(start);
  const goalI = toCell(dest);
  if (startI == null || goalI == null) return null;

  const gScore = new Float32Array(w * h).fill(Infinity);
  const came = new Int32Array(w * h).fill(-1);
  const seen = new Uint8Array(w * h);
  const heur = (i) => {
    const ax = i % w;
    const ay = (i / w) | 0;
    return Math.hypot(ax - (goalI % w), ay - ((goalI / w) | 0));
  };

  const open = makeHeap();
  gScore[startI] = 0;
  open.push({ i: startI, f: heur(startI) });

  const NB = [
    [1, 0, 1],
    [-1, 0, 1],
    [0, 1, 1],
    [0, -1, 1],
    [1, 1, Math.SQRT2],
    [1, -1, Math.SQRT2],
    [-1, 1, Math.SQRT2],
    [-1, -1, Math.SQRT2],
  ];

  while (open.size) {
    const { i } = open.pop();
    if (i === goalI) break;
    if (seen[i]) continue;
    seen[i] = 1;
    const gx = i % w;
    const gy = (i / w) | 0;
    for (const [dx, dy, cost] of NB) {
      const nx = gx + dx;
      const ny = gy + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const ni = ny * w + nx;
      if (!free[ni]) continue;
      // No cutting a diagonal past an obstacle corner.
      if (dx && dy && (!free[gy * w + nx] || !free[ny * w + gx])) continue;
      const tentative = gScore[i] + cost;
      if (tentative < gScore[ni]) {
        gScore[ni] = tentative;
        came[ni] = i;
        open.push({ i: ni, f: tentative + heur(ni) });
      }
    }
  }

  if (came[goalI] === -1 && goalI !== startI) return null;

  // Rebuild, then string-pull: keep a waypoint only where the line from the
  // last kept point to the next one is no longer clear.
  const cells = [];
  for (let i = goalI; i !== -1; i = came[i]) cells.push({ x: cx(i % w), y: cy((i / w) | 0) });
  cells.reverse();
  cells[0] = { x: start.x, y: start.y };
  cells[cells.length - 1] = dest;

  const out = [cells[0]];
  let anchor = 0;
  for (let k = 2; k < cells.length; k += 1) {
    if (!segmentClear(cells[anchor], cells[k], obstacles)) {
      out.push(cells[k - 1]);
      anchor = k - 1;
    }
  }
  out.push(cells[cells.length - 1]);
  return out.slice(1); // drop the start point itself
}
