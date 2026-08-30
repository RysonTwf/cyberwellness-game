import { useCallback, useEffect, useRef, useState } from 'react';
import { isInputLocked } from '../lib/inputLock';

/**
 * Movement for the Traveler inside a 2D realm.
 *
 * The world is a 100x100 unit space mapped onto whatever the scene box is, so
 * every position in realms.js is resolution-independent. Two input sources
 * both drive the same position: physical keys (arrow keys or WASD), and
 * tap/click-to-move (World.jsx's `goTo`, a one-shot destination the
 * Traveler walks toward each tick until they arrive or a key interrupts).
 *
 * Click/tap-to-move was tried once before (pre-`ef16cce`) as a single
 * whole-scene click handler and got pulled for competing with clicks on
 * hotspots/UI — tapping the interact button also walked the Traveler out
 * from under it. This version avoids that the same way the interact button
 * already guarded for it (`onPointerDown` + `stopPropagation`, present
 * before this hook existed): World.jsx's tap handler sits on the scene
 * background, and every clickable thing layered over it stops the event
 * from reaching that background before it can be read as "walk here".
 */

// Keyed by e.code (the physical key), not e.key. e.key for a letter flips
// case with Shift/Caps Lock ('w' vs 'W') — mash enough keys at once and it's
// easy to clip Shift for an instant while a movement key is already held,
// which fires a fresh keydown for the *same* held key under the other case.
// That adds a second, distinct entry below; the eventual keyup only ever
// matches whichever case was current at release, so the other one is
// orphaned in `keys.current` forever, permanently contributing to movement —
// the "stuck moving in one direction" bug. e.code doesn't have this problem:
// it's the physical key, so down and up always agree regardless of modifier
// state. (Arrow keys were never affected — ArrowUp has no shifted variant.)
const KEY_DIRS = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
  KeyA: [-1, 0],
  KeyD: [1, 0],
  KeyW: [0, -1],
  KeyS: [0, 1],
};

// Close enough to a tap/click target to call it "arrived" — snap and stop
// rather than asymptotically creeping the last fraction of a unit forever.
const ARRIVE_EPS = 1.2;

export function useWalker({ spawn, bounds, speed = 30, enabled = true, obstacles = [] }) {
  const [pos, setPos] = useState(spawn);
  const [facing, setFacing] = useState(1);
  const [moving, setMoving] = useState(false);

  const posRef = useRef(spawn);
  const keys = useRef(new Set());
  const target = useRef(null); // { x, y } | null — pending tap/click destination
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
    target.current = null;
    setMoving(false);
  }, []);

  // ---- tap/click-to-move ---------------------------------------------------
  // World.jsx calls this with a percentage-space point tapped/clicked on the
  // scene background. One-shot: the tick loop below walks toward it each
  // frame until arrival (or a key press interrupts, see the keyboard `down`
  // handler) — no continuous drag-tracking, just "go there".
  const goTo = useCallback((x, y) => {
    if (!enabled || isInputLocked()) return;
    const [cx, cy] = clamp(x, y);
    target.current = { x: cx, y: cy };
  }, [enabled, clamp]);

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
      // A floating overlay (the settings menu) sitting on top doesn't stop
      // this window-level listener on its own — see lib/inputLock.js.
      if (isInputLocked()) return;
      if (KEY_DIRS[e.code]) {
        // Don't let arrow keys scroll the page out from under the world.
        e.preventDefault();
        keys.current.add(e.code);
        // A real key press takes over from a walk-to-tap in progress —
        // otherwise the two fight over posRef every frame.
        target.current = null;
      }
    };
    const up = (e) => {
      if (KEY_DIRS[e.code]) keys.current.delete(e.code);
    };
    // Both a safety net for the rare case a keyup genuinely never arrives
    // (some keyboards drop events under heavy multi-key rollover) — losing
    // focus or the tab going background is as good a signal as any that
    // whatever's in `keys.current` can no longer be trusted.
    const clear = () => {
      keys.current.clear();
      target.current = null;
    };

    window.addEventListener('keydown', down, { passive: false });
    window.addEventListener('keyup', up);
    window.addEventListener('blur', clear);
    document.addEventListener('visibilitychange', clear);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', clear);
      document.removeEventListener('visibilitychange', clear);
      keys.current.clear();
      target.current = null;
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

      // Freezes movement immediately even if a key was already held down the
      // instant the overlay opened (the `down` guard above only stops *new*
      // presses from registering).
      if (!isInputLocked()) {
        for (const key of keys.current) {
          const dir = KEY_DIRS[key];
          if (dir) {
            dx += dir[0];
            dy += dir[1];
          }
        }
      }

      // No key held — if a tap/click set a destination, steer toward it
      // instead. Keys always win when both are present (checked above).
      const seekingTarget = dx === 0 && dy === 0 && !isInputLocked() && target.current;
      if (seekingTarget) {
        dx = target.current.x - posRef.current.x;
        dy = target.current.y - posRef.current.y;
        if (Math.hypot(dx, dy) < ARRIVE_EPS) {
          // Close enough — snap exactly onto it rather than creeping the
          // last fraction of a unit forever, and stop seeking.
          const [fx, fy] = clamp(target.current.x, target.current.y);
          target.current = null;
          posRef.current = { x: fx, y: fy };
          setPos({ x: fx, y: fy });
          setMoving(false);
          frame.current = requestAnimationFrame(tick);
          return;
        }
      }

      const len = Math.hypot(dx, dy);
      if (len > 0 && dt > 0) {
        // Vertical used to be compressed to 0.55x horizontal (the walkable
        // strip is shallow, and the worry was that full speed would read as
        // sliding rather than walking) — dropped on request: it read as
        // up/down just being slower, not as a deliberate stylistic choice.
        const stepX = (dx / len) * speed * dt;
        const stepY = (dy / len) * speed * dt;

        // Axis-separated, so walking diagonally into a piece of furniture
        // slides you along its edge instead of just stopping dead — the
        // same trick bounds-clamping already uses per axis, just checked
        // against obstacles too now.
        const startX = posRef.current.x;
        const startY = posRef.current.y;
        let cx = startX;
        let cy = startY;

        let tryX = clamp(cx + stepX, cy)[0];
        // Walking toward a tapped point: don't overshoot past it on either
        // axis just because the per-frame step was larger than what's left.
        if (seekingTarget) {
          const overshotX = (stepX > 0 && tryX > target.current.x) || (stepX < 0 && tryX < target.current.x);
          if (overshotX) tryX = target.current.x;
        }
        if (!blocked(tryX, cy)) cx = tryX;

        let tryY = clamp(cx, cy + stepY)[1];
        if (seekingTarget) {
          const overshotY = (stepY > 0 && tryY > target.current.y) || (stepY < 0 && tryY < target.current.y);
          if (overshotY) tryY = target.current.y;
        }
        if (!blocked(cx, tryY)) cy = tryY;

        posRef.current = { x: cx, y: cy };
        setPos({ x: cx, y: cy });
        setMoving(true);
        if (dx !== 0) setFacing(dx > 0 ? 1 : -1);

        // Reached the tap target, or walked as far as an obstacle/bound lets
        // — either way, stop seeking it (a target stuck behind furniture
        // would otherwise sit there forever quietly failing to arrive, which
        // reads as a bug more than "there was furniture in the way").
        if (seekingTarget) {
          const arrived = cx === target.current.x && cy === target.current.y;
          const stuck = cx === startX && cy === startY;
          if (arrived || stuck) target.current = null;
        }
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

  return { pos, facing, moving, stop, placeAt, goTo };
}

/** Distance in world units — used for "am I close enough to interact?" */
export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
