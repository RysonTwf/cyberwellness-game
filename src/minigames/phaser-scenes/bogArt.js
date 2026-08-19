/**
 * Bully Bog art set — the pieces "The Bog Current" is drawn from.
 *
 * ---------------------------------------------------------------------------
 * SWAPPING IN REAL ART
 * ---------------------------------------------------------------------------
 * Same contract as passworldArt.js, deliberately: every texture the scene
 * uses is declared once in ART_MANIFEST, each entry carrying both the sheet
 * it will eventually load from and a `draw()` that paints a stand-in.
 *
 *   1. Drop sheets into `public/assets/p4-6-only/bully-bog/` under the `file`
 *      names below, at the given frame size (frames left-to-right, one row).
 *   2. Point REAL_ART_BASE at that folder via a skin (see SKINS).
 *
 * The scene only ever names texture keys, so nothing there changes. A file
 * that 404s or fails to decode falls back to its procedural version, so a
 * half-delivered art pack still runs.
 *
 * The comment cards themselves aren't in the manifest: they're sized by their
 * own text at runtime (a two-word "same" and a full sentence are not the same
 * shape), so they're generated on demand by `bubbleTexture` further down —
 * exactly how passworldArt handles platforms.
 */

/**
 * A named set of real sheets layered over the built-in art. Only has to
 * declare what it actually replaces. Nothing has been drawn for the Bog yet,
 * so there's one entry and it's the stand-ins.
 */
export const SKINS = {
  /** The procedural art in this file. */
  builtin: null,
};

/** Which skin the scene loads. 'builtin' for the procedural stand-ins. */
export const ACTIVE_SKIN = 'builtin';

const skin = () => SKINS[ACTIVE_SKIN] ?? null;

const INK = '#1f3452';
const INK_SOFT = '#5c7185';
const PAPER = '#ffffff';
const PAPER_DIM = '#e7edef';
const CORAL = '#e0637a';
const CORAL_DEEP = '#b34a5f';
const TEAL = '#2d8c7f';
const TEAL_LIGHT = '#57b3a3';
const GOLD = '#e0a030';
const REED = '#3f8f6d';

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

function fillRR(ctx, x, y, w, h, r, colour) {
  rr(ctx, x, y, w, h, r);
  ctx.fillStyle = colour;
  ctx.fill();
}

function strokeRR(ctx, x, y, w, h, r, colour, width = 2) {
  rr(ctx, x, y, w, h, r);
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.stroke();
}

function circle(ctx, x, y, r, colour) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = colour;
  ctx.fill();
}

function ellipse(ctx, x, y, rx, ry, colour) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = colour;
  ctx.fill();
}

/* -------------------------------------------------------------------------- */
/* The actors                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * The Traveler's coracle — a little round reed boat seen from the side, with
 * the Traveler leaning out of it holding a landing net. Two frames: paddling
 * left and paddling right, so the boat visibly works when it moves.
 */
function drawBoat(ctx, { w, h, frame }) {
  const lean = frame === 1 ? 2 : -2;

  // net, held out ahead of the boat — the thing that does the work, so it
  // reads before the boat does
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w / 2 + 4, h * 0.46);
  ctx.lineTo(w - 7, h * 0.24);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(w - 6, h * 0.2, 5.5, 0, Math.PI * 2);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.stroke();

  // the Traveler: head + shoulders above the rim
  circle(ctx, w / 2 + lean, h * 0.32, 5, INK);
  fillRR(ctx, w / 2 + lean - 6, h * 0.4, 12, 9, 4, TEAL);

  // the hull
  ellipse(ctx, w / 2, h * 0.66, w * 0.38, h * 0.2, INK);
  ellipse(ctx, w / 2, h * 0.63, w * 0.34, h * 0.16, '#8a6a48');
  // woven reed banding
  ctx.strokeStyle = 'rgba(31,52,82,0.35)';
  ctx.lineWidth = 1;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.moveTo(w / 2 + i * 6, h * 0.56);
    ctx.lineTo(w / 2 + i * 6, h * 0.74);
    ctx.stroke();
  }

  // wake under the hull
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 12, h * 0.84);
  ctx.quadraticCurveTo(w / 2, h * 0.78 + (frame === 1 ? 3 : 0), w / 2 + 12, h * 0.84);
  ctx.stroke();
}

/**
 * Pockets on their lily pad. Four frames, and the frame is the whole point:
 * this is the only readout in the scene that says how the round is actually
 * going, so it has to be legible at a glance from across the canvas.
 *
 *   0 sunk (very murky) · 1 glum · 2 okay · 3 singing again
 */
function drawPockets(ctx, { w, h, frame }) {
  const cx = w / 2;
  const sink = [7, 4, 1, 0][frame];
  const padY = h - 9;

  // lily pad
  ellipse(ctx, cx, padY, w * 0.42, 6, REED);
  ellipse(ctx, cx, padY - 1.5, w * 0.38, 5, '#4fa981');
  // the pad's notch
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, padY);
  ctx.lineTo(cx + w * 0.4, padY - 4);
  ctx.lineTo(cx + w * 0.4, padY + 4);
  ctx.closePath();
  ctx.fillStyle = 'rgba(31,52,82,0.18)';
  ctx.fill();
  ctx.restore();

  const bodyY = padY - 12 + sink;

  // the frog
  ellipse(ctx, cx, bodyY, 11, 9, '#4f9d6b');
  ellipse(ctx, cx, bodyY + 2, 8, 5.5, '#6fb987');
  // legs
  ellipse(ctx, cx - 11, bodyY + 5, 4, 2.5, '#4f9d6b');
  ellipse(ctx, cx + 11, bodyY + 5, 4, 2.5, '#4f9d6b');
  // eyes, on top like a real frog
  circle(ctx, cx - 5, bodyY - 8, 4, '#4f9d6b');
  circle(ctx, cx + 5, bodyY - 8, 4, '#4f9d6b');
  circle(ctx, cx - 5, bodyY - 9, 2.2, PAPER);
  circle(ctx, cx + 5, bodyY - 9, 2.2, PAPER);
  circle(ctx, cx - 5 + (frame >= 2 ? 0.6 : -0.6), bodyY - 9, 1.2, INK);
  circle(ctx, cx + 5 + (frame >= 2 ? 0.6 : -0.6), bodyY - 9, 1.2, INK);

  // mouth: down when it's bad, up when it isn't
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  if (frame >= 2) ctx.arc(cx, bodyY - 1, 4.5, 0.15 * Math.PI, 0.85 * Math.PI);
  else ctx.arc(cx, bodyY + 6, 4.5, 1.15 * Math.PI, 1.85 * Math.PI);
  ctx.stroke();

  // singing again — the notes are the reward, so only the top frame gets them
  if (frame === 3) {
    ctx.fillStyle = GOLD;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('♪', cx + 13, bodyY - 12);
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('♫', cx + 20, bodyY - 19);
  }
}

/**
 * The heron — the trusted adult standing at the edge of the bog. Deliberately
 * tall and calm rather than looming: it's help you go and get, not a
 * punishment arriving. Two frames, standing and reaching down.
 */
function drawHeron(ctx, { w, h, frame }) {
  const reach = frame === 1 ? 10 : 0;
  const cx = w / 2;

  // legs
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 3, h - 2);
  ctx.lineTo(cx - 2, h - 20);
  ctx.moveTo(cx + 4, h - 2);
  ctx.lineTo(cx + 2, h - 20);
  ctx.stroke();

  // body
  ellipse(ctx, cx, h - 27, 8, 11, PAPER_DIM);
  ellipse(ctx, cx - 2, h - 27, 5, 8, PAPER);
  // wing
  ctx.beginPath();
  ctx.ellipse(cx + 2, h - 26, 5, 9, 0.25, 0, Math.PI * 2);
  ctx.fillStyle = '#c3d0d6';
  ctx.fill();

  // neck + head, bending down to look when it reaches
  ctx.strokeStyle = PAPER_DIM;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, h - 36);
  ctx.quadraticCurveTo(cx + 5, h - 48 + reach, cx - 2, h - 52 + reach);
  ctx.stroke();
  circle(ctx, cx - 3, h - 53 + reach, 4.5, PAPER);
  circle(ctx, cx - 4.5, h - 54 + reach, 1.2, INK);
  // beak
  ctx.beginPath();
  ctx.moveTo(cx - 7, h - 53 + reach);
  ctx.lineTo(cx - 16, h - 50 + reach);
  ctx.lineTo(cx - 7, h - 49 + reach);
  ctx.closePath();
  ctx.fillStyle = GOLD;
  ctx.fill();
}

/** A clump of reeds, for the banks. */
function drawReeds(ctx, { w, h }) {
  ctx.strokeStyle = REED;
  ctx.lineWidth = 2;
  const stalks = [
    [6, 0.9],
    [13, 0.6],
    [20, 1.0],
    [27, 0.72],
    [34, 0.86],
  ];
  for (const [x, tall] of stalks) {
    const top = h - h * tall;
    ctx.beginPath();
    ctx.moveTo(x, h);
    ctx.quadraticCurveTo(x + 3, h - h * tall * 0.6, x + 1, top);
    ctx.stroke();
    fillRR(ctx, x - 2, top - 6, 4, 8, 2, '#7a5c3a');
  }
}

/** The "reported" puff a netted comment leaves behind. */
function drawPuff(ctx, { w, h }) {
  circle(ctx, w / 2, h / 2, w / 2 - 1, 'rgba(255,255,255,0.85)');
  circle(ctx, w / 2, h / 2, w / 2 - 3.5, 'rgba(45,140,127,0.5)');
}

/** A single heart, used for the like-count that grows on a comment left up. */
function drawHeart(ctx, { w, h }) {
  ctx.fillStyle = CORAL;
  ctx.beginPath();
  ctx.moveTo(w / 2, h - 1);
  ctx.bezierCurveTo(-1, h * 0.55, 1, 0, w / 2, h * 0.3);
  ctx.bezierCurveTo(w - 1, 0, w + 1, h * 0.55, w / 2, h - 1);
  ctx.fill();
}

/* -------------------------------------------------------------------------- */
/* Backdrops                                                                  */
/* -------------------------------------------------------------------------- */

/** Far treeline, parallaxed slowest. Matches RealmArt's BogScene canopy. */
function drawTreeline(ctx, { w, h }) {
  ctx.fillStyle = 'rgba(45,140,127,0.10)';
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = 'rgba(45,140,127,0.20)';
  for (let x = 10; x < w + 40; x += 42) {
    circle(ctx, x, 60 + ((x / 42) % 3) * 6, 26 + ((x / 21) % 4) * 2, 'rgba(45,140,127,0.20)');
  }
  ctx.fillStyle = 'rgba(31,52,82,0.16)';
  for (let x = 26; x < w; x += 84) ctx.fillRect(x - 3, 70, 6, 26);
  ctx.fillStyle = 'rgba(45,140,127,0.42)';
  for (let x = 0; x < w + 40; x += 38) {
    circle(ctx, x, 84 + ((x / 38) % 2) * 8, 20 + ((x / 19) % 3) * 3, 'rgba(45,140,127,0.42)');
  }
}

/**
 * The water itself, as one tile. Drawn in the *clear* colour — the scene
 * darkens it by laying a murk rectangle over the top whose alpha is the
 * clarity meter, so the water changing is a single number rather than a
 * texture swap.
 */
function drawWater(ctx, { w, h }) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#4fa899');
  grad.addColorStop(1, '#2d8c7f');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(255,255,255,0.45)';
  ctx.lineWidth = 2.2;
  const ripples = [
    [30, 26],
    [150, 60],
    [255, 18],
    [360, 74],
    [470, 40],
    [95, 104],
    [300, 118],
    [430, 132],
  ];
  for (const [x, y] of ripples) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 9, y - 5, x + 18, y);
    ctx.quadraticCurveTo(x + 27, y + 5, x + 36, y);
    ctx.stroke();
  }
}

/* -------------------------------------------------------------------------- */
/* The manifest                                                               */
/* -------------------------------------------------------------------------- */

export const ART_MANIFEST = [
  { key: 'bog-boat', file: 'boat.png', frameWidth: 44, frameHeight: 32, frames: 2, draw: drawBoat },
  { key: 'bog-pockets', file: 'pockets.png', frameWidth: 46, frameHeight: 44, frames: 4, draw: drawPockets },
  { key: 'bog-heron', file: 'heron.png', frameWidth: 34, frameHeight: 62, frames: 2, draw: drawHeron },
  { key: 'bog-reeds', file: 'reeds.png', frameWidth: 40, frameHeight: 34, draw: drawReeds },
  { key: 'bog-puff', file: 'puff.png', frameWidth: 22, frameHeight: 22, draw: drawPuff },
  { key: 'bog-heart', file: 'heart.png', frameWidth: 9, frameHeight: 9, draw: drawHeart },
  { key: 'bog-bg-trees', file: 'treeline.png', frameWidth: 560, frameHeight: 110, draw: drawTreeline },
  { key: 'bog-bg-water', file: 'water.png', frameWidth: 560, frameHeight: 170, draw: drawWater },
];

/** Animations the scene plays. Frame indices are into the sheets above. */
export const ART_ANIMS = [
  { key: 'bog-paddle', texture: 'bog-boat', frames: [0, 1], frameRate: 5, repeat: -1 },
  { key: 'bog-heron-reach', texture: 'bog-heron', frames: [1], frameRate: 1, repeat: 0 },
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
 * Queue the real sheets, if a skin declares any. A missing or broken file is
 * logged rather than thrown — `buildBogArt` fills the gap with the stand-in.
 */
export function preloadBogArt(scene) {
  const s = skin();
  if (!s) return;
  scene.load.on('loaderror', (file) => {
    // eslint-disable-next-line no-console
    console.info(`[bullybog] no art file for "${file.key}" — using the built-in stand-in`);
  });
  for (const [key, t] of Object.entries(s.textures ?? {})) {
    scene.load.spritesheet(key, `${s.base}/${t.file}`, {
      frameWidth: t.frameWidth,
      frameHeight: t.frameHeight,
    });
  }
}

/** Fill in whatever the skin didn't provide, then register the animations. */
export function buildBogArt(scene) {
  const s = skin();
  const fromSkin = new Set(
    Object.keys(s?.textures ?? {}).filter((k) => scene.textures.exists(k)),
  );
  scene.bogFromSkin = fromSkin;

  for (const e of ART_MANIFEST) {
    if (!scene.textures.exists(e.key)) generate(scene, e);
  }

  const overrides = s?.anims ?? {};
  for (const a of ART_ANIMS) {
    if (scene.anims.exists(a.key)) continue;
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
 * A comment card, sized to its own text.
 *
 * Deliberately *not* colour-coded by kind. Which comments are kind, which are
 * cruel and which are just fair-but-unwelcome is the entire judgement the game
 * is asking for; painting mean ones red would answer it before the player
 * read a word. The only visual difference is weight: `heavy` cards (the ones
 * about who somebody is, not what they did) are drawn thicker and darker,
 * because the game *does* want the player to see that one of these is not
 * like the others — it just doesn't say which side it's on.
 */
export function bubbleTexture(scene, w, h, heavy) {
  const key = `bog-card-${w}x${h}${heavy ? '-heavy' : ''}`;
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, w, h);
  const ctx = tex.getContext();

  // a soft shadow so a card reads against the water at any clarity
  fillRR(ctx, 2, 3, w - 3, h - 3, 8, 'rgba(31,52,82,0.22)');
  fillRR(ctx, 1, 1, w - 4, h - 5, 8, heavy ? '#eef2f4' : PAPER);
  strokeRR(ctx, 1, 1, w - 4, h - 5, 8, heavy ? INK : 'rgba(31,52,82,0.28)', heavy ? 2.6 : 1.6);

  // the little tail, so it reads as something somebody said
  ctx.beginPath();
  ctx.moveTo(12, h - 4);
  ctx.lineTo(19, h - 4);
  ctx.lineTo(13, h + 0.5);
  ctx.closePath();
  ctx.fillStyle = heavy ? '#eef2f4' : PAPER;
  ctx.fill();

  tex.refresh();
  return key;
}

/** The float a card rides on, so cards sit *in* the water rather than over it. */
export function floatTexture(scene, w) {
  const key = `bog-float-${w}`;
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, w, 12);
  const ctx = tex.getContext();
  ellipse(ctx, w / 2, 6, w / 2 - 1, 5, 'rgba(255,255,255,0.34)');
  ellipse(ctx, w / 2, 5, w / 2 - 5, 3, 'rgba(255,255,255,0.5)');
  tex.refresh();
  return key;
}

export const BOG_COLOURS = { INK, INK_SOFT, PAPER, CORAL, CORAL_DEEP, TEAL, TEAL_LIGHT, GOLD, REED };
