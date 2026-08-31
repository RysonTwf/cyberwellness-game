/**
 * Tiny background-music player — same public/audio-relative-URL approach as
 * lib/sfx.js, but a single looping track instead of a pool of one-shots.
 *
 * One track: the gameplay loop, started once the player leaves the title
 * and left running across the whole journey (App.jsx). playMusic('name') is
 * safe to call repeatedly — it no-ops when that track is already going, and
 * retries a play() that the browser's autoplay policy blocked first time.
 */
import { getVolumes, subscribeAudioSettings } from './audioSettings';

const TRACK_FILES = {
  gameplay: '/audio/gameplay/2020-03-22_-_A_Bit_Of_Hope_-_David_Fesliyan.mp3',
};

// This is the volume at the settings menu's 100% — the music slider scales
// down from here, it never scales up past it. Set deliberately modest: it is
// a background loop, and the slider can only take it lower, so players who
// want it quieter (or off) have the room to do that in the options menu.
const BASE_VOLUME = 0.3;
const FADE_MS = 280;

function targetVolume() {
  return BASE_VOLUME * getVolumes().music;
}

let current = null; // { name, audio }
let fadeTimer = null;

function clearFade() {
  if (fadeTimer) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }
}

/** Start a track looping. No-ops if it's already the one playing. */
export function playMusic(name) {
  if (current?.name === name) {
    // The first call often lands before any user gesture and play() is
    // rejected by the autoplay policy. A later call (after a click or key)
    // should get the same element going rather than bailing on the name match.
    if (current.audio.paused) current.audio.play().catch(() => {});
    return;
  }
  stopMusic();

  const src = TRACK_FILES[name];
  if (!src) return;

  const audio = new Audio(src);
  audio.loop = true;
  audio.volume = 0;
  audio.play().catch(() => {});
  current = { name, audio };

  clearFade();
  const start = performance.now();
  fadeTimer = setInterval(() => {
    const t = Math.min(1, (performance.now() - start) / FADE_MS);
    // Recomputed each tick (not captured once) so a slider drag mid-fade-in
    // is reflected immediately rather than snapping once the fade finishes.
    audio.volume = targetVolume() * t;
    if (t >= 1) clearFade();
  }, 30);
}

/**
 * Step the current track aside without tearing it down. The P4–P6 Passworld
 * platformer level uses this so its own scene keeps the floor; resumeMusic()
 * then picks the same loop back up where it left off (the element stays alive
 * across the whole journey — App.jsx).
 */
export function pauseMusic() {
  if (current) current.audio.pause();
}

/** Resume a track paused with pauseMusic. */
export function resumeMusic() {
  if (current && current.audio.paused) {
    current.audio.volume = targetVolume();
    current.audio.play().catch(() => {});
  }
}

/** Fade out and stop whatever's currently playing. */
export function stopMusic() {
  if (!current) return;
  const { audio } = current;
  current = null;
  clearFade();

  const start = performance.now();
  const startVolume = audio.volume;
  fadeTimer = setInterval(() => {
    const t = Math.min(1, (performance.now() - start) / FADE_MS);
    audio.volume = startVolume * (1 - t);
    if (t >= 1) {
      clearFade();
      audio.pause();
    }
  }, 30);
}

// Live volume updates: if a track is playing steady (no fade in progress —
// fades already recompute their own target every tick above), dragging the
// music slider should be heard immediately, not on the next play/stop.
subscribeAudioSettings(() => {
  if (current && !fadeTimer) {
    current.audio.volume = targetVolume();
  }
});
