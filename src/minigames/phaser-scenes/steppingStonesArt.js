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
 * Unlike Passworld, there's no CC0 pack trialed here yet — SKINS only has the
 * built-in stand-ins for now. The manifest is the actual deliverable this
 * unblocks: a named, measured list instead of the designer reverse-engineering
 * shapes out of `steppingStonesScene.js`'s old inline Phaser Graphics calls.
 *
 * Frame sizes are the *live* ones, measured against the running scene.
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

const INK = '#1f3452';
const PAPER_SUNK = '#e7edef';
const TEAL = '#2d8c7f';

/* -------------------------------------------------------------------------- */
/* Canvas helpers (same small set passworldArt.js keeps locally)              */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* The stepping stone                                                        */
/* -------------------------------------------------------------------------- */

/** A flat stone seen from above — what the Traveler actually hops between.
 * The number badge is drawn separately by the scene (plain Phaser text over
 * the sprite), since it changes per stone and isn't art. */
function drawStone(ctx, { w, h }) {
  ctx.fillStyle = PAPER_SUNK;
  ctx.beginPath();
  ctx.ellipse(w / 2, h / 2, w / 2 - 2, h / 2 - 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.globalAlpha = 0.3;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

/* -------------------------------------------------------------------------- */
/* The Traveler token                                                        */
/* -------------------------------------------------------------------------- */

/**
 * The marker that hops stone to stone — a simplified stand-in, not the full
 * figure (world/Traveler.jsx): this one has to read at a glance from across
 * the run, not carry walk-cycle detail.
 */
function drawToken(ctx, { w, h }) {
  fillRR(ctx, 0, h * 0.23, w, h * 0.69, 6, INK);
  fillRR(ctx, 0, h * 0.08, w, h * 0.35, 4, TEAL);
}

/* -------------------------------------------------------------------------- */
/* Fog                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Soft drifting mist banked behind the stones. Several overlapping, feathered
 * patches rather than a flat wash, so there's an actual texture for real fog
 * art to replace instead of a plain tinted rectangle (what this scene drew
 * before the manifest existed).
 */
function drawFog(ctx, { w, h }) {
  const blobs = [
    [w * 0.12, h * 0.4, w * 0.26],
    [w * 0.4, h * 0.6, w * 0.32],
    [w * 0.68, h * 0.32, w * 0.28],
    [w * 0.92, h * 0.62, w * 0.24],
  ];
  for (const [x, y, r] of blobs) {
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(255,255,255,0.55)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

/* -------------------------------------------------------------------------- */
/* The manifest                                                              */
/* -------------------------------------------------------------------------- */

export const ART_MANIFEST = [
  { key: 'ss-stone', file: 'stone.png', frameWidth: 50, frameHeight: 30, draw: drawStone },
  { key: 'ss-token', file: 'traveler-token.png', frameWidth: 20, frameHeight: 26, draw: drawToken },
  { key: 'ss-fog', file: 'fog.png', frameWidth: 560, frameHeight: 220, draw: drawFog },
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
