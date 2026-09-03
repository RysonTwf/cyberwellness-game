import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, RefreshCw, Lock, LockOpen } from 'lucide-react';
import DialogueCard from './DialogueCard';
import ChoiceCard from './ChoiceCard';
import ReportBlock from './ReportBlock';
import StampMoment from './StampMoment';
import StepTrail from './StepTrail';
import MethodTrack from './MethodTrack';
import RealmArt from './RealmArt';
import MiniGameSort from '../minigames/MiniGameSort';
import PhaserMiniGame from '../minigames/PhaserMiniGame';
import { makePasswordFortressLevelConfig } from '../minigames/phaser-scenes/passwordFortressLevelScene';
import { pauseMusic, resumeMusic } from '../lib/music';

/**
 * A realm whose entire experience — story, the decision, the mini-game —
 * happens inside one continuous Phaser level, instead of the shared
 * walk-to-a-hotspot / open-a-panel pattern every other realm uses
 * (RealmScreen.jsx). Currently just Passworld P4–P6 ("entirely platformer,"
 * by request) — opted into via `realm.fullMechanic === 'platformerStory'`.
 *
 * The *content* (story/decision/rule text) is identical to what a normal
 * realm would use — this only changes *delivery*: the decision fires when
 * the player reaches an encounter zone in the level rather than a click,
 * and a locked gate (not a disabled button) is what actually blocks
 * progress until it resolves safely. Story and rule stay plain DOM
 * (DialogueCard) either side of the level, same accessible pattern as
 * everywhere else in the game — only the decision + game are truly
 * "inside" the platformer.
 */
export default function PlatformerStoryRealm({
  realm,
  progress,
  travelerName,
  onSettle,
  onStamp,
  onBackToAtlas,
}) {
  const [step, setStep] = useState('story'); // story | level | check | rule | stamp
  const [beat, setBeat] = useState(0);
  const [pick, setPick] = useState(null);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [collected, setCollected] = useState(0);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  // Everything picked up off the level, strong and weak alike, in the order
  // it was found — the door's question is asked against this.
  const [bag, setBag] = useState([]);
  const [doorOpen, setDoorOpen] = useState(false);
  const [chosen, setChosen] = useState([]); // ids ticked at the door
  const [verdict, setVerdict] = useState(null); // null | 'short' | 'wrong' | 'passed'

  const controlsRef = useRef({ left: false, right: false, jump: false });
  const sceneRef = useRef(null);
  // On a phone or a tablet the controls belong on the level itself, thumbs
  // resting at the bottom corners. On a desktop the keyboard does the job and
  // the row of buttons beside the level is there for a mouse.
  const [touchControls, setTouchControls] = useState(false);

  const accentVars = { '--accent': realm.accent, '--accent-wash': realm.accentWash };
  const total = realm.game.tiles.filter((t) => t.kind === 'real').length;
  const picked = pick ? realm.decision.options.find((o) => o.id === pick) : null;

  // The journey's background loop (App.jsx) steps aside for the level itself,
  // which carries its own game audio, and comes back for the story/check/rule
  // beats either side of it. Leaving early (the back button unmounts this
  // component mid-level) still resumes it via the cleanup.
  useEffect(() => {
    if (step !== 'level') return undefined;
    pauseMusic();
    return () => resumeMusic();
  }, [step]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const query = window.matchMedia('(pointer: coarse)');
    const apply = () => setTouchControls(query.matches);
    apply();
    query.addEventListener('change', apply);
    return () => query.removeEventListener('change', apply);
  }, []);

  // A panel taking over (Sam's question, the vault door) hides the buttons.
  // Let go of whatever was held down as they go, or the player carries on
  // running the moment the level unfreezes.
  useEffect(() => {
    if (decisionOpen || doorOpen) {
      controlsRef.current = { left: false, right: false, jump: false };
    }
  }, [decisionOpen, doorOpen]);

  function choose(optionId) {
    setPick(optionId);
    const option = realm.decision.options.find((o) => o.id === optionId);
    if (option.safe) {
      // Record the choice, but keep the panel up: the safe response and the
      // Report & Block option show first (see the `decisionOpen` block below),
      // then `carryOn` opens the gate. Report & Block belongs on the safe
      // path too, not only when the decision is picked wrong.
      onSettle(realm.id, optionId);
    }
  }

  function carryOn() {
    setDecisionOpen(false);
    sceneRef.current?.resolveSafe();
  }

  // Held down, not clicked: the key stays true while the finger or the mouse
  // button is down. `onTouchCancel` matters on a phone, where the browser can
  // take a touch away mid-press (a notification, a stray second finger) and no
  // `touchend` ever arrives, which would leave the player running on its own.
  // Scrolling and pinch-zooming are turned off by `touch-action: none` on the
  // buttons themselves rather than by `preventDefault` here: React listens for
  // touches passively, so a `preventDefault` in this handler is ignored and
  // only fills the console with warnings.
  const hold = (key) => ({
    onMouseDown: () => { controlsRef.current[key] = true; },
    onMouseUp: () => { controlsRef.current[key] = false; },
    onMouseLeave: () => { controlsRef.current[key] = false; },
    onTouchStart: () => { controlsRef.current[key] = true; },
    onTouchEnd: () => { controlsRef.current[key] = false; },
    onTouchCancel: () => { controlsRef.current[key] = false; },
    onContextMenu: (e) => e.preventDefault(),
  });

  function restartLevel() {
    setPick(null);
    setDecisionOpen(false);
    setCollected(0);
    setBag([]);
    setDoorOpen(false);
    setChosen([]);
    setVerdict(null);
    controlsRef.current = { left: false, right: false, jump: false };
    setRound((r) => r + 1);
  }

  const strongInBag = bag.filter((t) => t.kind === 'real');
  const hasEveryStrong = strongInBag.length >= total;

  /**
   * The door's question. Two separate gates, deliberately:
   * first, are all the strong pieces even in the bag — if not there's nothing
   * to test yet and they're turned away; then, can they pick those out from
   * the weak ones they also carried up here. Getting it wrong costs nothing
   * but another go (design.md §8), it just doesn't open.
   */
  function answerDoor() {
    if (!hasEveryStrong) {
      setVerdict('short');
      return;
    }
    const wantedIds = strongInBag.map((t) => t.id).sort();
    const gotIds = [...chosen].sort();
    const exact =
      wantedIds.length === gotIds.length && wantedIds.every((id, i) => id === gotIds[i]);
    if (!exact) {
      setVerdict('wrong');
      return;
    }
    setVerdict('passed');
    setDoorOpen(false);
    setScore(strongInBag.length);
    sceneRef.current?.resolveDoor(true);
  }

  function leaveDoor(message) {
    setDoorOpen(false);
    setVerdict(null);
    setChosen([]);
    sceneRef.current?.resolveDoor(false, message);
  }

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

  return (
    <div className="fold" style={accentVars}>
      <div className="accent-bar" />

      {/* Realm name/topic/icon are in the journal bar (JournalProgress) —
          see RealmScreen for why the heading row moved up there. Only three
          steps here: the choice and the game are one continuous vault run. */}
      <StepTrail
        steps={realm.privacyCheck ? ['Story', 'The vault', 'Check', 'Rule'] : ['Story', 'The vault', 'Rule']}
        current={
          (realm.privacyCheck
            ? { story: 0, level: 1, check: 2, rule: 3 }
            : { story: 0, level: 1, rule: 2 })[step] ?? 0
        }
      />

      {/* ---------------------------------------------------------- story -- */}
      {step === 'story' && (
        <div className="stage">
          <div className="stage-main">
            <div className="world" style={{ cursor: 'default' }}>
              <div className="world-scene">
                <RealmArt realmId={realm.id} mood="before" />
              </div>
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
                  else setStep('level');
                }}
              >
                {beat < realm.story.length - 1 ? 'Next' : 'Enter the vault'}
                <ArrowRight size={19} />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ---------------------------------------------------------- level -- */}
      {step === 'level' && (
        // The level fills the window; the instruction, progress readout,
        // d-pad and the Sam decision all sit in the column beside it, so
        // nothing pushes the game off-screen.
        <div className="stage">
          <div className="stage-main">
            <PhaserMiniGame
            key={round}
            config={(Phaser) =>
              makePasswordFortressLevelConfig(Phaser, {
                game: realm.game,
                controlsRef,
                onDecisionReached: () => setDecisionOpen(true),
                onProgress: (n) => setCollected(n),
                onCollect: (tile) =>
                  setBag((b) => (b.some((t) => t.id === tile.id) ? b : [...b, tile])),
                onDoorReached: () => {
                  setVerdict(null);
                  setChosen([]);
                  setDoorOpen(true);
                },
                onWin: (finalScore) => {
                  setScore((s) => s || finalScore);
                  setStep(realm.privacyCheck ? 'check' : 'rule');
                },
                onSceneReady: (scene) => {
                  sceneRef.current = scene;
                },
              })
            }
            >
              {/* On a touch screen the controls sit on the level itself:
                  left in the bottom left corner, right in the bottom right
                  corner, and jump just above right, so both thumbs rest where
                  they already are. They step out of the way while Sam's
                  question or the vault door is on screen, because the level is
                  frozen then anyway. */}
              {touchControls && !decisionOpen && !doorOpen && (
                <div className="level-pad">
                  <button
                    type="button"
                    className="level-pad-btn level-pad-left"
                    aria-label="Move left"
                    {...hold('left')}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="level-pad-btn level-pad-jump"
                    aria-label="Jump"
                    {...hold('jump')}
                  >
                    Jump
                  </button>
                  <button
                    type="button"
                    className="level-pad-btn level-pad-right"
                    aria-label="Move right"
                    {...hold('right')}
                  >
                    →
                  </button>
                </div>
              )}
            </PhaserMiniGame>
          </div>

          <aside className="stage-side">
          {doorOpen && (
            <div className="stack">
              <h3>The vault door</h3>

              {/* The three tests to judge each piece against, on screen while
                  you choose. The pieces themselves are shown plain on purpose:
                  marking the strong ones teal-and-padlocked at the door handed
                  over the answer, so ticking the green ones took no judgement
                  at all. L.M.N. is what replaces that, something to reason
                  from rather than a colour to follow. */}
              <MethodTrack purpose={realm.game.purpose} cleared={new Set()} />

              {!hasEveryStrong && verdict !== 'short' && (
                <p className="instruction">
                  The keypad wants the whole password. Tick the pieces you think make it strong,
                  and leave the easy-to-guess ones out. Not every short one is strong, and not
                  every word-shaped one is weak.
                </p>
              )}

              {verdict === 'short' && (
                <DialogueCard
                  who="Comet"
                  accent={realm.accent}
                  text={`You do not have all the right pieces yet. ${strongInBag.length} of ${total} so far. The door will not open on a half-built password. Go back and find the rest.`}
                />
              )}

              {verdict === 'wrong' && (
                <DialogueCard
                  who="Comet"
                  accent={realm.accent}
                  text="That is not the set. Something you ticked would be easy for someone to guess, or something strong got left out. Read them again and try once more."
                />
              )}

              {verdict !== 'short' && (
                <>
                  <div className="bag-grid">
                    {bag.map((t) => {
                      const on = chosen.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          className={`bag-chip${on ? ' on' : ''}`}
                          aria-pressed={on}
                          aria-label={t.label}
                          onClick={() =>
                            setChosen((c) =>
                              c.includes(t.id) ? c.filter((x) => x !== t.id) : [...c, t.id],
                            )
                          }
                        >
                          {on ? <Lock size={12} /> : <LockOpen size={12} />}
                          {t.label}
                        </button>
                      );
                    })}
                    {bag.length === 0 && <p className="muted">Your bag is empty.</p>}
                  </div>
                  <p className="tile-hint">
                    Tap a piece to put it in the password. Tap it again to take it back out.
                  </p>
                  <button
                    type="button"
                    className="btn btn-accent"
                    disabled={chosen.length === 0}
                    onClick={answerDoor}
                  >
                    <Check size={19} />
                    Enter the password
                  </button>
                </>
              )}

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() =>
                  leaveDoor(
                    hasEveryStrong ? 'Have another look at what you have.' : 'Some pieces are still out there.',
                  )
                }
              >
                Step back
              </button>
            </div>
          )}

          {!decisionOpen && !doorOpen && (
            <>
              <p className="instruction">{realm.game.instruction}</p>
              {/* Count only. Showing "x of 6 strong" as they went told them
                  which pickups had counted the moment they touched one. */}
              <p className="tile-hint">In the bag: {bag.length}</p>
              {/* The same three controls for a mouse. On a touch screen they
                  are on the level itself instead, so this row stands down. */}
              {!touchControls && (
                <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ minWidth: 56, minHeight: 48, touchAction: 'none' }}
                    aria-label="Move left"
                    {...hold('left')}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ minWidth: 72, minHeight: 48, touchAction: 'none' }}
                    aria-label="Jump"
                    {...hold('jump')}
                  >
                    Jump
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ minWidth: 56, minHeight: 48, touchAction: 'none' }}
                    aria-label="Move right"
                    {...hold('right')}
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}

          {/* The world froze the moment the player reached Sam — same
              decision content and Report & Block option every other realm
              uses, just triggered by the level instead of a hotspot. Report &
              Block sits on both branches: a player who verifies (the safe
              choice) still meets it, before the gate opens. */}
          {decisionOpen && (
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

              {picked && (
                <>
                  <DialogueCard who={picked.who} text={picked.response} accent={realm.accent} />
                  <div className="row" style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                    {picked.safe ? (
                      <button type="button" className="btn btn-accent" onClick={carryOn}>
                        Carry on
                        <ArrowRight size={19} />
                      </button>
                    ) : (
                      <button type="button" className="btn btn-ghost" onClick={() => setPick(null)}>
                        <RefreshCw size={17} />
                        Let me look again
                      </button>
                    )}
                    {realm.reportBlockEligible !== false && <ReportBlock accent={realm.accent} />}
                  </div>
                </>
              )}
            </div>
          )}

          <div className="row panel-actions" style={{ justifyContent: 'center' }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={restartLevel}>
              <RefreshCw size={16} />
              Restart this vault
            </button>
          </div>
          </aside>
        </div>
      )}

      {/* --------------------------------------------------------- check -- */}
      {step === 'check' && realm.privacyCheck && (
        <div className="stage">
          <div className="stage-main">
            <div className="world" style={{ cursor: 'default' }}>
              <div className="world-scene">
                <RealmArt realmId={realm.id} mood="before" />
              </div>
            </div>
          </div>
          <aside className="stage-side">
            <MiniGameSort
              game={realm.privacyCheck}
              onComplete={(result) => {
                setScore((s) => s + result);
                setStep('rule');
              }}
            />
          </aside>
        </div>
      )}

      {/* ----------------------------------------------------------- rule -- */}
      {step === 'rule' && (
        <div className="stage">
          <div className="stage-main">
            <div className="world" style={{ cursor: 'default' }}>
              <div className="world-scene">
                <RealmArt realmId={realm.id} mood="after" />
              </div>
            </div>
          </div>
          <aside className="stage-side">
            <DialogueCard who={realm.rule.who} text={realm.rule.text} accent={realm.accent} />
            <div className="center">
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => {
                  onStamp(realm.id, score);
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
