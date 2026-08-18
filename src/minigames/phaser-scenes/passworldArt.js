/**
 * Passworld platformer art set (Milestones Phase 2 — the designer's
 * "Password Fortress" asset list, built procedurally).
 *
 * ---------------------------------------------------------------------------
 * SWAPPING IN REAL ART
 * ---------------------------------------------------------------------------
 * Every texture the level uses is declared exactly once in ART_MANIFEST below.
 * Each entry carries both the sprite-sheet file it will eventually load from
 * and a `draw()` that paints the same thing onto a canvas as a stand-in.
 *
 * To switch to real art:
 *   1. Drop the sheets into `public/assets/p4-6-only/passworld-platformer/`
 *      using the `file` names below, at the `frameWidth`×`frameHeight` frame
 *      size given (frames laid out left-to-right in a single row).
 *   2. Set REAL_ART_BASE to that folder.
 *
 * Nothing in the scene changes — it only ever refers to texture keys and
 * animation names, both of which stay the same. Each file loads independently
 * and silently falls back to its procedural version if it's missing or fails
 * to decode, so a partial art delivery still runs rather than crashing.
 *
 * The frame sizes here are the *live* ones, measured against the running
 * level rather than proposed ahead of it — the Milestones spec table's 64×64
 * was a guess made before this scene existed, and is far too big for a
 * 1120×280 world where the player stands 34px tall.
 */

/**
 * Skins: a named set of real sprite sheets layered over the built-in art.
 *
 * A skin only has to declare the textures it actually replaces — everything it
 * leaves out keeps its procedural version, so you can swap the player in
 * before the tileset exists, or try a pack out on one character. Frame sizes
 * and animation frame lists come from the skin too, since a real sheet won't
 * happen to use the same layout as the stand-ins.
 *
 * `playerBody` is the physics box for the skin's player sprite. It's part of
 * the skin because a differently-proportioned character needs a different
 * hitbox — the level must not have to know which art is loaded.
 */
export const SKINS = {
  /** The stand-in art in this file. */
  builtin: null,

  /**
   * Brackeys' CC0 platformer pack (see assets/brackeys_platformer_assets).
   * A trial fit, not the shipping look — it's a fantasy knight and slimes,
   * which read nothing like a password vault and clash with the flat
   * paper-journal style the rest of the Atlas uses.
   */
  brackeys: {
    base: '/assets/passworld-brackeys',
    textures: {
      // `scale` because a pack's characters sit inside their frame however
      // that pack likes — the knight only fills about 16x20 of its 32x32
      // cell, so at 1:1 it reads as a doll next to the vault fittings.
      'pw-traveler': { file: 'knight.png', frameWidth: 32, frameHeight: 32, scale: 1.6 },
      'pw-hacker': { file: 'slime_purple.png', frameWidth: 24, frameHeight: 24, scale: 1.5 },
    },
    anims: {
      'pw-idle': { frames: [0, 1, 2, 3], frameRate: 6 },
      'pw-run': { frames: [16, 17, 18, 19, 20, 21, 22, 23], frameRate: 12 },
      'pw-jump': { frames: [24] },
      'pw-fall': { frames: [26] },
      'pw-hacker-move': { frames: [0, 1, 2, 3], frameRate: 6 },
    },
    playerBody: { width: 12, height: 19, offsetX: 10, offsetY: 12 },
  },
};

/** Which skin the level loads. 'builtin' for the procedural stand-ins. */
export const ACTIVE_SKIN = 'brackeys';

const skin = () => SKINS[ACTIVE_SKIN] ?? null;

const BUILTIN_PLAYER_BODY = { width: 14, height: 28, offsetX: 7, offsetY: 6 };

/**
 * The physics box for the player sprite. Falls back to the stand-in's box if
 * the skin's player sheet didn't load, so a missing file can't leave the
 * player with a hitbox sized for art that isn't on screen.
 */
export function playerBody(scene) {
  if (!scene?.pwFromSkin?.has('pw-traveler')) return BUILTIN_PLAYER_BODY;
  return skin()?.playerBody ?? BUILTIN_PLAYER_BODY;
}

/** Display scale for a sprite, if the active skin's sheet is the one in use. */
export function spriteScale(scene, key) {
  if (!scene?.pwFromSkin?.has(key)) return 1;
  return skin()?.textures?.[key]?.scale ?? 1;
}

const INK = '#1f3452';
const INK_SOFT = '#3a5578';
const PAPER = '#f1f5f6';
const PAPER_DIM = '#dde5e8';
const GOLD = '#e0a030';
const GOLD_DEEP = '#b8801f';
const TEAL = '#2d8c7f';
const BLUE = '#3d6fa8';
const VIOLET = '#6b5b95';
const HAZARD = '#c76b5c';
const NEUTRAL = '#9aa6b5';

/* -------------------------------------------------------------------------- */
/* Canvas helpers                                                             */
/* -------------------------------------------------------------------------- */

/** Rounded rect via arcTo — `ctx.roundRect` isn't safe on older school devices. */
function rr(ctx, x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function fillRR(ctx, x, y, w, h, r, color) {
  ctx.fillStyle = color;
  rr(ctx, x, y, w, h, r);
  ctx.fill();
}

function strokeRR(ctx, x, y, w, h, r, color, width = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  rr(ctx, x, y, w, h, r);
  ctx.stroke();
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** A four-point sparkle, used for collect bursts and the decoys' false shine. */
function sparkle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

/** A closed padlock badge — marks the tiles that actually count. */
function padlock(ctx, x, y, s, body, shackle) {
  ctx.strokeStyle = shackle;
  ctx.lineWidth = Math.max(1, s * 0.16);
  ctx.beginPath();
  ctx.arc(x, y - s * 0.18, s * 0.3, Math.PI, 0);
  ctx.stroke();
  fillRR(ctx, x - s * 0.42, y - s * 0.06, s * 0.84, s * 0.62, s * 0.16, body);
}

/* -------------------------------------------------------------------------- */
/* The Traveler                                                               */
/* -------------------------------------------------------------------------- */

/**
 * Drawn to match world/Traveler.jsx — no skin tone, no hair, no gendered
 * silhouette, just a small figure in a gold scarf and cap (storyline.md leaves
 * the Traveler's appearance open on purpose).
 *
 * Frames: 0 idle · 1-3 run cycle · 4 jump (rising) · 5 fall.
 */
function drawTraveler(ctx, { frame }) {
  // Per-frame leg positions and body bob. The run cycle is 1→2→3→2 so the
  // contact pose reads twice per stride, which sells the weight of the step.
  const poses = [
    { bob: 0, back: [12, 31], front: [16, 31] }, // idle — standing, not mid-stride
    { bob: 0, back: [8, 30], front: [20, 30] }, // run — stride open
    { bob: -1, back: [13, 29], front: [16, 31] }, // run — passing
    { bob: 0, back: [19, 30], front: [10, 30] }, // run — stride open, mirrored
    { bob: -1, back: [10, 27], front: [19, 29] }, // jump — knees tucked
    { bob: 1, back: [9, 31], front: [20, 28] }, // fall — legs trailing
  ];
  const p = poses[frame] ?? poses[0];
  const cy = p.bob;

  // legs
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  for (const [lx, ly] of [p.back, p.front]) {
    ctx.beginPath();
    ctx.moveTo(14, 25 + cy);
    ctx.lineTo(lx, ly + cy);
    ctx.stroke();
  }

  // pack, slung on the back
  fillRR(ctx, 3, 14 + cy, 7, 9, 3, GOLD_DEEP);

  // torso
  fillRR(ctx, 8, 13 + cy, 12, 13, 4, INK);

  // scarf, in the realm's gold
  fillRR(ctx, 8, 13 + cy, 12, 5, 2, GOLD);
  // ...and its tail, streaming further back the faster we're going
  const tail = frame >= 1 && frame <= 3 ? 6 : 3;
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(8, 15 + cy);
  ctx.quadraticCurveTo(8 - tail, 17 + cy, 8 - tail * 0.7, 22 + cy);
  ctx.lineTo(8, 20 + cy);
  ctx.closePath();
  ctx.fill();

  // head + traveller's cap
  circle(ctx, 14, 8 + cy, 6, INK);
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.moveTo(8, 6 + cy);
  ctx.quadraticCurveTo(14, 0 + cy, 20, 6 + cy);
  ctx.quadraticCurveTo(14, 3 + cy, 8, 6 + cy);
  ctx.closePath();
  ctx.fill();

  // eyes
  circle(ctx, 16.5, 9 + cy, 1.4, PAPER);
  circle(ctx, 12.5, 9 + cy, 1.4, PAPER);
}

/* -------------------------------------------------------------------------- */
/* The hazard — a "hacker" patrol                                             */
/* -------------------------------------------------------------------------- */

/**
 * Deliberately not a villain: rounded, soft-edged, no teeth, no weapon. It's a
 * hooded figure that bumps you off a ledge, nothing worse — design.md §8 rules
 * out fail states, so it can't read as something that might kill you.
 */
function drawHacker(ctx, { frame }) {
  const bob = frame === 1 ? 1 : 0;

  // trailing hood cloth, so it reads as moving even while it hovers
  ctx.fillStyle = HAZARD;
  ctx.globalAlpha = 0.45;
  ctx.beginPath();
  ctx.moveTo(22, 10 + bob);
  ctx.quadraticCurveTo(30, 14 + bob, 26, 22 + bob);
  ctx.lineTo(20, 18 + bob);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;

  // hood
  fillRR(ctx, 3, 4 + bob, 22, 20, 10, HAZARD);
  // the shadowed face void
  fillRR(ctx, 6, 9 + bob, 15, 11, 5, '#8f4436');
  // eyes
  circle(ctx, 11, 14 + bob, 1.9, PAPER);
  circle(ctx, 17, 14 + bob, 1.9, PAPER);
  // a small prying tool, held low — a hint at what it's doing, not a threat
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(6, 23 + bob);
  ctx.lineTo(2, 21 + bob);
  ctx.stroke();
}

/* -------------------------------------------------------------------------- */
/* The impersonator                                                           */
/* -------------------------------------------------------------------------- */

/**
 * "Sam" — except it isn't. Drawn as a soft double image, slightly out of
 * register, so it reads as "something here doesn't line up" without giving it
 * a face or an expression that would tell the player the answer outright.
 */
function drawImpostor(ctx) {
  ctx.globalAlpha = 0.45;
  fillRR(ctx, 4, 7, 22, 24, 8, NEUTRAL);
  ctx.globalAlpha = 1;
  fillRR(ctx, 2, 5, 22, 24, 8, NEUTRAL);
  fillRR(ctx, 2, 5, 22, 5, 2, '#7f8b9c');
  circle(ctx, 13, 3, 5.5, NEUTRAL);
  circle(ctx, 15.5, 13, 1.8, PAPER);
  circle(ctx, 9.5, 13, 1.8, PAPER);
}

/* -------------------------------------------------------------------------- */
/* Collectible tiles                                                          */
/* -------------------------------------------------------------------------- */

/**
 * The three tile types that actually build a strong password. Each gets its
 * own colour *and* its own corner motif, so they're still distinguishable if
 * the glyph is hard to read (or the player is colour-blind) — the Milestones
 * asset list asks for "distinct types at a glance."
 */
/**
 * One card for every collectible, strong and weak alike.
 *
 * These used to differ on sight — the real ones carried a closed padlock, the
 * decoys a gold gloss, sparkles and an *open* padlock. That handed the answer
 * over before the player read a word, which is the one thing the vault door is
 * supposed to ask. Now the only thing that separates them is what's written on
 * them, so deciding whether "qwerty" belongs in a password is actually the
 * player's decision to make.
 *
 * Anything added here has to stay uniform for that reason: no per-kind colour,
 * shape, badge or animation.
 */
function drawTile(ctx) {
  fillRR(ctx, 2, 2, 30, 30, 7, TEAL);
  strokeRR(ctx, 2, 2, 30, 30, 7, INK, 1.6);
  // a lighter inset panel, so the glyph the scene draws on top has a bed
  fillRR(ctx, 5, 5, 24, 24, 5, 'rgba(255,255,255,0.14)');
  padlock(ctx, 25, 25, 7.5, PAPER, PAPER);
}

/* -------------------------------------------------------------------------- */
/* Vault fixtures                                                             */
/* -------------------------------------------------------------------------- */

/** The portcullis the impersonator stands behind, with a lock plate. */
function drawGate(ctx, { w, h }) {
  ctx.fillStyle = INK;
  for (let i = 0; i < 5; i += 1) {
    rr(ctx, i * 12, 0, 6, h, 3);
    ctx.fill();
  }
  // cross-braces
  ctx.fillStyle = INK_SOFT;
  for (const y of [h * 0.22, h * 0.62]) ctx.fillRect(0, y, w, 5);
  // lock plate
  fillRR(ctx, w / 2 - 9, h * 0.4, 18, 18, 4, INK_SOFT);
  circle(ctx, w / 2, h * 0.4 + 9, 4.5, GOLD);
  circle(ctx, w / 2, h * 0.4 + 9, 1.8, INK);
}

/**
 * The vault door at the end of the run — the one the Traveler has to answer
 * to. Drawn shut and locked, with a keypad panel, so it reads as something
 * that wants an answer rather than something you walk through.
 */
function drawVaultDoor(ctx, { w, h }) {
  // frame
  fillRR(ctx, 0, 0, w, h, 5, '#24405f');
  // plate
  fillRR(ctx, 4, 4, w - 8, h - 8, 4, '#2c4a6d');
  // rivets down both sides
  for (let y = 12; y < h - 8; y += 14) {
    circle(ctx, 8, y, 1.8, GOLD_DEEP);
    circle(ctx, w - 8, y, 1.8, GOLD_DEEP);
  }
  // keypad panel — the thing you answer
  fillRR(ctx, w / 2 - 9, 14, 18, 22, 3, '#16283c');
  for (let r = 0; r < 3; r += 1) {
    for (let c = 0; c < 3; c += 1) {
      fillRR(ctx, w / 2 - 7 + c * 5, 17 + r * 6, 3.4, 4.2, 1, 'rgba(224,160,48,0.55)');
    }
  }
  // wheel handle
  const cy = h - 22;
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(w / 2, cy, 11, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 2.4;
  for (let i = 0; i < 4; i += 1) {
    const a = (Math.PI / 2) * i + Math.PI / 4;
    ctx.beginPath();
    ctx.moveTo(w / 2 + Math.cos(a) * 3, cy + Math.sin(a) * 3);
    ctx.lineTo(w / 2 + Math.cos(a) * 13, cy + Math.sin(a) * 13);
    ctx.stroke();
  }
  circle(ctx, w / 2, cy, 4, GOLD_DEEP);
}

/** A single sparkle particle for the collect burst. */
function drawSpark(ctx) {
  sparkle(ctx, 5, 5, 5, PAPER);
}

/** The HUD strength meter's housing — the fill is drawn live over the top. */
function drawMeterFrame(ctx, { w, h }) {
  fillRR(ctx, 0, 0, w, h, h / 2, 'rgba(31,52,82,0.16)');
  strokeRR(ctx, 0.75, 0.75, w - 1.5, h - 1.5, h / 2, INK, 1.5);
}

/**
 * One half of the vault door, for the win animation. Drawn as a real door —
 * riveted plate, wheel handle, hinge column — so the two halves parting reads
 * as a vault opening rather than two rectangles sliding off.
 */
function makeDoorDrawer(side) {
  return (ctx, { w, h }) => {
    ctx.fillStyle = '#24405f';
    ctx.fillRect(0, 0, w, h);
    // plate
    ctx.fillStyle = '#2c4a6d';
    ctx.fillRect(side === 'left' ? 10 : 0, 10, w - 10, h - 20);
    // rivets down the seam
    const seamX = side === 'left' ? w - 9 : 9;
    for (let y = 22; y < h - 12; y += 22) circle(ctx, seamX, y, 2.6, GOLD_DEEP);
    // wheel handle, on the seam side
    const cx = side === 'left' ? w - 42 : 42;
    const cy = h / 2;
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 4;
    for (let i = 0; i < 4; i += 1) {
      const a = (Math.PI / 2) * i + Math.PI / 4;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6);
      ctx.lineTo(cx + Math.cos(a) * 26, cy + Math.sin(a) * 26);
      ctx.stroke();
    }
    circle(ctx, cx, cy, 7, GOLD_DEEP);
  };
}

/* -------------------------------------------------------------------------- */
/* Background layers                                                          */
/* -------------------------------------------------------------------------- */

/** Far layer: the vault's back wall. Tiled horizontally, barely scrolls. */
function drawVaultWall(ctx, { w, h }) {
  ctx.fillStyle = '#eef1f2';
  ctx.fillRect(0, 0, w, h);
  // tall wall panels
  ctx.fillStyle = PAPER_DIM;
  for (let x = 8; x < w; x += 56) ctx.fillRect(x, 0, 40, h);
  // a warm floor glow so the bottom of the level doesn't read as empty
  const grad = ctx.createLinearGradient(0, h * 0.55, 0, h);
  grad.addColorStop(0, 'rgba(224,160,48,0)');
  grad.addColorStop(1, 'rgba(224,160,48,0.16)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);
}

/** Mid layer: safe-deposit boxes, pipework and dials. Scrolls at half speed. */
function drawVaultMachinery(ctx, { w, h }) {
  ctx.globalAlpha = 0.5;

  // safe-deposit box grid
  ctx.fillStyle = '#c9d3d8';
  for (let x = 12; x < w * 0.45; x += 26) {
    for (let y = 34; y < 150; y += 22) {
      fillRR(ctx, x, y, 20, 16, 3, '#c9d3d8');
      circle(ctx, x + 10, y + 8, 1.8, '#9fb0b8');
    }
  }

  // a big dial, the sort a vault door carries
  const dx = w * 0.62;
  ctx.strokeStyle = '#b9c6cc';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(dx, 80, 38, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 4;
  for (let i = 0; i < 12; i += 1) {
    const a = (Math.PI / 6) * i;
    ctx.beginPath();
    ctx.moveTo(dx + Math.cos(a) * 30, 80 + Math.sin(a) * 30);
    ctx.lineTo(dx + Math.cos(a) * 38, 80 + Math.sin(a) * 38);
    ctx.stroke();
  }

  // pipework along the ceiling
  ctx.strokeStyle = '#b9c6cc';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.lineTo(w * 0.82, 18);
  ctx.lineTo(w * 0.9, 46);
  ctx.lineTo(w, 46);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

/* -------------------------------------------------------------------------- */
/* The manifest                                                               */
/* -------------------------------------------------------------------------- */

export const ART_MANIFEST = [
  {
    key: 'pw-traveler',
    file: 'traveler.png',
    frameWidth: 28,
    frameHeight: 34,
    frames: 6,
    draw: drawTraveler,
  },
  { key: 'pw-hacker', file: 'hazard-hacker.png', frameWidth: 30, frameHeight: 26, frames: 2, draw: drawHacker },
  { key: 'pw-impostor', file: 'impostor.png', frameWidth: 28, frameHeight: 32, draw: drawImpostor },
  { key: 'pw-tile', file: 'tile.png', frameWidth: 34, frameHeight: 34, draw: drawTile },
  { key: 'pw-gate', file: 'gate.png', frameWidth: 60, frameHeight: 120, draw: drawGate },
  { key: 'pw-vault-door', file: 'vault-door.png', frameWidth: 46, frameHeight: 68, draw: drawVaultDoor },
  { key: 'pw-spark', file: 'spark.png', frameWidth: 10, frameHeight: 10, draw: drawSpark },
  { key: 'pw-meter', file: 'meter-ui.png', frameWidth: 96, frameHeight: 14, draw: drawMeterFrame },
  { key: 'pw-door-left', file: 'vault-door-left.png', frameWidth: 280, frameHeight: 280, draw: makeDoorDrawer('left') },
  {
    key: 'pw-door-right',
    file: 'vault-door-right.png',
    frameWidth: 280,
    frameHeight: 280,
    draw: makeDoorDrawer('right'),
  },
  { key: 'pw-bg-wall', file: 'vault-wall.png', frameWidth: 280, frameHeight: 280, draw: drawVaultWall },
  {
    key: 'pw-bg-machinery',
    file: 'vault-machinery.png',
    frameWidth: 560,
    frameHeight: 280,
    draw: drawVaultMachinery,
  },
];

/** Animations the scene plays, by name. Frame indices are into the sheets above. */
export const ART_ANIMS = [
  { key: 'pw-idle', texture: 'pw-traveler', frames: [0], frameRate: 1, repeat: -1 },
  { key: 'pw-run', texture: 'pw-traveler', frames: [1, 2, 3, 2], frameRate: 10, repeat: -1 },
  { key: 'pw-jump', texture: 'pw-traveler', frames: [4], frameRate: 1, repeat: 0 },
  { key: 'pw-fall', texture: 'pw-traveler', frames: [5], frameRate: 1, repeat: 0 },
  { key: 'pw-hacker-move', texture: 'pw-hacker', frames: [0, 1], frameRate: 3, repeat: -1 },
];

/* -------------------------------------------------------------------------- */
/* Loading / generating                                                       */
/* -------------------------------------------------------------------------- */

function generate(scene, entry) {
  const { key, frameWidth: fw, frameHeight: fh, frames = 1, draw } = entry;
  const tex = scene.textures.createCanvas(key, fw * frames, fh);
  if (!tex) return;
  const ctx = tex.getContext();
  for (let i = 0; i < frames; i += 1) {
    ctx.save();
    ctx.translate(i * fw, 0);
    draw(ctx, { w: fw, h: fh, frame: i });
    ctx.restore();
  }
  tex.refresh();
  if (frames > 1) {
    for (let i = 0; i < frames; i += 1) tex.add(i, 0, i * fw, 0, fw, fh);
  }
}

/**
 * Queue the real sprite sheets, if there are any. A missing or broken file is
 * swallowed here rather than thrown — `buildPassworldArt` fills the gap with
 * the procedural version, so half-delivered art degrades instead of breaking.
 */
export function preloadPassworldArt(scene) {
  const s = skin();
  if (!s) return;
  scene.load.on('loaderror', (file) => {
    // eslint-disable-next-line no-console
    console.info(`[passworld] no art file for "${file.key}" — using the built-in stand-in`);
  });
  for (const [key, t] of Object.entries(s.textures)) {
    scene.load.spritesheet(key, `${s.base}/${t.file}`, {
      frameWidth: t.frameWidth,
      frameHeight: t.frameHeight,
    });
  }
}

/**
 * Fill in whatever the skin didn't provide, then register the animations.
 * Call from `create()`, once the loader has finished.
 */
export function buildPassworldArt(scene) {
  const s = skin();

  // Whatever the skin declared and that now exists came from its files — this
  // has to be read *before* generating, or the stand-ins would look identical.
  const fromSkin = new Set(
    Object.keys(s?.textures ?? {}).filter((k) => scene.textures.exists(k)),
  );
  scene.pwFromSkin = fromSkin;

  for (const e of ART_MANIFEST) {
    if (!scene.textures.exists(e.key)) generate(scene, e);
  }

  const overrides = s?.anims ?? {};
  for (const a of ART_ANIMS) {
    if (scene.anims.exists(a.key)) continue;
    // Only take the skin's frame list if its sheet actually loaded — a file
    // that 404'd leaves the stand-in in play, and its own indices still apply.
    const o = fromSkin.has(a.texture) ? overrides[a.key] : null;
    const frames = o?.frames ?? a.frames;
    scene.anims.create({
      key: a.key,
      frames: frames.map((f) => ({ key: a.texture, frame: f })),
      frameRate: o?.frameRate ?? a.frameRate,
      repeat: o?.repeat ?? a.repeat,
    });
  }
}

/**
 * Platforms are sized by the level layout rather than by the art, so they're
 * generated on demand instead of living in the manifest. Real art would swap
 * this for a 3-slice or a tiling sprite; the key naming stays the same either
 * way so the scene doesn't care.
 */
export function platformTexture(scene, w, h) {
  const key = `pw-plat-${w}x${h}`;
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();
  fillRR(ctx, 0, 0, w, h, 4, INK);
  // lit top edge, so the surface you land on is the part that catches the eye
  fillRR(ctx, 2, 1, w - 4, Math.max(2, h * 0.28), 2, INK_SOFT);
  // rivets
  for (let x = 9; x < w - 6; x += 26) circle(ctx, x, h - 4, 1.5, 'rgba(224,160,48,0.55)');
  tex.refresh();
  return key;
}

/**
 * The texture for any collectible. Deliberately ignores `kind` and `type`:
 * see drawTile — telling strong from weak on sight is the player's job.
 */
export function tileTextureFor() {
  return 'pw-tile';
}
