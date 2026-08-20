import { UserRound } from 'lucide-react';

/**
 * Boy/girl character pick, shown once between the title screen and the
 * Traveler's Room. Placeholder by design — `world/Traveler.jsx` originally
 * went out of its way to have *no* gendered appearance ("no skin tone, no
 * hair, no gendered silhouette"), so there's no real art to differentiate
 * these two yet. Both cards use the same icon on purpose; only the label
 * and accent differ. The choice is stored (`state.avatar`) so a real sprite
 * swap can key off it later — nothing downstream reads it yet.
 */
const OPTIONS = [
  { id: 'boy', label: 'Boy', accent: 'var(--teal)' },
  { id: 'girl', label: 'Girl', accent: 'var(--coral)' },
];

export default function CharacterSelect({ onSelect }) {
  return (
    <div className="fold">
      <div className="center" style={{ flex: 1, display: 'grid', placeItems: 'center', gap: 26 }}>
        <div className="stack" style={{ alignItems: 'center', textAlign: 'center', gap: 8 }}>
          <h2>Who are you today?</h2>
          <p className="muted">Placeholder art for now — real characters are on the way.</p>
        </div>

        <div className="row" style={{ justifyContent: 'center', gap: 18, flexWrap: 'wrap' }}>
          {OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              className="card center"
              style={{
                '--accent': opt.accent,
                width: 160,
                cursor: 'pointer',
                border: '2px solid var(--line)',
                appearance: 'none',
                font: 'inherit',
                color: 'inherit',
              }}
              onClick={() => onSelect(opt.id)}
            >
              <div
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 84,
                  height: 84,
                  margin: '0 auto 12px',
                  borderRadius: '50%',
                  background: 'var(--paper-sunk)',
                  color: opt.accent,
                }}
              >
                <UserRound size={44} strokeWidth={1.8} />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
