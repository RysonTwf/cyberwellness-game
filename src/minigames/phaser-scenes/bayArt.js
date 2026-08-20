/**
 * Balance Bay art set — the pieces "One More" is drawn from.
 *
 * ---------------------------------------------------------------------------
 * SWAPPING IN REAL ART
 * ---------------------------------------------------------------------------
 * Same contract as passworldArt.js, bogArt.js and peakArt.js, deliberately:
 * every texture the scene uses is declared once in ART_MANIFEST, each entry
 * carrying both the sheet it will eventually load from and a `draw()` that
 * paints a stand-in.
 *
 *   1. Drop sheets into `public/assets/p4-6-only/balance-bay/` under the
 *      `file` names below, at the given frame size (frames left-to-right,
 *      one row).
 *   2. Point a skin's `base` at that folder (see SKINS).
 *
 * The scene only ever names texture keys, so nothing there changes. A file
 * that 404s or fails to decode falls back to its procedural version, so a
 * half-delivered art pack still runs.
 *
 * Two sprites in here are *readouts*, not scenery, and they carry the whole
 * game: the Traveler's posture and the bonfire. Between them they say how the
 * evening is actually going without a number anywhere on screen — which
 * matters more in this realm than in any other, because chapter 2 takes the
 * numbers away on purpose and asks the player to read exactly these.
 */

/**
 * A named set of real sheets layered over the built-in art. Only has to
 * declare what it actually replaces. Nothing has been drawn for the Bay yet,
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
const PERI = '#7b6ef6';
const PERI_DEEP = '#5a4fd0';
const PERI_PALE = '#a79eff';
const GOLD = '#e0a030';
const GOLD_PALE = '#f6e3a8';
const CORAL = '#e0637a';
const TEAL = '#2d8c7f';
const SAND = '#e2cfa4';
const SAND_WET = '#c9b183';

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
/* The readouts                                                               */
/* -------------------------------------------------------------------------- */

/**
 * The Traveler, hands out, catching what the Glimmer throws.
 *
 * **Four frames, and the frame is the entire point of this realm.** Chapter 2
 * hides every number on screen, so this posture is the readout the player has
 * to learn to read — the same job Pockets does in the Bog and the far lookout
 * does on the Peaks.
 *
 *   0 up on their toes, grinning, hands high
 *   1 still keen, but standing flat
 *   2 shoulders down, hands lower, smile gone
 *   3 slumped, head forward, hands barely up — still catching, not enjoying it
 *
 * Drawn as one continuous slump rather than four poses so the change reads
 * even when you only glance: the head drops, the arms drop, the back curves.
 */
function drawTraveler(ctx, { w, h, frame }) {
  const cx = w / 2;
  const slump = [0, 2, 5, 8][frame];
  const armUp = [13, 10, 6, 2][frame];
  const lean = [0, 0.5, 1.5, 3][frame];

  // legs
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 1, h - 12);
  ctx.lineTo(cx - 5, h - 1);
  ctx.moveTo(cx + 1, h - 12);
  ctx.lineTo(cx + 5, h - 1);
  ctx.stroke();

  // body, curving forward as the evening goes on
  poly(
    ctx,
    [
      [cx - 7 + lean, h - 26 + slump],
      [cx + 7 + lean, h - 26 + slump],
      [cx + 6, h - 10],
      [cx - 6, h - 10],
    ],
    TEAL,
  );

  // arms, up to catch — the height of the hands is the clearest tell of all
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx - 6 + lean, h - 24 + slump);
  ctx.lineTo(cx - 11 + lean, h - 24 - armUp + slump);
  ctx.moveTo(cx + 6 + lean, h - 24 + slump);
  ctx.lineTo(cx + 11 + lean, h - 24 - armUp + slump);
  ctx.stroke();
  // cupped hands
  circle(ctx, cx - 11 + lean, h - 24 - armUp + slump, 3, '#f0d9c0');
  circle(ctx, cx + 11 + lean, h - 24 - armUp + slump, 3, '#f0d9c0');

  // head
  circle(ctx, cx + lean, h - 32 + slump, 5.5, '#f0d9c0');
  // hair
  ctx.beginPath();
  ctx.arc(cx + lean, h - 33 + slump, 5.5, Math.PI, Math.PI * 2);
  ctx.fillStyle = INK;
  ctx.fill();

  // The face. A grin at first, a flat line by the end — small, but it's the
  // difference between "having fun" and "still here".
  ctx.strokeStyle = INK;
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  if (frame === 0) ctx.arc(cx + lean, h - 33 + slump, 3, 0.15 * Math.PI, 0.85 * Math.PI);
  else if (frame === 1) ctx.arc(cx + lean, h - 33.5 + slump, 2.6, 0.25 * Math.PI, 0.75 * Math.PI);
  else {
    ctx.moveTo(cx - 2 + lean, h - 30 + slump);
    ctx.lineTo(cx + 2 + lean, h - 30 + slump);
  }
  ctx.stroke();
  // eyes — half-shut by the last frame
  const eyeY = h - 34 + slump;
  if (frame < 3) {
    circle(ctx, cx - 2 + lean, eyeY, 1, INK);
    circle(ctx, cx + 2.5 + lean, eyeY, 1, INK);
  } else {
    ctx.beginPath();
    ctx.moveTo(cx - 3.4 + lean, eyeY);
    ctx.lineTo(cx - 0.6 + lean, eyeY);
    ctx.moveTo(cx + 1.2 + lean, eyeY);
    ctx.lineTo(cx + 4 + lean, eyeY);
    ctx.stroke();
  }
}

/**
 * The bonfire down the beach, and what's left of it. The other readout: it
 * burns down while you play, faster the longer you stay, so "what this is
 * costing" is a thing you can see from across the screen.
 *
 *   0 out, embers only · 1 low · 2 going · 3 roaring, with friends lit by it
 */
function drawBonfire(ctx, { w, h, frame }) {
  const cx = w / 2;
  const base = h - 4;

  // logs
  ctx.strokeStyle = '#7a5c3a';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - 12, base);
  ctx.lineTo(cx + 9, base - 7);
  ctx.moveTo(cx + 12, base);
  ctx.lineTo(cx - 9, base - 7);
  ctx.stroke();

  if (frame === 0) {
    // embers: still warm, not gone. Nothing in this realm is unrecoverable.
    circle(ctx, cx - 4, base - 5, 2.2, '#a3542c');
    circle(ctx, cx + 3, base - 6, 2.6, '#c9762f');
    return;
  }

  const tall = [0, 12, 22, 34][frame];
  const wide = [0, 6, 9, 12][frame];
  poly(ctx, [[cx - wide, base - 5], [cx, base - 5 - tall], [cx + wide, base - 5]], '#e07a2c');
  poly(
    ctx,
    [[cx - wide * 0.55, base - 5], [cx + 1, base - 5 - tall * 0.7], [cx + wide * 0.55, base - 5]],
    GOLD,
  );
  if (frame >= 2) {
    poly(
      ctx,
      [[cx - wide * 0.25, base - 5], [cx, base - 5 - tall * 0.4], [cx + wide * 0.28, base - 5]],
      GOLD_PALE,
    );
  }
  // the glow it throws on the sand
  ellipse(ctx, cx, base + 1, 22 + tall * 0.5, 5, `rgba(224,160,48,${0.1 + frame * 0.07})`);

  if (frame === 3) {
    // sparks going up, only on the top frame — the reward for getting there
    circle(ctx, cx - 7, base - 5 - tall - 6, 1.4, GOLD_PALE);
    circle(ctx, cx + 6, base - 5 - tall - 12, 1.1, GOLD);
    circle(ctx, cx + 1, base - 5 - tall - 19, 1.5, GOLD_PALE);
  }
}

/**
 * A friend at the bonfire. Two frames: sitting, and waving you over — the
 * wave is chapter 3's called moment, a cost with a deadline on it rather than
 * a vague "balance".
 */
function drawFriend(ctx, { w, h, frame }) {
  const cx = w / 2;
  // sitting body
  poly(ctx, [[cx - 6, h - 2], [cx - 5, h - 15], [cx + 5, h - 15], [cx + 6, h - 2]], CORAL);
  circle(ctx, cx, h - 19, 4.5, '#f0d9c0');
  ctx.beginPath();
  ctx.arc(cx, h - 20, 4.5, Math.PI, Math.PI * 2);
  ctx.fillStyle = '#4b3a2a';
  ctx.fill();

  ctx.strokeStyle = CORAL;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  if (frame === 1) {
    // arm up, waving
    ctx.moveTo(cx + 4, h - 13);
    ctx.lineTo(cx + 10, h - 24);
    ctx.stroke();
    circle(ctx, cx + 11, h - 25, 2.4, '#f0d9c0');
  } else {
    ctx.moveTo(cx + 4, h - 13);
    ctx.lineTo(cx + 8, h - 6);
    ctx.stroke();
  }
}

/**
 * The Glimmer — the thing in the water that is very, very good at being fun.
 *
 * Deliberately *not* drawn as a monster. It's pretty, and it stays pretty all
 * evening, because the realm's whole claim is that the problem isn't that
 * screens are bad — it's that "am I still enjoying this" stops being a
 * question you ask. Making it visibly sinister would answer that question for
 * the player and hand them the wrong lesson.
 *
 *   0 drifting · 1 throwing · 2 leaning in, a little more insistent
 */
function drawGlimmer(ctx, { w, h, frame }) {
  const cx = w / 2;
  const cy = h / 2;

  // halo
  circle(ctx, cx, cy, 22 - frame, `rgba(123,110,246,0.16)`);
  circle(ctx, cx, cy, 16, `rgba(167,158,255,0.34)`);

  // body — a soft, slightly jellyfish-ish glow
  ellipse(ctx, cx, cy, 12, 10, PERI_PALE);
  ellipse(ctx, cx, cy - 2, 9, 7, PAPER);

  // trailing ribbons, livelier the more insistent it is
  ctx.strokeStyle = PERI;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let i = -1; i <= 1; i += 1) {
    const sway = frame * 2 * i;
    ctx.beginPath();
    ctx.moveTo(cx + i * 6, cy + 8);
    ctx.quadraticCurveTo(cx + i * 8 + sway, cy + 15, cx + i * 5 - sway, cy + 22);
    ctx.stroke();
  }

  // eyes — friendly, always
  circle(ctx, cx - 4, cy - 3, 1.6, PERI_DEEP);
  circle(ctx, cx + 4, cy - 3, 1.6, PERI_DEEP);
  ctx.strokeStyle = PERI_DEEP;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy - 1, 3.4, 0.15 * Math.PI, 0.85 * Math.PI);
  ctx.stroke();
}

/**
 * A mote of light the Glimmer throws for you to catch.
 *
 * Two frames, bright and dim, and the scene picks per-round: late rounds
 * spawn dim ones. That is the honest mechanical expression of the thing this
 * realm is about — the toy itself gets duller, and the question is whether
 * you notice before the bonfire goes out.
 */
function drawMote(ctx, { w, h, frame }) {
  const cx = w / 2;
  const cy = h / 2;
  const bright = frame === 0;
  circle(ctx, cx, cy, cx - 1, bright ? 'rgba(167,158,255,0.42)' : 'rgba(167,158,255,0.16)');
  circle(ctx, cx, cy, cx - 3.5, bright ? PERI_PALE : '#c3bde0');
  circle(ctx, cx - 1, cy - 1, cx - 6, bright ? PAPER : '#e8e6f4');
}

/** The little pop a caught mote makes. */
function drawCatch(ctx, { w, h }) {
  circle(ctx, w / 2, h / 2, w / 2 - 1, 'rgba(255,255,255,0.8)');
  circle(ctx, w / 2, h / 2, w / 2 - 4, 'rgba(123,110,246,0.4)');
}

/* -------------------------------------------------------------------------- */
/* Backdrops                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Sky and sea, down to the beach. Painted at *dusk* — the bright end of the
 * evening. The scene lays a night rectangle over the top whose alpha is how
 * late it's got, so "the evening running away from you" is one number and the
 * player watches it without reading it.
 */
function drawSky(ctx, { w, h }) {
  const grad = ctx.createLinearGradient(0, 0, 0, 150);
  grad.addColorStop(0, '#8f86e8');
  grad.addColorStop(0.55, '#c9a6d8');
  grad.addColorStop(1, '#f0c79a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, 150);

  // the low dusk sun
  circle(ctx, 92, 128, 30, 'rgba(224,160,48,0.5)');
  circle(ctx, 92, 128, 20, 'rgba(246,227,168,0.75)');

  // cloud bars
  ctx.globalAlpha = 0.24;
  for (const [x, y, rx] of [
    [112, 108, 46],
    [146, 103, 30],
    [396, 96, 40],
    [422, 92, 26],
    [262, 122, 34],
  ]) {
    ellipse(ctx, x, y, rx, 9, GOLD);
  }
  ctx.globalAlpha = 1;

  // the sea, from a fixed horizon down
  const sea = ctx.createLinearGradient(0, 150, 0, h);
  sea.addColorStop(0, '#6a5fd8');
  sea.addColorStop(1, '#8d83ea');
  ctx.fillStyle = sea;
  ctx.fillRect(0, 150, w, h - 150);
  ctx.fillStyle = 'rgba(31,52,82,0.12)';
  ctx.fillRect(0, 150, w, 2);

  // a few catch-lights on the water
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 2;
  for (const [x, y] of [
    [60, 168],
    [190, 182],
    [330, 164],
    [452, 186],
    [140, 196],
    [400, 200],
  ]) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 8, y - 4, x + 16, y);
    ctx.stroke();
  }
}

/**
 * The beach, drawn as one tile. The wet line sits at the top — the scene
 * slides the whole tile up and down, so a rising tide is one number too.
 */
function drawBeach(ctx, { w, h }) {
  // wet sand where the water has just been
  ctx.fillStyle = SAND_WET;
  ctx.fillRect(0, 0, w, 14);
  // foam along the water's edge
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let x = -10; x < w + 20; x += 40) {
    ctx.moveTo(x, 3);
    ctx.quadraticCurveTo(x + 10, 8, x + 20, 3);
    ctx.quadraticCurveTo(x + 30, -2, x + 40, 3);
  }
  ctx.stroke();

  ctx.fillStyle = SAND;
  ctx.fillRect(0, 12, w, h - 12);

  // scattered shells and dry ripples, so the sand isn't a flat slab
  ctx.fillStyle = 'rgba(31,52,82,0.07)';
  for (let x = 8; x < w; x += 31) {
    ellipse(ctx, x, 24 + ((x / 31) % 4) * 9, 9, 2.5, 'rgba(31,52,82,0.07)');
  }
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  for (let x = 20; x < w; x += 47) circle(ctx, x, 40 + ((x / 47) % 3) * 11, 1.8, 'rgba(255,255,255,0.4)');
}

/** Stars, which only really come out once the Glimmer is put down. */
function drawStars(ctx, { w, h }) {
  for (const [x, y, r] of [
    [300, 24, 2.8],
    [356, 52, 2.1],
    [414, 20, 2.5],
    [466, 48, 1.9],
    [514, 16, 2.6],
    [238, 42, 2],
    [486, 86, 1.8],
    [178, 26, 2.2],
    [62, 40, 1.9],
  ]) {
    circle(ctx, x, y, r, GOLD_PALE);
  }
  void h;
}

/* -------------------------------------------------------------------------- */
/* The manifest                                                               */
/* -------------------------------------------------------------------------- */

export const ART_MANIFEST = [
  { key: 'bay-traveler', file: 'traveler.png', frameWidth: 34, frameHeight: 46, frames: 4, draw: drawTraveler },
  { key: 'bay-bonfire', file: 'bonfire.png', frameWidth: 56, frameHeight: 54, frames: 4, draw: drawBonfire },
  { key: 'bay-friend', file: 'friend.png', frameWidth: 26, frameHeight: 30, frames: 2, draw: drawFriend },
  { key: 'bay-glimmer', file: 'glimmer.png', frameWidth: 52, frameHeight: 60, frames: 3, draw: drawGlimmer },
  { key: 'bay-mote', file: 'mote.png', frameWidth: 18, frameHeight: 18, frames: 2, draw: drawMote },
  { key: 'bay-catch', file: 'catch.png', frameWidth: 22, frameHeight: 22, draw: drawCatch },
  { key: 'bay-bg-sky', file: 'sky.png', frameWidth: 560, frameHeight: 230, draw: drawSky },
  // 110 tall, not 90: the scene slides this tile up as the tide comes in,
  // and it still has to reach the bottom of the canvas at full tide.
  { key: 'bay-bg-beach', file: 'beach.png', frameWidth: 560, frameHeight: 110, draw: drawBeach },
  { key: 'bay-stars', file: 'stars.png', frameWidth: 560, frameHeight: 110, draw: drawStars },
];

/** Animations the scene plays. Frame indices are into the sheets above. */
/**
 * No animations. The Glimmer's three frames are *state* — drifting, throwing,
 * leaning in — and the scene sets them directly; a looping idle animation would
 * overwrite that every few frames. Its liveliness comes from a positional bob
 * in the scene instead. A skin that wants a real idle loop should add it here
 * and stop the scene setting frames.
 */
export const ART_ANIMS = [];

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
 * logged rather than thrown — `buildBayArt` fills the gap with the stand-in.
 */
export function preloadBayArt(scene) {
  const s = skin();
  if (!s) return;
  scene.load.on('loaderror', (file) => {
    // eslint-disable-next-line no-console
    console.info(`[balance] no art file for "${file.key}" — using the built-in stand-in`);
  });
  for (const [key, t] of Object.entries(s.textures ?? {})) {
    scene.load.spritesheet(key, `${s.base}/${t.file}`, {
      frameWidth: t.frameWidth,
      frameHeight: t.frameHeight,
    });
  }
}

/** Fill in whatever the skin didn't provide, then register the animations. */
export function buildBayArt(scene) {
  const s = skin();
  const fromSkin = new Set(Object.keys(s?.textures ?? {}).filter((k) => scene.textures.exists(k)));
  scene.bayFromSkin = fromSkin;

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

export const BAY_COLOURS = {
  INK,
  INK_SOFT,
  PAPER,
  PERI,
  PERI_DEEP,
  PERI_PALE,
  GOLD,
  GOLD_PALE,
  CORAL,
  TEAL,
  SAND,
};
