import boyPortrait from '../assets/characters/boy-walk-1.png';
import girlPortrait from '../assets/characters/girl-walk-1.png';

/**
 * Boy/girl character pick, shown once between the title screen and the
 * Traveler's Room. `world/Traveler.jsx` originally went out of its way to
 * have *no* gendered appearance ("no skin tone, no hair, no gendered
 * silhouette") — real art was always meant to replace that per-avatar, not
 * redesign it. Both picks now have real art (the same walk-cycle sprites
 * used in-world, idle frame). The choice is stored (`state.avatar`) and
 * read downstream by World.jsx/Traveler.jsx to pick which figure walks
 * around for the rest of the game.
 */
const OPTIONS = [
  { id: 'boy', label: 'Boy', accent: 'var(--teal)', portrait: boyPortrait },
  { id: 'girl', label: 'Girl', accent: 'var(--coral)', portrait: girlPortrait },
];

export default function CharacterSelect({ onSelect }) {
  return (
    <div className="fold">
      <div className="center" style={{ flex: 1, display: 'grid', placeItems: 'center', gap: 26 }}>
        <div className="stack" style={{ alignItems: 'center', textAlign: 'center', gap: 8 }}>
          <h2>Who are you today?</h2>
          <p className="muted">Pick who walks the Atlas with Comet.</p>
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
                  overflow: 'hidden',
                }}
              >
                <img
                  src={opt.portrait}
                  alt=""
                  width={84}
                  height={84}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
                />
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
