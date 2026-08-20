import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X, Music, Volume2 } from 'lucide-react';
import { useAudioSettings } from '../hooks/useAudioSettings';
import { lockInput, unlockInput } from '../lib/inputLock';

/**
 * Always-available settings menu — a floating gear button, present on every
 * screen (rendered once, in App.jsx, outside any of the screen switches),
 * opening a small volume panel. Currently just music/sfx sliders; anything
 * else settings-shaped later (band re-pick, reset) has a home here too.
 */
export default function SettingsMenu() {
  const [open, setOpen] = useState(false);

  // Overlays here float above every screen, including ones with their own
  // window-level keyboard movement (the Atlas, a realm) — lock that out for
  // as long as this is open, see lib/inputLock.js.
  useEffect(() => {
    if (!open) return undefined;
    lockInput();
    return () => unlockInput();
  }, [open]);

  return (
    <>
      <button
        type="button"
        className="settings-fab"
        onClick={() => setOpen(true)}
        aria-label="Settings"
      >
        <Settings size={19} />
      </button>

      {open && createPortal(<SettingsPanel onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}

function SettingsPanel({ onClose }) {
  const { music, sfx, setMusicVolume, setSfxVolume } = useAudioSettings();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="settings-scrim" onClick={onClose}>
      <div
        className="settings-card"
        role="dialog"
        aria-label="Settings"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="panel-close" onClick={onClose} aria-label="Close settings">
          <X size={18} />
        </button>

        <h2 style={{ marginBottom: 4 }}>Settings</h2>
        <p className="muted" style={{ marginTop: 0 }}>Adjust the music and sound effects.</p>

        <VolumeRow
          icon={<Music size={18} />}
          label="Music"
          value={music}
          onChange={setMusicVolume}
        />
        <VolumeRow
          icon={<Volume2 size={18} />}
          label="Sound effects"
          value={sfx}
          onChange={setSfxVolume}
        />
      </div>
    </div>
  );
}

function VolumeRow({ icon, label, value, onChange }) {
  const pct = Math.round(value * 100);
  return (
    <div className="volume-row">
      <span className="volume-label">
        {icon}
        {label}
      </span>
      <input
        type="range"
        className="volume-slider"
        min={0}
        max={100}
        value={pct}
        onChange={(e) => onChange(Number(e.target.value) / 100)}
        aria-label={label}
        aria-valuetext={`${pct}%`}
      />
      <span className="volume-pct">{pct}%</span>
    </div>
  );
}
