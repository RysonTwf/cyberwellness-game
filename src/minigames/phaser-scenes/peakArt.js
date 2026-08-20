/**
 * Privacy Peaks art set — the pieces "The Fog Line" is drawn from.
 *
 * ---------------------------------------------------------------------------
 * SWAPPING IN REAL ART
 * ---------------------------------------------------------------------------
 * Same contract as passworldArt.js and bogArt.js, deliberately: every texture
 * the scene uses is declared once in ART_MANIFEST, each entry carrying both
 * the sheet it will eventually load from and a `draw()` that paints a
 * stand-in.
 *
 *   1. Drop sheets into `public/assets/p4-6-only/privacy-peaks/` under the
 *      `file` names below, at the given frame size (frames left-to-right,
 *      one row).
 *   2. Point a skin's `base` at that folder (see SKINS).
 *
 * The scene only ever names texture keys, so nothing there changes. A file
 * that 404s or fails to decode falls back to its procedural version, so a
 * half-delivered art pack still runs.
 *
 * The message notes themselves aren't in the manifest: they're sized by their
 * own text at runtime, so they're generated on demand by `noteTexture` further
 * down — exactly how bogArt handles comment cards.
 */

/**
 * A named set of real sheets layered over the built-in art. Only has to
 * declare what it actually replaces. Nothing has been drawn for the Peaks
 * yet, so there's one entry and it's the stand-ins.
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
const SNOW = '#f6f9fa';
const FOG = '#eef3f4';
const TEAL = '#2d8c7f';
const TEAL_LIGHT = '#57b3a3';
const TEAL_DEEP = '#1f6a60';
const GOLD = '#e0a030';
const CORAL = '#e0637a';
const BRASS = '#c98f3c';
const TIMBER = '#8a6a48';

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

function poly(ctx, points, colour) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = colour;
  ctx.fill();
}

/* -------------------------------------------------------------------------- */
/* The actors                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * The Traveler, walking the ridge with a satchel. Two frames — the legs swap
 * — so a player can tell at a glance whether they're moving or parked at a
 * post, which matters because parking at a post is half the game.
 */
function drawWalker(ctx, { w, h, frame }) {
  const cx = w / 2;
  const swing = frame === 1 ? 1 : -1;

  // legs
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, h - 13);
  ctx.lineTo(cx - 4 * swing, h - 2);
  ctx.moveTo(cx, h - 13);
  ctx.lineTo(cx + 4 * swing, h - 3);
  ctx.stroke();

  // coat
  poly(
    ctx,
    [
      [cx - 7, h - 26],
      [cx + 7, h - 26],
      [cx + 6, h - 11],
      [cx - 6, h - 11],
    ],
    TEAL,
  );
  poly(
    ctx,
    [
      [cx - 7, h - 26],
      [cx, h - 24],
      [cx, h - 11],
      [cx - 6, h - 11],
    ],
    TEAL_DEEP,
  );

  // satchel, on the downhill side
  fillRR(ctx, cx + 4, h - 20, 8, 8, 2, TIMBER);

  // head and woolly hat, because it is a cold ridge and the hat reads at 12px
  circle(ctx, cx, h - 31, 5, '#f0d9c0');
  fillRR(ctx, cx - 5.5, h - 37, 11, 6, 3, CORAL);
  circle(ctx, cx, h - 38, 2, PAPER);

  // the arm that holds a note up, always raised — it is the carrying hand
  ctx.strokeStyle = TEAL_DEEP;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx - 5, h - 24);
  ctx.lineTo(cx - 9, h - 33);
  ctx.stroke();
}

/**
 * The spyglass post: a tripod with a brass glass on it. This is the "look at
 * who actually sent it" station, so the thing itself has to say *looking* —
 * hence a glass you point, not a screen you read.
 *
 *   0 idle · 1 in use (tilted up, lens catching the light)
 */
function drawSpyglass(ctx, { w, h, frame }) {
  const cx = w / 2;
  const tilt = frame === 1 ? -0.42 : -0.16;

  // tripod
  ctx.strokeStyle = TIMBER;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(cx, h - 20);
  ctx.lineTo(cx - 8, h - 1);
  ctx.moveTo(cx, h - 20);
  ctx.lineTo(cx + 8, h - 1);
  ctx.moveTo(cx, h - 20);
  ctx.lineTo(cx + 1, h - 1);
  ctx.stroke();

  // the glass
  ctx.save();
  ctx.translate(cx, h - 22);
  ctx.rotate(tilt);
  fillRR(ctx, -11, -4, 20, 8, 3, BRASS);
  fillRR(ctx, 7, -5.5, 8, 11, 3, '#e0b566');
  fillRR(ctx, -14, -3, 5, 6, 2, '#8f6427');
  circle(ctx, 12, 0, 3.4, frame === 1 ? SNOW : '#bcd3d8');
  ctx.restore();

  // a cairn of stones at the foot, so the post has weight on the ridge
  ellipse(ctx, cx - 12, h - 3, 6, 3.5, INK_SOFT);
  ellipse(ctx, cx + 12, h - 3, 5, 3, INK_SOFT);
}

/**
 * The signal fire: the "go and check the official way, by a route you chose"
 * station. Drawn as something you *light* rather than something you read,
 * because the lesson is that you start the check, not the message.
 *
 *   0 banked embers · 1 flaring
 */
function drawFire(ctx, { w, h, frame }) {
  const cx = w / 2;

  // stone ring
  for (const [dx, r] of [
    [-13, 5],
    [-5, 4.5],
    [4, 5],
    [12, 4.5],
  ]) {
    ellipse(ctx, cx + dx, h - 4, r, 3.6, '#9aa8ad');
    ellipse(ctx, cx + dx, h - 5, r - 1.4, 2.6, '#bcc7cb');
  }

  // logs
  ctx.strokeStyle = TIMBER;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 8, h - 6);
  ctx.lineTo(cx + 7, h - 12);
  ctx.moveTo(cx + 8, h - 6);
  ctx.lineTo(cx - 7, h - 12);
  ctx.stroke();

  if (frame === 1) {
    poly(ctx, [[cx - 8, h - 10], [cx, h - 34], [cx + 8, h - 10]], GOLD);
    poly(ctx, [[cx - 4, h - 10], [cx + 1, h - 25], [cx + 5, h - 10]], '#f6e3a8');
    // smoke, so the flare reads from the far end of the ridge
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx, h - 34);
    ctx.quadraticCurveTo(cx + 8, h - 42, cx + 2, h - 48);
    ctx.stroke();
  } else {
    poly(ctx, [[cx - 5, h - 10], [cx, h - 18], [cx + 5, h - 10]], '#c9762f');
    poly(ctx, [[cx - 2, h - 10], [cx + 1, h - 14], [cx + 3, h - 10]], GOLD);
  }
}

/**
 * The ranger's hut — the trusted adult on this mountain. Warm, lit, and with
 * the door already ajar: it is a place you're allowed to walk into, not a
 * consequence that arrives.
 *
 *   0 door closed, lamp on · 1 door open, ranger's lamp swung out
 */
function drawHut(ctx, { w, h, frame }) {
  const cx = w / 2;
  const bodyY = h - 26;

  // walls
  fillRR(ctx, cx - 17, bodyY, 34, 26, 2, TIMBER);
  ctx.fillStyle = 'rgba(31,52,82,0.18)';
  for (let y = bodyY + 5; y < h - 2; y += 6) ctx.fillRect(cx - 17, y, 34, 1.4);

  // roof
  poly(ctx, [[cx - 22, bodyY + 1], [cx, bodyY - 14], [cx + 22, bodyY + 1]], '#5f7f74');
  poly(ctx, [[cx - 22, bodyY + 1], [cx, bodyY - 14], [cx - 2, bodyY + 1]], '#4d6b61');
  // snow on the roof, which is what makes it read as a mountain hut
  ctx.strokeStyle = SNOW;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(cx - 20, bodyY - 1);
  ctx.lineTo(cx - 2, bodyY - 13);
  ctx.stroke();

  // window, always lit — somebody is in
  fillRR(ctx, cx - 13, bodyY + 6, 9, 8, 1.5, frame === 1 ? '#ffe9b0' : GOLD);

  // door
  if (frame === 1) {
    fillRR(ctx, cx + 1, bodyY + 6, 12, 20, 1.5, '#ffe9b0');
    fillRR(ctx, cx + 11, bodyY + 6, 4, 20, 1.5, '#6f5438');
    // the lamp, swung out to meet you
    ctx.strokeStyle = INK_SOFT;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx + 16, bodyY + 4);
    ctx.lineTo(cx + 22, bodyY + 9);
    ctx.stroke();
    circle(ctx, cx + 23, bodyY + 12, 4, GOLD);
    circle(ctx, cx + 23, bodyY + 12, 2, '#fff3cf');
  } else {
    fillRR(ctx, cx + 2, bodyY + 6, 12, 20, 1.5, '#6f5438');
    circle(ctx, cx + 11, bodyY + 16, 1.4, GOLD);
  }
}

/**
 * The far lookout on the next summit. Four frames, and the frame is the whole
 * point: this is the readout that says how the round is actually going, so it
 * has to be legible at a glance from across the canvas without reading a
 * number. You cannot see it at all when the fog is thick; it sharpens as the
 * air clears, and lights its lamp once you've cleared enough.
 *
 *   0 nothing but a smudge · 1 an outline · 2 solid · 3 lamp lit
 */
function drawLookout(ctx, { w, h, frame }) {
  const cx = w / 2;
  const alpha = [0.16, 0.4, 0.75, 1][frame];
  ctx.globalAlpha = alpha;

  // the crag it stands on
  poly(
    ctx,
    [[2, h - 1], [cx - 4, h - 22], [cx + 9, h - 16], [w - 2, h - 1]],
    frame >= 2 ? TEAL : TEAL_LIGHT,
  );
  ctx.globalAlpha = alpha * 0.8;
  poly(ctx, [[cx - 4, h - 22], [cx + 2, h - 19], [cx - 1, h - 15]], SNOW);
  ctx.globalAlpha = alpha;

  // legs and platform
  ctx.strokeStyle = frame >= 2 ? INK : INK_SOFT;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 8, h - 20);
  ctx.lineTo(cx - 5, h - 38);
  ctx.moveTo(cx + 8, h - 18);
  ctx.lineTo(cx + 5, h - 38);
  ctx.stroke();
  fillRR(ctx, cx - 12, h - 44, 24, 7, 2, frame >= 2 ? INK : INK_SOFT);

  // cabin
  fillRR(ctx, cx - 9, h - 56, 18, 13, 2, frame >= 2 ? PAPER_DIM : FOG);
  poly(ctx, [[cx - 12, h - 55], [cx, h - 64], [cx + 12, h - 55]], frame >= 2 ? TEAL_DEEP : TEAL_LIGHT);

  if (frame === 3) {
    // the lamp, and a flag — the reward for clearing the air
    circle(ctx, cx, h - 50, 4.5, GOLD);
    circle(ctx, cx, h - 50, 2.2, '#fff3cf');
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx + 11, h - 64);
    ctx.lineTo(cx + 11, h - 76);
    ctx.stroke();
    poly(ctx, [[cx + 11, h - 76], [cx + 23, h - 72], [cx + 11, h - 68]], CORAL);
  } else {
    circle(ctx, cx, h - 50, 3.6, frame >= 2 ? INK_SOFT : FOG);
  }

  ctx.globalAlpha = 1;
}

/**
 * The drop — the windward edge of the ridge, where you let a message go. A
 * leaning marker post with paper already blowing off it, so the verb is
 * obvious before anybody reads the label.
 */
function drawDrop(ctx, { w, h }) {
  const cx = w / 2;

  ctx.save();
  ctx.translate(cx, h - 2);
  ctx.rotate(-0.14);
  ctx.strokeStyle = TIMBER;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -30);
  ctx.stroke();
  poly(ctx, [[-1, -30], [-16, -25], [-1, -20]], INK_SOFT);
  ctx.restore();

  // paper going over the edge
  ctx.globalAlpha = 0.75;
  fillRR(ctx, cx - 16, h - 42, 10, 8, 2, PAPER);
  ctx.globalAlpha = 0.45;
  fillRR(ctx, cx - 26, h - 34, 8, 6, 2, PAPER);
  ctx.globalAlpha = 0.22;
  fillRR(ctx, cx - 34, h - 27, 6, 5, 2, PAPER);
  ctx.globalAlpha = 1;
}

/**
 * The waypost — two standing stones and a lintel. Walking a message through
 * here is *doing what it says*, and the shape says "a way onward", because
 * acting on a message that turns out to be genuine is the right and ordinary
 * thing to do.
 */
function drawGate(ctx, { w, h }) {
  const cx = w / 2;
  fillRR(ctx, cx - 15, h - 30, 8, 30, 2, '#9aa8ad');
  fillRR(ctx, cx + 7, h - 30, 8, 30, 2, '#9aa8ad');
  fillRR(ctx, cx - 18, h - 38, 36, 9, 2, '#8895a0');
  ctx.strokeStyle = SNOW;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 16, h - 37);
  ctx.lineTo(cx + 16, h - 37);
  ctx.stroke();
  // the path carrying on through it
  ctx.strokeStyle = 'rgba(45,140,127,0.85)';
  ctx.lineWidth = 3;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(cx - 10, h - 2);
  ctx.lineTo(cx + 12, h - 12);
  ctx.stroke();
  ctx.setLineDash([]);
}

/** A wooden peg. Every note on the line hangs from one. */
function drawPeg(ctx, { w, h }) {
  fillRR(ctx, 1, 2, w - 2, h - 3, 2, TIMBER);
  ctx.fillStyle = 'rgba(31,52,82,0.3)';
  ctx.fillRect(w / 2 - 0.7, 3, 1.4, h - 6);
}

/** The puff a message leaves when it's resolved. */
function drawSpark(ctx, { w, h }) {
  circle(ctx, w / 2, h / 2, w / 2 - 1, 'rgba(255,255,255,0.85)');
  circle(ctx, w / 2, h / 2, w / 2 - 3.5, 'rgba(45,140,127,0.45)');
}

/* -------------------------------------------------------------------------- */
/* Backdrops                                                                  */
/* -------------------------------------------------------------------------- */

/** Sky and the far ranges. Matches RealmArt's PrivacyScene ridges. */
function drawSky(ctx, { w, h }) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#cfe6e3');
  grad.addColorStop(1, '#e8f1f0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // furthest range
  ctx.globalAlpha = 0.3;
  poly(
    ctx,
    [[0, h], [0, 96], [92, 20], [166, 78], [240, 8], [330, 92], [412, 32], [484, 86], [w, 18], [w, h]],
    TEAL,
  );
  // second range
  ctx.globalAlpha = 0.5;
  poly(
    ctx,
    [[0, h], [0, 118], [78, 56], [158, 112], [254, 40], [342, 116], [436, 58], [516, 120], [w, 84], [w, h]],
    TEAL,
  );
  ctx.globalAlpha = 0.85;
  for (const [x, y] of [[254, 40], [436, 58], [78, 56]]) {
    poly(ctx, [[x, y], [x + 14, y + 16], [x - 14, y + 16]], SNOW);
  }
  ctx.globalAlpha = 1;
}

/**
 * The ridge the Traveler walks, drawn as one tile. The scene lays a fog
 * rectangle over everything behind it whose alpha *is* the visibility meter —
 * so "the air clears" is a single number, and the player watches their own
 * score without reading one.
 */
function drawRidge(ctx, { w, h }) {
  // the mass of the mountain below the path
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, '#5aa79b');
  grad.addColorStop(1, '#2d7a70');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 12, w, h - 12);

  // The path itself: a flat shelf across the whole width. The game is 1-D and
  // the art must not imply anywhere you can't actually walk.
  ctx.fillStyle = '#c8b48c';
  ctx.fillRect(0, 12, w, 16);
  ctx.fillStyle = 'rgba(31,52,82,0.16)';
  ctx.fillRect(0, 26, w, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fillRect(0, 12, w, 2);

  // scree and tufts below, for texture
  for (let x = 6; x < w; x += 29) {
    ellipse(ctx, x, 40 + ((x / 29) % 3) * 9, 7, 3, 'rgba(31,52,82,0.13)');
  }
  ctx.strokeStyle = 'rgba(63,143,109,0.55)';
  ctx.lineWidth = 1.6;
  for (let x = 14; x < w; x += 37) {
    ctx.beginPath();
    ctx.moveTo(x, h - 4);
    ctx.quadraticCurveTo(x + 3, h - 12, x + 6, h - 5);
    ctx.stroke();
  }
}

/** A drifting bank of fog. The scene tiles a few of these and slides them. */
function drawFogBank(ctx, { w, h }) {
  ellipse(ctx, w * 0.3, h * 0.55, w * 0.3, h * 0.4, 'rgba(238,243,244,0.9)');
  ellipse(ctx, w * 0.6, h * 0.45, w * 0.26, h * 0.34, 'rgba(242,246,247,0.85)');
  ellipse(ctx, w * 0.82, h * 0.6, w * 0.2, h * 0.3, 'rgba(238,243,244,0.8)');
}

/* -------------------------------------------------------------------------- */
/* The manifest                                                               */
/* -------------------------------------------------------------------------- */

export const ART_MANIFEST = [
  { key: 'peak-walker', file: 'walker.png', frameWidth: 30, frameHeight: 42, frames: 2, draw: drawWalker },
  { key: 'peak-spyglass', file: 'spyglass.png', frameWidth: 46, frameHeight: 48, frames: 2, draw: drawSpyglass },
  { key: 'peak-fire', file: 'fire.png', frameWidth: 46, frameHeight: 52, frames: 2, draw: drawFire },
  { key: 'peak-hut', file: 'hut.png', frameWidth: 60, frameHeight: 50, frames: 2, draw: drawHut },
  { key: 'peak-lookout', file: 'lookout.png', frameWidth: 54, frameHeight: 82, frames: 4, draw: drawLookout },
  { key: 'peak-drop', file: 'drop.png', frameWidth: 44, frameHeight: 46, draw: drawDrop },
  { key: 'peak-gate', file: 'gate.png', frameWidth: 44, frameHeight: 42, draw: drawGate },
  { key: 'peak-peg', file: 'peg.png', frameWidth: 8, frameHeight: 12, draw: drawPeg },
  { key: 'peak-spark', file: 'spark.png', frameWidth: 22, frameHeight: 22, draw: drawSpark },
  // 200 tall, not 130: the ridge tile starts at y=196, and anything short of
  // that leaves a flat band of background colour across the middle of the sky.
  { key: 'peak-bg-sky', file: 'sky.png', frameWidth: 560, frameHeight: 200, draw: drawSky },
  { key: 'peak-bg-ridge', file: 'ridge.png', frameWidth: 560, frameHeight: 90, draw: drawRidge },
  { key: 'peak-fogbank', file: 'fogbank.png', frameWidth: 220, frameHeight: 64, draw: drawFogBank },
];

/** Animations the scene plays. Frame indices are into the sheets above. */
export const ART_ANIMS = [
  { key: 'peak-walk', texture: 'peak-walker', frames: [0, 1], frameRate: 7, repeat: -1 },
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
 * logged rather than thrown — `buildPeakArt` fills the gap with the stand-in.
 */
export function preloadPeakArt(scene) {
  const s = skin();
  if (!s) return;
  scene.load.on('loaderror', (file) => {
    // eslint-disable-next-line no-console
    console.info(`[privacy] no art file for "${file.key}" — using the built-in stand-in`);
  });
  for (const [key, t] of Object.entries(s.textures ?? {})) {
    scene.load.spritesheet(key, `${s.base}/${t.file}`, {
      frameWidth: t.frameWidth,
      frameHeight: t.frameHeight,
    });
  }
}

/** Fill in whatever the skin didn't provide, then register the animations. */
export function buildPeakArt(scene) {
  const s = skin();
  const fromSkin = new Set(Object.keys(s?.textures ?? {}).filter((k) => scene.textures.exists(k)));
  scene.peakFromSkin = fromSkin;

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
 * A message note, sized to its own text.
 *
 * Deliberately *not* colour-coded by kind. Whether a message is a scam, a
 * genuine one that matters, or harmless noise is the entire judgement the game
 * is asking for; tinting the fakes red would answer it before the player read
 * a word — and worse, it would teach the exact thing this realm exists to
 * unteach, that you can tell by looking.
 *
 * `heavy` notes — the ones asking for something about *you* — are the single
 * exception: darker paper, heavier rule, because the game does want "this one
 * is not like the others" to be visible. It still never says which side of the
 * line it's on.
 */
export function noteTexture(scene, w, h, heavy) {
  const key = `peak-note-${w}x${h}${heavy ? '-heavy' : ''}`;
  if (scene.textures.exists(key)) return key;
  const tex = scene.textures.createCanvas(key, w, h + 6);
  const ctx = tex.getContext();

  // a soft shadow so a note reads against the fog at any visibility
  fillRR(ctx, 3, 5, w - 4, h - 2, 6, 'rgba(31,52,82,0.2)');
  fillRR(ctx, 1, 2, w - 5, h - 3, 6, heavy ? '#e8eef1' : PAPER);
  strokeRR(ctx, 1, 2, w - 5, h - 3, 6, heavy ? INK : 'rgba(31,52,82,0.26)', heavy ? 2.6 : 1.5);

  // The rule the sender name sits above. A note off a washing line should read
  // as a note, not as a speech bubble — Bully Bog's cards are the bubbles.
  ctx.strokeStyle = heavy ? 'rgba(31,52,82,0.45)' : 'rgba(31,52,82,0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(9, 20);
  ctx.lineTo(w - 13, 20);
  ctx.stroke();

  // two punch-holes at the top, where the pegs bite
  circle(ctx, w * 0.3, 6, 1.6, 'rgba(31,52,82,0.35)');
  circle(ctx, w * 0.7, 6, 1.6, 'rgba(31,52,82,0.35)');

  tex.refresh();
  return key;
}

/**
 * The mark a completed check leaves on a note — a coloured tab down the left
 * edge, one per post used, so "I already looked at this one" is visible from
 * across the ridge and survives being hung back on the line.
 */
export function stampTexture(scene, post) {
  const key = `peak-stamp-${post}`;
  if (scene.textures.exists(key)) return key;
  const colour = { spy: BRASS, fire: GOLD, hut: TEAL }[post] ?? INK_SOFT;
  const tex = scene.textures.createCanvas(key, 6, 14);
  const ctx = tex.getContext();
  fillRR(ctx, 0, 0, 6, 14, 3, colour);
  tex.refresh();
  return key;
}

export const PEAK_COLOURS = {
  INK,
  INK_SOFT,
  PAPER,
  FOG,
  SNOW,
  TEAL,
  TEAL_LIGHT,
  TEAL_DEEP,
  GOLD,
  CORAL,
  BRASS,
};
