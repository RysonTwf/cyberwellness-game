import { BookMarked } from 'lucide-react';
import { REALMS } from '../data/realms';

/** Small persistent header showing the stamp count (design.md §6). */
export default function JournalProgress({ realmProgress, travelerName, onOpenAtlas, showBack }) {
  const earned = REALMS.filter((r) => realmProgress[r.id]?.stamped).length;

  return (
    <div className="journal-bar">
      {showBack ? (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onOpenAtlas}>
          <BookMarked size={17} />
          The Atlas
        </button>
      ) : (
        <div className="row" style={{ gap: 8 }}>
          <BookMarked size={18} color="var(--ink-soft)" />
          <span className="stamp-label">
            {travelerName ? `${travelerName}'s passport` : 'Passport'}
          </span>
        </div>
      )}

      <div className="journal-count">
        <span className="stamp-label">
          {earned}/{REALMS.length} stamps
        </span>
        {REALMS.map((r) => (
          <span
            key={r.id}
            className={`dot${realmProgress[r.id]?.stamped ? ' filled' : ''}`}
            style={realmProgress[r.id]?.stamped ? { background: r.accent } : undefined}
            title={r.name}
          />
        ))}
      </div>
    </div>
  );
}
