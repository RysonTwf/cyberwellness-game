import boyWalk1 from '../assets/characters/boy-walk-1.png';
import boyWalk2 from '../assets/characters/boy-walk-2.png';
import boyWalkFlip1 from '../assets/characters/boy-walkflip-1.png';
import boyWalkFlip2 from '../assets/characters/boy-walkflip-2.png';
import girlWalk1 from '../assets/characters/girl-walk-1.png';
import girlWalk2 from '../assets/characters/girl-walk-2.png';
import girlWalkFlip1 from '../assets/characters/girl-walkflip-1.png';
import girlWalkFlip2 from '../assets/characters/girl-walkflip-2.png';

// Each avatar has a hand-drawn two-pose walk cycle for each direction —
// `right` faces the way the art was drawn, `left` is the artist's flipped
// pass (not a CSS mirror, so the pack sits on the correct shoulder either
// way). [poseA, poseB] — A is also the idle/CharacterSelect pose.
const FRAME_SETS = {
  boy: { right: [boyWalk1, boyWalk2], left: [boyWalkFlip1, boyWalkFlip2] },
  girl: { right: [girlWalk1, girlWalk2], left: [girlWalkFlip1, girlWalkFlip2] },
};

/**
 * Real character art for players who picked "boy" or "girl" at
 * CharacterSelect. `facing` picks the left or right cycle rather than
 * mirroring one with scaleX, so the pack, the cap brim and the stride all
 * stay drawn the right way round.
 *
 * The two poses cross-fade continuously while walking (CSS `tv-step`) rather
 * than hard-cutting on a JS timer — with only two frames a hard swap reads
 * as a stutter, and swapping the <img> src can drop a frame while the next
 * one decodes. Every frame for both directions stays mounted here, so a
 * step, and a turn, are pure opacity changes with nothing to load. Idle
 * holds pose A; the blanket reduced-motion rule (styles.css) freezes it
 * there too.
 *
 * All eight frames (two avatars x two directions x two poses) are cropped to
 * the same 672x931 box (~0.722:1, close enough to the neutral SVG's own
 * 40:56 — ~0.714:1 — that a 64px-wide footprint lands in World.jsx's
 * `.walker` positioning without changes there). The -8.9% translateY is the
 * one correction: the SVG's feet sit ~8.9% up from its bottom edge (the
 * shadow gap), which `.walker`'s -81px offset was calibrated against, and
 * the crops are tight to the shoe tips with no such gap.
 */
function SpriteTraveler({ avatar, facing = 1, moving = false }) {
  const dir = facing < 0 ? 'left' : 'right';
  return (
    <div
      className={`traveler-sprite${moving ? ' walking' : ''}`}
      style={{ width: 64, transform: 'translateY(-8.9%)' }}
    >
      <div className="tv-shadow-sprite" />
      {Object.entries(FRAME_SETS[avatar]).map(([d, [poseA, poseB]]) => (
        <div key={d} className={`tv-dir${d === dir ? ' active' : ''}`}>
          <img className="tv-frame" src={poseA} alt="" width={64} draggable={false} />
          <img className="tv-frame tv-b" src={poseB} alt="" width={64} draggable={false} />
        </div>
      ))}
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
 * standing in. Picking "boy" or "girl" at CharacterSelect opts out of that
 * — real art (SpriteTraveler above), fixed appearance, no per-realm
 * recolour. Anything else (no pick yet, or a future avatar with no art)
 * keeps the neutral figure.
 */
export default function Traveler({ facing = 1, moving = false, accent = 'var(--ink)', avatar = null }) {
  if (FRAME_SETS[avatar]) {
    // key={avatar}: a fresh mount (not a prop update) if the pick ever
    // changes mid-session, so the frame-swap timer above can't carry stale
    // state from one avatar's cycle into another's.
    return <SpriteTraveler key={avatar} avatar={avatar} facing={facing} moving={moving} />;
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
