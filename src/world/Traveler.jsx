import { useEffect, useState } from 'react';
import boyWalk1 from '../assets/characters/boy-walk-1.png';
import boyWalk2 from '../assets/characters/boy-walk-2.png';

const BOY_FRAMES = [boyWalk1, boyWalk2];
const BOY_FRAME_MS = 240;

/**
 * Real character art for players who picked "boy" at CharacterSelect — a
 * 2-frame walk cycle, swapped on a timer while moving and held on the idle
 * frame otherwise. Cropped to a 664x931 bounding box (~0.713:1), which is
 * close enough to the neutral SVG's own 40:56 (~0.714:1) that rendering it
 * at the same 64px-wide footprint lands in World.jsx's existing `.walker`
 * positioning (styles.css, calibrated for that footprint) without any
 * changes there. No "girl" art exists yet, so Traveler below only reaches
 * for this when avatar === 'boy'; everyone else keeps the neutral figure.
 *
 * One correction on top of that footprint match: the SVG's own feet sit
 * ~8.9% up from its rendered bottom edge (viewBox y=51 of 56 — the shadow
 * ellipse lives in that gap), which is what `.walker`'s -81px offset was
 * actually calibrated against. This crop is tight to the shoe tips instead
 * (no such gap), so without a correction the sprite would visibly sit ~8px
 * lower than pos.y/the hotspots actually anchor it. -8.9% here restores it.
 */
function BoyTraveler({ facing = 1, moving = false }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!moving) {
      setFrame(0); // hold the idle pose the instant they stop, not mid-stride
      return undefined;
    }
    const id = setInterval(() => setFrame((f) => (f + 1) % BOY_FRAMES.length), BOY_FRAME_MS);
    return () => clearInterval(id);
  }, [moving]);

  return (
    <div
      className={`traveler-sprite${moving ? ' walking' : ''}`}
      style={{ width: 64, transform: `scaleX(${facing}) translateY(-8.9%)` }}
    >
      <div className="tv-shadow-sprite" />
      <img src={BOY_FRAMES[frame]} alt="" width={64} draggable={false} />
    </div>
  );
}

/**
 * The Traveler — the player's avatar.
 *
 * storyline.md gives the Traveler no fixed appearance on purpose, so the
 * default is built from plain shapes: no skin tone, no hair, no gendered
 * silhouette. Just a small figure in a scarf, which takes the realm's
 * accent colour so the player visibly belongs to whichever realm they're
 * standing in. Picking "boy" at CharacterSelect opts out of that — real art
 * (BoyTraveler above), fixed appearance, no per-realm recolour.
 */
export default function Traveler({ facing = 1, moving = false, accent = 'var(--ink)', avatar = null }) {
  if (avatar === 'boy') {
    return <BoyTraveler facing={facing} moving={moving} />;
  }

  return (
    <svg
      className={`traveler${moving ? ' walking' : ''}`}
      viewBox="0 0 40 56"
      width="64"
      height="90"
      style={{ transform: `scaleX(${facing})` }}
      aria-hidden="true"
    >
      {/* soft ground shadow */}
      <ellipse className="tv-shadow" cx="20" cy="53" rx="12" ry="3.2" fill="var(--ink)" opacity="0.18" />

      <g className="tv-body">
        {/* legs */}
        <g stroke="var(--ink)" strokeWidth="4.5" strokeLinecap="round">
          <line className="tv-leg-back" x1="17" y1="40" x2="15" y2="51" />
          <line className="tv-leg-front" x1="23" y1="40" x2="25" y2="51" />
        </g>

        {/* pack */}
        <rect x="6" y="24" width="9" height="13" rx="3.5" fill={accent} opacity="0.85" />

        {/* torso */}
        <path d="M12 24 q8 -5 16 0 v14 q-8 4 -16 0 Z" fill="var(--ink)" />

        {/* scarf, in the realm's colour */}
        <path d="M12 24 q8 4 16 0 l1 5 q-9 4 -18 0 Z" fill={accent} />
        <path className="tv-scarf-tail" d="M27 27 q7 3 6 10 l-4 -1 q0 -6 -4 -7 Z" fill={accent} />

        {/* head */}
        <circle cx="20" cy="15" r="9" fill="var(--ink)" />
        {/* traveller's cap brim */}
        <path d="M11 13 q9 -9 18 0 q-9 -4 -18 0 Z" fill={accent} />
        {/* eyes */}
        <circle cx="23.5" cy="16" r="1.7" fill="var(--paper)" />
        <circle cx="17.5" cy="16" r="1.7" fill="var(--paper)" />
      </g>
    </svg>
  );
}
