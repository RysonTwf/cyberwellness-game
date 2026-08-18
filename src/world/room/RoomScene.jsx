import floorTile from '../../assets/room/floor.png';
import doorImg from '../../assets/room/door.png';
import tableImg from '../../assets/room/table.png';
import wardrobeImg from '../../assets/room/wardrobe.png';
import cabinetImg from '../../assets/room/cabinet.png';
import plantImg from '../../assets/room/plant.png';
import rugImg from '../../assets/room/rug.png';

/**
 * A piece of furniture, positioned in the room's 0-100 world space and
 * sized as a percentage of the room's own width so it scales with the box
 * (real pixel art, `image-rendering: pixelated` keeps it crisp at any size).
 */
function Prop({ src, x, y, width, z = 1 }) {
  return (
    <img
      src={src}
      alt=""
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        transform: 'translate(-50%, -100%)',
        imageRendering: 'pixelated',
        zIndex: z,
        pointerEvents: 'none',
      }}
    />
  );
}

/**
 * The glowing journal (storyline.md prologue) — hand-drawn rather than from
 * the tileset, since it's the one prop that has to read as magical, not
 * furniture. Sits on the table; `lit` fades the glow out once it's been
 * opened, so it doesn't keep visually begging for another interaction.
 */
function GlowingDiary({ x, y, lit = true }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -100%)',
        zIndex: 3,
        pointerEvents: 'none',
      }}
    >
      <svg width="34" height="26" viewBox="0 0 34 26" style={{ overflow: 'visible' }}>
        {lit && (
          <circle cx="17" cy="13" r="15" fill="var(--gold)" opacity="0.35" className="diary-glow" />
        )}
        <path d="M3 4 L17 1 L31 4 L31 22 L17 25 L3 22 Z" fill="#3a2e6b" />
        <path d="M17 1 L17 25 L31 22 L31 4 Z" fill="#2a2050" />
        <rect x="14.5" y="1" width="3" height="24" fill="#e0a030" opacity="0.9" />
      </svg>
    </div>
  );
}

/**
 * The Traveler's Room — the game's opening scene (storyline.md prologue).
 * Built from the itch.io top-down house pack rather than hand-drawn SVG,
 * since it's real furniture rather than a stylised map. Floor tiles via a
 * repeating background (so one 16x16 crop covers the whole room); walls are
 * a plain colour frame — this pack only has a thin top-edge wall trim, not
 * a tileable wall face, so a solid frame reads better than stretching that.
 */
export default function RoomScene({ diaryOpened = false }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#5c3a22' }}>
      {/* floor */}
      <div
        style={{
          position: 'absolute',
          left: '4%',
          top: '9%',
          right: '4%',
          bottom: '3%',
          backgroundImage: `url(${floorTile})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '7% 12.5%',
          imageRendering: 'pixelated',
          boxShadow: 'inset 0 0 0 3px #3f2717',
        }}
      />

      {/* the door the Traveler steps out through, once they're ready */}
      <Prop src={doorImg} x={50} y={99} width={7} z={2} />

      <Prop src={rugImg} x={50} y={68} width={22} z={1} />
      <Prop src={wardrobeImg} x={15} y={24} width={8} z={2} />
      <Prop src={cabinetImg} x={85} y={22} width={9} z={2} />
      <Prop src={plantImg} x={12} y={76} width={3.5} z={2} />

      {/* the table the diary rests on */}
      <Prop src={tableImg} x={50} y={30} width={6} z={2} />
      <GlowingDiary x={50} y={29} lit={!diaryOpened} />
    </div>
  );
}
