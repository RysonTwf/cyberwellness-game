import seesawImg from '../../assets/beach/seesaw.png';
import palmHammockImg from '../../assets/beach/palm-hammock.png';

/**
 * A piece of beach furniture, positioned in the scene's 0-100 world space
 * and sized as a percentage of the scene's own width, same convention as
 * world/room/RoomScene.jsx's `Prop` — `x, y` is the sprite's own
 * bottom-centre (its base/shadow), so several props on the same `y` sit the
 * same distance from the water.
 */
function Prop({ src, x, y, width, rotate = 0, z = 1 }) {
  return (
    <img
      src={src}
      alt=""
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        // The base stays anchored to (x, y) regardless of rotation — rotate
        // around the sprite's own centre, not the translate origin, so a
        // tilting seesaw swings both ends instead of drifting off its spot.
        transform: `translate(-50%, -100%) rotate(${rotate}deg)`,
        transformOrigin: 'center',
        transition: 'transform 0.5s cubic-bezier(0.34, 1.2, 0.64, 1)',
        imageRendering: 'pixelated',
        zIndex: z,
        pointerEvents: 'none',
      }}
    />
  );
}

/** A soft contact shadow — same treatment as RoomScene's `Shadow`. */
function Shadow({ x, y, width }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        aspectRatio: '3 / 1',
        transform: 'translate(-50%, -50%)',
        borderRadius: '50%',
        background: 'radial-gradient(closest-side, rgba(31,52,82,0.24), rgba(31,52,82,0))',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}

const WATER_LINE = 46; // where the tide's edge sits, in scene-percent
export const SEESAW_SPOT = { x: 50, y: 76 };
const HAMMOCK_SPOT = { x: 20, y: 62 };

/** .world's default width:height (styles.css `--scene-ar`) — same role as
 * RoomScene's ROOM_ASPECT: converts a sprite's width-as-percentage into its
 * real on-screen height. */
const BEACH_ASPECT = 2;

// Single source of truth for the beach's two standing props — same pattern
// as RoomScene's FURNITURE array, so a prop's collision box can't drift out
// of sync with where it's actually drawn.
const PROPS = [
  { key: 'seesaw', src: seesawImg, ...SEESAW_SPOT, width: 16, nativeW: 43, nativeH: 16 },
  { key: 'hammock', src: palmHammockImg, ...HAMMOCK_SPOT, width: 20, nativeW: 72, nativeH: 36 },
];

export const BEACH_OBSTACLES = PROPS.map((p) => {
  const height = p.width * (p.nativeH / p.nativeW) * BEACH_ASPECT;
  // Both props here are squarely footprint-shaped (not tall-and-thin like a
  // wardrobe), so most of the sprite's height counts as unwalkable, same
  // reasoning RoomScene applied to the bed.
  const footprint = Math.max(height * 0.8, 6);
  return { x: p.x, y: p.y - footprint / 2 + 1.5, w: p.width + 2.5, h: footprint };
});

/**
 * Balance Bay's beach — the walkable stand-in for MiniGameBalance's tap
 * list (components/BalanceBeachRealm.jsx, P1–3 only). Flat CSS fills for
 * sand/water, matching RoomScene's CSS-only wall/floor; the seesaw and the
 * palm-tree hammock are real sprites cropped from the Farm RPG pack (see
 * src/assets/beach/), the only two props this scene needs since everything
 * else here is a hotspot the Traveler walks up to, not scenery.
 *
 * `tilt` is the seesaw's live rotation in degrees — same formula
 * MiniGameBalance already uses (-((screenCount - lifeCount) / slots) * 15),
 * just applied to a sprite instead of a CSS beam.
 */
export default function BeachScene({ tilt = 0 }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#e8d5a3' }}>
      {/* the tide, along the top edge */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          height: `${WATER_LINE}%`,
          background: 'linear-gradient(180deg, #6fa8b5 0%, #8fc0c9 70%, #a8d0d4 100%)',
        }}
      />
      {/* where the water meets the sand — a soft foam edge, not a hard line */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${WATER_LINE - 3}%`,
          height: '6%',
          background:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.55) 0 14px, rgba(255,255,255,0) 14px 30px)',
          opacity: 0.6,
        }}
      />
      {/* sand grain texture, echoing RoomScene's plank-grain treatment */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${WATER_LINE}%`,
          bottom: 0,
          backgroundImage:
            'repeating-linear-gradient(120deg, rgba(122,82,51,0.06) 0 3px, transparent 3px 20px)',
        }}
      />

      <Shadow x={HAMMOCK_SPOT.x} y={HAMMOCK_SPOT.y} width={22} />
      <Prop src={palmHammockImg} x={HAMMOCK_SPOT.x} y={HAMMOCK_SPOT.y} width={20} z={2} />

      <Shadow x={SEESAW_SPOT.x} y={SEESAW_SPOT.y} width={18} />
      <Prop src={seesawImg} x={SEESAW_SPOT.x} y={SEESAW_SPOT.y} width={16} rotate={tilt} z={2} />
    </div>
  );
}
