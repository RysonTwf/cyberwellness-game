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
  const allRight = done && correctCount === stones.length;

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
        {done ? `Across! ${correctCount} of ${stones.length} right.` : `Stone ${index + 1} of ${stones.length}`}
      </p>

      {!done && current && !feedback && (
        <div className="tile-stage">
          <div className="tile">{current.text}</div>
        </div>
      )}

      {feedback && (
        <div className={`redirect${feedback.correct ? ' settled' : ''}`}>
          <span className="ic">
            {feedback.correct ? <Check size={22} /> : <Info size={22} />}
          </span>
          <p>{feedback.text}</p>
        </div>
      )}

      {/* A clean crossing is the one that counts. Every stone resolves either
          way and explains itself, so nothing is lost by getting one wrong —
          but you don't reach the far side by calling "step" on everything and
          letting the misses slide, which is what advancing regardless allowed
          (design.md §8: retry freely, just don't pass without judging). */}
      {done && allRight && (
        <div className="redirect settled">
          <span className="ic">
            <Check size={22} />
          </span>
          <p>Nice work reading each one before you move. Pausing to think is the real skill.</p>
        </div>
      )}

      {done && !allRight && (
        <div className="redirect">
          <span className="ic">
            <Info size={22} />
          </span>
          <p>
            You get across, but {stones.length - correctCount} of them trick you. Read
            what each one says again and cross it clean.
          </p>
        </div>
      )}

      {/* One sticky action row for every state — the Step/Skip choice, Onward,
          Done crossing — so the panel isn't stacking loose button rows that
          scroll out of reach on a short screen. */}
      <div
        className="row panel-actions"
        style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}
      >
        <button type="button" className="btn btn-ghost btn-sm" onClick={retry}>
          <RotateCcw size={16} />
          Cross again
        </button>
        {!done && current && !feedback && (
          <>
            <button type="button" className="btn btn-ghost" onClick={() => choose('skip')}>
              <ShieldAlert size={17} />
              Skip it
            </button>
            <button type="button" className="btn btn-accent" onClick={() => choose('step')}>
              <Footprints size={17} />
              Step on it
            </button>
          </>
        )}
        {feedback && (
          <button type="button" className="btn btn-accent" onClick={onward}>
            Onward
          </button>
        )}
        {done && allRight && (
          <button type="button" className="btn btn-accent" onClick={() => onComplete(correctCount)}>
            <Check size={19} />
            Done crossing
          </button>
        )}
      </div>
    </div>
  );
}
