import { useState } from 'react';
import { Check, Info, RotateCcw, ArrowRight } from 'lucide-react';
import { playSfx } from '../lib/sfx';

/**
 * Plain 5-question Q&A mini-game — used by Privacy Peaks (P1–3) and Fable
 * Falls (both bands), which the school found the "mark a whole pile, then
 * commit" games (Spot / Sort) too confusing for.
 *
 * One question at a time. Each answer carries its own `feedback`, shown when
 * picked. Same no-fail rule as every other mini-game (design.md §5/§8): a
 * wrong pick explains itself and the child simply picks again — no buzzer,
 * no score gate. `onComplete` is handed the count answered right first try,
 * purely for parity with the other games (nothing downstream reads it).
 *
 *   game.questions: [{ id, text, options: [{ id, text, correct, feedback }] }]
 */
export default function MiniGameQuiz({ game, onComplete }) {
  const questions = game.questions;
  const [qi, setQi] = useState(0);
  const [chosenId, setChosenId] = useState(null); // option picked for this question
  const [missedHere, setMissedHere] = useState(false); // wrong at least once on this one
  const [firstTry, setFirstTry] = useState(0);

  const q = questions[qi];
  const chosen = chosenId ? q.options.find((o) => o.id === chosenId) : null;
  const answered = Boolean(chosen?.correct);
  const last = qi === questions.length - 1;

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
      playSfx('complete');
      onComplete(firstTry);
      return;
    }
    setQi((i) => i + 1);
    setChosenId(null);
    setMissedHere(false);
  }

  function startOver() {
    setQi(0);
    setChosenId(null);
    setMissedHere(false);
    setFirstTry(0);
  }

  return (
    <div className="stack">
      <div className="game-head">
        <h3>{game.title}</h3>
        {game.instruction && <p className="instruction">{game.instruction}</p>}
      </div>

      <p className="tile-hint">
        Question {qi + 1} of {questions.length}
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
            {last ? 'Done' : 'Next question'}
            <ArrowRight size={19} />
          </button>
        )}
      </div>
    </div>
  );
}
