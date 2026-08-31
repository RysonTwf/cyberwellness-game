import { useState } from 'react';
import { X } from 'lucide-react';
import World from '../world/World';
import RoomScene, { ROOM_OBSTACLES } from '../world/room/RoomScene';
import AtlasGate from './AtlasGate';
import Tutorial from './Tutorial';
import { applyScreenOverrides } from '../dev/contentOverrides';

// First-ever screen with a walkable world, so this is where the controls get
// taught (Tutorial.jsx; runs once, tracked in progress `tutorialsSeen.room`).
// Exported for the dev-only Copy Editor (src/dev/CopyEditor.jsx).
export const ROOM_TOUR = [
  {
    title: 'Home base',
    text: 'One stop before the Atlas. A quick look at how to get around, then you can open that diary.',
  },
  {
    // Point at the character, not the whole scene box — a full-box spotlight
    // parks the card over the lower edge, right on top of the walker the step
    // is talking about. Targeting `.walker` lifts the card clear of it.
    target: '.walker',
    title: 'Moving around',
    text: 'This is you! Tap or click anywhere on the floor to walk there, or use WASD or the arrow keys.',
  },
  {
    target: '.hotspot',
    title: 'The glowing pin',
    text: 'A pin like this marks the next place to go. Get close and a button pops up. Press it, or press Enter, to interact. ',
  },
  {
    target: '.objective',
    title: 'Never lost',
    text: 'Not sure what to do next? The bar down here always says your next move. That is everything. Go open that diary!',
  },
];

/**
 * The opening scene (storyline.md prologue): the Traveler wakes in their
 * own room, walks up to a glowing diary on the table, and Comet unfolds out
 * of it — the existing naming/band-select flow (AtlasGate) runs inside that
 * moment, staged as a panel over the room rather than a bare card screen.
 * Once named, the diary settles and the door becomes the way out to the
 * Atlas.
 */
// In the clear lane below the door, so the way out is a straight walk
// rather than a route around the reading nook (see RoomScene's FURNITURE).
const SPAWN = { x: 67, y: 84 };
const BOUNDS = { minX: 10, maxX: 90, minY: 30, maxY: 92 };
// Just in front of the table (RoomScene's TABLE_BASE), so the Traveler walks
// up to it on the floor rather than standing inside the furniture.
// No label — the diary glows for itself, and the pin is enough of a marker.
const DIARY_SPOT = { id: 'diary', x: 58, y: 63, action: 'Open it' };
// On the floor just inside the door, which is set into the back wall.
const DOOR_SPOT = { id: 'door', x: 68, y: 36, label: 'the door', action: 'Step outside' };

export default function TravelerRoom({ onBegin, onExit, avatar, showTutorial, onTutorialDone }) {
  const [open, setOpen] = useState(false);
  const [diaryOpened, setDiaryOpened] = useState(false);

  return (
    <div className="fold">
      {showTutorial && !open && (
        <Tutorial
          steps={applyScreenOverrides(ROOM_TOUR, 'roomTour')}
          accent="var(--gold)"
          onDone={onTutorialDone}
        />
      )}
      <World
        sceneKey="room"
        scene={<RoomScene diaryOpened={diaryOpened} />}
        accent="var(--gold)"
        spawn={SPAWN}
        bounds={BOUNDS}
        obstacles={ROOM_OBSTACLES}
        avatar={avatar}
        hotspots={[diaryOpened ? DOOR_SPOT : DIARY_SPOT]}
        objective={diaryOpened ? 'Walk to the door and step outside' : 'Walk up to the diary'}
        paused={open}
        showComet={diaryOpened}
        onInteract={(spot) => (spot.id === 'diary' ? setOpen(true) : onExit())}
      />

      {open && (
        <div className="panel-scrim">
          <div className="panel">
            {/* Closing back out doesn't lose anything — AtlasGate's own local
                state (typed name, intro beat reached) just resets, same as
                walking away from any other realm's step panel and coming
                back to it. */}
            <button
              type="button"
              className="panel-close"
              onClick={() => setOpen(false)}
              aria-label="Close the diary and step back"
            >
              <X size={18} />
            </button>
            <AtlasGate
              onBegin={(name, band) => {
                setDiaryOpened(true);
                setOpen(false);
                onBegin(name, band);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
