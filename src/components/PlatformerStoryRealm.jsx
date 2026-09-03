import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, RefreshCw, Lock, LockOpen } from 'lucide-react';
import DialogueCard from './DialogueCard';
import ChoiceCard from './ChoiceCard';
import ReportBlock from './ReportBlock';
import StampMoment from './StampMoment';
import StepTrail from './StepTrail';
import MethodTrack from './MethodTrack';
import RealmArt from './RealmArt';
import PasswordBuild, { PasswordChoices, PasswordCompare, PasswordLegend } from './PasswordBuild';
import MiniGameSort from '../minigames/MiniGameSort';
import PhaserMiniGame from '../minigames/PhaserMiniGame';
import { makePasswordFortressLevelConfig } from '../minigames/phaser-scenes/passwordFortressLevelScene';
import { pauseMusic, resumeMusic } from '../lib/music';
import { describeMix, gradePassword, readPassword } from '../lib/password';
import { playSfx } from '../lib/sfx';
import { prefersReducedMotion } from '../lib/motion';

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
  const panelRef = useRef(null);
  // On a phone or a tablet the controls belong on the level itself, thumbs
  // resting at the bottom corners. On a desktop the keyboard does the job and
  // the row of buttons beside the level is there for a mouse.
  const [touchControls, setTouchControls] = useState(false);

  const accentVars = { '--accent': realm.accent, '--accent-wash': realm.accentWash };

  // The level as played: the `{name}` tile carries the name the child chose
  // for themselves, and drops out of the level entirely if they never gave
  // one, since a piece labelled with an empty string teaches nothing.
  const game = useMemo(() => {
    const tiles = realm.game.tiles
      .map((t) => (t.label.includes('{name}')
        ? { ...t, label: t.label.replace('{name}', travelerName ?? '') }
        : t))
      .filter((t) => t.label.trim().length > 0);
    return { ...realm.game, tiles };
  }, [realm.game, travelerName]);

  const total = game.tiles.filter((t) => t.kind === 'real').length;
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

  // Stacked on a phone, the panel sits under a level that fills the screen,
  // so a question opening down there can go unseen. Bring it into view as it
  // opens, and again when the door answers back. Side by side on a laptop,
  // nothing needs to move.
  useEffect(() => {
    if (!decisionOpen && !doorOpen) return;
    if (typeof window === 'undefined' || !window.matchMedia) return;
    if (!window.matchMedia('(max-width: 900px)').matches) return;
    panelRef.current?.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  }, [decisionOpen, doorOpen, verdict]);

  // A panel taking over (Sam's question, the vault door) hides the buttons.
  // Let go of whatever was held down as they go, or the player carries on
  // running the moment the level unfreezes.
  useEffect(() => {
    const panelOpen = decisionOpen || doorOpen;
    if (panelOpen) {
      controlsRef.current = { left: false, right: false, jump: false };
    }
    // Hand the keyboard back to the panel while it is up, and to the level
    // again once it closes. See `setPanelOpen` in the scene.
    sceneRef.current?.setPanelOpen(panelOpen);
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

  // The ticked pieces in the order they were ticked, which is the order they
  // are joined in: the child decides what the password reads like, not the
  // order the level happened to hand the pieces over in.
  const chosenPieces = chosen.map((id) => bag.find((t) => t.id === id)).filter(Boolean);
  const built = readPassword(chosenPieces);
  // The gauge on screen is what the door opens for, so the two read the same
  // grade rather than testing different things.
  const grade = gradePassword(built);
  // The pieces that are about the child: their own name, and the pet name.
  // No gauge anywhere can see anything wrong with these, which is why the
  // vault, not the gauge, is what refuses them.
  const aboutMePieces = chosenPieces.filter((t) => t.aboutMe);
  // Easy-to-guess words that are not about the child. They do not stop the
  // door: a common word inside a long, well mixed password barely dents it,
  // and saying otherwise would be teaching something untrue. The reveal says
  // as much.
  const weakWordsUsed = chosenPieces.filter((t) => t.kind === 'decoy' && !t.aboutMe);
  // Two of L.M.N. are plain facts about what is ticked, so they tick
  // themselves as the password grows. The third is the judgement being asked
  // for, so it stays open until the door opens.
  // All three tick live now, because all three are checkable: long, mixed, and
  // nothing about you in there. N going dark the moment a child ticks their own
  // name is not giving an answer away, it is the lesson arriving at the moment
  // they can act on it.
  const liveChecks = new Set([
    ...(built.isLong ? ['L'] : []),
    ...(built.isMixed ? ['M'] : []),
    ...(chosenPieces.length > 0 && aboutMePieces.length === 0 ? ['N'] : []),
  ]);
  // The reveal compares what they built against something weak they actually
  // carried up here, rather than an example out of nowhere.
  const weakExample = bag.find((t) => t.kind === 'decoy')?.label ?? 'password';

  /**
   * The door's question. Two separate gates, deliberately:
   * first, are all the strong pieces even in the bag — if not there's nothing
   * to test yet and they're turned away; then, can they pick those out from
   * the weak ones they also carried up here. Getting it wrong costs nothing
   * but another go (design.md §8), it just doesn't open.
   */
  function answerDoor() {
    // The gauge decides. It used to be one exact set of pieces, which meant a
    // child holding a long, well mixed password could still be turned away
    // with "that is not the set" and nothing to work from. Now the keypad
    // opens for anything its own gauge calls strong, and the gauge says what
    // is missing when it does not.
    if (!grade.strong) {
      setVerdict('weak');
      return;
    }
    // Strong is not enough on its own. A password with the child's own name in
    // it is one question away for anybody who knows them, and no meter on
    // earth can spot that, so the vault holds this line itself.
    if (aboutMePieces.length > 0) {
      setVerdict('aboutMe');
      return;
    }
    // The door stays on screen on a pass: the reveal of what the pieces built
    // is the part the level was missing, and it goes with `openVault` below,
    // once the child has read it.
    setVerdict('passed');
    // Scored on the strong pieces they actually used, so a password padded out
    // with something weak is still a pass, but not full marks.
    setScore(chosenPieces.filter((t) => t.kind === 'real').length);
    playSfx('confirm');
  }

  /** The reveal is read; open the vault and let the level play its win. */
  function openVault() {
    setDoorOpen(false);
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
                game,
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
            <div className="stack" ref={panelRef}>
              <h3>The vault door</h3>

              {verdict === 'passed' ? (
                /* The reveal. Opening the door used to be the whole answer,
                   so children finished the level without ever seeing what
                   their six pickups had built, or why a letter beside a
                   number beside a symbol is harder to guess than a word.
                   The vault waits here now, with the pieces joined up on
                   screen, until they have read it and chosen to go on. */
                <>
                  {/* Ticked from what they actually built, not as a foregone
                      conclusion: a password can get through the door long and
                      mixed while still carrying a piece that is about them, and
                      the track has to say so. */}
                  <MethodTrack
                    purpose={game.purpose}
                    cleared={new Set([
                      ...(built.isLong ? ['L'] : []),
                      ...(built.isMixed ? ['M'] : []),
                      ...(aboutMePieces.length === 0 ? ['N'] : []),
                    ])}
                  />

                  <p className="instruction">
                    The keypad accepts it. Here is what your pieces built.
                  </p>

                  <PasswordBuild pieces={chosenPieces} animate />
                  <PasswordLegend />

                  <DialogueCard
                    who="Comet"
                    accent={realm.accent}
                    text={`Look at it all joined up. Your ${chosenPieces.length} pieces became one password of ${built.length} characters, holding ${describeMix(built.counts)}, and no part of it is a real word or anything about you.`}
                  />

                  {/* The two "why" panels sit side by side wherever there is
                      room, which keeps the reveal short enough to read on a
                      phone held sideways. */}
                  <div className="pw-why">
                    {weakWordsUsed.length > 0 && (
                    <DialogueCard
                      who="Comet"
                      accent={realm.accent}
                      text={`Worth knowing: ${weakWordsUsed.map((t) => `"${t.label}"`).join(' and ')} on its own would be guessed in a heartbeat, because it sits near the top of every guessing list. Buried inside something this long and this mixed, it does no harm. Length and mix are what did the work.`}
                    />
                  )}

                  <PasswordChoices length={built.length} />
                    <PasswordCompare weak={weakExample} strong={built.joined} />
                  </div>

                  <button type="button" className="btn btn-accent" onClick={openVault}>
                    <ArrowRight size={19} />
                    Open the vault
                  </button>
                </>
              ) : (
                <>
                  {/* The three tests to judge each piece against, on screen while
                      you choose. The pieces themselves are shown plain on purpose:
                      marking the strong ones teal-and-padlocked at the door handed
                      over the answer, so ticking the green ones took no judgement
                      at all. L.M.N. is what replaces that, something to reason
                      from rather than a colour to follow.

                      Long and Mixed tick themselves as the child builds, because
                      both are plain facts about the string they can see for
                      themselves. Not me stays open: whether a piece is a real word
                      or something about them is the judgement the door is asking
                      for, and ticking it would hand the answer over. */}
                  <MethodTrack purpose={game.purpose} cleared={liveChecks} />

                  {!verdict && (
                    <p className="instruction">
                      The keypad opens for any password its gauge calls strong: twelve characters
                      or more, with letters, numbers and symbols mixed together. The vault adds one
                      rule of its own, and it is the N up there. Nothing about you goes in.
                    </p>
                  )}

                  {verdict === 'weak' && (
                    <DialogueCard
                      who="Comet"
                      accent={realm.accent}
                      text={`The gauge does not call that strong yet. ${grade.reason ?? 'Try a longer, better mixed set of pieces.'} Change what you have ticked and watch the gauge move.`}
                    />
                  )}

                  {verdict === 'aboutMe' && (
                    <DialogueCard
                      who="Comet"
                      accent={realm.accent}
                      text={`The gauge says that password is strong, and it is right about the length and the mix. It cannot see the problem, though. ${aboutMePieces.map((t) => `"${t.label}"`).join(' and ')} ${aboutMePieces.length > 1 ? 'are' : 'is'} about you. Anybody who knows you would try that first, so the vault will not take it. Leave that piece out and use the others.`}
                    />
                  )}

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

                      {/* The pieces joined up as they are ticked, so the password
                          is something the child watches being built rather than a
                          list of chips they hope adds up. */}
                      <PasswordBuild
                        pieces={chosenPieces}
                        strengthNote
                        empty="Tick a piece to start building your password."
                      />

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

                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() =>
                      leaveDoor(
                        hasEveryStrong
                          ? 'Have another look at what you have.'
                          : 'Some pieces are still out there.',
                      )
                    }
                  >
                    Step back
                  </button>
                </>
              )}
            </div>
          )}

          {!decisionOpen && !doorOpen && (
            <>
              <p className="instruction">{game.instruction}</p>
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
            <div className="stack" ref={panelRef}>
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

          {/* Gone during the reveal: the vault is solved by then, and a
              restart sitting under "Open the vault" is one mistaken tap away
              from throwing the whole climb away. */}
          {verdict !== 'passed' && (
            <div className="row panel-actions" style={{ justifyContent: 'center' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={restartLevel}>
                <RefreshCw size={16} />
                Restart this vault
              </button>
            </div>
          )}
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
