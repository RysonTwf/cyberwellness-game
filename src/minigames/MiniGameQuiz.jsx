import { useState } from 'react';
import { Check, Info, RotateCcw, ArrowRight } from 'lucide-react';
import { playSfx } from '../lib/sfx';
import { drawRound, shuffle } from '../lib/draw';
import MethodTrack from '../components/MethodTrack';

/**
 * Plain 5-question Q&A mini-game — used by Privacy Peaks (P1–3) and Fable
 * Falls (P1–3), which the school found the "mark a whole pile, then commit"
 * games (Spot / Sort) too confusing for.
 *
 * One question at a time. Each answer carries its own `feedback`, shown when
 * picked. Same no-fail rule as every other mini-game (design.md §5/§8): a
 * wrong pick explains itself and the child simply picks again — no buzzer,
 * no penalty, retry as often as you like.
 *
 * What changed (thingstoimproveon.md §2/§3): finishing now takes a clean run.
 * Before, a wrong pick simply handed the question back and "Done" appeared
 * the moment the last one went green, so a child who read nothing cleared the
 * whole game in ten taps: no gate *and* no measurement, across half the
 * P1–P3 curriculum. Three changes close that, none of them a fail state:
 *
 *  - **a clean-run gate**, the same one Sort and Stepping Stones already
 *    have: every question right first time, or the round doesn't count;
 *  - **a drawn round**: `game.roundSize` questions out of a larger pool, so
 *    one blind run can't be traded for a memorised clean one;
 *  - **shuffled options**, so the answer can't be memorised by position.
 *
 * The method being taught rides above the questions on the shared track
 * (components/MethodTrack.jsx) rather than being invisible.
 *
 *   game.purpose:   { name, why, checks: [{ key, name, sub }] }
 *   game.roundSize: how many of `questions` to ask each run (optional)
 *   game.questions: [{ id, text, options: [{ id, text, correct, feedback }] }]
 */
export default function MiniGameQuiz({ game, onComplete }) {
  const deal = () =>
    drawRound(game.questions, game.roundSize).map((q) => ({ ...q, options: shuffle(q.options) }));

  const [round, setRound] = useState(deal);
  const [qi, setQi] = useState(0);
  const [chosenId, setChosenId] = useState(null); // option picked for this question
  const [missedHere, setMissedHere] = useState(false); // wrong at least once on this one
  const [firstTry, setFirstTry] = useState(0);
  const [done, setDone] = useState(false);

  const q = round[qi];
  const chosen = chosenId ? q.options.find((o) => o.id === chosenId) : null;
  const answered = Boolean(chosen?.correct);
  const last = qi === round.length - 1;
  const allClean = firstTry === round.length;

  function pick(optionId) {
    if (answered) return; // locked once they've got it right
    const option = q.options.find((o) => o.id === optionId);
    setChosenId(optionId);
    playSfx(option.correct ? 'confirm' : 'error');
    if (option.correct && !missedHere) setFirstTry((n) => n + 1);
    if (!option.correct) setMissedHere(true);
  }

  function next() {
    if (last) {
      setDone(true);
      return;
    }
    setQi((i) => i + 1);
    setChosenId(null);
    setMissedHere(false);
  }

  function startOver() {
    setRound(deal());
    setQi(0);
    setChosenId(null);
    setMissedHere(false);
    setFirstTry(0);
    setDone(false);
  }

  /* ------------------------------------------------------------ the end -- */
  if (done) {
    return (
      <div className="stack">
        <div className="game-head">
          <h3>{game.title}</h3>
        </div>

        <MethodTrack purpose={game.purpose} cleared={new Set()} />

        <div className={`redirect${allClean ? ' settled' : ''}`}>
          <span className="ic">{allClean ? <Check size={22} /> : <Info size={22} />}</span>
          <p>
            {allClean
              ? `All ${round.length} right first time. That is what reading each one properly looks like.`
              : `${firstTry} of ${round.length} right first time. Go again and see if you can read every one before you answer, you will get a different set.`}
          </p>
        </div>

        <div
          className="row panel-actions"
          style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}
        >
          <button type="button" className="btn btn-ghost btn-sm" onClick={startOver}>
            <RotateCcw size={16} />
            Go again
          </button>
          {/* A clean run is the one that counts, every answer still explains
              itself as you go, so nothing is lost by getting one wrong, but
              you don't finish by tapping until the green one appears. */}
          {allClean && (
            <button
              type="button"
              className="btn btn-accent"
              onClick={() => {
                playSfx('complete');
                onComplete(firstTry);
              }}
            >
              Done
              <ArrowRight size={19} />
            </button>
          )}
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------- the questions -- */
  return (
    <div className="stack">
      <div className="game-head">
        <h3>{game.title}</h3>
        {game.instruction && <p className="instruction">{game.instruction}</p>}
      </div>

      <MethodTrack purpose={game.purpose} cleared={new Set()} />

      <p className="tile-hint">
        Question {qi + 1} of {round.length}
      </p>

      <h3>{q.text}</h3>

      <div className="choices" style={{ gridTemplateColumns: '1fr' }}>
        {q.options.map((option) => {
          const isChosen = chosenId === option.id;
          const cls = !isChosen
            ? answered
              ? 'choice faded'
              : 'choice'
            : option.correct
              ? 'choice picked-safe'
              : 'choice picked-rethink';
          return (
            <button
              key={option.id}
              type="button"
              className={cls}
              onClick={() => pick(option.id)}
              disabled={answered}
            >
              <span>{option.text}</span>
            </button>
          );
        })}
      </div>

      {chosen && (
        <div className={`redirect${chosen.correct ? ' settled' : ''}`}>
          <span className="ic">
            {chosen.correct ? <Check size={22} /> : <Info size={22} />}
          </span>
          <p>{chosen.feedback}</p>
        </div>
      )}

      <div
        className="row panel-actions"
        style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}
      >
        <button type="button" className="btn btn-ghost btn-sm" onClick={startOver}>
          <RotateCcw size={16} />
          Start over
        </button>
        {answered && (
          <button type="button" className="btn btn-accent" onClick={next}>
            {last ? 'See how I did' : 'Next question'}
            <ArrowRight size={19} />
          </button>
        )}
      </div>
    </div>
  );
}
