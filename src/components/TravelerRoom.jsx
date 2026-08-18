import { useState } from 'react';
import World from '../world/World';
import RoomScene from '../world/room/RoomScene';
import AtlasGate from './AtlasGate';

/**
 * The opening scene (storyline.md prologue): the Traveler wakes in their
 * own room, walks up to a glowing diary on the table, and Comet unfolds out
 * of it — the existing naming/band-select flow (AtlasGate) runs inside that
 * moment, staged as a panel over the room rather than a bare card screen.
 * Once named, the diary settles and the door becomes the way out to the
 * Atlas.
 */
const SPAWN = { x: 50, y: 82 };
const BOUNDS = { minX: 10, maxX: 90, minY: 20, maxY: 92 };
const DIARY_SPOT = { id: 'diary', x: 50, y: 31, label: 'the glowing diary', action: 'Open it' };
const DOOR_SPOT = { id: 'door', x: 50, y: 94, label: 'the door', action: 'Step outside' };

export default function TravelerRoom({ onBegin, onExit }) {
  const [open, setOpen] = useState(false);
  const [diaryOpened, setDiaryOpened] = useState(false);

  return (
    <div className="fold">
      <World
        sceneKey="room"
        scene={<RoomScene diaryOpened={diaryOpened} />}
        accent="var(--gold)"
        spawn={SPAWN}
        bounds={BOUNDS}
        hotspots={[diaryOpened ? DOOR_SPOT : DIARY_SPOT]}
        objective={diaryOpened ? 'Walk to the door and step outside' : 'Walk up to the diary'}
        paused={open}
        onInteract={(spot) => (spot.id === 'diary' ? setOpen(true) : onExit())}
      />

      {open && (
        <div className="panel-scrim">
          <div className="panel">
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
