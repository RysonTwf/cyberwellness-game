/**
 * Shared music/sfx volume — a tiny module-level store (not React state) so
 * both the settings menu and the audio players (sfx.js, music.js) read the
 * same live values without threading props through every screen. Persisted
 * to localStorage so a chosen level survives a reload.
 */
const STORAGE_KEY = 'cyber-wellness-quest/audio/v1';
const DEFAULTS = { music: 1, sfx: 1 };

function clamp01(n) {
  const v = Number(n);
  return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw);
    return {
      music: parsed.music === undefined ? DEFAULTS.music : clamp01(parsed.music),
      sfx: parsed.sfx === undefined ? DEFAULTS.sfx : clamp01(parsed.sfx),
    };
  } catch {
    return { ...DEFAULTS };
  }
}

let volumes = load();
const listeners = new Set();

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(volumes));
  } catch {
    // Private-browsing/quota edge cases — the slider still works for the
    // rest of the session, it just won't remember next visit.
  }
}

function notify() {
  for (const fn of listeners) fn(volumes);
}

export function getVolumes() {
  return volumes;
}

export function setMusicVolume(v) {
  volumes = { ...volumes, music: clamp01(v) };
  save();
  notify();
}

export function setSfxVolume(v) {
  volumes = { ...volumes, sfx: clamp01(v) };
  save();
  notify();
}

/** Subscribe to volume changes; returns an unsubscribe function. */
export function subscribeAudioSettings(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
