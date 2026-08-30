import { useState } from 'react';
import { PenLine, RotateCcw, BookMarked } from 'lucide-react';
import DialogueCard from './DialogueCard';
import StampBadge from './StampBadge';
import { Comet } from './Characters';
import { ACTIVE_REALMS, REALM_BY_ID, activePledge } from '../data/realms';

/** The finale (storyline.md): Wise Traveler certificate + the Traveler's Pledge. */
export default function CertificateScreen({
  travelerName,
  realmProgress,
  pledgeSigned,
  onSign,
  onBackToAtlas,
  onStartOver,
}) {
  const [farewell, setFarewell] = useState(false);

  return (
    <div className="fold fold-scroll">
      <div className="stack">
        <DialogueCard
          who="Comet"
          text={`${ACTIVE_REALMS.length} stamps. ${ACTIVE_REALMS.length} realms. You pick curiosity and a bit of caution, every time. That's all it takes.`}
        />

        <div className="cert" style={{ '--accent': 'var(--gold)' }}>
          <span className="stamp-label">Cyber Defender Quest</span>
          <h2 style={{ margin: '10px 0 4px' }}>Wise Traveller</h2>
          <p className="muted">This traveller has walked the whole Atlas.</p>

          <div className="cert-stamps">
            {ACTIVE_REALMS.map((realm) => (
              <StampBadge
                key={realm.id}
                realmId={realm.id}
                icon={realm.stamp.icon}
                label={realm.stamp.label}
                accent={realm.accent}
                earned={realmProgress[realm.id]?.stamped}
                angle={realmProgress[realm.id]?.stampAngle ?? 0}
                size={92}
              />
            ))}
          </div>

          <span className="stamp-label">The Traveller&rsquo;s Pledge</span>
          <div className="pledge" style={{ marginTop: 12 }}>
            {activePledge().map((line) => (
              <div
                key={line.realm}
                className="pledge-line"
                style={{ '--accent': REALM_BY_ID[line.realm].accent }}
              >
                {line.text}
              </div>
            ))}
          </div>

          {pledgeSigned ? (
            <>
              <span className="stamp-label">Signed by</span>
              <div>
                <span className="signature">{travelerName}</span>
              </div>
            </>
          ) : (
            <button
              type="button"
              className="btn btn-accent"
              style={{ '--accent': 'var(--gold)' }}
              onClick={onSign}
            >
              <PenLine size={19} />
              Sign it, {travelerName}
            </button>
          )}
        </div>

        {pledgeSigned && !farewell && (
          <div className="center">
            <button type="button" className="btn" onClick={() => setFarewell(true)}>
              Say goodbye to Comet
            </button>
          </div>
        )}

        {farewell && (
          <>
            <div className="center" style={{ padding: '10px 0' }}>
              <Comet size={64} />
            </div>
            <DialogueCard
              who="Comet"
              text="The Atlas doesn't change much, but you can always visit again."
            />
            <div className="row" style={{ justifyContent: 'center' }}>
              <button type="button" className="btn btn-ghost" onClick={onBackToAtlas}>
                <BookMarked size={17} />
                Back to the Atlas
              </button>
              <button type="button" className="btn btn-ghost" onClick={onStartOver}>
                <RotateCcw size={17} />
                Start a new journal
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
