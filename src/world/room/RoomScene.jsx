import floorTile from '../../assets/room/floor.png';
import doorImg from '../../assets/room/door.png';
import tableImg from '../../assets/room/table.png';
import deskImg from '../../assets/room/desk.png';
import bookshelfImg from '../../assets/room/bookshelf.png';
import clockImg from '../../assets/room/clock.png';
import wardrobeImg from '../../assets/room/wardrobe.png';
import cabinetImg from '../../assets/room/cabinet.png';
import armchairImg from '../../assets/room/armchair.png';
import plantImg from '../../assets/room/plant.png';
import rugImg from '../../assets/room/rug.png';

/**
 * A piece of furniture, positioned in the room's 0-100 world space and
 * sized as a percentage of the room's own width so it scales with the box
 * (real pixel art, `image-rendering: pixelated` keeps it crisp at any size).
 * `x, y` is the sprite's own bottom-centre — its base/shadow, i.e. where it
 * actually touches the ground — so lining several props up on the same `y`
 * reliably means "same distance from the wall," not just "same pixel row."
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

/** A small screen, hand-drawn, sitting on the real desk sprite. */
function Screen({ x, y, width }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${width}%`,
        aspectRatio: '5 / 4',
        transform: 'translate(-50%, -100%)',
        zIndex: 3,
        pointerEvents: 'none',
      }}
    >
      <svg viewBox="0 0 25 20" width="100%" height="100%">
        <rect x="1" y="1" width="23" height="15" rx="1.5" fill="#3a3a44" stroke="#22222a" strokeWidth="1" />
        <rect x="3.5" y="3.5" width="18" height="9" fill="#7fb6c9" opacity="0.85" />
        <rect x="9" y="16" width="7" height="3" fill="#55555f" />
      </svg>
    </div>
  );
}

/** A simple bed — hand-drawn (no bed sprite in the itch.io pack). */
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

const WALL_BOTTOM = 27; // where wall meets floor, in room-percent

/**
 * The Traveler's Room — the game's opening scene (storyline.md prologue).
 * Composition takes its cue from a classic top-down RPG bedroom (desk
 * corner, wall clock under the roof peak, bookshelf, rug, bed) rebuilt
 * with the itch.io top-down house pack; only the screen, diary and bed
 * are hand-drawn, where the pack has no matching piece.
 */
export default function RoomScene({ diaryOpened = false }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#5c3a22' }}>
      {/* the wall — a real band with its own wallpaper texture, not just a
          margin, so furniture reads as standing against a surface */}
      <div
        style={{
          position: 'absolute',
          left: '4%',
          top: 0,
          right: '4%',
          height: `${WALL_BOTTOM}%`,
          background: '#6b4a2f',
          backgroundImage:
            'repeating-linear-gradient(135deg, rgba(0,0,0,0.12) 0 3px, transparent 3px 18px)',
          borderBottom: '4px solid #3f2717',
        }}
      />
      {/* the classic gabled roofline, sitting above the wall band */}
      <div
        style={{
          position: 'absolute',
          left: '38%',
          top: 0,
          width: '24%',
          height: '10%',
          background: '#4a2f1c',
          clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
        }}
      />
      {/* the wall clock, hung right at the gable peak */}
      <Prop src={clockImg} x={50} y={9} width={3.2} z={2} />

      {/* floor */}
      <div
        style={{
          position: 'absolute',
          left: '4%',
          top: `${WALL_BOTTOM}%`,
          right: '4%',
          bottom: '3%',
          backgroundImage: `url(${floorTile})`,
          backgroundRepeat: 'repeat',
          backgroundSize: '7% 12.5%',
          imageRendering: 'pixelated',
        }}
      />
      {/* diagonal plank grain, layered over the tiled floor */}
      <div
        style={{
          position: 'absolute',
          left: '4%',
          top: `${WALL_BOTTOM}%`,
          right: '4%',
          bottom: '3%',
          backgroundImage:
            'repeating-linear-gradient(45deg, rgba(63,39,23,0.08) 0 3px, transparent 3px 16px)',
        }}
      />

      {/* the door the Traveler steps out through, once they're ready */}
      <Prop src={doorImg} x={50} y={99} width={7} z={2} />

      {/* everything below stands with its base right at the wall/floor line */}
      <Prop src={deskImg} x={14} y={WALL_BOTTOM} width={9} z={2} />
      <Screen x={14} y={WALL_BOTTOM - 6} width={5.5} />
      <Prop src={bookshelfImg} x={28} y={WALL_BOTTOM} width={9} z={2} />
      <Prop src={wardrobeImg} x={42} y={WALL_BOTTOM} width={7} z={2} />
      <Prop src={cabinetImg} x={86} y={WALL_BOTTOM} width={9} z={2} />

      {/* the desk the diary rests on, right where the Traveler starts nearby */}
      <Prop src={tableImg} x={70} y={WALL_BOTTOM + 15} width={6} z={2} />
      <GlowingDiary x={70} y={WALL_BOTTOM + 14} lit={!diaryOpened} />

      {/* reading nook by the bookshelf */}
      <Prop src={armchairImg} x={28} y={WALL_BOTTOM + 16} width={6} z={2} />

      {/* bottom row: plant, rug, bed — echoing the reference layout */}
      <Prop src={plantImg} x={12} y={90} width={3.5} z={2} />
      <Prop src={rugImg} x={50} y={80} width={22} z={1} />
      <Bed x={84} y={92} width={13} />
    </div>
  );
}
