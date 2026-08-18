import { useState } from 'react';
import { ArrowRight, BookMarked, Sprout, GraduationCap } from 'lucide-react';
import DialogueCard from './DialogueCard';
import { Comet } from './Characters';
import StampBadge from './StampBadge';
import { ACTIVE_REALMS, COMET_CATCHPHRASE } from '../data/realms';

/** Prologue: Comet unfolds from the journal, and the player gets a name. */
const BEATS = [
  {
    who: 'Comet',
    text: 'Oh — hello! You opened it. Most people just dust these off and put them back on the shelf.',
  },
  {
    who: 'Comet',
    text: "I'm Comet. This is the Atlas — every path the internet takes, drawn out as a map. And you, lucky page-turner, are about to become a Traveler.",
  },
];

/**
 * Band-select options (Milestones Phase 0). Asked once, right after naming —
 * everything downstream reads content for whichever band is picked here
 * (Improvement Plan §0: one game, one entry point, band chosen up front).
 */
const BANDS = [
  { id: 'lower', label: 'P1–P3', sub: 'Primary 1 to 3', Icon: Sprout },
  { id: 'higher', label: 'P4–P6', sub: 'Primary 4 to 6', Icon: GraduationCap },
];

export default function AtlasGate({ onBegin }) {
  // intro (BEATS) -> naming -> band -> onBegin(name, band)
  const [beat, setBeat] = useState(0);
  const [phase, setPhase] = useState('intro');
  const [name, setName] = useState('');

  const trimmed = name.trim().slice(0, 18);
  const introDone = beat >= BEATS.length;

  function submitName() {
    if (!trimmed) return;
    setPhase('band');
  }

  return (
    <div className="fold">
      <div className="center" style={{ padding: '18px 0 26px' }}>
        <div style={{ display: 'grid', placeItems: 'center', marginBottom: 14 }}>
          <Comet size={78} />
        </div>
        <h1>Cyber Wellness Quest</h1>
        <p className="lede" style={{ marginTop: 10 }}>
          A journal, a map, and realms worth visiting.
        </p>
      </div>

      <div className="stack">
        {BEATS.slice(0, Math.min(beat + 1, BEATS.length)).map((b, i) => (
          <DialogueCard key={i} who={b.who} text={b.text} />
        ))}

        {phase === 'intro' && !introDone && (
          <div className="center">
            <button
              type="button"
              className="btn"
              onClick={() => {
                if (beat < BEATS.length - 1) setBeat((b) => b + 1);
                else setPhase('naming');
              }}
            >
              Keep reading
              <ArrowRight size={19} />
            </button>
          </div>
        )}

        {phase === 'naming' && (
          <>
            {/* The passport, still empty */}
            <div className="card center">
              <div className="row" style={{ justifyContent: 'center', gap: 8, marginBottom: 6 }}>
                <BookMarked size={18} color="var(--ink-soft)" />
                <span className="stamp-label">Your passport</span>
              </div>
              <div
                className="row"
                style={{ justifyContent: 'center', gap: 2, margin: '10px 0 18px' }}
              >
                {ACTIVE_REALMS.map((r) => (
                  <StampBadge
                    key={r.id}
                    realmId={r.id}
                    icon={r.stamp.icon}
                    label={r.stamp.label}
                    accent={r.accent}
                    earned={false}
                    size={72}
                  />
                ))}
              </div>

              <label htmlFor="traveler-name" className="stamp-label">
                Traveler name
              </label>
              <div style={{ maxWidth: 340, margin: '10px auto 0' }}>
                <input
                  id="traveler-name"
                  className="name-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submitName();
                  }}
                  placeholder="Type your first name"
                  maxLength={18}
                  autoComplete="off"
                  spellCheck="false"
                />
                {/* design.md §8 — no real personal data beyond an in-session first name */}
                <p className="muted" style={{ marginTop: 10 }}>
                  Just a first name, and only so Comet knows what to call you.
                </p>
              </div>
            </div>

            <DialogueCard who="Comet" text={`${COMET_CATCHPHRASE} You'll need both. Ready to see the map?`} />

            <div className="center">
              <button type="button" className="btn" disabled={!trimmed} onClick={submitName}>
                Next
                <ArrowRight size={19} />
              </button>
            </div>
          </>
        )}

        {phase === 'band' && (
          <>
            <div className="card center">
              <span className="stamp-label">One last thing, {trimmed}</span>
              <p style={{ marginTop: 10 }}>Which grade band are you in?</p>

              <div
                className="row"
                style={{ justifyContent: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}
              >
                {BANDS.map(({ id, label, sub, Icon }) => (
                  <button
                    key={id}
                    type="button"
                    className="btn btn-ghost"
                    style={{ flexDirection: 'column', gap: 6, padding: '18px 26px', height: 'auto' }}
                    onClick={() => onBegin(trimmed, id)}
                  >
                    <Icon size={28} />
                    <span style={{ fontWeight: 700 }}>{label}</span>
                    <span className="muted" style={{ fontSize: '0.85em' }}>
                      {sub}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="center">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPhase('naming')}>
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
