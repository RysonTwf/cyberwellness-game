import { useEffect, useMemo, useRef } from 'react';
import { MapPin, CornerDownLeft } from 'lucide-react';
import { Comet } from '../components/Characters';
import Traveler from './Traveler';
import Boat from './Boat';
import { useWalker, distance } from './useWalker';

/**
 * A walkable 2D space — used for both a realm and the Atlas hub.
 *
 * The scene art is the backdrop, the Traveler walks on it, and each thing
 * worth reaching is a pin you walk up to. Movement is deliberately forgiving
 * for a 7-12 year old: nothing to fall off, no timer, no failing, and every
 * pin carries a visible label so nobody gets lost hunting for it.
 */

const INTERACT_RANGE = 12;

export default function World({
  sceneKey,
  scene,
  accent = 'var(--ink)',
  spawn,
  bounds,
  hotspots = [],
  objective,
  hint = 'Use WASD or the arrow keys to walk',
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
}) {
  const { pos, facing, moving, placeAt } = useWalker({
    spawn,
    bounds,
    enabled: !paused,
  });

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
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onInteract(active);
      }
    };
    window.addEventListener('keydown', onKey, { passive: false });
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onInteract, paused]);

  // Fake a little depth: the Traveler is smaller further "back" in the scene.
  const depth = (pos.y - bounds.minY) / Math.max(1, bounds.maxY - bounds.minY);
  const scale = 0.82 + depth * 0.34;

  return (
    <div className="world-wrap">
      <div
        className={`world${paused ? ' paused' : ''}${className ? ` ${className}` : ''}`}
        role="presentation"
      >
        <div className="world-scene">{scene}</div>

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
            <Traveler facing={facing} moving={moving} accent={accent} />
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
