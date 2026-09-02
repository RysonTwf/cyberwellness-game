import { useEffect, useRef, useState } from 'react';
import { X, Check } from 'lucide-react';
import StampBadge from './StampBadge';
import { ACTIVE_REALMS } from '../data/realms';

/**
 * The passport spread — tap "[name]'s passport" in the journal bar to flip it
 * open and see the stamp collection so far.
 *
 * The page art is public/assets/ATLASPASSPORT/AtlasPassport.png (a 1282x948
 * open-journal spread with a light circle + a realm-coloured caption frame
 * per realm). Slot centres below are measured against that image, as
 * percentages, so the overlaid stamps and captions track the art at any
 * size. Earned realms get their StampBadge in the circle and the realm's
 * topic (ticked) in the frame; unearned realms show the empty slot the art
 * already draws plus a greyed-out badge outline.
 */
const SLOTS = {
  passworld: { circle: [13.0, 37.8], frame: [34.9, 38.0] },
  privacy: { circle: [38.3, 68.2], frame: [15.9, 68.4] },
  balance: { circle: [61.9, 18.8], frame: [83.8, 19.0] },
  bullybog: { circle: [87.0, 48.3], frame: [64.4, 48.3] },
  fablefalls: { circle: [61.7, 77.7], frame: [84.0, 77.7] },
};

export default function PassportScreen({ travelerName, realmProgress, onClose }) {
  const spreadRef = useRef(null);
  const [spreadW, setSpreadW] = useState(860);

  // StampBadge sizes in px, so track the spread's rendered width and scale
  // the badge to ~15% of it (the painted circle is ~17% wide).
  useEffect(() => {
    const el = spreadRef.current;
    if (!el) return undefined;
    const update = () => setSpreadW(el.getBoundingClientRect().width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const stampSize = Math.round(spreadW * 0.138);
  const earned = ACTIVE_REALMS.filter((r) => realmProgress[r.id]?.stamped).length;

  return (
    <div className="passport-overlay" role="dialog" aria-label={`${travelerName}'s passport`}>
      <button
        type="button"
        className="passport-backdrop"
        aria-label="Close passport"
        onClick={onClose}
      />

      <div className="passport-spread" ref={spreadRef}>
        <img
          src="/assets/ATLASPASSPORT/AtlasPassport.png"
          alt=""
          className="passport-art"
          draggable={false}
        />

        {/* Sits over the art's mis-spelled subtitle. */}
        <span className="passport-subtitle">Stamp Collection</span>
        <span className="passport-count">
          {earned} of {ACTIVE_REALMS.length} stamps
        </span>

        {ACTIVE_REALMS.map((realm) => {
          const slot = SLOTS[realm.id];
          if (!slot) return null;
          const stamped = Boolean(realmProgress[realm.id]?.stamped);
          return (
            <div key={realm.id}>
              <div
                className="passport-stamp"
                style={{ left: `${slot.circle[0]}%`, top: `${slot.circle[1]}%` }}
              >
                <StampBadge
                  realmId={realm.id}
                  icon={realm.stamp.icon}
                  label={realm.name}
                  accent={realm.accent}
                  earned={stamped}
                  angle={realmProgress[realm.id]?.stampAngle ?? 0}
                  size={stampSize}
                />
              </div>
              <div
                className={`passport-caption${stamped ? ' done' : ''}`}
                style={{
                  left: `${slot.frame[0]}%`,
                  top: `${slot.frame[1]}%`,
                  '--accent': realm.accent,
                }}
              >
                {stamped && <Check size={13} strokeWidth={3} />}
                <span>{realm.topic}</span>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          className="passport-close"
          onClick={onClose}
          aria-label="Close passport"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
