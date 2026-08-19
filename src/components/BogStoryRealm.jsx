import { useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Lightbulb, RefreshCw } from 'lucide-react';
import DialogueCard from './DialogueCard';
import ChoiceCard from './ChoiceCard';
import ReportBlock from './ReportBlock';
import StampMoment from './StampMoment';
import RealmArt from './RealmArt';
import PhaserMiniGame from '../minigames/PhaserMiniGame';
import { makeBogCurrentConfig } from '../minigames/phaser-scenes/bogCurrentScene';

/**
 * Bully Bog P4–P6, run as three chapters of one arcade game instead of the
 * shared story → decision → mini-game → rule step machine (RealmScreen.jsx).
 * Opted into with `realm.fullMechanic === 'bogCurrent'`.
 *
 * The realm's problem was length and stakes: one sort of eight comments, over
 * in well under a minute, with no cost to getting one wrong. Bully Bog is the
 * realm where the child is a *bystander* — and a bystander's real difficulty
 * isn't telling kind from cruel on a card, it's that things are happening at
 * once and doing nothing is the easy option. So the mechanic is now a current
 * you're working against (bogCurrentScene.js), and this component is the
 * frame around it:
 *
 *   Chapter 1  One Comment at a Time — kind, cruel, and the comment you send
 *              yourself. The realm's decision fires here, mid-round, with the
 *              pile-on comment still sitting in the water.
 *   Chapter 2  The Pile-On — faster, and mean comments now arrive with a tail
 *              of "lol true" replies and gather likes while they sit.
 *   Chapter 3  About Who You Are — identity-based comments too heavy to lift
 *              alone, which only the heron (a trusted adult) will take.
 *
 * Same division of labour as PlatformerStoryRealm: everything with words in
 * it — chapter cards, the decision, the debrief, the rule — is plain
 * accessible DOM here; the scene owns only what happens in the water.
 *
 * **Deliberate design constraint:** nothing tells the player which comment is
 * which until the debrief. The cards are identical paper, the meter moves on
 * everything, and each comment's `why` is only read out after the round. The
 * judgement is the game.
 */
export default function BogStoryRealm({
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
  const [round, setRound] = useState(0); // bumping this remounts the scene
  const [pick, setPick] = useState(null);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [clarity, setClarity] = useState(0);
  const [entries, setEntries] = useState([]); // this chapter's resolved comments
  const [finalClarity, setFinalClarity] = useState(null);
  const [cleared, setCleared] = useState([]); // clarity reached per chapter
  const [beatAcked, setBeatAcked] = useState(false); // the debrief's extra beat
  const [tellPick, setTellPick] = useState(null);

  const sceneRef = useRef(null);

  const accentVars = { '--accent': realm.accent, '--accent-wash': realm.accentWash };
  const level = chapters[index];
  const target = level.target ?? 100;
  const isLast = index >= chapters.length - 1;
  const picked = pick ? realm.decision.options.find((o) => o.id === pick) : null;
  const passed = finalClarity != null && finalClarity >= target;
  // The two post-decision beats the curriculum asks for (Improvement Plan §2)
  // live on the chapter whose lesson they belong to rather than in a run of
  // cards after the decision: the digital-footprint question lands on the
  // pile-on debrief, and "who would you tell" on the heron chapter's, right
  // after the game has just made the player go and fetch an adult.
  const extra = passed && level.beat ? realm.extraBeats?.[level.beat] : null;
  const beatDone = !extra || (level.beat === 'tellSomeone' ? Boolean(tellPick) : beatAcked);

  /** Everything one run of one chapter owns. */
  function resetRound() {
    setPick(null);
    setDecisionOpen(false);
    setEntries([]);
    setFinalClarity(null);
    setBeatAcked(false);
    setTellPick(null);
    setClarity(level.startClarity ?? 40);
  }

  /** Land on a chapter, with nothing carried over from the last one. */
  function goToChapter(i, next) {
    setIndex(i);
    setPick(null);
    setDecisionOpen(false);
    setEntries([]);
    setFinalClarity(null);
    setBeatAcked(false);
    setTellPick(null);
    setClarity(chapters[i].startClarity ?? 40);
    setStep(next);
  }

  function startChapter(i) {
    goToChapter(i, 'round');
    setRound((r) => r + 1);
  }

  function replay() {
    resetRound();
    setRound((r) => r + 1);
    setStep('round');
  }

  function choose(optionId) {
    setPick(optionId);
    const option = realm.decision.options.find((o) => o.id === optionId);
    if (option.safe) {
      onSettle(realm.id, optionId);
      setDecisionOpen(false);
      sceneRef.current?.resolveDecision(true, level.ownComment);
    } else {
      // The water darkens where you said it, and the decision comes straight
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

  const meter = (
    <div className="bog-meter" role="img" aria-label={`The water is ${clarity} percent clear`}>
      <span className="bog-meter-label">The water</span>
      <div className="bog-meter-track">
        <div
          className="bog-meter-fill"
          style={{ width: `${clarity}%`, background: clarity >= target ? 'var(--teal)' : undefined }}
        />
        <span className="bog-meter-goal" style={{ left: `${target}%` }} />
      </div>
      <span className="bog-meter-read">
        {clarity} / {target} clear
      </span>
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
                {beat < realm.story.length - 1 ? 'Next' : 'Get in the boat'}
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
            <Stations level={level} />
            <div className="center">
              <button type="button" className="btn btn-accent" onClick={() => startChapter(index)}>
                Push off
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
              key={`${index}-${round}`}
              config={(Phaser) =>
                makeBogCurrentConfig(Phaser, {
                  level,
                  onClarity: setClarity,
                  onResolve: (entry) => setEntries((e) => [...e, entry]),
                  onDecisionReached: () => setDecisionOpen(true),
                  onRoundEnd: ({ clarity: end }) => {
                    setFinalClarity(end);
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
              /* The current is stopped, and the comment is still up there. */
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
                {meter}
                <Stations level={level} compact />
                <p className="muted bog-controls">
                  Arrow keys or <kbd>WASD</kbd> to paddle — or just point with the mouse.{' '}
                  <kbd>Space</kbd> or a click scoops up the nearest comment, and press again at a
                  station to drop it. Comments you never touch drift on past.
                </p>
                {entries.length > 0 && (
                  <ul className="bog-feed">
                    {entries.slice(-4).reverse().map((e, i) => (
                      <li key={`${e.id}-${i}`} className={e.ok ? 'good' : 'weak'}>
                        {e.note}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="center">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={replay}>
                    <RefreshCw size={16} />
                    Start this stretch again
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* -------------------------------------------------------- debrief -- */}
      {/* Only here does the game say what each comment actually was. Before
          the round ended, that would have been the answer sheet. */}
      {step === 'debrief' && (
        <div className="stage">
          <div className="stage-main">
            <div className="world" style={{ cursor: 'default' }}>
              <RealmArt realmId={realm.id} mood={passed ? 'after' : 'before'} />
            </div>
          </div>
          <aside className="stage-side">
            <div className="chapter-card">
              <span className="chapter-kicker">
                {level.chapter} · {passed ? 'the water cleared' : 'still murky'}
              </span>
              <h3>{level.name}</h3>
              <p>{passed ? level.pass : level.retry}</p>
            </div>

            {meter}

            <h4 className="debrief-head">Every comment, and what it really was</h4>
            <ul className="debrief-list bog-debrief">
              {entries
                .filter((e) => !e.follower)
                .map((e, i) => (
                  <li key={`${e.id}-${i}`} className={e.ok ? 'good' : 'weak'}>
                    <code>{e.text}</code>
                    <span className="debrief-verdict">
                      {KIND_LABEL[e.kind]} · {ACTION_LABEL[e.action] ?? e.action}
                    </span>
                    {e.why && <p>{e.why}</p>}
                  </li>
                ))}
            </ul>

            {level.lesson && (
              <div className="note-card">
                <strong>What the water was showing you</strong>
                <p>{level.lesson}</p>
              </div>
            )}

            {extra && level.beat === 'footprint' && (
              <>
                <DialogueCard who={extra.who} text={extra.prompt} accent={realm.accent} />
                {beatAcked ? (
                  <DialogueCard who={extra.who} text={extra.followUp} accent={realm.accent} />
                ) : (
                  <div className="center">
                    <button
                      type="button"
                      className="btn btn-accent"
                      onClick={() => setBeatAcked(true)}
                    >
                      {extra.accept}
                    </button>
                  </div>
                )}
              </>
            )}

            {extra && level.beat === 'tellSomeone' && (
              <>
                <DialogueCard who={extra.who} text={extra.prompt} accent={realm.accent} />
                {tellPick ? (
                  <DialogueCard who={extra.who} text={extra.response} accent={realm.accent} />
                ) : (
                  <div className="row" style={{ justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {extra.options.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setTellPick(o.id)}
                      >
                        {o.text}
                      </button>
                    ))}
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
                    setCleared((c) => [...c, finalClarity]);
                    if (isLast) {
                      setStep('rule');
                      return;
                    }
                    goToChapter(index + 1, 'chapter');
                  }}
                >
                  {isLast ? 'Come ashore' : `Next: ${chapters[index + 1].name}`}
                  <ArrowRight size={19} />
                </button>
              ) : (
                <button type="button" className="btn btn-accent" onClick={replay}>
                  <RefreshCw size={18} />
                  Take that stretch again
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
            <h4 className="debrief-head">What you carried out of the Bog</h4>
            <ul className="notes-list">
              {chapters.map((c, i) => (
                <li key={c.id} className="note-card">
                  <strong>{c.name}</strong>
                  <p>{c.lesson}</p>
                  {cleared[i] != null && (
                    <p className="muted" style={{ marginTop: 6 }}>
                      You got the water to {cleared[i]}% clear.
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

const KIND_LABEL = {
  kind: 'Kind',
  mean: 'Cruel',
  fair: 'Honest, not cruel',
  heavy: 'About who Pockets is',
};

const ACTION_LABEL = {
  pockets: 'you showed it to Pockets',
  report: 'you reported it',
  heron: 'you took it to the heron',
  chain: 'went with the comment it piled onto',
  landed: 'you let it land',
  drifted: 'you left it alone',
};

/**
 * What the three stations on the bank are for. Shown on the chapter card and
 * again, smaller, beside the running game — a player who forgets which one
 * takes what shouldn't have to lose a round to find out.
 */
function Stations({ level, compact = false }) {
  const rows = [
    { id: 'report', title: 'Report', text: 'Takes a comment out of the water before it lands.' },
    {
      id: 'pockets',
      title: 'Pockets',
      text: 'Shows a comment to Pockets. This is the only thing that makes the water clearer.',
    },
  ];
  if (level.hasHeron) {
    rows.push({
      id: 'heron',
      title: 'Ask the heron',
      text: 'A grown-up. Some comments are too heavy for the basket and only go here.',
    });
  }

  return (
    <ul className={`bog-stations${compact ? ' compact' : ''}`}>
      {rows.map((r) => (
        <li key={r.id} className={`bog-station bog-station-${r.id}`}>
          <strong>{r.title}</strong>
          <span>{r.text}</span>
        </li>
      ))}
    </ul>
  );
}
