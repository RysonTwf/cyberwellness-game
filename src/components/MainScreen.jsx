import { Play } from 'lucide-react';
import { Comet } from './Characters';

/**
 * The actual first thing a player sees — before the Traveler's Room, before
 * any of the room's own walk-up-to-the-diary staging. A real title screen:
 * the game's name, and one button. Everything else (the room, meeting
 * Comet, naming, band-select) still happens exactly as it did, just one
 * screen later than before.
 *
 * Only ever shown on a genuinely fresh session — a saved game's
 * `currentScreen` already points past 'title' the moment the player has
 * started, so a returning player never sees this again (state/useProgress.js).
 */
export default function MainScreen({ onStart }) {
  return (
    <div className="fold">
      <div className="center" style={{ flex: 1, display: 'grid', placeItems: 'center', gap: 22 }}>
        <div className="stack" style={{ alignItems: 'center', textAlign: 'center' }}>
          <Comet size={96} />
          <h1 style={{ marginTop: 10 }}>Cyber Defender Quest</h1>
          <p className="lede" style={{ marginTop: 8, maxWidth: '38ch' }}>
            Travel the Atlas with Comet, and become a Wise Traveler.
          </p>
        </div>

        <button type="button" className="btn btn-accent" onClick={onStart}>
          <Play size={19} />
          Start
        </button>
      </div>
    </div>
  );
}
