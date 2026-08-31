import { useMemo, useState } from 'react';
import { Check, Info, RotateCcw, ArrowRight } from 'lucide-react';
import { playSfx } from '../lib/sfx';
import { shuffle } from '../lib/draw';
import MethodTrack, { CheckPrompt } from '../components/MethodTrack';

/**
 * S.U.R.E. mini-game — P4–P6 Fable Falls (10–12s).
 *
 * The quiz this replaced *labelled* every question with its own step
 * ("Source. The screenshot has no name…"), so a child could clear the whole
 * thing on ordinary common sense and never learn the method: the letters
 * were decoration on top of five normal questions.
 *
 * Here the letter is the answer. Each thing you notice about the post arrives
 * unlabelled, in a shuffled order, and you have to name the check it belongs
 * to *before* you can say what to do about it.
 *
 *   clue -> which check is this? -> so what do you do? -> next
 *   ...four clues, then anything you had to guess at comes back, then the
 *   verdict: knowing all of that, do you forward it?
 *
 * Nothing here is passable on luck, and nothing here is a fail state
 * (design.md §5/§8): a wrong answer always explains itself first, and the
 * clue simply isn't finished with you yet:
 *
 *  - a letter you've already tried on this clue is **spent**, so you can't
 *    tap along the row until one sticks;
 *  - every clue you named wrongly comes back for a **second look**, and keeps
 *    coming back until you place it cleanly;
 *  - **the action half is gated too.** It used to be a 2-option
 *    retry-until-right with no consequence, so only the naming half was
 *    actually protected (thingstoimproveon.md). A wrong "so what do you do"
 *    now sends the clue round again alongside a misnamed check;
 *  - **the verdict is gated.** Getting it wrong sends you back through the
 *    clues before you may answer again, rather than handing you the other
 *    option on a plate;
 *  - **the post is drawn.** `game.posts` holds two unrelated posts and one is
 *    chosen per run, so the clue→letter mapping can't be learned off a single
 *    scenario's `miss`/`note` copy.
 *
 * `onComplete` gets the count of clues that went right first time, both
 * halves, for parity with the other games.
 *
 *   game.purpose: { name, why, checks: [{ key, name, sub }], nameTheCheck }
 *   game.posts:   [{ id, lead, cards, verdict }]
 *   ...cards:     [{ id, step, text, miss, note, action: { prompt, options } }]
 *   ...verdict:   { prompt, options: [{ id, text, correct, feedback }] }
 */

const pickOne = (list) => list[Math.floor(Math.random() * list.length)];

// Option order is shuffled per run as well, so neither half can be cleared
// off "it was the second one last time".
function dealPost(posts) {
  const post = pickOne(posts);
  return {
    ...post,
    cards: post.cards.map((c) => ({
      ...c,
      action: { ...c.action, options: shuffle(c.action.options) },
    })),
    verdict: { ...post.verdict, options: shuffle(post.verdict.options) },
  };
}

export default function MiniGameSure({ game, onComplete }) {
  const purpose = game.purpose;
  const steps = purpose.checks;

  const [post, setPost] = useState(() => dealPost(game.posts));
  const { cards, verdict } = post;

  const [order, setOrder] = useState(() => shuffle(post.cards));
  const [ci, setCi] = useState(0);
  const [phase, setPhase] = useState('clues'); // clues | recheck | verdict

  const [stepPick, setStepPick] = useState(null); // letter currently showing
  const [spent, setSpent] = useState([]); // letters already tried on this clue
  const [pickId, setPickId] = useState(null); // action / verdict option tried
  const [missed, setMissed] = useState(false); // slipped anywhere on this clue
  const [firstTry, setFirstTry] = useState(0);
  // Set when the verdict was answered wrongly, the clues come round again
  // before it may be answered a second time.
  const [verdictMissed, setVerdictMissed] = useState(false);

  // Clues whose check (or action) was got wrong, they come back before the
  // verdict.
  const [toRecheck, setToRecheck] = useState([]); // this pass's queue
  const [nextRecheck, setNextRecheck] = useState([]); // ids still not clean

  const stepByKey = useMemo(() => Object.fromEntries(steps.map((s) => [s.key, s])), [steps]);

  const card = phase === 'recheck' ? (toRecheck[ci] ?? null) : (order[ci] ?? null);
  const stepRight = Boolean(card) && stepPick === card.step;
  const action = card?.action ?? null;
  const chosen = pickId && action ? action.options.find((o) => o.id === pickId) : null;
  const actionDone = Boolean(chosen?.correct);
  // A clue is finished only when both halves are clean, in the recheck pass
  // too. The recheck used to ask the naming again and nothing else, which
  // left a wrong "so what do you do" costing a lap but never being re-tested.
  const cardDone = actionDone;

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

  const owesRecheck = (id) =>
    setNextRecheck((ids) => (ids.includes(id) ? ids : [...ids, id]));

  function pickStep(key) {
    if (stepRight || spent.includes(key)) return;
    const right = key === card.step;
    setStepPick(key);
    playSfx(right ? 'confirm' : 'error');
    if (right) return;
    setSpent((s) => [...s, key]);
    setMissed(true);
    // Named the wrong check — this clue owes us a second look.
    owesRecheck(card.id);
  }

  function pickAction(optionId) {
    if (actionDone) return;
    const option = action.options.find((o) => o.id === optionId);
    setPickId(optionId);
    playSfx(option.correct ? 'confirm' : 'error');
    if (option.correct) {
      if (!missed) setFirstTry((n) => n + 1);
      return;
    }
    setMissed(true);
    // Gated like the naming half: reading the clue right and then deciding
    // wrongly is exactly the mistake the method exists to catch, so the clue
    // comes back rather than the right answer being handed over.
    owesRecheck(card.id);
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
    const fresh = dealPost(game.posts);
    setPost(fresh);
    setOrder(shuffle(fresh.cards));
    setCi(0);
    setPhase('clues');
    setToRecheck([]);
    setNextRecheck([]);
    setFirstTry(0);
    setVerdictMissed(false);
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
    if (option.correct) return;
    // Not a fail, but not a free second guess either. Two options means one
    // wrong pick would otherwise leave the answer showing, so the clues come
    // back round first and the verdict is asked again at the end of them.
    setVerdictMissed(true);
  }

  function backThroughClues() {
    setToRecheck(order);
    setNextRecheck([]);
    setPhase('recheck');
    setCi(0);
    setVerdictMissed(false);
    resetCard();
  }

  /* ------------------------------------------------------------- pieces -- */

  const track = <MethodTrack purpose={purpose} cleared={cleared} />;

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
        {optionRow(verdict.options, verdictSettled || verdictMissed, pickVerdict)},
        {note(Boolean(verdictPick?.correct), verdictPick?.feedback)}

        <div
          className="row panel-actions"
          style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}
        >
          {startOverBtn}
          {verdictMissed && (
            <button type="button" className="btn btn-accent" onClick={backThroughClues}>
              Go back through the four checks
              <ArrowRight size={19} />
            </button>
          )}
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
            These are the ones you had to guess at. Name the check and decide again, this time on
            purpose.
          </p>
        ) : (
          game.instruction && (
            <p className="instruction">
              {post.lead} {game.instruction}
            </p>
          )
        )}
      </div>

      {track}

      <p className="tile-hint">
        {recheck ? 'Second look' : 'Clue'} {ci + 1} of {list.length}
      </p>

      <p className="sure-clue">{card.text}</p>

      {!stepRight ? (
        <>
          <CheckPrompt
            checks={steps}
            prompt="Which check is this?"
            spent={spent}
            onPick={pickStep}
          />
          {wrongStep && note(false, card.miss)}
        </>
      ) : (
        <>
          {note(true, card.note)}
          <h3>{action.prompt}</h3>
          {optionRow(action.options, actionDone, pickAction)},
          {note(Boolean(chosen?.correct), chosen?.feedback)}
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
