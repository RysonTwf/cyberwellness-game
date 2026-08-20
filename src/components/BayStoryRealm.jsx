import { useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Lightbulb, RefreshCw } from 'lucide-react';
import DialogueCard from './DialogueCard';
import ChoiceCard from './ChoiceCard';
import ReportBlock from './ReportBlock';
import StampMoment from './StampMoment';
import RealmArt from './RealmArt';
import PhaserMiniGame from '../minigames/PhaserMiniGame';
import { makeOneMoreConfig } from '../minigames/phaser-scenes/oneMoreScene';

/**
 * Balance Bay P4–P6, run as three chapters of one arcade game instead of the
 * shared story → decision → mini-game → rule step machine (RealmScreen.jsx).
 * Opted into with `realm.fullMechanic === 'oneMore'`.
 *
 * The realm's old mechanic was a planning exercise — fill six hours from a
 * pool of cards, watch a beam tilt — and it taught against its own lesson
 * twice. It's a god's-eye view with full information and nothing at stake,
 * which is the one situation in which balance is easy; and it scored a tidy
 * ratio, when the realm's rule says the opposite: counting hours matters less
 * than noticing how you actually feel, in the moment, while it's still fun.
 *
 * So the game is the moment itself (oneMoreScene.js), and this component is
 * the frame around it:
 *
 *   Chapter 1  One More — play, and find out that the toy really does get
 *              worse while the evening gets more expensive. Numbers on.
 *   Chapter 2  You're Basically Fine — the numbers go away. All that's left
 *              are the tells chapter 1 taught you. The realm's decision fires
 *              here, at a "one more?", with the Glimmer insisting you're fine.
 *   Chapter 3  The Bonfire — the next round starts by itself unless you stop
 *              it, and down the beach somebody is waving with a deadline on it.
 *
 * Same division of labour as the other three full-mechanic realms: everything
 * with words in it is plain accessible DOM here; the scene owns only what
 * happens on the beach.
 *
 * **The debrief is where this realm does its teaching**, more than any of the
 * others — because the thing it wants you to notice is invisible while it's
 * happening. `EveningChart` below is the payoff: the shape of the evening you
 * just played, with the moment "one more" stopped being worth it marked on it.
 */
export default function BayStoryRealm({
  realm,
  progress,
  travelerName,
  Icon,
  onSettle,
  onStamp,
  onBackToAtlas,
}) {
  const chapters = useMemo(() => realm.game.levels ?? [realm.game], [realm.game]);

  const [step, setStep] = useState('story'); // story | chapter | round | debrief | rule | stamp
  const [index, setIndex] = useState(0);
  const [beat, setBeat] = useState(0);
  const [run, setRun] = useState(0); // bumping this remounts the scene
  const [pick, setPick] = useState(null);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [meter, setMeter] = useState({ sparks: 0, bonfire: 0, total: 0, rounds: 0 });
  const [evening, setEvening] = useState(null);
  const [cleared, setCleared] = useState([]); // total reached per chapter
  const [beatAcked, setBeatAcked] = useState(false);
  const [beatPick, setBeatPick] = useState(null);

  const sceneRef = useRef(null);

  const accentVars = { '--accent': realm.accent, '--accent-wash': realm.accentWash };
  const level = chapters[index];
  const target = level.target ?? 100;
  const isLast = index >= chapters.length - 1;
  const picked = pick ? realm.decision.options.find((o) => o.id === pick) : null;
  const passed = evening != null && evening.total >= target;

  // The extra beats the curriculum asks for (Improvement Plan §2) land on the
  // chapter whose lesson they belong to. Unlike the Bog and the Peaks, the
  // *shape* of the beat is inferred from the data rather than hard-coded to a
  // known key — a beat with `options` is a question, anything else is
  // something to acknowledge — so naming a new beat costs nothing here.
  const extra = passed && level.beat ? realm.extraBeats?.[level.beat] : null;
  const beatDone = !extra || (extra.options ? Boolean(beatPick) : beatAcked);

  function resetRun() {
    setPick(null);
    setDecisionOpen(false);
    setEvening(null);
    setBeatAcked(false);
    setBeatPick(null);
    setMeter({ sparks: 0, bonfire: level.bonfireStart ?? 60, total: level.bonfireStart ?? 60, rounds: 0 });
  }

  function goToChapter(i, next) {
    const start = chapters[i].bonfireStart ?? 60;
    setIndex(i);
    setPick(null);
    setDecisionOpen(false);
    setEvening(null);
    setBeatAcked(false);
    setBeatPick(null);
    setMeter({ sparks: 0, bonfire: start, total: start, rounds: 0 });
    setStep(next);
  }

  function startChapter(i) {
    goToChapter(i, 'round');
    setRun((r) => r + 1);
  }

  function replay() {
    resetRun();
    setRun((r) => r + 1);
    setStep('round');
  }

  function choose(optionId) {
    setPick(optionId);
    const option = realm.decision.options.find((o) => o.id === optionId);
    if (option.safe) {
      onSettle(realm.id, optionId);
      setDecisionOpen(false);
      sceneRef.current?.resolveDecision(true);
    } else {
      // The tide creeps up where you said it, and the decision comes straight
      // back — never a dead end (design.md §5).
      sceneRef.current?.resolveDecision(false);
    }
  }

  /* --------------------------------------------------------------- render -- */

  if (step === 'stamp') {
    return (
      <div className="fold" style={accentVars}>
        <div className="accent-bar" />
        <StampMoment
          realm={realm}
          angle={progress.stampAngle}
          travelerName={travelerName}
          onBackToAtlas={onBackToAtlas}
        />
      </div>
    );
  }

  /**
   * The meter, when the chapter is willing to show one.
   *
   * Chapter 2 sets `showNumbers: false` and gets `Tells` instead — that isn't
   * a missing feature, it's the chapter. The realm's claim is that the numbers
   * which would tell you how you're doing aren't on offer in the moment, so
   * the game doesn't offer them either.
   */
  const meterBlock = level.showNumbers === false ? (
    <Tells />
  ) : (
    <div className="bog-meter" role="img" aria-label={`The evening is at ${meter.total} out of ${target}`}>
      <span className="bog-meter-label">How the evening&rsquo;s going</span>
      <div className="bog-meter-track">
        <div
          className="bog-meter-fill"
          style={{
            width: `${meter.total}%`,
            background: meter.total >= target ? 'var(--teal)' : 'var(--periwinkle)',
          }}
        />
        <span className="bog-meter-goal" style={{ left: `${target}%` }} />
      </div>
      <span className="bog-meter-read">
        {meter.total} / {target}
      </span>
      <ul className="bay-split">
        <li className="bay-split-fun">
          Fun you&rsquo;ve had <strong>{meter.sparks}</strong>
        </li>
        <li className="bay-split-fire">
          The bonfire <strong>{meter.bonfire}</strong>
        </li>
      </ul>
    </div>
  );

  return (
    <div className="fold" style={accentVars}>
      <div className="accent-bar" />

      <div className="realm-head">
        <span className="badge-ic">
          <Icon size={22} strokeWidth={2.2} />
        </span>
        <div>
          <h2>{realm.name}</h2>
          <span className="pin-label">
            {realm.topic}
            {(step === 'round' || step === 'debrief') && level.chapter ? ` · ${level.chapter}` : ''}
          </span>
        </div>
      </div>

      {/* ---------------------------------------------------------- story -- */}
      {step === 'story' && (
        <div className="stage">
          <div className="stage-main">
            <div className="world" style={{ cursor: 'default' }}>
              <RealmArt realmId={realm.id} mood="before" />
            </div>
          </div>
          <aside className="stage-side">
            {realm.story.slice(0, beat + 1).map((b, i) => (
              <DialogueCard key={i} who={b.who} text={b.text} accent={realm.accent} />
            ))}
            <div className="center">
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => {
                  if (beat < realm.story.length - 1) setBeat((b) => b + 1);
                  else setStep('chapter');
                }}
              >
                {beat < realm.story.length - 1 ? 'Next' : 'Go down to the water'}
                <ArrowRight size={19} />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ------------------------------------------------- chapter opener -- */}
      {step === 'chapter' && (
        <div className="stage">
          <div className="stage-main">
            <div className="world" style={{ cursor: 'default' }}>
              <RealmArt realmId={realm.id} mood="before" />
            </div>
          </div>
          <aside className="stage-side">
            <div className="chapter-card">
              <span className="chapter-kicker">{level.chapter}</span>
              <h3>{level.name}</h3>
              <p>{level.intro}</p>
              {level.goal && (
                <p className="chapter-goal">
                  <Lightbulb size={16} /> {level.goal}
                </p>
              )}
            </div>
            <div className="center">
              <button type="button" className="btn btn-accent" onClick={() => startChapter(index)}>
                Go and play
                <ArrowRight size={19} />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ---------------------------------------------------------- round -- */}
      {step === 'round' && (
        <div className="stage">
          <div className="stage-main">
            <PhaserMiniGame
              key={`${index}-${run}`}
              config={(Phaser) =>
                makeOneMoreConfig(Phaser, {
                  level,
                  onMeter: setMeter,
                  onRound: () => {},
                  onDecisionReached: () => setDecisionOpen(true),
                  onEvening: (result) => {
                    setEvening(result);
                    setStep('debrief');
                  },
                  onSceneReady: (scene) => {
                    sceneRef.current = scene;
                  },
                })
              }
            />
          </div>

          <aside className="stage-side">
            {decisionOpen ? (
              /* The evening is stopped, mid "one more?". */
              <div className="stack">
                <h3>{realm.decision.prompt}</h3>
                <div className="choices">
                  {realm.decision.options.map((option) => (
                    <ChoiceCard
                      key={option.id}
                      option={option}
                      disabled={Boolean(picked)}
                      state={
                        !picked
                          ? 'idle'
                          : picked.id !== option.id
                            ? 'faded'
                            : option.safe
                              ? 'safe'
                              : 'rethink'
                      }
                      onPick={() => choose(option.id)}
                    />
                  ))}
                </div>
                {picked && !picked.safe && (
                  <>
                    <DialogueCard who={picked.who} text={picked.response} accent={realm.accent} />
                    <div className="row" style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-ghost" onClick={() => setPick(null)}>
                        <RefreshCw size={17} />
                        Let me look again
                      </button>
                      {realm.reportBlockEligible !== false && <ReportBlock accent={realm.accent} />}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <p className="instruction">{level.instruction}</p>
                {meterBlock}
                <p className="muted bog-controls">
                  Left and right arrows or <kbd>A</kbd>/<kbd>D</kbd> to move — or just point with
                  the mouse. Catch what the Glimmer throws you. When it asks,{' '}
                  <kbd>&larr;</kbd>/<kbd>&rarr;</kbd> and <kbd>Space</kbd> pick an answer, or click
                  one.
                </p>
                <div className="center">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={replay}>
                    <RefreshCw size={16} />
                    Start this evening again
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* -------------------------------------------------------- debrief -- */}
      {step === 'debrief' && evening && (
        <div className="stage">
          <div className="stage-main">
            <div className="world" style={{ cursor: 'default' }}>
              <RealmArt realmId={realm.id} mood={passed ? 'after' : 'before'} />
            </div>
          </div>
          <aside className="stage-side">
            <div className="chapter-card">
              <span className="chapter-kicker">
                {level.chapter} · {passed ? 'a good evening' : 'not quite'}
              </span>
              <h3>{level.name}</h3>
              <p>{passed ? level.pass : level.retry}</p>
            </div>

            <EveningChart level={level} evening={evening} target={target} />

            {level.lesson && (
              <div className="note-card">
                <strong>What the evening was showing you</strong>
                <p>{level.lesson}</p>
              </div>
            )}

            {extra && (
              <>
                <DialogueCard who={extra.who} text={extra.prompt} accent={realm.accent} />
                {extra.options ? (
                  beatPick ? (
                    <DialogueCard who={extra.who} text={extra.response} accent={realm.accent} />
                  ) : (
                    <div className="row" style={{ justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {extra.options.map((o) => (
                        <button
                          key={o.id}
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setBeatPick(o.id)}
                        >
                          {o.text}
                        </button>
                      ))}
                    </div>
                  )
                ) : beatAcked ? (
                  <DialogueCard who={extra.who} text={extra.followUp} accent={realm.accent} />
                ) : (
                  <div className="center">
                    <button type="button" className="btn btn-accent" onClick={() => setBeatAcked(true)}>
                      {extra.accept}
                    </button>
                  </div>
                )}
              </>
            )}

            <div className="center">
              {passed ? (
                <button
                  type="button"
                  className="btn btn-accent"
                  disabled={!beatDone}
                  onClick={() => {
                    setCleared((c) => [...c, evening.total]);
                    if (isLast) {
                      setStep('rule');
                      return;
                    }
                    goToChapter(index + 1, 'chapter');
                  }}
                >
                  {isLast ? 'Sit down at the bonfire' : `Next: ${chapters[index + 1].name}`}
                  <ArrowRight size={19} />
                </button>
              ) : (
                <button type="button" className="btn btn-accent" onClick={replay}>
                  <RefreshCw size={18} />
                  Try that evening again
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ----------------------------------------------------------- rule -- */}
      {step === 'rule' && (
        <div className="stage">
          <div className="stage-main">
            <div className="world" style={{ cursor: 'default' }}>
              <RealmArt realmId={realm.id} mood="after" />
            </div>
          </div>
          <aside className="stage-side">
            <DialogueCard who={realm.rule.who} text={realm.rule.text} accent={realm.accent} />
            <h4 className="debrief-head">What you took away from the Bay</h4>
            <ul className="notes-list">
              {chapters.map((c, i) => (
                <li key={c.id} className="note-card">
                  <strong>{c.name}</strong>
                  <p>{c.lesson}</p>
                  {cleared[i] != null && (
                    <p className="muted" style={{ marginTop: 6 }}>
                      That evening came out at {cleared[i]}.
                    </p>
                  )}
                </li>
              ))}
            </ul>
            <div className="center">
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => {
                  onStamp(realm.id, cleared.reduce((a, b) => a + b, 0));
                  setStep('stamp');
                }}
              >
                <Check size={19} />
                Stamp my passport
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

/**
 * What you can see when the numbers are gone — chapter 2's replacement for the
 * meter. Not a readout: a reminder of *where to look*, which is the skill the
 * chapter is asking for. It deliberately never says what any of them mean
 * right now; that's the player's job, and the debrief marks it afterwards.
 */
function Tells() {
  const rows = [
    { id: 'you', title: 'You', text: 'Shoulders, hands, whether you’re still smiling.' },
    { id: 'fire', title: 'The bonfire', text: 'How big it still is, down the beach.' },
    { id: 'sky', title: 'The sky', text: 'How dark it’s got since you started.' },
    { id: 'tide', title: 'The tide', text: 'How far up the sand the water has come.' },
  ];
  return (
    <div className="bay-tells">
      <span className="bog-meter-label">No numbers tonight — but you can still see</span>
      <ul>
        {rows.map((r) => (
          <li key={r.id}>
            <strong>{r.title}</strong>
            <span>{r.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The shape of the evening you just played.
 *
 * One axis — evening points — diverging around a neutral zero rule: what each
 * round was **worth** above the line, what it **cost** below it. Read left to
 * right, the moment the gold bar outgrows the periwinkle one is the moment
 * "one more" stopped paying for itself, and that is the entire lesson of this
 * realm in one picture. (Two measures on two y-scales would have invented a
 * relationship; these are the same unit, so they share one.)
 *
 * Rounds the player never reached are drawn faintly from the chapter's own
 * design values, so somebody who quit after round one — the other failure mode
 * — can still see the hump they stopped short of.
 *
 * Colours are the game's own: periwinkle is the Glimmer, gold is the bonfire,
 * exactly as on the beach. The pair passes the categorical checks (adjacent
 * ΔE 34.3 protan / 24.4 tritan, normal 35.4); gold sits below 3:1 on white,
 * which is why every bar is directly labelled and the table below carries
 * every value in text.
 */
function EveningChart({ level, evening, target }) {
  const designed = level.rounds ?? [];
  const log = evening.log ?? [];
  const played = log.length;

  // What each round was worth and cost — played rounds from what actually
  // happened, the rest from the chapter's design.
  const bars = designed.map((def, i) => {
    const actual = log[i];
    return {
      round: i + 1,
      fun: actual ? actual.fun : def.fun,
      cost: def.cost,
      ghost: !actual,
    };
  });

  // Where the hump was: the stopping point with the best total. Computed over
  // the same mixture, so it's the honest answer for the evening as played.
  const bonfireStart = level.bonfireStart ?? 60;
  let sum = 0;
  let fire = bonfireStart;
  const totals = [{ at: 0, total: bonfireStart }];
  for (const b of bars) {
    fire = Math.max(0, fire - b.cost);
    sum += b.fun;
    totals.push({ at: b.round, total: Math.min(100, sum + fire) });
  }
  const best = totals.reduce((a, b) => (b.total > a.total ? b : a));

  // **One scale, both directions.** Worth and cost are the same unit, so they
  // share a single pixels-per-point — scaling them independently would have
  // been a dual axis in disguise, and would have put the visual crossover
  // somewhere other than the real one, which is the single thing this chart
  // exists to show.
  const maxUp = Math.max(...bars.map((b) => b.fun), 1);
  const maxDown = Math.max(...bars.map((b) => b.cost), 1);
  const PX = 56 / Math.max(maxUp, maxDown);
  const UP = Math.ceil(maxUp * PX);
  const DOWN = Math.ceil(maxDown * PX);
  const ZERO = UP + 12;
  const H = ZERO + DOWN + 26;
  const CH_W = 320;
  const slot = CH_W / bars.length;
  const barW = Math.max(8, slot - 10); // the gap between columns is surface, not a border

  return (
    <div className="bay-chart">
      <h4 className="debrief-head">The shape of your evening</h4>

      <ul className="bay-legend">
        <li>
          <span className="bay-key bay-key-fun" /> Fun you had
        </li>
        <li>
          <span className="bay-key bay-key-cost" /> Evening it cost
        </li>
        {played < bars.length && (
          <li>
            <span className="bay-key bay-key-ghost" /> Rounds you didn&rsquo;t play
          </li>
        )}
      </ul>

      <svg viewBox={`0 0 ${CH_W} ${H}`} className="bay-chart-svg" role="img"
        aria-label={`Round by round: what each round of play was worth and what it cost. You stopped after ${played} ${played === 1 ? 'round' : 'rounds'}; the best evening was to stop after ${best.at}.`}>
        {/* the neutral zero rule — a solid hairline, one shade off the surface */}
        <line x1="0" y1={ZERO} x2={CH_W} y2={ZERO} stroke="var(--line-strong)" strokeWidth="1" />

        {bars.map((b, i) => {
          const x = i * slot + (slot - barW) / 2;
          const up = Math.round(b.fun * PX);
          const down = Math.round(b.cost * PX);
          const stopped = b.round === played;
          return (
            <g key={b.round} opacity={b.ghost ? 0.28 : 1}>
              <title>
                Round {b.round}: worth {b.fun}, cost {b.cost}
                {b.ghost ? ' (you never played it)' : ''}
              </title>
              {/* 4px rounded data-ends, anchored to the baseline */}
              <rect x={x} y={ZERO - up} width={barW} height={Math.max(up, 2)} rx="4"
                fill="var(--periwinkle)" />
              <rect x={x} y={ZERO + 2} width={barW} height={Math.max(down, 2)} rx="4"
                fill="var(--gold)" stroke="#a8761f" strokeWidth="1" />
              {/* every bar is labelled: gold sits under 3:1 on white, so the
                  value can never live in the fill alone */}
              <text x={x + barW / 2} y={ZERO - up - 3} className="bay-val" textAnchor="middle">
                {b.fun}
              </text>
              <text x={x + barW / 2} y={ZERO + down + 12} className="bay-val" textAnchor="middle">
                {b.cost}
              </text>
              {stopped && (
                <rect x={x - 3} y={ZERO - up - 14} width={barW + 6} height={up + down + 28} rx="7"
                  fill="none" stroke="var(--ink)" strokeWidth="1.5" />
              )}
            </g>
          );
        })}

        <text x={CH_W / 2} y={H - 3} className="bay-axis" textAnchor="middle">
          each round, left to right
        </text>
      </svg>

      <p className="bay-verdict">
        You stopped after <strong>{played === 0 ? 'no rounds at all' : `round ${played}`}</strong>,
        and the evening came out at <strong>{evening.total}</strong> (you needed {target}).{' '}
        {best.at === played
          ? 'That was the best moment there was to stop.'
          : best.at === 0
            ? 'Playing at all was worth it — the first round was the best thing in the evening.'
            : `The best moment to stop was after round ${best.at}, worth ${best.total}.`}
      </p>

      {/* The table view. Not a fallback — it's how every value stays readable
          without relying on a fill colour, which the gold does not have the
          contrast to do on its own. */}
      <table className="bay-table">
        <caption className="sr-only">Every round: what it was worth and what it cost</caption>
        <thead>
          <tr>
            <th scope="col">Round</th>
            <th scope="col">Worth</th>
            <th scope="col">Cost</th>
            <th scope="col">Caught</th>
          </tr>
        </thead>
        <tbody>
          {bars.map((b) => {
            const actual = log[b.round - 1];
            return (
              <tr key={b.round} className={b.ghost ? 'ghost' : b.round === played ? 'stopped' : ''}>
                <th scope="row">{b.round}</th>
                <td>{b.fun}</td>
                <td>{b.cost}</td>
                <td>{actual ? `${actual.caught}/${actual.thrown}` : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
