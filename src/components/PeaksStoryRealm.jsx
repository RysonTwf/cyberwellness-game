import { useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Lightbulb, RefreshCw } from 'lucide-react';
import DialogueCard from './DialogueCard';
import ChoiceCard from './ChoiceCard';
import ReportBlock from './ReportBlock';
import StampMoment from './StampMoment';
import RealmArt from './RealmArt';
import PhaserMiniGame from '../minigames/PhaserMiniGame';
import { makeFogLineConfig } from '../minigames/phaser-scenes/fogLineScene';

/**
 * Privacy Peaks P4–P6, run as three chapters of one arcade game instead of
 * the shared story → decision → mini-game → rule step machine
 * (RealmScreen.jsx). Opted into with `realm.fullMechanic === 'fogLine'`.
 *
 * The realm's problem wasn't only length. Its old mechanic — six stepping
 * stones, read each message, step or skip — asked the player to *judge a
 * message by reading it*, which is precisely the skill a decent scam is
 * designed to defeat. The realm's own rule says so: looking official is the
 * easiest part to fake, so go and check by a route you chose. A mechanic that
 * rewards reading teaches against its own lesson.
 *
 * So the game is now a ridge, a line of pegged messages, and three posts you
 * carry them to (fogLineScene.js). This component is the frame around it:
 *
 *   Chapter 1  Who's Actually Talking — the two commits, the spyglass, and
 *              the discovery that being right by instinct is worth a fraction
 *              of being right on purpose.
 *   Chapter 2  Looks Right, Isn't — the signal fire, and messages where the
 *              sender genuinely is who it claims. The realm's decision fires
 *              here, mid-round, with that message still hanging on the line.
 *   Chapter 3  What They're Really After — `heavy` messages that ask for
 *              something about *you*. The waypost refuses them; only the
 *              ranger's hut takes them.
 *
 * Same division of labour as PlatformerStoryRealm and BogStoryRealm:
 * everything with words in it — chapter cards, the decision, the debrief, the
 * rule — is plain accessible DOM here; the scene owns only what happens on the
 * ridge.
 *
 * **Deliberate design constraint:** nothing tells the player which message is
 * which until the debrief. The notes are identical paper, the meter moves on
 * everything, and each message's `why` is only read out after the round. The
 * judgement is the game.
 */
export default function PeaksStoryRealm({
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
  const [visibility, setVisibility] = useState(0);
  const [entries, setEntries] = useState([]); // this chapter's resolved messages
  const [finalVisibility, setFinalVisibility] = useState(null);
  const [cleared, setCleared] = useState([]); // visibility reached per chapter
  const [beatAcked, setBeatAcked] = useState(false); // the debrief's extra beat
  const [tellPick, setTellPick] = useState(null);

  const sceneRef = useRef(null);

  const accentVars = { '--accent': realm.accent, '--accent-wash': realm.accentWash };
  const level = chapters[index];
  const target = level.target ?? 100;
  const isLast = index >= chapters.length - 1;
  const picked = pick ? realm.decision.options.find((o) => o.id === pick) : null;
  const passed = finalVisibility != null && finalVisibility >= target;
  // The two post-decision beats the curriculum asks for (Improvement Plan §2)
  // live on the chapter whose lesson they belong to rather than in a run of
  // cards after the decision: the digital-footprint question lands on the
  // chapter where something was nearly typed into a fake page, and "who would
  // you tell" on the ranger chapter's, right after the game has just made the
  // player go and fetch an adult.
  const extra = passed && level.beat ? realm.extraBeats?.[level.beat] : null;
  const beatDone = !extra || (level.beat === 'tellSomeone' ? Boolean(tellPick) : beatAcked);

  /** Everything one run of one chapter owns. */
  function resetRound() {
    setPick(null);
    setDecisionOpen(false);
    setEntries([]);
    setFinalVisibility(null);
    setBeatAcked(false);
    setTellPick(null);
    setVisibility(level.startVisibility ?? 36);
  }

  /** Land on a chapter, with nothing carried over from the last one. */
  function goToChapter(i, next) {
    setIndex(i);
    setPick(null);
    setDecisionOpen(false);
    setEntries([]);
    setFinalVisibility(null);
    setBeatAcked(false);
    setTellPick(null);
    setVisibility(chapters[i].startVisibility ?? 36);
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
      sceneRef.current?.resolveDecision(true, level.afterDecision);
    } else {
      // The fog closes in where you said it, and the decision comes straight
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
    <div className="bog-meter" role="img" aria-label={`You can see ${visibility} percent of the way`}>
      <span className="bog-meter-label">How far you can see</span>
      <div className="bog-meter-track">
        <div
          className="bog-meter-fill"
          style={{
            width: `${visibility}%`,
            background: visibility >= target ? 'var(--teal)' : undefined,
          }}
        />
        <span className="bog-meter-goal" style={{ left: `${target}%` }} />
      </div>
      <span className="bog-meter-read">
        {visibility} / {target} clear
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
                {beat < realm.story.length - 1 ? 'Next' : 'Walk out onto the ridge'}
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
            <Posts level={level} />
            <div className="center">
              <button type="button" className="btn btn-accent" onClick={() => startChapter(index)}>
                Set off
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
                makeFogLineConfig(Phaser, {
                  level,
                  onVisibility: setVisibility,
                  onResolve: (entry) => setEntries((e) => [...e, entry]),
                  onDecisionReached: () => setDecisionOpen(true),
                  onRoundEnd: ({ visibility: end }) => {
                    setFinalVisibility(end);
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
              /* The ridge is stopped, and the message is still hanging there. */
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
                <Posts level={level} compact />
                <p className="muted bog-controls">
                  Left and right arrows or <kbd>A</kbd>/<kbd>D</kbd> to walk — or just point with
                  the mouse. <kbd>Space</kbd> or a click lifts the message you&rsquo;re standing
                  under, and again at either end of the ridge to commit.{' '}
                  <strong>Hold</strong> it at a post to check — checks take a moment, and the wind
                  doesn&rsquo;t wait.
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
                    Walk this stretch again
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* -------------------------------------------------------- debrief -- */}
      {/* Only here does the game say what each message actually was. Before
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
                {level.chapter} · {passed ? 'the fog lifted' : 'still fogged in'}
              </span>
              <h3>{level.name}</h3>
              <p>{passed ? level.pass : level.retry}</p>
            </div>

            {meter}

            <h4 className="debrief-head">Every message, and what it really was</h4>
            <ul className="debrief-list peak-debrief">
              {entries.map((e, i) => (
                <li key={`${e.id}-${i}`} className={e.ok ? 'good' : 'weak'}>
                  <span className="peak-from">{e.from}</span>
                  <code>{e.text}</code>
                  <span className="debrief-verdict">
                    {KIND_LABEL[e.kind]} · {ACTION_LABEL[e.action] ?? e.action}
                    {e.action !== 'blown' && (
                      <em className={e.solved ? 'peak-checked' : 'peak-unchecked'}>
                        {e.solved ? ' · checked first' : ' · never checked'}
                      </em>
                    )}
                  </span>
                  {e.why && <p>{e.why}</p>}
                </li>
              ))}
            </ul>

            {level.lesson && (
              <div className="note-card">
                <strong>What the fog was showing you</strong>
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
                    setCleared((c) => [...c, finalVisibility]);
                    if (isLast) {
                      setStep('rule');
                      return;
                    }
                    goToChapter(index + 1, 'chapter');
                  }}
                >
                  {isLast ? 'Take the path down' : `Next: ${chapters[index + 1].name}`}
                  <ArrowRight size={19} />
                </button>
              ) : (
                <button type="button" className="btn btn-accent" onClick={replay}>
                  <RefreshCw size={18} />
                  Walk that stretch again
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
            <h4 className="debrief-head">What you carried down off the Peaks</h4>
            <ul className="notes-list">
              {chapters.map((c, i) => (
                <li key={c.id} className="note-card">
                  <strong>{c.name}</strong>
                  <p>{c.lesson}</p>
                  {cleared[i] != null && (
                    <p className="muted" style={{ marginTop: 6 }}>
                      You cleared the air to {cleared[i]}%.
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
  bait: 'A scam',
  real: 'Genuine, and it mattered',
  noise: 'Genuine, and harmless',
  heavy: 'Asking for something about you',
};

const ACTION_LABEL = {
  drop: 'you let it go',
  gate: 'you did what it said',
  hut: 'you took it to the ranger',
  blown: 'the wind took it',
};

/**
 * What the posts along the ridge are for. Shown on the chapter card and again,
 * smaller, beside the running game — a player who forgets which one does what
 * shouldn't have to lose a round to find out.
 *
 * Only the posts a chapter actually opens are listed, so chapter 1 isn't
 * carrying a paragraph about a hut that isn't there yet.
 */
function Posts({ level, compact = false }) {
  const open = level.posts ?? ['spy'];
  const rows = [
    {
      id: 'spy',
      title: 'The spyglass — hold',
      text: 'Look at who actually sent it: the address underneath, not the name on top.',
    },
    {
      id: 'fire',
      title: 'The signal fire — hold',
      text: 'Check it the official way, by a route you picked rather than the one the message handed you.',
    },
    {
      id: 'hut',
      title: 'The ranger — hold',
      text: 'A grown-up. Some messages aren’t yours to answer at all, and this is the only place they go.',
    },
  ].filter((r) => open.includes(r.id));

  rows.push(
    {
      id: 'drop',
      title: 'Let it go',
      text: 'The windward edge. Nothing happens to you, and nothing happens for you either.',
    },
    {
      id: 'gate',
      title: 'Do it',
      text: 'The waypost. Reply, click, hand over whatever it asked for.',
    },
  );

  return (
    <ul className={`bog-stations peak-posts${compact ? ' compact' : ''}`}>
      {rows.map((r) => (
        <li key={r.id} className={`bog-station peak-post-${r.id}`}>
          <strong>{r.title}</strong>
          <span>{r.text}</span>
        </li>
      ))}
    </ul>
  );
}
