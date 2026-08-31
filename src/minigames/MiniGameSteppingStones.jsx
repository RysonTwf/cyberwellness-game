import { useRef, useState } from 'react';
import { RotateCcw, Check, Info, Footprints, ShieldAlert } from 'lucide-react';
import { playSfx } from '../lib/sfx';
import { drawRound } from '../lib/draw';
import MethodTrack, { CheckPrompt } from '../components/MethodTrack';
import PhaserMiniGame from './PhaserMiniGame';
import { makeSteppingStonesConfig } from './phaser-scenes/steppingStonesScene';

/**
 * P4–P6 Privacy Peaks mechanic ("Clear the Fog: Level Up", Milestones
 * Phase 2). One stone at a time, in order: same underlying judgement as a
 * spot-the-risk list (design.md §6), but paced as a run rather than a static
 * list, and the choice is explicit (Step / Skip) rather than tap-to-reveal.
 *
 * All decision state lives here in React, same as every other mini-game;
 * Phaser is only the visual run of stones + fog + the Traveler hopping
 * across (see phaser-scenes/steppingStonesScene.js).
 *
 * Two additions close the holes the audit found (thingstoimproveon.md):
 *
 *  - **The crossing is drawn.** `game.roundSize` stones out of a larger pool
 *    each run (lib/draw.js). Before, the same six stones came back in the
 *    same order with the same words, so one blind crossing told you every
 *    answer and bought a guaranteed clean one.
 *  - **Skipping names its reason.** Skipping a flagged stone then asks
 *    *which* S.T.O.P. check caught it, with the spent-key rule (a key you've
 *    tried is disabled). "Skip anything that sounds scary" clears the old
 *    version; it does not clear this one. A stone may legitimately trip more
 *    than one check, so `stone.check` accepts an array and any of them counts.
 *
 * Naming is opt-in via `game.purpose.nameTheCheck`, so the same component
 * still serves a band that only reads the method off the track.
 */

const asKeys = (check) => (Array.isArray(check) ? check : check ? [check] : []);

export default function MiniGameSteppingStones({ game, onComplete, avatar = null }) {
  const purpose = game.purpose ?? null;
  const naming = Boolean(purpose?.nameTheCheck);

  const deal = () => drawRound(game.stones, game.roundSize);
  const [stones, setStones] = useState(deal);
  const [index, setIndex] = useState(0);
  const [resolved, setResolved] = useState([]); // { id, action, correct, keys }
  const [feedback, setFeedback] = useState(null); // { text, correct }
  const [namingState, setNamingState] = useState(null); // { spent, wrong }
  const [round, setRound] = useState(0);
  const sceneRef = useRef(null);

  const current = stones[index] ?? null;
  const done = index >= stones.length;
  const correctCount = resolved.filter((r) => r.correct).length;
  const allRight = done && correctCount === stones.length;

  const cleared = new Set(resolved.filter((r) => r.correct).flatMap((r) => r.keys ?? []));

  function choose(action) {
    if (!current || feedback || namingState) return;
    // Skip is correct exactly when the stone is flagged; Step is correct
    // exactly when it isn't.
    const correct = action === 'skip' ? current.flag : !current.flag;
    playSfx(correct ? 'confirm' : 'error');
    sceneRef.current?.hopTo(index, correct);

    // Skipped it *and* got it right, so say what caught it.
    if (correct && naming && action === 'skip' && asKeys(current.check).length) {
      setNamingState({ spent: [], wrong: null });
      return;
    }
    setResolved((r) => [...r, { id: current.id, action, correct, keys: asKeys(current.check) }]);
    setFeedback({ text: current.note, correct });
  }

  function nameCheck(key) {
    if (namingState.spent.includes(key)) return;
    const right = asKeys(current.check).includes(key);
    playSfx(right ? 'confirm' : 'error');
    if (!right) {
      setNamingState((n) => ({ ...n, spent: [...n.spent, key], wrong: key }));
      return;
    }
    setResolved((r) => [
      ...r,
      {
        id: current.id,
        action: 'skip',
        correct: namingState.spent.length === 0,
        keys: asKeys(current.check),
      },
    ]);
    setFeedback({ text: current.note, correct: true });
    setNamingState(null);
  }

  function onward() {
    setFeedback(null);
    setIndex((i) => i + 1);
  }

  function retry() {
    setStones(deal());
    setIndex(0);
    setResolved([]);
    setFeedback(null);
    setNamingState(null);
    setRound((r) => r + 1);
  }

  return (
    <div className="stack">
      <div className="game-head">
        <h3>{game.title}</h3>
        <p className="instruction">{game.instruction}</p>
      </div>

      <MethodTrack purpose={purpose} cleared={cleared} />

      <PhaserMiniGame
        key={round}
        config={(Phaser) =>
          makeSteppingStonesConfig(Phaser, {
            stones,
            avatar,
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

      {namingState && (
        <>
          <CheckPrompt
            checks={purpose.checks}
            prompt={purpose.prompt ?? 'Which check caught it?'}
            spent={namingState.spent}
            onPick={nameCheck}
          />
          {namingState.wrong && (
            <div className="redirect">
              <span className="ic">
                <Info size={22} />
              </span>
              <p>Not that one. Read the message again, what is it actually doing to you?</p>
            </div>
          )}
        </>
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
            You get across, but {stones.length - correctCount} of them trick you. Cross again
            and read each one properly, the fog sends different ones over.
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
        {!done && current && !feedback && !namingState && (
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
