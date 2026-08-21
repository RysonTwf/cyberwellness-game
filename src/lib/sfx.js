/**
 * Tiny sound-effect player for UI feedback.
 *
 * Files live in public/audio/sfx — Vite serves public/ as-is at the root, so
 * these are plain root-relative URLs, not bundled imports (same as any other
 * public/ asset, e.g. index.html's favicon).
 */
import { getVolumes } from './audioSettings';

const SOUND_FILES = {
  click: '/audio/sfx/click1.wav',
  hover: '/audio/sfx/rollover2.wav',
  // A choice card settling safe/rethink (RealmScreen's choose()) — never
  // "wrong" styling in this game (design.md §5), so "error" here just means
  // "let's think about that again," not a buzzer.
  confirm: '/audio/sfx/confirm_style_4.ogg',
  error: '/audio/sfx/error_style.ogg',
  // Finishing a realm's mini-game (RealmScreen's game step onComplete).
  complete: '/audio/sfx/Puzzle_Complete.mp3',
  // The Passworld platformer level (passwordFortressLevelScene.js).
  jump: '/audio/sfx/jofae-swing-whoosh-110410.mp3',
};

// Hover fires far more often than anything else here (every pointer move
// onto a new button), so it's kept much quieter than the rest.
const VOLUMES = {
  click: 0.45,
  hover: 0.22,
  confirm: 0.5,
  error: 0.4,
  complete: 0.55,
  jump: 0.4,
};
const DEFAULT_VOLUME = 0.45;

// A few pooled <audio> instances per sound so two triggers in quick
// succession don't cut each other off — a single HTMLAudioElement can only
// play one instance of itself at a time, and restarting it mid-tail is
// audible.
const POOL_SIZE = 4;

const pools = {};
const nextIndex = {};

function getPool(name) {
  if (pools[name]) return pools[name];
  const src = SOUND_FILES[name];
  if (!src) return null;
  pools[name] = Array.from({ length: POOL_SIZE }, () => {
    const audio = new Audio(src);
    audio.preload = 'auto';
    return audio;
  });
  return pools[name];
}

/**
 * Play a named sound effect. No-ops quietly if the name is unknown, or if
 * playback is rejected (e.g. a browser autoplay policy edge case) — sound
 * is a nice-to-have here, never worth surfacing an error over.
 */
export function playSfx(name) {
  const pool = getPool(name);
  if (!pool) return;
  const i = (nextIndex[name] ?? 0) % pool.length;
  nextIndex[name] = i + 1;
  const audio = pool[i];
  audio.currentTime = 0;
  // Set fresh on every play, not once at pool-creation — the settings menu
  // can change this mid-session, and these elements are reused across plays.
  audio.volume = (VOLUMES[name] ?? DEFAULT_VOLUME) * getVolumes().sfx;
  if (audio.volume <= 0) return;
  audio.play().catch(() => {});
}
