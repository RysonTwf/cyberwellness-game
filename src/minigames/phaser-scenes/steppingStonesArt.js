/**
 * Privacy Peaks stepping-stone/fog art set (Milestones Phase 4 — the
 * designer's measured asset list, built procedurally, same shape as
 * `passworldArt.js`).
 *
 * ---------------------------------------------------------------------------
 * SWAPPING IN REAL ART
 * ---------------------------------------------------------------------------
 * Every texture the scene uses is declared exactly once in ART_MANIFEST below.
 * Each entry carries both the file it will eventually load from and a
 * `draw()` that paints the same thing onto a canvas as a stand-in.
 *
 * To switch to real art:
 *   1. Add a skin to SKINS below (see passworldArt.js's `brackeys` entry for
 *      the shape) with the sheets dropped into whatever folder its `base`
 *      points at, at the `frameWidth`×`frameHeight` frame size given.
 *   2. Set ACTIVE_SKIN to that skin's name.
 *
 * Nothing in steppingStonesScene.js changes — it only ever refers to texture
 * keys. Each file loads independently and silently falls back to its
 * procedural version if it's missing or fails to decode, so a partial art
 * delivery still runs rather than crashing.
 *
 * The stand-ins here are drawn to actually *look* like Privacy Peaks — a
 * misty teal ravine with a torii gate on the far side (the same beat
 * RealmArt.jsx's PrivacyScene paints) — rather than the grey wireframe
 * ellipses this scene used before. Real art can still replace any single
 * piece; it just isn't a placeholder eyesore until it does.
 *
 * Frame sizes are the *live* ones, measured against the running scene
 * (560×190 canvas — see steppingStonesScene.js).
 */

export const SKINS = {
  /** The stand-in art in this file. */
  builtin: null,
};

/** Which skin the scene loads. 'builtin' for the procedural stand-ins. */
export const ACTIVE_SKIN = 'builtin';

const skin = () => SKINS[ACTIVE_SKIN] ?? null;

/** Display scale for a sprite, if the active skin's sheet is the one in use. */
export function spriteScale(scene, key) {
  if (!scene?.ssFromSkin?.has(key)) return 1;
  return skin()?.textures?.[key]?.scale ?? 1;
}

/* Privacy Peaks palette — desaturated teal mist, lavender sky, ink line.
 * Kept in sync with styles.css's --teal / --ink / --periwinkle by eye. */
const INK = '#1f3452';
const TEAL = '#2d8c7f';
const SKY_TOP = '#c7c1ee';
const SKY_LOW = '#dbe8e6';
const MTN_FAR = '#a9c8bf';
const MTN_MID = '#7bb0a4';
const MTN_NEAR = '#4c8a7d';
const STONE_TOP = '#f6f9fa';
const STONE_SIDE = '#8592a8';
const FOG = '255, 255, 255';

/* -------------------------------------------------------------------------- */
/* Canvas helpers                                                            */
/* -------------------------------------------------------------------------- */

function ridge(ctx, baseY, peaks, w, colour, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(0, baseY + 40);
  ctx.lineTo(0, baseY);
  for (let i = 0; i < peaks.length; i += 1) {
    const [px, py] = peaks[i];
    const prev = i === 0 ? [0, baseY] : peaks[i - 1];
    const midX = (prev[0] + px) / 2;
    ctx.quadraticCurveTo(midX, prev[1], px, py);
  }
  ctx.lineTo(w, baseY);
  ctx.lineTo(w, baseY + 40);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function softBlob(ctx, x, y, r, inner) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${FOG}, ${inner})`);
  g.addColorStop(0.6, `rgba(${FOG}, ${inner * 0.5})`);
  g.addColorStop(1, `rgba(${FOG}, 0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/* -------------------------------------------------------------------------- */
/* The backdrop — sky, mountains, the ravine, the far-side gate               */
/* -------------------------------------------------------------------------- */

function drawBackdrop(ctx, { w, h }) {
  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, SKY_TOP);
  sky.addColorStop(0.55, SKY_LOW);
  sky.addColorStop(1, '#e6efec');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, w, h);

  // a soft dawn glow over the far side, where the gate sits — kept small so
  // it lifts that corner without washing the whole scene
  softBlob(ctx, w * 0.86, h * 0.3, h * 0.5, 0.3);

  // three mountain ridges, back to front — the near one carries the colour,
  // the far ones fade for depth
  ridge(ctx, h * 0.46, [[w * 0.22, h * 0.14], [w * 0.55, h * 0.32], [w * 0.85, h * 0.1]], w, MTN_FAR, 0.7);
  ridge(ctx, h * 0.58, [[w * 0.16, h * 0.36], [w * 0.44, h * 0.18], [w * 0.72, h * 0.4], [w * 0.95, h * 0.22]], w, MTN_MID, 0.82);
  ridge(ctx, h * 0.74, [[w * 0.3, h * 0.46], [w * 0.6, h * 0.3], [w * 0.9, h * 0.48]], w, MTN_NEAR, 0.95);

  // the far-side torii gate — the crossing's destination, standing back on
  // the ridge beyond the last stone. Half-lost in the fog the scene lays
  // over it, and cleared as the crossing is made (RealmArt PrivacyScene's
  // same beat).
  ctx.save();
  ctx.fillStyle = INK;
  ctx.globalAlpha = 0.5;
  const gx = w * 0.95;
  const gy = h * 0.4;
  const gh = 34;
  const post = 4;
  const span = 19;
  // posts
  ctx.fillRect(gx - span - post / 2, gy, post, gh);
  ctx.fillRect(gx + span - post / 2, gy, post, gh);
  // lower beam (nuki)
  ctx.fillRect(gx - span - 3, gy + 9, span * 2 + 6, 3.5);
  // top beam (kasagi) — overhangs the posts and lifts at the ends
  ctx.beginPath();
  ctx.moveTo(gx - span - 9, gy + 1);
  ctx.quadraticCurveTo(gx, gy - 6, gx + span + 9, gy + 1);
  ctx.lineTo(gx + span + 9, gy + 4.5);
  ctx.quadraticCurveTo(gx, gy - 2, gx - span - 9, gy + 4.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // the ravine: a cool mist rising from below, deepest at the base
  const chasm = ctx.createLinearGradient(0, h * 0.5, 0, h);
  chasm.addColorStop(0, 'rgba(165, 174, 201, 0)');
  chasm.addColorStop(0.6, 'rgba(150, 160, 192, 0.42)');
  chasm.addColorStop(1, 'rgba(112, 123, 160, 0.72)');
  ctx.fillStyle = chasm;
  ctx.fillRect(0, h * 0.5, w, h * 0.5);
}

/* -------------------------------------------------------------------------- */
/* A stepping stone — a rock with a top face and a side, not a flat ellipse   */
/* -------------------------------------------------------------------------- */

function drawStone(ctx, { w, h }) {
  const cx = w / 2;
  // side / thickness
  ctx.fillStyle = STONE_SIDE;
  ctx.beginPath();
  ctx.ellipse(cx, h * 0.66, w / 2 - 3, h * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  // top face
  ctx.fillStyle = STONE_TOP;
  ctx.beginPath();
  ctx.ellipse(cx, h * 0.44, w / 2 - 5, h * 0.28, 0, 0, Math.PI * 2);
  ctx.fill();
  // rim light along the top-left
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(cx, h * 0.44, w / 2 - 6, h * 0.26, 0, Math.PI * 0.9, Math.PI * 1.7);
  ctx.stroke();
  // a couple of flecks so it isn't a blank pebble
  ctx.fillStyle = 'rgba(31, 52, 82, 0.12)';
  ctx.beginPath();
  ctx.arc(cx - w * 0.14, h * 0.44, 1.6, 0, Math.PI * 2);
  ctx.arc(cx + w * 0.1, h * 0.5, 1.2, 0, Math.PI * 2);
  ctx.fill();
}

/** Soft contact shadow / ripple, sits on the mist just under a stone. */
function drawStoneShadow(ctx, { w, h }) {
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, 'rgba(31, 52, 82, 0.28)');
  g.addColorStop(1, 'rgba(31, 52, 82, 0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
  ctx.fill();
}

/* -------------------------------------------------------------------------- */
/* The Traveler token — the neutral figure from world/Traveler.jsx, small     */
/* -------------------------------------------------------------------------- */

function drawToken(ctx, { w, h }) {
  const s = w / 40; // Traveler.jsx viewBox is 40 wide
  ctx.save();
  ctx.scale(s, s);
  // ground shadow
  ctx.fillStyle = 'rgba(31, 52, 82, 0.18)';
  ctx.beginPath();
  ctx.ellipse(20, 53, 11, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // legs
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(17, 40); ctx.lineTo(15, 51);
  ctx.moveTo(23, 40); ctx.lineTo(25, 51);
  ctx.stroke();
  // pack (plain rect — roundRect isn't safe on older school devices, and at
  // this size the corners don't read anyway)
  ctx.fillStyle = TEAL;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(6, 24, 9, 13);
  ctx.globalAlpha = 1;
  // torso
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(12, 24);
  ctx.quadraticCurveTo(20, 19, 28, 24);
  ctx.lineTo(28, 38);
  ctx.quadraticCurveTo(20, 42, 12, 38);
  ctx.closePath();
  ctx.fill();
  // scarf + cap in teal
  ctx.fillStyle = TEAL;
  ctx.beginPath();
  ctx.moveTo(12, 24);
  ctx.quadraticCurveTo(20, 28, 28, 24);
  ctx.lineTo(29, 29);
  ctx.quadraticCurveTo(20, 33, 11, 29);
  ctx.closePath();
  ctx.fill();
  // head
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(20, 15, 9, 0, Math.PI * 2);
  ctx.fill();
  // cap brim
  ctx.fillStyle = TEAL;
  ctx.beginPath();
  ctx.moveTo(11, 13);
  ctx.quadraticCurveTo(20, 4, 29, 13);
  ctx.quadraticCurveTo(20, 9, 11, 13);
  ctx.closePath();
  ctx.fill();
  // eyes
  ctx.fillStyle = '#f1f5f6';
  ctx.beginPath();
  ctx.arc(17.5, 16, 1.7, 0, Math.PI * 2);
  ctx.arc(23.5, 16, 1.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/* -------------------------------------------------------------------------- */
/* Fog                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The fog bank — one wide, fully-feathered mass the scene lays over the
 * ravine. It's drawn wider than the canvas and every blob fades to nothing
 * well inside the texture bounds, so drifting it or sliding it off toward
 * the far side (as the crossing is made — the realm's whole beat) never
 * exposes a hard sprite edge.
 */
function drawFogBank(ctx, { w, h }) {
  // A soft base wash concentrated in the lower-middle band...
  const base = ctx.createLinearGradient(0, h * 0.2, 0, h);
  base.addColorStop(0, `rgba(${FOG}, 0)`);
  base.addColorStop(0.5, `rgba(${FOG}, 0.3)`);
  base.addColorStop(1, `rgba(${FOG}, 0.12)`);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  // ...plus a few billows for texture.
  for (const [x, y, r, a] of [
    [w * 0.24, h * 0.46, w * 0.2, 0.3],
    [w * 0.42, h * 0.38, w * 0.22, 0.34],
    [w * 0.56, h * 0.54, w * 0.2, 0.3],
    [w * 0.74, h * 0.42, w * 0.22, 0.34],
  ]) {
    softBlob(ctx, x, y, r, a);
  }

  // Guaranteed clean edges: wipe a feather off both sides so shifting or
  // clipping the sprite never shows a hard vertical line.
  ctx.globalCompositeOperation = 'destination-out';
  const feL = ctx.createLinearGradient(0, 0, w * 0.12, 0);
  feL.addColorStop(0, 'rgba(0,0,0,1)');
  feL.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = feL;
  ctx.fillRect(0, 0, w * 0.12, h);
  const feR = ctx.createLinearGradient(w * 0.88, 0, w, 0);
  feR.addColorStop(0, 'rgba(0,0,0,0)');
  feR.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = feR;
  ctx.fillRect(w * 0.88, 0, w * 0.12, h);
  ctx.globalCompositeOperation = 'source-over';
}

/** A single drifting wisp — a couple of these float across for a bit of life. */
function drawWisp(ctx, { w, h }) {
  softBlob(ctx, w * 0.42, h * 0.5, w * 0.32, 0.5);
  softBlob(ctx, w * 0.6, h * 0.44, w * 0.24, 0.4);
}

/* -------------------------------------------------------------------------- */
/* The manifest                                                              */
/* -------------------------------------------------------------------------- */

export const ART_MANIFEST = [
  { key: 'ss-backdrop', file: 'backdrop.png', frameWidth: 560, frameHeight: 190, draw: drawBackdrop },
  { key: 'ss-stone', file: 'stone.png', frameWidth: 58, frameHeight: 34, draw: drawStone },
  { key: 'ss-stone-shadow', file: 'stone-shadow.png', frameWidth: 66, frameHeight: 22, draw: drawStoneShadow },
  { key: 'ss-token', file: 'traveler-token.png', frameWidth: 30, frameHeight: 40, draw: drawToken },
  { key: 'ss-fog', file: 'fog-bank.png', frameWidth: 720, frameHeight: 190, draw: drawFogBank },
  { key: 'ss-wisp', file: 'wisp.png', frameWidth: 160, frameHeight: 80, draw: drawWisp },
];

/* -------------------------------------------------------------------------- */
/* Loading / generating (identical shape to passworldArt.js's)               */
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
 * swallowed here rather than thrown — `buildSteppingStonesArt` fills the gap
 * with the procedural version, so half-delivered art degrades instead of
 * breaking.
 */
export function preloadSteppingStonesArt(scene) {
  const s = skin();
  if (!s) return;
  scene.load.on('loaderror', (file) => {
    // eslint-disable-next-line no-console
    console.info(`[stepping-stones] no art file for "${file.key}" — using the built-in stand-in`);
  });
  for (const [key, t] of Object.entries(s.textures)) {
    scene.load.spritesheet(key, `${s.base}/${t.file}`, {
      frameWidth: t.frameWidth,
      frameHeight: t.frameHeight,
    });
  }
}

/**
 * Fill in whatever the skin didn't provide. Call from `create()`, once the
 * loader has finished.
 */
export function buildSteppingStonesArt(scene) {
  const s = skin();

  // Whatever the skin declared and that now exists came from its files — this
  // has to be read *before* generating, or the stand-ins would look identical.
  const fromSkin = new Set(
    Object.keys(s?.textures ?? {}).filter((k) => scene.textures.exists(k)),
  );
  scene.ssFromSkin = fromSkin;

  for (const e of ART_MANIFEST) {
    if (!scene.textures.exists(e.key)) generate(scene, e);
  }
}
