import { useMemo, useState } from 'react';
import { Check, Info, RotateCcw, ArrowRight } from 'lucide-react';
import { playSfx } from '../lib/sfx';

/**
 * S.U.R.E. mini-game — P4–P6 Fable Falls (10–12s).
 *
 * The quiz this replaced *labelled* every question with its own step
 * ("Source. The screenshot has no name…"), so a child could clear the whole
 * thing on ordinary common sense and never learn the method: the letters
 * were decoration on top of five normal questions.
 *
 * Here the letter is the answer. Each thing you notice about the Mia post
 * arrives unlabelled, in a shuffled order, and you have to name the check it
 * belongs to *before* you can say what to do about it.
 *
 *   clue -> which check is this? -> so what do you do? -> next
 *   ...four clues, then any check you had to guess at comes back, then the
 *   verdict: knowing all of that, do you forward it?
 *
 * Two rules keep it from being passable on luck:
 *  - a letter you've already tried on this clue is spent, so you can't just
 *    tap along the row until one sticks;
 *  - every clue whose check you named wrongly comes back for a second look
 *    before the verdict, and keeps coming back until you place it cleanly.
 * Neither is a fail state (design.md §5/§8) — nothing is lost, the clue just
 * isn't finished with you yet. A wrong answer always explains itself first.
 *
 * `onComplete` gets the count of clues that went right first time, both
 * halves, for parity with the other games.
 *
 *   game.steps:   [{ key: 'S', name: 'Source', sub: 'Who is behind it?' }]
 *   game.cards:   [{ id, step, text, miss, note, action: { prompt, options } }]
 *   game.verdict: { prompt, options: [{ id, text, correct, feedback }] }
 */

function shuffle(list) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function MiniGameSure({ game, onComplete }) {
  const { steps, cards, verdict } = game;

  const [order, setOrder] = useState(() => shuffle(cards));
  const [ci, setCi] = useState(0);
  const [phase, setPhase] = useState('clues'); // clues | recheck | verdict

  const [stepPick, setStepPick] = useState(null); // letter currently showing
  const [spent, setSpent] = useState([]); // letters already tried on this clue
  const [pickId, setPickId] = useState(null); // action / verdict option tried
  const [missed, setMissed] = useState(false); // slipped anywhere on this clue
  const [firstTry, setFirstTry] = useState(0);

  // Clues whose check was named wrongly — they come back before the verdict.
  const [toRecheck, setToRecheck] = useState([]); // this pass's queue
  const [nextRecheck, setNextRecheck] = useState([]); // ids still not clean

  const stepByKey = useMemo(() => Object.fromEntries(steps.map((s) => [s.key, s])), [steps]);

  const card = phase === 'recheck' ? (toRecheck[ci] ?? null) : (order[ci] ?? null);
  const stepRight = Boolean(card) && stepPick === card.step;
  const action = card?.action ?? null;
  const chosen = pickId && action ? action.options.find((o) => o.id === pickId) : null;
  const actionDone = Boolean(chosen?.correct);
  // In the recheck pass there's no second half — naming the check is the job.
  const cardDone = phase === 'recheck' ? stepRight : actionDone;

  // A letter is ticked off on the track once every clue that belongs to it
  // has been placed. The recheck pass unticks the ones being looked at again.
  const cleared = useMemo(() => {
    const done = new Set();
    if (phase === 'verdict') return new Set(steps.map((s) => s.key));
    const list = phase === 'recheck' ? toRecheck : order;
    steps.forEach((s) => {
      if (phase === 'recheck' && !list.some((c) => c.step === s.key)) done.add(s.key);
      const owned = list.filter((c) => c.step === s.key);
      if (owned.length && owned.every((c) => list.indexOf(c) < ci)) done.add(s.key);
    });
    return done;
  }, [steps, order, toRecheck, ci, phase]);

  function resetCard() {
    setStepPick(null);
    setSpent([]);
    setPickId(null);
    setMissed(false);
  }

  function pickStep(key) {
    if (stepRight || spent.includes(key)) return;
    const right = key === card.step;
    setStepPick(key);
    playSfx(right ? 'confirm' : 'error');
    if (right) return;
    setSpent((s) => [...s, key]);
    setMissed(true);
    // Named the wrong check — this clue owes us a second look.
    setNextRecheck((ids) => (ids.includes(card.id) ? ids : [...ids, card.id]));
  }

  function pickAction(optionId) {
    if (actionDone) return;
    const option = action.options.find((o) => o.id === optionId);
    setPickId(optionId);
    playSfx(option.correct ? 'confirm' : 'error');
    if (!option.correct) setMissed(true);
    else if (!missed) setFirstTry((n) => n + 1);
  }

  function next() {
    const list = phase === 'recheck' ? toRecheck : order;
    if (ci < list.length - 1) {
      setCi((i) => i + 1);
      resetCard();
      return;
    }
    // End of a pass. Anything still shaky goes round again; otherwise finish.
    if (nextRecheck.length) {
      setToRecheck(cards.filter((c) => nextRecheck.includes(c.id)));
      setNextRecheck([]);
      setPhase('recheck');
      setCi(0);
      resetCard();
      return;
    }
    setPhase('verdict');
    setCi(0);
    resetCard();
  }

  function startOver() {
    setOrder(shuffle(cards));
    setCi(0);
    setPhase('clues');
    setToRecheck([]);
    setNextRecheck([]);
    setFirstTry(0);
    resetCard();
  }

  const verdictPick =
    phase === 'verdict' && pickId ? verdict.options.find((o) => o.id === pickId) : null;
  const verdictSettled = Boolean(verdictPick?.correct);

  function pickVerdict(optionId) {
    if (verdictSettled) return;
    const option = verdict.options.find((o) => o.id === optionId);
    setPickId(optionId);
    playSfx(option.correct ? 'confirm' : 'error');
  }

  /* ------------------------------------------------------------- pieces -- */

  const track = (
    <ol className="sure-track" aria-label="The four S.U.R.E. checks">
      {steps.map((s) => {
        const done = cleared.has(s.key);
        return (
          <li key={s.key} className={`sure-chip${done ? ' done' : ''}`}>
            <span className="sure-letter">{done ? <Check size={13} /> : s.key}</span>
            {s.name}
          </li>
        );
      })}
    </ol>
  );

  const startOverBtn = (
    <button type="button" className="btn btn-ghost btn-sm" onClick={startOver}>
      <RotateCcw size={16} />
      Start over
    </button>
  );

  const optionRow = (options, locked, onPick) => (
    <div className="choices" style={{ gridTemplateColumns: '1fr' }}>
      {options.map((option) => {
        const isChosen = pickId === option.id;
        const cls = !isChosen
          ? locked
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
            onClick={() => onPick(option.id)}
            disabled={locked}
          >
            <span>{option.text}</span>
          </button>
        );
      })}
    </div>
  );

  const note = (settled, text) =>
    text && (
      <div className={`redirect${settled ? ' settled' : ''}`}>
        <span className="ic">{settled ? <Check size={22} /> : <Info size={22} />}</span>
        <p>{text}</p>
      </div>
    );

  /* ------------------------------------------------------------ verdict -- */
  if (phase === 'verdict') {
    return (
      <div className="stack">
        <div className="game-head">
          <h3>{game.title}</h3>
        </div>

        {track}

        <h3>{verdict.prompt}</h3>
        {optionRow(verdict.options, verdictSettled, pickVerdict)}
        {note(Boolean(verdictPick?.correct), verdictPick?.feedback)}

        <div
          className="row panel-actions"
          style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}
        >
          {startOverBtn}
          {verdictSettled && (
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

  /* --------------------------------------------------------------- clue -- */
  const recheck = phase === 'recheck';
  const list = recheck ? toRecheck : order;
  const wrongStep = stepPick && !stepRight ? stepByKey[stepPick] : null;
  const lastOfPass = ci === list.length - 1;
  const nextLabel = !lastOfPass
    ? 'Next clue'
    : nextRecheck.length
      ? 'One more look'
      : 'Last question';

  return (
    <div className="stack">
      <div className="game-head">
        <h3>{game.title}</h3>
        {recheck ? (
          <p className="instruction">
            These are the checks you had to guess at. Place them again, this time on purpose.
          </p>
        ) : (
          game.instruction && <p className="instruction">{game.instruction}</p>
        )}
      </div>

      {track}

      <p className="tile-hint">
        {recheck ? 'Second look' : 'Clue'} {ci + 1} of {list.length}
      </p>

      <p className="sure-clue">{card.text}</p>

      {!stepRight ? (
        <>
          <h3>Which check is this?</h3>
          <div className="sure-keys">
            {steps.map((s) => {
              const used = spent.includes(s.key);
              return (
                <button
                  key={s.key}
                  type="button"
                  className={`sure-key${used ? ' spent' : ''}`}
                  onClick={() => pickStep(s.key)}
                  disabled={used}
                >
                  <span className="sure-letter">{s.key}</span>
                  <span className="sure-key-name">{s.name}</span>
                  <span className="sure-key-sub">{s.sub}</span>
                </button>
              );
            })}
          </div>
          {wrongStep && note(false, card.miss)}
        </>
      ) : (
        <>
          {note(true, card.note)}
          {!recheck && (
            <>
              <h3>{action.prompt}</h3>
              {optionRow(action.options, actionDone, pickAction)}
              {note(Boolean(chosen?.correct), chosen?.feedback)}
            </>
          )}
        </>
      )}

      <div
        className="row panel-actions"
        style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}
      >
        {startOverBtn}
        {cardDone && (
          <button type="button" className="btn btn-accent" onClick={next}>
            {nextLabel}
            <ArrowRight size={19} />
          </button>
        )}
      </div>
    </div>
  );
}
