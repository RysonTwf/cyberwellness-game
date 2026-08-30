import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, CornerDownLeft } from 'lucide-react';
import { Comet } from '../components/Characters';
import Traveler from './Traveler';
import Boat from './Boat';
import { useWalker, distance } from './useWalker';
import { isInputLocked } from '../lib/inputLock';

/**
 * A walkable 2D space — used for both a realm and the Atlas hub.
 *
 * The scene art is the backdrop, the Traveler walks on it, and each thing
 * worth reaching is a pin you walk up to. Movement is deliberately forgiving
 * for a 7-12 year old: nothing to fall off, no timer, no failing, and every
 * pin carries a visible label so nobody gets lost hunting for it.
 */

const INTERACT_RANGE = 12;

// Dev-only pin calibration: run the app with `?pins` in the URL
// (e.g. http://localhost:5174/?pins) and every world shows a live x/y
// readout in stop-space percent — the same numbers realms.js stops use.
// Clicking copies `x: NN, y: NN` to the clipboard (and logs it) so a
// misplaced pin can be re-measured by eye and pasted straight into
// realms.js. Stripped from production builds via the DEV guard.
const CALIBRATE =
  import.meta.env.DEV && new URLSearchParams(window.location.search).has('pins');

export default function World({
  sceneKey,
  scene,
  accent = 'var(--ink)',
  spawn,
  bounds,
  hotspots = [],
  objective,
  hint = 'Use WASD/arrow keys, or tap where you want to go',
  paused = false,
  onInteract,
  // Every realm shares the same 2:1 scene box (`.world`) so their SVGs
  // (all viewBox="0 0 560 280") render without letterboxing. The Atlas is
  // the one scene wide enough to want its own ratio — pass a modifier
  // class rather than changing `.world` itself, so nothing else shifts.
  className,
  // 'boat' on the Atlas hub, since its ground is open water — see Boat.jsx.
  vehicle = 'walk',
  // Comet only exists once they've unfolded out of the diary (storyline.md
  // prologue), so the opening room hides them until that happens.
  showComet = true,
  // Called as the Traveler moves, so a space that wants to be resumable
  // (the Atlas) can remember where they were and spawn them back there.
  onMove,
  // Furniture/props the Traveler can't walk into — { x, y, w, h } rects in
  // the same 0-100 room-percent space as everything else. Empty by default;
  // only the Traveler's Room passes any in right now.
  obstacles = [],
  // 'boy' | 'girl' | null — which CharacterSelect pick to render as, forwarded
  // straight to Traveler (world/Traveler.jsx decides what that means).
  // Irrelevant on 'boat' scenes.
  avatar = null,
}) {
  const { pos, facing, moving, placeAt, goTo } = useWalker({
    spawn,
    bounds,
    enabled: !paused,
    obstacles,
  });

  // Tap/click-to-move: touch's primary control, and available to mouse too.
  // Lives on the scene background (`.world` itself), not the whole document,
  // so everything layered over it — the interact button, and any future
  // clickable UI — can opt out just by stopping the event before it gets
  // here (the interact button already does, see its own onPointerDown
  // below). Pointer events unify mouse/touch/pen, so one handler covers all
  // three; e.button !== 0 filters out right/middle-click.
  const handleWalkTap = (e) => {
    if (paused || e.button !== 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    if (CALIBRATE) {
      const snippet = `x: ${Math.round(x)}, y: ${Math.round(y)}`;
      // eslint-disable-next-line no-console
      console.log(`[pins] ${sceneKey}: { ${snippet} }`);
      navigator.clipboard?.writeText(snippet).catch(() => {});
    }
    goTo(x, y);
  };

  // Calibration readout state — only ever set while ?pins is active.
  const [probe, setProbe] = useState(null);
  const handleProbeMove = CALIBRATE
    ? (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setProbe({
          x: Math.round(((e.clientX - rect.left) / rect.width) * 100),
          y: Math.round(((e.clientY - rect.top) / rect.height) * 100),
        });
      }
    : undefined;

  // Re-place whenever the space changes, so each one starts at its own gate.
  useEffect(() => {
    placeAt(spawn.x, spawn.y);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneKey]);

  // Report movement upward, but only once they've settled: writing every frame
  // would push a state update (and a localStorage write) on every rAF tick.
  const moveRef = useRef(onMove);
  moveRef.current = onMove;
  useEffect(() => {
    if (!moveRef.current || moving) return undefined;
    const t = setTimeout(() => moveRef.current?.(pos), 250);
    return () => clearTimeout(t);
  }, [moving, pos]);

  // Whichever pin the Traveler is closest to, if they're close enough at all.
  const active = useMemo(() => {
    let best = null;
    let bestDist = INTERACT_RANGE;
    for (const spot of hotspots) {
      const d = distance(pos, spot);
      if (d < bestDist) {
        best = spot;
        bestDist = d;
      }
    }
    return best;
  }, [hotspots, pos]);

  // Space / Enter to interact, matching the on-screen button.
  useEffect(() => {
    if (paused || !active) return undefined;
    const onKey = (e) => {
      if (isInputLocked()) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onInteract(active);
      }
    };
    window.addEventListener('keydown', onKey, { passive: false });
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onInteract, paused]);

  // Everything placed *in* the world (walker, pins, interact button, Comet)
  // is sized in fixed CSS px, calibrated for the box at its old 1100px width
  // cap — but the box itself is fluid and can now run up to 1600px. Without
  // compensation the actors visibly shrink relative to the scene as the box
  // grows (most noticeable on browser zoom-out, where the box re-expands
  // into the freed space while fixed-px pins get smaller). This factor
  // scales them back up in proportion, never below 1 — so phones and small
  // windows (and their 48px touch floors) behave exactly as before.
  const worldRef = useRef(null);
  const [worldScale, setWorldScale] = useState(1);
  useEffect(() => {
    const el = worldRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry?.contentRect?.width ?? el.clientWidth;
      setWorldScale(Math.min(Math.max(w / 1100, 1), 1.5));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fake a little depth: the Traveler is smaller further "back" in the scene.
  const depth = (pos.y - bounds.minY) / Math.max(1, bounds.maxY - bounds.minY);
  const scale = (0.82 + depth * 0.34) * worldScale;

  return (
    <div className="world-wrap">
      <div
        ref={worldRef}
        className={`world${paused ? ' paused' : ''}${className ? ` ${className}` : ''}`}
        style={{ '--ws': worldScale }}
        role="presentation"
        onPointerDown={handleWalkTap}
        onPointerMove={handleProbeMove}
      >
        <div className="world-scene">{scene}</div>

        {CALIBRATE && probe && (
          <div
            style={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 10,
              padding: '4px 10px',
              borderRadius: 8,
              background: 'rgba(31, 52, 82, 0.85)',
              color: '#fff',
              fontFamily: 'monospace',
              fontSize: 14,
              pointerEvents: 'none',
            }}
          >
            x: {probe.x}, y: {probe.y} · click copies
          </div>
        )}

        {hotspots.map((spot) => (
          <div
            key={spot.id ?? spot.label}
            className={`hotspot${active === spot ? ' near' : ''}`}
            style={{ left: `${spot.x}%`, top: `${spot.y}%`, '--accent': spot.accent ?? accent }}
          >
            <span className="hotspot-pin">
              <MapPin size={22} strokeWidth={2.6} />
            </span>
            {spot.label && <span className="hotspot-label">{spot.label}</span>}
          </div>
        ))}

        {/* Comet, trailing along behind */}
        {showComet && (
          <div
            className="comet-follow"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: `scale(${scale})` }}
          >
            <span className="floaty">
              <Comet size={30} />
            </span>
          </div>
        )}

        <div
          className="walker"
          style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: `scale(${scale})` }}
        >
          {vehicle === 'boat' ? (
            <Boat facing={facing} moving={moving} accent={accent} />
          ) : (
            <Traveler facing={facing} moving={moving} accent={accent} avatar={avatar} />
          )}
        </div>

        {active && !paused && (
          <button
            type="button"
            className="interact"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, '--accent': active.accent ?? accent }}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onInteract(active)}
          >
            {active.action ?? 'Look'}
            <CornerDownLeft size={15} />
          </button>
        )}
      </div>

      <div className="world-bar">
        <span className="objective">
          <MapPin size={15} style={{ color: accent }} />
          {objective}
        </span>
        <span className="controls-hint">{hint}</span>
      </div>
    </div>
  );
}
