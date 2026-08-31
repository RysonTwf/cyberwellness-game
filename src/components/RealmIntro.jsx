import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { lockInput, unlockInput } from '../lib/inputLock';
import Tutorial from './Tutorial';
import { applyScreenOverrides } from '../dev/contentOverrides';

// The one-time "how a realm works" tour, run on the first walkable realm.
// Exported for the dev-only Copy Editor (src/dev/CopyEditor.jsx).
export const REALM_TOUR = [
  {
    target: '.hotspot',
    title: 'Follow the pin',
    text: 'A glowing pin marks where the story goes next. Walk to it. Tap where you want to go, or use WASD or the arrow keys.',
  },
  {
    title: 'Say hello',
    text: 'When you get close enough, a button pops up over your head. Press it (or press Enter) to talk, look, and play.',
  },
  {
    target: '.objective',
    title: 'Never lost',
    text: 'The bar down here always says what to do next. That is the whole game: follow the pins, make your choices, earn the stamp!',
  },
];

/**
 * The moment of stepping into a realm: a popup telling the story of the
 * place (`realm.intro.lore`, data/realms.js) and what the player is going
 * to learn there, over the realm already visible behind it. Shows on every
 * entry until the realm is stamped; revisits skip straight in.
 *
 * On the very first realm (progress `tutorialsSeen.realm` unset), closing
 * the intro flows into a short Tutorial tour of how a realm works — pin,
 * objective bar, interact button. Realms that replace the walkable flow
 * with their own mechanic (fullMechanic) skip that tour; their screens
 * carry their own instructions.
 */
export default function RealmIntro({ realm, showIntro, showTutorial, onTutorialDone }) {
  const [open, setOpen] = useState(Boolean(showIntro && realm.intro));
  // The tour starts right away if there's no intro to read first.
  const [touring, setTouring] = useState(Boolean(showTutorial) && !(showIntro && realm.intro));

  useEffect(() => {
    if (!open) return undefined;
    lockInput();
    return () => unlockInput();
  }, [open]);

  const close = () => {
    setOpen(false);
    if (showTutorial) setTouring(true);
  };

  if (touring) {
    return (
      <Tutorial
        accent={realm.accent}
        steps={applyScreenOverrides(REALM_TOUR, 'realmTour')}
        onDone={() => {
          setTouring(false);
          onTutorialDone?.();
        }}
      />
    );
  }

  if (!open) return null;

  return createPortal(
    <div className="panel-scrim">
      <div
        className="panel realm-intro"
        role="dialog"
        aria-modal="true"
        style={{ '--accent': realm.accent, '--accent-wash': realm.accentWash }}
      >
        <div className="accent-bar" />
        <h2>{realm.name}</h2>
        <span className="pin-label">{realm.topic}</span>

        <p className="realm-lore">{realm.intro.lore}</p>

        <div className="realm-learn">
          <span className="realm-learn-head">
            <Sparkles size={16} />
            In this realm you will learn
          </span>
          <ul>
            {realm.intro.learn.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="center">
          <button type="button" className="btn btn-accent" onClick={close} autoFocus>
            Step in
            <ArrowRight size={19} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
