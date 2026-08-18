import { useRef, useState } from 'react';
import { RotateCcw, Check, Info, Footprints, ShieldAlert } from 'lucide-react';
import PhaserMiniGame from './PhaserMiniGame';
import { makeSteppingStonesConfig } from './phaser-scenes/steppingStonesScene';

/**
 * P4–P6 Privacy Peaks mechanic ("Clear the Fog: Level Up", Milestones
 * Phase 2). One stone at a time, in order — same underlying judgement as
 * MiniGameSpot (design.md §6), but paced as a run rather than a static
 * list, and the choice is explicit (Step / Skip) rather than tap-to-reveal.
 *
 * All decision state lives here in React, same as every other mini-game;
 * Phaser is only the visual run of stones + fog + the Traveler hopping
 * across (see phaser-scenes/steppingStonesScene.js).
 */
export default function MiniGameSteppingStones({ game, onComplete }) {
  const stones = game.stones;
  const [index, setIndex] = useState(0);
  const [resolved, setResolved] = useState([]); // { id, action, correct }
  const [feedback, setFeedback] = useState(null); // { text, correct }
  const [round, setRound] = useState(0);
  const sceneRef = useRef(null);

  const current = stones[index] ?? null;
  const done = index >= stones.length;
  const correctCount = resolved.filter((r) => r.correct).length;

  function choose(action) {
    if (!current || feedback) return;
    // Skip is correct exactly when the stone is flagged; Step is correct
    // exactly when it isn't.
    const correct = action === 'skip' ? current.flag : !current.flag;
    setResolved((r) => [...r, { id: current.id, action, correct }]);
    setFeedback({ text: current.note, correct });
    sceneRef.current?.hopTo(index, correct);
  }

  function onward() {
    setFeedback(null);
    setIndex((i) => i + 1);
  }

  function retry() {
    setIndex(0);
    setResolved([]);
    setFeedback(null);
    setRound((r) => r + 1);
  }

  return (
    <div className="stack">
      <div className="game-head">
        <h3>{game.title}</h3>
        <p className="instruction">{game.instruction}</p>
      </div>

      <PhaserMiniGame
        key={round}
        config={(Phaser) =>
          makeSteppingStonesConfig(Phaser, {
            stones,
            onSceneReady: (scene) => {
              sceneRef.current = scene;
            },
          })
        }
      />

      <p className="tile-hint">
        {done ? `Crossed — ${correctCount} of ${stones.length} right.` : `Stone ${index + 1} of ${stones.length}`}
      </p>

      {!done && current && !feedback && (
        <>
          <div className="tile-stage">
            <div className="tile">{current.text}</div>
          </div>
          <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
            <button type="button" className="btn btn-accent" onClick={() => choose('step')}>
              <Footprints size={17} />
              Step on it
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => choose('skip')}>
              <ShieldAlert size={17} />
              Skip it
            </button>
          </div>
        </>
      )}

      {feedback && (
        <>
          <div className={`redirect${feedback.correct ? ' settled' : ''}`}>
            <span className="ic">
              {feedback.correct ? <Check size={22} /> : <Info size={22} />}
            </span>
            <p>{feedback.text}</p>
          </div>
          <div className="center">
            <button type="button" className="btn btn-accent" onClick={onward}>
              Onward
            </button>
          </div>
        </>
      )}

      {done && (
        <div className="redirect settled">
          <span className="ic">
            <Check size={22} />
          </span>
          <p>Nice work reading each one before you moved — that pause is the whole skill.</p>
        </div>
      )}

      <div className="row panel-actions" style={{ justifyContent: 'center' }}>
        <button type="button" className="btn btn-ghost btn-sm" onClick={retry}>
          <RotateCcw size={16} />
          Cross again
        </button>
        {done && (
          <button type="button" className="btn btn-accent" onClick={() => onComplete(correctCount)}>
            <Check size={19} />
            Done crossing
          </button>
        )}
      </div>
    </div>
  );
}
