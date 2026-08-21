/**
 * Tiny background-music player — same public/audio-relative-URL approach as
 * lib/sfx.js, but a single looping track instead of a pool of one-shots.
 *
 * Only one track lives here for now (the platformer level's). A screen that
 * wants music calls playMusic('name') on mount/enter and stopMusic() on
 * unmount/leave — see PlatformerStoryRealm.jsx.
 */
import { getVolumes, subscribeAudioSettings } from './audioSettings';

const TRACK_FILES = {
  platformer: '/audio/gameplay/2020-03-22_-_A_Bit_Of_Hope_-_David_Fesliyan.mp3',
};

// This is the volume at the settings menu's 100% — the music slider scales
// down from here, it never scales up past it. Tune this if a future track
// swap reads too loud/quiet again rather than just living with it, since
// the slider can only go down from whatever this is set to.
const BASE_VOLUME = 0.16;
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
  if (current?.name === name) return;
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
