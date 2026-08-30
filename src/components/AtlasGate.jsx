import { useState } from 'react';
import { ArrowRight, BookMarked, Sprout, GraduationCap } from 'lucide-react';
import DialogueCard from './DialogueCard';
import { Comet } from './Characters';
import StampBadge from './StampBadge';
import { ACTIVE_REALMS } from '../data/realms';
import { applyScreenOverrides } from '../dev/contentOverrides';

/**
 * The diary, opened in the Traveler's Room. Comet and the lore were already
 * covered in the opening story (components/IntroStory.jsx); this is the
 * practical part — grab the passport, put a name on it, pick a grade band.
 *
 * Every player-facing line lives in DIARY_COPY as a flat { id, label, text }
 * list so the dev-only Copy Editor (src/dev/CopyEditor.jsx) can list and edit
 * it; `applyScreenOverrides` merges any live edits at render.
 */
export const DIARY_COPY = [
  { id: 'title', label: 'Diary title', text: 'Cyber Defender Quest' },
  { id: 'lede', label: 'Diary tagline', text: 'A journal, a map, and realms worth visiting.' },
  {
    id: 'intro',
    label: 'Comet — passport intro',
    text: 'There you are. This is your passport now. Five empty stamps, one for each realm. You just need a name for the cover.',
  },
  { id: 'letsDo', label: 'Button — start', text: "Let's do it" },
  { id: 'passportLabel', label: 'Passport heading', text: 'Your passport' },
  { id: 'nameLabel', label: 'Name field label', text: 'Traveller name' },
  { id: 'namePlaceholder', label: 'Name field placeholder', text: 'Type your first name' },
  {
    id: 'nameHint',
    label: 'Name field hint',
    text: 'Just a first name, and only so Comet knows what to call you.',
  },
  {
    id: 'nameNudge',
    label: 'Comet — after the name field',
    text: 'Type it in, then tap Next. One quick question after that, and the door is yours.',
  },
  { id: 'next', label: 'Button — Next', text: 'Next' },
  { id: 'bandPrefix', label: 'Grade band — lead-in', text: 'One last thing' },
  { id: 'bandQuestion', label: 'Grade band — question', text: 'Which grade band are you in?' },
  { id: 'bandLowerLabel', label: 'Grade band — lower name', text: 'P1–P3' },
  { id: 'bandLowerSub', label: 'Grade band — lower detail', text: 'Primary 1 to 3' },
  { id: 'bandHigherLabel', label: 'Grade band — higher name', text: 'P4–P6' },
  { id: 'bandHigherSub', label: 'Grade band — higher detail', text: 'Primary 4 to 6' },
  { id: 'back', label: 'Button — Back', text: 'Back' },
];

export default function AtlasGate({ onBegin }) {
  // intro -> naming -> band -> onBegin(name, band)
  const [phase, setPhase] = useState('intro');
  const [name, setName] = useState('');

  const dc = Object.fromEntries(
    applyScreenOverrides(DIARY_COPY, 'diary').map((e) => [e.id, e.text]),
  );
  const BANDS = [
    { id: 'lower', label: dc.bandLowerLabel, sub: dc.bandLowerSub, Icon: Sprout },
    { id: 'higher', label: dc.bandHigherLabel, sub: dc.bandHigherSub, Icon: GraduationCap },
  ];

  const trimmed = name.trim().slice(0, 18);

  function submitName() {
    if (!trimmed) return;
    setPhase('band');
  }

  return (
    <div className="diary">
      <div className="diary-ribbon" aria-hidden="true" />

      <div className="center" style={{ padding: '4px 0 22px' }}>
        <div style={{ display: 'grid', placeItems: 'center', marginBottom: 10 }}>
          <Comet size={60} />
        </div>
        <h1 className="diary-title">{dc.title}</h1>
        <p className="lede" style={{ marginTop: 8 }}>
          {dc.lede}
        </p>
      </div>

      <div className="stack">
        <DialogueCard who="Comet" text={dc.intro} />

        {phase === 'intro' && (
          <div className="center">
            <button type="button" className="btn" onClick={() => setPhase('naming')}>
              {dc.letsDo}
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
                <span className="stamp-label">{dc.passportLabel}</span>
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
                {dc.nameLabel}
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
                  placeholder={dc.namePlaceholder}
                  maxLength={18}
                  autoComplete="off"
                  spellCheck="false"
                />
                {/* design.md §8 — no real personal data beyond an in-session first name */}
                <p className="muted" style={{ marginTop: 10 }}>
                  {dc.nameHint}
                </p>
              </div>
            </div>

            <DialogueCard who="Comet" text={dc.nameNudge} />

            <div className="center">
              <button type="button" className="btn" disabled={!trimmed} onClick={submitName}>
                {dc.next}
                <ArrowRight size={19} />
              </button>
            </div>
          </>
        )}

        {phase === 'band' && (
          <>
            <div className="card center">
              <span className="stamp-label">
                {dc.bandPrefix}, {trimmed}
              </span>
              <p style={{ marginTop: 10 }}>{dc.bandQuestion}</p>

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
                {dc.back}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
