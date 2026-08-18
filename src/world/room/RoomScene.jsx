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
 * furniture. Sits on the desk; `lit` fades the glow out once it's been
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

/** A simple bed — hand-drawn (no bed sprite in the itch.io pack), corner spot. */
function Bed({ x, y, width }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        aspectRatio: '4 / 5',
        transform: 'translate(-50%, -100%)',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      <svg viewBox="0 0 40 50" width="100%" height="100%">
        <rect x="1" y="1" width="38" height="48" rx="3" fill="#7a5233" />
        <rect x="4" y="13" width="32" height="34" rx="2" fill="#e0637a" />
        <rect x="4" y="13" width="32" height="34" rx="2" fill="none" stroke="#b94f61" strokeWidth="1.4" />
        <rect x="6" y="3" width="28" height="12" rx="2.5" fill="#fdf6e3" stroke="#d8c9a3" strokeWidth="1.2" />
        <rect x="6" y="24" width="28" height="2" fill="#b94f61" opacity="0.5" />
        <rect x="6" y="32" width="28" height="2" fill="#b94f61" opacity="0.5" />
      </svg>
    </div>
  );
}

/** A small TV-on-a-desk, hand-drawn — the study-corner echo of the reference room. */
function DeskAndScreen({ x, y, width }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        aspectRatio: '5 / 4',
        transform: 'translate(-50%, -100%)',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      <svg viewBox="0 0 50 40" width="100%" height="100%">
        <rect x="2" y="18" width="46" height="20" rx="2" fill="#7a5233" />
        <rect x="2" y="18" width="46" height="4" fill="#a06a3f" />
        <rect x="10" y="4" width="30" height="18" rx="2" fill="#3a3a44" />
        <rect x="13" y="7" width="24" height="12" fill="#7fb6c9" opacity="0.8" />
      </svg>
    </div>
  );
}

/** A framed picture on the wall — hand-drawn accent. */
function Picture({ x, y, width }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        aspectRatio: '4 / 5',
        zIndex: 2,
        pointerEvents: 'none',
      }}
    >
      <svg viewBox="0 0 24 30" width="100%" height="100%">
        <rect x="1" y="1" width="22" height="28" rx="1.5" fill="#c99a5b" stroke="#5c3a22" strokeWidth="1.6" />
        <rect x="4" y="4" width="16" height="22" fill="#9fd0d8" />
        <path d="M4 20 L10 12 L14 17 L17 13 L20 20 Z" fill="#3f8f4f" />
        <circle cx="16" cy="8" r="2.4" fill="#fdf3d8" />
      </svg>
    </div>
  );
}

/**
 * The Traveler's Room — the game's opening scene (storyline.md prologue).
 * Layout takes its composition (desk-corner, wall picture, rug, plant, bed)
 * from a classic top-down RPG bedroom, rebuilt with our own assets: the
 * itch.io top-down house pack for floor/door/wardrobe/cabinet/plant/rug,
 * and a few hand-drawn accents (desk screen, picture, bed) where the pack
 * doesn't have a matching piece.
 */
export default function RoomScene({ diaryOpened = false }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#5c3a22' }}>
      {/* a hint of the classic gabled roofline, behind the wall band */}
      <div
        style={{
          position: 'absolute',
          left: '38%',
          top: 0,
          width: '24%',
          height: '9%',
          background: '#4a2f1c',
          clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
        }}
      />

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
      {/* diagonal plank grain, layered over the tiled floor */}
      <div
        style={{
          position: 'absolute',
          left: '4%',
          top: '9%',
          right: '4%',
          bottom: '3%',
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(63,39,23,0.08) 0 3px, transparent 3px 16px)',
        }}
      />

      {/* the door the Traveler steps out through, once they're ready */}
      <Prop src={doorImg} x={50} y={99} width={7} z={2} />

      {/* top wall: desk+screen far-left, wardrobe, picture, cabinet far-right */}
      <DeskAndScreen x={14} y={26} width={12} />
      <Prop src={wardrobeImg} x={30} y={24} width={7} z={2} />
      <Picture x={57} y={11} width={7} />
      <Prop src={cabinetImg} x={85} y={22} width={9} z={2} />

      {/* the desk the diary rests on, right where the Traveler starts nearby */}
      <Prop src={tableImg} x={14} y={38} width={6} z={2} />
      <GlowingDiary x={14} y={37} lit={!diaryOpened} />

      {/* bottom row: plant, rug, bed — echoing the reference layout */}
      <Prop src={plantImg} x={12} y={88} width={3.5} z={2} />
      <Prop src={rugImg} x={50} y={78} width={22} z={1} />
      <Bed x={84} y={90} width={13} />
    </div>
  );
}
