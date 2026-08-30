import { Play } from 'lucide-react';
import { Comet } from './Characters';
import SchoolLogo from './SchoolLogo';
import TitleScene from './TitleScene';

/**
 * The title screen — the first thing a fresh player sees. A soft green
 * dawn landscape (TitleScene.jsx) with Comet looping in over it, and the
 * game's name on a field-journal cover: the closed version of the same
 * journal the Traveler opens in their room a screen later.
 *
 * Only ever shown on a genuinely fresh session — a saved game's
 * `currentScreen` already points past 'title' (state/useProgress.js).
 */
export default function MainScreen({ onStart }) {
  return (
    <div className="fold prologue title-screen">
      <TitleScene />
      <span className="title-comet" aria-hidden="true">
        <Comet size={46} />
      </span>

      <div className="title-cover">
        <span className="title-cover-ribbon" aria-hidden="true" />
        <SchoolLogo variant="full" className="title-cover-crest" />
        <p className="title-cover-kicker">A Cyber Wellness field journal</p>
        <h1 className="title-cover-name">Cyber Defender Quest</h1>
        <p className="title-cover-lede">
          Travel the Atlas with Comet, and become a Wise Traveller.
        </p>
        <button type="button" className="btn btn-accent title-cover-start" onClick={onStart}>
          <Play size={19} />
          Start the journey
        </button>
      </div>
    </div>
  );
}
