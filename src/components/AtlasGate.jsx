import { useState } from 'react';
import { ArrowRight, BookMarked } from 'lucide-react';
import DialogueCard from './DialogueCard';
import { Comet } from './Characters';
import StampBadge from './StampBadge';
import { REALMS, COMET_CATCHPHRASE } from '../data/realms';

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

export default function AtlasGate({ onBegin }) {
  const [beat, setBeat] = useState(0);
  const [name, setName] = useState('');

  const naming = beat >= BEATS.length;
  const trimmed = name.trim().slice(0, 18);

  return (
    <div className="fold">
      <div className="center" style={{ padding: '18px 0 26px' }}>
        <div style={{ display: 'grid', placeItems: 'center', marginBottom: 14 }}>
          <Comet size={78} />
        </div>
        <h1>Cyber Wellness Quest</h1>
        <p className="lede" style={{ marginTop: 10 }}>
          A journal, a map, and four realms worth visiting.
        </p>
      </div>

      <div className="stack">
        {BEATS.slice(0, Math.min(beat + 1, BEATS.length)).map((b, i) => (
          <DialogueCard key={i} who={b.who} text={b.text} />
        ))}

        {!naming && (
          <div className="center">
            <button type="button" className="btn" onClick={() => setBeat((b) => b + 1)}>
              Keep reading
              <ArrowRight size={19} />
            </button>
          </div>
        )}

        {naming && (
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
                {REALMS.map((r) => (
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
                    if (e.key === 'Enter' && trimmed) onBegin(trimmed);
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
              <button
                type="button"
                className="btn"
                disabled={!trimmed}
                onClick={() => onBegin(trimmed)}
              >
                Open the Atlas
                <ArrowRight size={19} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
