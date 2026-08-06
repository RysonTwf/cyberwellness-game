import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Movement for the Traveler inside a 2D realm.
 *
 * The world is a 100x100 unit space mapped onto whatever the scene box is, so
 * every position in realms.js is resolution-independent. Two control schemes
 * run at once, because this is a touch-first product used on desktop too:
 *
 *   - hold arrow keys / WASD (desktop)
 *   - tap or click a spot on the ground to walk there (touch)
 *
 * Both feed the same rAF loop, so neither one is a second-class path.
 */

const KEY_DIRS = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  a: [-1, 0],
  d: [1, 0],
  w: [0, -1],
  s: [0, 1],
  A: [-1, 0],
  D: [1, 0],
  W: [0, -1],
  S: [0, 1],
};

export function useWalker({ spawn, bounds, speed = 30, enabled = true }) {
  const [pos, setPos] = useState(spawn);
  const [facing, setFacing] = useState(1);
  const [moving, setMoving] = useState(false);

  const posRef = useRef(spawn);
  const keys = useRef(new Set());
  const target = useRef(null);
  const frame = useRef(0);
  const lastTime = useRef(0);

  const clamp = useCallback(
    (x, y) => [
      Math.min(bounds.maxX, Math.max(bounds.minX, x)),
      Math.min(bounds.maxY, Math.max(bounds.minY, y)),
    ],
    [bounds.maxX, bounds.minX, bounds.maxY, bounds.minY],
  );

  /** Send the Traveler walking to a point (used by tap-to-move). */
  const walkTo = useCallback(
    (x, y) => {
      if (!enabled) return;
      const [cx, cy] = clamp(x, y);
      target.current = { x: cx, y: cy };
    },
    [clamp, enabled],
  );

  const stop = useCallback(() => {
    target.current = null;
    keys.current.clear();
    setMoving(false);
  }, []);

  /** Teleport without animating — used when a realm remounts. */
  const placeAt = useCallback(
    (x, y) => {
      const [cx, cy] = clamp(x, y);
      posRef.current = { x: cx, y: cy };
      target.current = null;
      setPos({ x: cx, y: cy });
    },
    [clamp],
  );

  // ---- keyboard ----------------------------------------------------------
  useEffect(() => {
    if (!enabled) return undefined;

    const down = (e) => {
      if (KEY_DIRS[e.key]) {
        // Don't let arrow keys scroll the page out from under the world.
        e.preventDefault();
        keys.current.add(e.key);
        target.current = null; // a keypress cancels a tap-to-move
      }
    };
    const up = (e) => {
      if (KEY_DIRS[e.key]) keys.current.delete(e.key);
    };
    const blur = () => keys.current.clear();

    window.addEventListener('keydown', down, { passive: false });
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
      keys.current.clear();
    };
  }, [enabled]);

  // ---- the loop ----------------------------------------------------------
  useEffect(() => {
    if (!enabled) {
      setMoving(false);
      return undefined;
    }

    const tick = (time) => {
      // dt is clamped so returning to a backgrounded tab (where rAF is paused)
      // resumes with a normal step instead of teleporting the Traveler.
      const dt = lastTime.current ? Math.min((time - lastTime.current) / 1000, 0.05) : 0;
      lastTime.current = time;

      let dx = 0;
      let dy = 0;

      for (const key of keys.current) {
        const dir = KEY_DIRS[key];
        if (dir) {
          dx += dir[0];
          dy += dir[1];
        }
      }

      if (!dx && !dy && target.current) {
        const tx = target.current.x - posRef.current.x;
        const ty = target.current.y - posRef.current.y;
        const dist = Math.hypot(tx, ty);
        if (dist < 0.8) {
          target.current = null;
        } else {
          dx = tx / dist;
          dy = ty / dist;
        }
      }

      const len = Math.hypot(dx, dy);
      if (len > 0 && dt > 0) {
        // Vertical movement is compressed: the walkable strip is shallow, and
        // moving up/down as fast as left/right reads as sliding, not walking.
        const nx = posRef.current.x + (dx / len) * speed * dt;
        const ny = posRef.current.y + (dy / len) * speed * 0.55 * dt;
        const [cx, cy] = clamp(nx, ny);
        posRef.current = { x: cx, y: cy };
        setPos({ x: cx, y: cy });
        setMoving(true);
        if (dx !== 0) setFacing(dx > 0 ? 1 : -1);
      } else {
        setMoving(false);
      }

      frame.current = requestAnimationFrame(tick);
    };

    frame.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame.current);
      lastTime.current = 0;
    };
  }, [clamp, enabled, speed]);

  return { pos, facing, moving, walkTo, stop, placeAt };
}

/** Distance in world units — used for "am I close enough to interact?" */
export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
