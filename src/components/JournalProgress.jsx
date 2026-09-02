import { BookMarked, Key, Compass, Heart, Sun, Eye } from 'lucide-react';
import { ACTIVE_REALMS } from '../data/realms';

// Which icon marks each realm — lives here (not RealmScreen) since the bar
// is now the only place the realm's identity is drawn.
const REALM_ICONS = { passworld: Key, privacy: Compass, bullybog: Heart, balance: Sun, fablefalls: Eye };

/**
 * Small persistent header showing the stamp count (design.md §6).
 *
 * On a realm screen it also carries the realm's name/topic in its middle —
 * the realms used to draw their own full-width heading row under this bar,
 * but on short laptop viewports the scene box below is height-bound, so
 * that row's ~55px cost the box ~110px of width. The bar's middle was
 * empty; the identity moved up here instead (`realm` prop, null elsewhere).
 */
export default function JournalProgress({
  realmProgress,
  travelerName,
  onOpenAtlas,
  onOpenPassport,
  showBack,
  realm,
}) {
  const earned = ACTIVE_REALMS.filter((r) => realmProgress[r.id]?.stamped).length;
  const RealmIcon = realm ? REALM_ICONS[realm.id] : null;
  const passportLabel = travelerName ? `${travelerName}'s passport` : 'Passport';

  return (
    <div className="journal-bar">
      {showBack ? (
        <button type="button" className="btn btn-ghost btn-sm" onClick={onOpenAtlas}>
          <BookMarked size={17} />
          The Atlas
        </button>
      ) : onOpenPassport ? (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onOpenPassport}
          title="Open your passport"
        >
          <BookMarked size={17} />
          {passportLabel}
        </button>
      ) : (
        <div className="row" style={{ gap: 8 }}>
          <BookMarked size={18} color="var(--ink-soft)" />
          <span className="stamp-label">{passportLabel}</span>
        </div>
      )}

      {realm && (
        <div
          className="journal-realm"
          style={{ '--accent': realm.accent, '--accent-wash': realm.accentWash }}
        >
          {RealmIcon && (
            <span className="badge-ic">
              <RealmIcon size={17} strokeWidth={2.2} />
            </span>
          )}
          <span className="journal-realm-name">{realm.name}</span>
          <span className="pin-label journal-realm-topic">{realm.topic}</span>
        </div>
      )}

      <div className="journal-count">
        <span className="stamp-label">
          {earned}/{ACTIVE_REALMS.length} stamps
        </span>
        {ACTIVE_REALMS.map((r) => (
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
