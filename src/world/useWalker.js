import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Movement for the Traveler inside a 2D realm.
 *
 * The world is a 100x100 unit space mapped onto whatever the scene box is, so
 * every position in realms.js is resolution-independent. Movement is
 * keyboard-only — hold arrow keys or WASD — so it stays predictable and
 * doesn't compete with clicks on hotspots/UI.
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

export function useWalker({ spawn, bounds, speed = 30, enabled = true, obstacles = [] }) {
  const [pos, setPos] = useState(spawn);
  const [facing, setFacing] = useState(1);
  const [moving, setMoving] = useState(false);

  const posRef = useRef(spawn);
  const keys = useRef(new Set());
  const frame = useRef(0);
  const lastTime = useRef(0);

  const clamp = useCallback(
    (x, y) => [
      Math.min(bounds.maxX, Math.max(bounds.minX, x)),
      Math.min(bounds.maxY, Math.max(bounds.minY, y)),
    ],
    [bounds.maxX, bounds.minX, bounds.maxY, bounds.minY],
  );

  // Kept in a ref, not a hook dependency — callers that don't memoize their
  // `obstacles` array (a fresh `[]` every render, by default) would
  // otherwise restart the tick loop below on every single render.
  const obstaclesRef = useRef(obstacles);
  obstaclesRef.current = obstacles;

  /** Is this point standing inside a piece of furniture? */
  const blocked = useCallback((x, y) => {
    for (const o of obstaclesRef.current) {
      if (Math.abs(x - o.x) < o.w / 2 && Math.abs(y - o.y) < o.h / 2) return true;
    }
    return false;
  }, []);

  const stop = useCallback(() => {
    keys.current.clear();
    setMoving(false);
  }, []);

  /** Teleport without animating — used when a realm remounts. */
  const placeAt = useCallback(
    (x, y) => {
      const [cx, cy] = clamp(x, y);
      posRef.current = { x: cx, y: cy };
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

      const len = Math.hypot(dx, dy);
      if (len > 0 && dt > 0) {
        // Vertical movement is compressed: the walkable strip is shallow, and
        // moving up/down as fast as left/right reads as sliding, not walking.
        const stepX = (dx / len) * speed * dt;
        const stepY = (dy / len) * speed * 0.55 * dt;

        // Axis-separated, so walking diagonally into a piece of furniture
        // slides you along its edge instead of just stopping dead — the
        // same trick bounds-clamping already uses per axis, just checked
        // against obstacles too now.
        let cx = posRef.current.x;
        let cy = posRef.current.y;

        const tryX = clamp(cx + stepX, cy)[0];
        if (!blocked(tryX, cy)) cx = tryX;

        const tryY = clamp(cx, cy + stepY)[1];
        if (!blocked(cx, tryY)) cy = tryY;

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
  }, [blocked, clamp, enabled, speed]);

  return { pos, facing, moving, stop, placeAt };
}

/** Distance in world units — used for "am I close enough to interact?" */
export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
