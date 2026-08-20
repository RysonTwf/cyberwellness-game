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
import bedImg from '../../assets/room/bed.png';
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
 * A soft contact shadow. Several sprites in the pack are cut flat across the
 * bottom with no shadow of their own, which makes them read as sunk into the
 * floorboards rather than standing on them; a pooled ellipse under the base
 * gives them somewhere to sit.
 */
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
        background: 'radial-gradient(closest-side, rgba(45,26,13,0.38), rgba(45,26,13,0))',
        zIndex: 1,
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

const WALL_BOTTOM = 27; // where wall meets floor, in room-percent
const BACK_ROW = WALL_BOTTOM + 6; // bases of the furniture standing against the wall
const TABLE_BASE = 57; // where the diary table's pedestal meets the floor
const TABLE_TOP = 43; // ...and the tabletop surface the diary sits on

/** .world's default width:height (styles.css `--scene-ar`) — used to convert
 * a sprite's width-as-percentage into its real on-screen height. */
const ROOM_ASPECT = 2;

/**
 * Single source of truth for every piece of standing furniture: where it
 * sits, how big it renders, and its real pixel dimensions. Both the <Prop>
 * tags below and ROOM_OBSTACLES (World's `obstacles` prop, world/useWalker.js)
 * are generated from this one array — a furniture piece can't visually move
 * or resize without its collision box moving with it. (It used to be two
 * separate hand-kept-in-sync lists, which is exactly how they drifted apart
 * — one report of missing collision, then another of it not reaching the
 * top of the bed.)
 *
 * `footprintFrac` is how much of a sprite's real on-screen height counts as
 * its floor footprint, default 0.45 — just the base, for tall vertical
 * pieces like the wardrobe, so standing "in front of" the tall part above
 * head height is still allowed. The bed is the one piece here that isn't
 * tall-and-vertical: the whole sprite *is* the floor space it occupies, so
 * it gets near-full coverage instead — 0.45 was leaving the pillow end
 * walkable, which is what the "no collision at the top" report was.
 */
const FURNITURE = [
  // desk/bookshelf sized up freely (79/28% and 90% clear of the roof gable
  // at x:38-62, see the wall/gable block below); wardrobe sits inside that
  // gable's x-range, so it's capped a bit tighter to stay clear of it.
  { key: 'desk', src: deskImg, x: 14, y: BACK_ROW, width: 7.5, nativeW: 30, nativeH: 46 },
  { key: 'bookshelf', src: bookshelfImg, x: 28, y: BACK_ROW, width: 11.5, nativeW: 40, nativeH: 41 },
  { key: 'wardrobe', src: wardrobeImg, x: 42, y: BACK_ROW, width: 9.5, nativeW: 41, nativeH: 46 },
  { key: 'cabinet', src: cabinetImg, x: 86, y: BACK_ROW, width: 5.8, nativeW: 16, nativeH: 23 },
  { key: 'table', src: tableImg, x: 70, y: TABLE_BASE, width: 7, nativeW: 30, nativeH: 29, footprintFrac: 0.55 },
  // Bigger, per request — was 4.
  { key: 'armchair', src: armchairImg, x: 63, y: TABLE_BASE, width: 6, nativeW: 23, nativeH: 26, footprintFrac: 0.55 },
  { key: 'plant', src: plantImg, x: 12, y: 90, width: 4.3, nativeW: 10, nativeH: 23 },
  // footprintFrac > 1 on purpose — see comment above.
  { key: 'bed', src: bedImg, x: 84, y: 92, width: 9.5, nativeW: 35, nativeH: 36, footprintFrac: 1.1 },
];

const F = Object.fromEntries(FURNITURE.map((f) => [f.key, f]));

export const ROOM_OBSTACLES = FURNITURE.map((f) => {
  const height = f.width * (f.nativeH / f.nativeW) * ROOM_ASPECT; // true on-screen %
  const footprint = Math.max(height * (f.footprintFrac ?? 0.45), 5);
  return { x: f.x, y: f.y - footprint / 2 + 1.5, w: f.width + 2.5, h: footprint };
});

/**
 * The Traveler's Room — the game's opening scene (storyline.md prologue).
 * Composition takes its cue from a classic top-down RPG bedroom (desk
 * corner, wall clock under the roof peak, bookshelf, rug, bed) rebuilt
 * with the itch.io top-down house pack; only the screen and diary are
 * hand-drawn now, where no pack has a matching piece.
 *
 * wardrobe/bookshelf/table/armchair/bed were re-cropped 21 Aug 2026 from
 * the "Farm RPG - Tiny Asset Pack" in /assets — genuinely higher-detail
 * pixel art than the original itch.io house-pack placeholders they
 * replace. desk/cabinet/clock/door/plant/floor stayed as they were —
 * nothing in the Farm pack read as a clear improvement on those specific
 * pieces. The rug (same day) was already sitting unused in /assets/room —
 * pure floor decoration, no collision needed, and a cheap way to make the
 * reading nook feel furnished rather than just less empty everywhere.
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

      {/* the rug, under the reading nook — flat on the floor, so it sits
          below the table/armchair/shadows drawn after it, and needs no
          collision box of its own. */}
      <img
        src={rugImg}
        alt=""
        style={{
          position: 'absolute',
          left: '66.5%',
          top: `${TABLE_BASE + 3}%`,
          width: '24%',
          transform: 'translate(-50%, -50%)',
          imageRendering: 'pixelated',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />

      {/* the grandfather clock, hung on the wall between the door and the gable */}
      <Prop src={clockImg} x={54} y={23} width={4.5} z={2} />

      {/* The door the Traveler steps out through, once they're ready. It's set
          *into* the back wall — on the floor it just read as a doormat. */}
      <Prop src={doorImg} x={68} y={WALL_BOTTOM} width={4} z={2} />

      {/* The back-wall row. These stand ON the floor with their bases a little
          below the wall line and their upper bodies overlapping the wall —
          basing them exactly *at* WALL_BOTTOM put the whole sprite inside the
          wall band, so they read as mounted on the wall rather than standing
          against it. */}
      <Prop src={F.desk.src} x={F.desk.x} y={F.desk.y} width={F.desk.width} z={2} />
      <Screen x={F.desk.x} y={F.desk.y - 4} width={3.4} />
      <Prop src={F.bookshelf.src} x={F.bookshelf.x} y={F.bookshelf.y} width={F.bookshelf.width} z={2} />
      <Prop src={F.wardrobe.src} x={F.wardrobe.x} y={F.wardrobe.y} width={F.wardrobe.width} z={2} />
      <Prop src={F.cabinet.src} x={F.cabinet.x} y={F.cabinet.y} width={F.cabinet.width} z={2} />

      {/* The table the diary rests on, out on the open floor, with the reading
          sofa pulled up beside it. TABLE_TOP is the tabletop surface: the
          sprite is a round pedestal table whose top ellipse ends about a
          fifth of the way down, so the diary sits there rather than down at
          the foot of the pedestal. */}
      <Shadow x={F.table.x} y={F.table.y} width={F.table.width + 3} />
      <Prop src={F.table.src} x={F.table.x} y={F.table.y} width={F.table.width} z={2} />
      <GlowingDiary x={F.table.x} y={TABLE_TOP} lit={!diaryOpened} />

      {/* the reading chair, pulled up facing the table (sprite faces right) */}
      <Shadow x={F.armchair.x} y={F.armchair.y} width={F.armchair.width + 1.5} />
      <Prop src={F.armchair.src} x={F.armchair.x} y={F.armchair.y} width={F.armchair.width} z={2} />

      {/* bottom row: plant and bed — echoing the reference layout */}
      <Prop src={F.plant.src} x={F.plant.x} y={F.plant.y} width={F.plant.width} z={2} />
      <Prop src={F.bed.src} x={F.bed.x} y={F.bed.y} width={F.bed.width} z={2} />
    </div>
  );
}
