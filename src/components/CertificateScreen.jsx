import { useState } from 'react';
import { PenLine, RotateCcw, BookMarked } from 'lucide-react';
import DialogueCard from './DialogueCard';
import StampBadge from './StampBadge';
import { Comet } from './Characters';
import { ACTIVE_REALMS, REALM_BY_ID } from '../data/realms';
import { applyScreenOverrides } from '../dev/contentOverrides';

/**
 * The finale (storyline.md): Wise Traveller certificate + the Traveller's
 * Pledge.
 *
 * Every player-facing line — including the per-realm pledge lines, which used
 * to be `PLEDGE` in realms.js — lives in CERTIFICATE_COPY as a flat
 * { id, label, text } list so the dev-only Copy Editor (src/dev/CopyEditor.jsx)
 * can list and edit it. `{count}` / `{name}` are filled in at render.
 * A pledge entry carries a `realm` id; it only renders if that realm is active.
 */
export const CERTIFICATE_COPY = [
  {
    id: 'comet1',
    label: 'Comet — opening line',
    text: '{count} stamps, one for every realm. Each time, you stopped to think before you clicked, shared or believed. That is what makes a Wise Traveller.',
  },
  { id: 'certLabel', label: 'Certificate — small label', text: 'Cyber Defender Quest' },
  { id: 'certHeading', label: 'Certificate — heading', text: 'Wise Traveller' },
  {
    id: 'certSub',
    label: 'Certificate — subtitle',
    text: 'This traveller has walked the whole Atlas.',
  },
  { id: 'pledgeHeading', label: 'Pledge — heading', text: "The Traveller's Pledge" },
  {
    id: 'pledge-passworld',
    label: 'Pledge — Passworld',
    text: 'I will keep my personal information to myself.',
    realm: 'passworld',
  },
  {
    id: 'pledge-privacy',
    label: 'Pledge — Privacy Peaks',
    text: 'I will stop and think before I tap.',
    realm: 'privacy',
  },
  {
    id: 'pledge-bullybog',
    label: 'Pledge — Bully Bog',
    text: 'I will be kind, and stand up for others.',
    realm: 'bullybog',
  },
  {
    id: 'pledge-balance',
    label: 'Pledge — Balance Bay',
    text: 'I will balance my screen time with the rest of my day.',
    realm: 'balance',
  },
  {
    id: 'pledge-fablefalls',
    label: 'Pledge — Fable Falls',
    text: 'I will stop and check before I believe or share.',
    realm: 'fablefalls',
  },
  { id: 'signButton', label: 'Button — sign the pledge', text: 'Sign it, {name}' },
  { id: 'signedByLabel', label: 'Certificate — "Signed by"', text: 'Signed by' },
  { id: 'goodbyeButton', label: 'Button — say goodbye', text: 'Say goodbye to Comet' },
  {
    id: 'farewell',
    label: 'Comet — farewell',
    text: 'The Atlas is always here, and you can always visit again. Travel well.',
  },
  { id: 'backButton', label: 'Button — back to the Atlas', text: 'Back to the Atlas' },
  { id: 'startOverButton', label: 'Button — start a new journal', text: 'Start a new journal' },
];

export default function CertificateScreen({
  travelerName,
  realmProgress,
  pledgeSigned,
  onSign,
  onBackToAtlas,
  onStartOver,
}) {
  const [farewell, setFarewell] = useState(false);

  const merged = applyScreenOverrides(CERTIFICATE_COPY, 'certificate');
  const cc = Object.fromEntries(merged.map((e) => [e.id, e.text]));
  const activeIds = new Set(ACTIVE_REALMS.map((r) => r.id));
  const pledge = merged.filter((e) => e.realm && activeIds.has(e.realm));

  return (
    <div className="fold fold-scroll">
      <div className="stack">
        <DialogueCard
          who="Comet"
          text={cc.comet1.replace('{count}', String(ACTIVE_REALMS.length))}
        />

        <div className="cert" style={{ '--accent': 'var(--gold)' }}>
          <span className="stamp-label">{cc.certLabel}</span>
          <h2 style={{ margin: '10px 0 4px' }}>{cc.certHeading}</h2>
          <p className="muted">{cc.certSub}</p>

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

          <span className="stamp-label">{cc.pledgeHeading}</span>
          <div className="pledge" style={{ marginTop: 12 }}>
            {pledge.map((line) => (
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
              <span className="stamp-label">{cc.signedByLabel}</span>
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
              {cc.signButton.replace('{name}', travelerName)}
            </button>
          )}
        </div>

        {pledgeSigned && !farewell && (
          <div className="center">
            <button type="button" className="btn" onClick={() => setFarewell(true)}>
              {cc.goodbyeButton}
            </button>
          </div>
        )}

        {farewell && (
          <>
            <div className="center" style={{ padding: '10px 0' }}>
              <Comet size={64} />
            </div>
            <DialogueCard who="Comet" text={cc.farewell} />
            <div className="row" style={{ justifyContent: 'center' }}>
              <button type="button" className="btn btn-ghost" onClick={onBackToAtlas}>
                <BookMarked size={17} />
                {cc.backButton}
              </button>
              <button type="button" className="btn btn-ghost" onClick={onStartOver}>
                <RotateCcw size={17} />
                {cc.startOverButton}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
