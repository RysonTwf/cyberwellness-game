import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import StampBadge from './StampBadge';
import DialogueCard from './DialogueCard';

/**
 * The stamp moment (design.md §4, §10): a full-bleed accent flash, then the
 * stamp thunks down onto the journal at its own slight angle. This is one of
 * only two places the product spends motion.
 */
export default function StampMoment({ realm, angle, travelerName, onBackToAtlas }) {
  const [flash, setFlash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setFlash(false), 640);
    return () => clearTimeout(t);
  }, []);

  return (
    <div>
      {flash && <div className="stamp-flash" style={{ '--accent': realm.accent }} />}

      <div className="stamp-stage">
        <StampBadge
          realmId={realm.id}
          icon={realm.stamp.icon}
          label={realm.stamp.label}
          accent={realm.accent}
          earned
          angle={angle}
          thunk
          size={168}
        />
      </div>

      <div className="stack">
        <div className="center">
          <h2>Stamped.</h2>
          <p className="lede" style={{ marginTop: 8 }}>
            {realm.stamp.label}. That one&rsquo;s yours, {travelerName}.
          </p>
        </div>

        <DialogueCard
          who="Comet"
          text="Into the passport it goes. Nothing gets un-stamped. That stamp is yours forever."
          accent={realm.accent}
        />

        <div className="center">
          <button
            type="button"
            className="btn btn-accent"
            style={{ '--accent': realm.accent }}
            onClick={onBackToAtlas}
          >
            Back to the Atlas
            <ArrowRight size={19} />
          </button>
        </div>
      </div>
    </div>
  );
}
