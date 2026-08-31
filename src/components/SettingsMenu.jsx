import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings, X, Music, Volume2, ClipboardList } from 'lucide-react';
import { useAudioSettings } from '../hooks/useAudioSettings';
import { lockInput, unlockInput } from '../lib/inputLock';
import { readSaved } from '../state/useProgress';
import { ACTIVE_REALMS } from '../data/realms';

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

        <HowItWent />
      </div>
    </div>
  );
}

/**
 * The teacher's read-out: behind a "Show" toggle in Settings, deliberately
 * not on the child's certificate.
 *
 * Every mini-game has always handed `onComplete` the number it got right
 * first time, and that number has always been saved: RealmScreen → App →
 * useProgress writes it as `gameScore` into the journal, and the journal goes
 * to localStorage. Nothing ever read it back, so there was no way for a
 * teacher to tell a child who judged carefully from one who thrashed
 * (thingstoimproveon.md, Secondary findings). This is the read.
 *
 * It is kept out of the child's flow on purpose. design.md §5/§8 is explicit
 * that there is no score and no fail state in front of the player, and a
 * per-realm mark on the finale would undo that. Settings is where an adult
 * already goes.
 */
function HowItWent() {
  const [shown, setShown] = useState(false);
  const saved = shown ? readSaved() : null;
  const rows = saved
    ? ACTIVE_REALMS.map((r) => ({ realm: r, p: saved.realmProgress?.[r.id] })).filter(
        ({ p }) => p?.stamped,
      )
    : [];

  return (
    <div className="how-it-went">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => setShown((s) => !s)}
        aria-expanded={shown}
      >
        <ClipboardList size={16} />
        {shown ? 'Hide how it went' : 'For the teacher: how it went'}
      </button>

      {shown && (
        <>
          <p className="muted" style={{ marginBottom: 4 }}>
            How many each realm&apos;s game got right first time. Not a mark, a child may
            retry as often as they like, and the last attempt is what is stored.
          </p>
          {rows.length === 0 ? (
            <p className="muted">No realms finished on this device yet.</p>
          ) : (
            <ul className="how-it-went-list">
              {rows.map(({ realm, p }) => (
                <li key={realm.id}>
                  <span>{realm.name}</span>
                  <strong>{p.gameScore} right first time</strong>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
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
