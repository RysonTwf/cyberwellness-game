import { useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Lightbulb, RefreshCw } from 'lucide-react';
import DialogueCard from './DialogueCard';
import ChoiceCard from './ChoiceCard';
import ReportBlock from './ReportBlock';
import StampMoment from './StampMoment';
import RealmArt from './RealmArt';
import PhaserMiniGame from '../minigames/PhaserMiniGame';
import { makePasswordFortressLevelConfig } from '../minigames/phaser-scenes/passwordFortressLevelScene';

/**
 * A realm whose entire experience — story, the decision, the mini-games —
 * happens inside a run of continuous Phaser levels, instead of the shared
 * walk-to-a-hotspot / open-a-panel pattern every other realm uses
 * (RealmScreen.jsx). Currently just Passworld P4–P6 ("entirely platformer,"
 * by request) — opted into via `realm.fullMechanic === 'platformerStory'`.
 *
 * Passworld is three chapters long (`realm.game.levels`), not one, because it
 * has three separate things to teach and a single vault door can only ask one
 * question:
 *
 *   1. what belongs in a password (door mode `strong`)
 *   2. why length beats cleverness  (door mode `length`)
 *   3. why one password everywhere is the real danger (door mode `unique`)
 *
 * Each chapter is topped and tailed by a plain-DOM card: an intro that says
 * what this chapter is about, and a debrief afterwards that finally explains
 * *why* each piece counted or didn't. The debrief is deliberately after the
 * door rather than at pickup — telling the player a symbol is good the moment
 * they touch it would answer the door's question for them.
 *
 * Between those, the Traveler collects **field notes** by walking through
 * lamp-post beacons planted along the route (`level.beacons`). Those carry the
 * actual teaching — a robot with a list, a dice with more sides — in language
 * aimed at 7–12s. They accumulate across all three chapters and stay readable
 * from the side panel, so a player who ran past one can still go and read it.
 *
 * The *content* is data (realms.js); this only changes delivery: the decision
 * fires when the player reaches an encounter zone rather than on a click, and
 * a locked gate (not a disabled button) is what blocks progress until it
 * resolves safely. Story and rule stay plain DOM either side of the run, same
 * accessible pattern as everywhere else in the game.
 */
export default function PlatformerStoryRealm({
  realm,
  progress,
  travelerName,
  Icon,
  onSettle,
  onStamp,
  onBackToAtlas,
}) {
  // A realm that predates the chapter split still works: one level, unnamed.
  const levels = useMemo(
    () => realm.game.levels ?? [realm.game],
    [realm.game],
  );

  const [step, setStep] = useState('story'); // story | chapter | level | debrief | rule | stamp
  const [levelIndex, setLevelIndex] = useState(0);
  const [beat, setBeat] = useState(0);
  const [pick, setPick] = useState(null);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [round, setRound] = useState(0);
  const [banked, setBanked] = useState(0); // strong pieces across every chapter
  // Everything picked up off the current level, strong and weak alike, in the
  // order it was found — the door's question is asked against this.
  const [bag, setBag] = useState([]);
  const [doorOpen, setDoorOpen] = useState(false);
  const [chosen, setChosen] = useState([]); // ids ticked at the door
  const [assigned, setAssigned] = useState({}); // unique mode: accountId -> tileId
  const [heldCard, setHeldCard] = useState(null); // unique mode: card awaiting a slot
  const [verdict, setVerdict] = useState(null); // null | a failure key | 'passed'
  // Beacons walked through, newest last. Kept across chapters on purpose — the
  // notebook is the one thing the player carries all the way out of the realm.
  const [notes, setNotes] = useState([]);
  const [notesOpen, setNotesOpen] = useState(false);

  const controlsRef = useRef({ left: false, right: false, jump: false });
  const sceneRef = useRef(null);

  const accentVars = { '--accent': realm.accent, '--accent-wash': realm.accentWash };
  const level = levels[levelIndex];
  const door = level.door ?? { mode: 'strong' };
  const isLast = levelIndex >= levels.length - 1;
  const total = level.tiles.filter((t) => t.kind === 'real').length;
  const picked = pick ? realm.decision.options.find((o) => o.id === pick) : null;

  const strongInBag = bag.filter((t) => t.kind === 'real');
  const hasEveryStrong = strongInBag.length >= total;
  const chosenTiles = chosen
    .map((id) => bag.find((t) => t.id === id))
    .filter(Boolean);
  // The `length` door builds a real password out of the ticked pieces, in the
  // order they were ticked, and shows it — seeing "Purple7Taco!" assemble
  // itself is most of the lesson about what length actually buys you.
  const builtPassword = chosenTiles.map((t) => t.label).join('');
  const notesThisChapter = notes.filter((n) =>
    (level.beacons ?? []).some((b) => b.id === n.id),
  );

  function choose(optionId) {
    setPick(optionId);
    const option = realm.decision.options.find((o) => o.id === optionId);
    if (option.safe) {
      onSettle(realm.id, optionId);
      setDecisionOpen(false);
      sceneRef.current?.resolveSafe();
    }
  }

  const hold = (key) => ({
    onMouseDown: () => { controlsRef.current[key] = true; },
    onMouseUp: () => { controlsRef.current[key] = false; },
    onMouseLeave: () => { controlsRef.current[key] = false; },
    onTouchStart: (e) => { e.preventDefault(); controlsRef.current[key] = true; },
    onTouchEnd: (e) => { e.preventDefault(); controlsRef.current[key] = false; },
  });

  /** Wipes everything that belongs to one run of one chapter. */
  function resetLevelState() {
    setPick(null);
    setDecisionOpen(false);
    setBag([]);
    setDoorOpen(false);
    setChosen([]);
    setAssigned({});
    setHeldCard(null);
    setVerdict(null);
    controlsRef.current = { left: false, right: false, jump: false };
  }

  function restartLevel() {
    resetLevelState();
    setRound((r) => r + 1);
  }

  function startChapter(index) {
    resetLevelState();
    setLevelIndex(index);
    setRound((r) => r + 1);
    setStep('level');
  }

  /* ------------------------------------------------------------- the door -- */

  /**
   * Each chapter's door asks its own question. Getting one wrong costs
   * nothing but another go (design.md §8) — it just doesn't open, and the
   * message says specifically what's off so the next attempt is informed
   * rather than a shuffle of the same chips.
   */
  function answerDoor() {
    if (door.mode === 'unique') return answerUniqueDoor();

    if (door.mode === 'length') {
      const onTheList = chosenTiles.find((t) => t.kind === 'decoy');
      if (onTheList) return setVerdict('listed');
      const kinds = new Set(chosenTiles.map((t) => t.type));
      const missing = (door.requireKinds ?? []).filter((k) => !kinds.has(k));
      if (missing.length) return setVerdict('kinds');
      if (builtPassword.length < (door.minLength ?? 12)) return setVerdict('tooShort');
      return passDoor();
    }

    // mode: 'strong' — two gates, deliberately. First, are all the strong
    // pieces even in the bag: if not there's nothing to test yet. Then, can
    // they pick those out from the weak ones they carried up here too.
    if (!hasEveryStrong) return setVerdict('short');
    const wantedIds = strongInBag.map((t) => t.id).sort();
    const gotIds = [...chosen].sort();
    const exact =
      wantedIds.length === gotIds.length && wantedIds.every((id, i) => id === gotIds[i]);
    if (!exact) return setVerdict('wrong');
    return passDoor();
  }

  function answerUniqueDoor() {
    const accounts = door.accounts ?? [];
    const usedIds = accounts.map((a) => assigned[a.id]);
    if (usedIds.some((id) => !id)) return setVerdict('incomplete');
    const cards = usedIds.map((id) => bag.find((t) => t.id === id));
    if (cards.some((c) => c?.kind === 'decoy')) return setVerdict('weakCard');
    // Reuse is *allowed* to be attempted on purpose: being told why the same
    // key on two doors is a bad idea, right after choosing to do it, teaches
    // far more than a slot that silently refused to accept it.
    if (new Set(usedIds).size !== usedIds.length) return setVerdict('reused');
    return passDoor();
  }

  function passDoor() {
    setVerdict('passed');
    setDoorOpen(false);
    setBanked((b) => b + strongInBag.length);
    sceneRef.current?.resolveDoor(true, door.pass);
  }

  function leaveDoor(message) {
    setDoorOpen(false);
    setVerdict(null);
    sceneRef.current?.resolveDoor(false, message);
  }

  /** The nudge shown when a door refuses, phrased per mode. */
  function doorMessage() {
    switch (verdict) {
      case 'short':
        return `Some tiles are still out there — you have ${strongInBag.length} of the ${total} good ones. The door will not open on half a password. Go and find the rest.`;
      case 'wrong':
        return 'That is not quite the set. Either one is missing, or one you ticked is the easy-to-guess kind. Remember: a whole real word is only one guess to a robot, however long it looks.';
      case 'listed':
        return 'One of those is already on the Engine’s list. A long password is no help if part of it is something the robot already knows — swap that one out.';
      case 'kinds':
        return `The keypad wants all three kinds: a letter, a number and a symbol. You have ${
          new Set(chosenTiles.map((t) => t.type)).size
        } of the three so far. The symbol is the one that helps most.`;
      case 'tooShort':
        return `That is only ${builtPassword.length} characters, and the keypad wants ${
          door.minLength ?? 12
        }. Every extra character makes the Engine’s job much bigger — add another chunk.`;
      case 'incomplete':
        return 'Every account needs its own password. Tap a card, then tap the account you want it on.';
      case 'weakCard':
        return 'One of those is a password the Engine already knows. It would be cracked before you finished typing it. Pick one of the long mixed ones instead.';
      case 'reused':
        return 'You gave the same password to two accounts. That is exactly what happened to Sam — one of those sites leaks, and whoever gets the list walks straight into the other one. Give each account its own.';
      default:
        return '';
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
            {(step === 'level' || step === 'debrief') && level.chapter
              ? ` · ${level.chapter}`
              : ''}
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
                {beat < realm.story.length - 1 ? 'Next' : 'Enter the vault'}
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
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => startChapter(levelIndex)}
              >
                Start this chapter
                <ArrowRight size={19} />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ---------------------------------------------------------- level -- */}
      {step === 'level' && (
        // The level fills the window; the instruction, progress readout,
        // d-pad, field notes and the decision all sit in the column beside
        // it, so nothing pushes the game off-screen.
        <div className="stage">
          <div className="stage-main">
            <PhaserMiniGame
              key={`${levelIndex}-${round}`}
              config={(Phaser) =>
                makePasswordFortressLevelConfig(Phaser, {
                  game: level,
                  controlsRef,
                  onDecisionReached: () => setDecisionOpen(true),
                  onCollect: (tile) =>
                    setBag((b) => (b.some((t) => t.id === tile.id) ? b : [...b, tile])),
                  onNote: (note) =>
                    setNotes((n) => (n.some((x) => x.id === note.id) ? n : [...n, note])),
                  onDoorReached: () => {
                    setVerdict(null);
                    setChosen([]);
                    setAssigned({});
                    setHeldCard(null);
                    setDoorOpen(true);
                  },
                  onWin: () => setStep('debrief'),
                  onSceneReady: (scene) => {
                    sceneRef.current = scene;
                  },
                })
              }
            />
          </div>

          <aside className="stage-side">
            {doorOpen && (
              <div className="stack">
                <h3>{door.title ?? 'The vault door'}</h3>

                {/* Whenever there's no verdict to read instead. Gating this on
                    "has everything" hid the instruction from exactly the
                    player who could act on it. */}
                {!verdict && <p className="instruction">{door.prompt}</p>}

                {verdict && verdict !== 'passed' && (
                  <DialogueCard who="Comet" accent={realm.accent} text={doorMessage()} />
                )}

                {/* -------------------------------------- ticking doors -- */}
                {door.mode !== 'unique' && verdict !== 'short' && (
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
                            onClick={() => {
                              // Changing the answer clears the last verdict.
                              // Without this the "you're still missing a
                              // symbol" note stayed on screen while its own
                              // live counts updated underneath it, so it
                              // could end up reading "you have 3 of the
                              // three" next to a refusal.
                              setVerdict(null);
                              setChosen((c) =>
                                c.includes(t.id) ? c.filter((x) => x !== t.id) : [...c, t.id],
                              );
                            }}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                      {bag.length === 0 && <p className="muted">Your bag is empty.</p>}
                    </div>

                    {/* The `length` door shows the password assembling, with a
                        live character count — the number going up as chunks
                        are added is the argument the chapter is making. */}
                    {door.mode === 'length' && (
                      <div className="pw-preview">
                        <span className="pw-preview-label">Your password so far</span>
                        <code className="pw-preview-value">
                          {builtPassword || '—'}
                        </code>
                        <span
                          className={`pw-count${
                            builtPassword.length >= (door.minLength ?? 12) ? ' ok' : ''
                          }`}
                        >
                          {builtPassword.length} / {door.minLength ?? 12} characters
                        </span>
                      </div>
                    )}

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

                {/* ------------------------------------- assigning doors -- */}
                {door.mode === 'unique' && (
                  <>
                    <div className="pw-slots">
                      {(door.accounts ?? []).map((account) => {
                        const card = bag.find((t) => t.id === assigned[account.id]);
                        return (
                          <button
                            key={account.id}
                            type="button"
                            className={`pw-slot${card ? ' filled' : ''}`}
                            onClick={() => {
                              setVerdict(null);
                              if (heldCard) {
                                setAssigned((a) => ({ ...a, [account.id]: heldCard }));
                                setHeldCard(null);
                              } else if (card) {
                                // Tapping a filled slot with nothing in hand
                                // takes the card back out again.
                                setAssigned((a) => {
                                  const next = { ...a };
                                  delete next[account.id];
                                  return next;
                                });
                              }
                            }}
                          >
                            <span className="pw-slot-label">{account.label}</span>
                            <span className="pw-slot-value">
                              {card ? card.label : heldCard ? 'Tap to put it here' : 'Empty'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="bag-grid">
                      {bag.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          className={`bag-chip${heldCard === t.id ? ' on' : ''}`}
                          aria-pressed={heldCard === t.id}
                          onClick={() => setHeldCard((h) => (h === t.id ? null : t.id))}
                        >
                          {t.label}
                        </button>
                      ))}
                      {bag.length === 0 && <p className="muted">Your bag is empty.</p>}
                    </div>
                    <button type="button" className="btn btn-accent" onClick={answerDoor}>
                      <Check size={19} />
                      Unlock all three
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() =>
                    leaveDoor(
                      hasEveryStrong
                        ? 'Have another look at what you picked up.'
                        : 'Some pieces are still out there.',
                    )
                  }
                >
                  Step back
                </button>
              </div>
            )}

            {!decisionOpen && !doorOpen && (
              <>
                <p className="instruction">{level.instruction ?? realm.game.instruction}</p>
                {/* Count only. Showing "x of 6 strong" as they went told them
                    which pickups had counted the moment they touched one. */}
                <p className="tile-hint">
                  In the bag: {bag.length} · Signposts read: {notesThisChapter.length} of{' '}
                  {(level.beacons ?? []).length}
                </p>
                <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ minWidth: 56, minHeight: 48 }}
                    aria-label="Move left"
                    {...hold('left')}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ minWidth: 72, minHeight: 48 }}
                    aria-label="Jump"
                    {...hold('jump')}
                  >
                    Jump
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ minWidth: 56, minHeight: 48 }}
                    aria-label="Move right"
                    {...hold('right')}
                  >
                    →
                  </button>
                </div>
              </>
            )}

            {/* The world froze the moment the player reached Sam — same
                decision content and Report & Block option every other realm
                uses, just triggered by the level instead of a hotspot. */}
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

                {picked && !picked.safe && (
                  <>
                    <DialogueCard who={picked.who} text={picked.response} accent={realm.accent} />
                    <div
                      className="row"
                      style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}
                    >
                      <button type="button" className="btn btn-ghost" onClick={() => setPick(null)}>
                        <RefreshCw size={17} />
                        Let me look again
                      </button>
                      {realm.reportBlockEligible !== false && <ReportBlock accent={realm.accent} />}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Field notes: everything the signposts have explained so far,
                kept open-able at any point in the run. A player who sprinted
                past a beacon can still read what it said. */}
            {notes.length > 0 && (
              <div className="notes-block">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  aria-expanded={notesOpen}
                  onClick={() => setNotesOpen((o) => !o)}
                >
                  <Lightbulb size={16} />
                  Field notes ({notes.length})
                </button>
                {notesOpen && (
                  <ul className="notes-list">
                    {notes.map((n) => (
                      <li key={n.id} className="note-card">
                        <strong>{n.title}</strong>
                        <p>{n.text}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="row panel-actions" style={{ justifyContent: 'center' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={restartLevel}>
                <RefreshCw size={16} />
                Restart this chapter
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* -------------------------------------------------------- debrief -- */}
      {/* Only now does the game say which piece was which, and why. Before the
          door, that would have been the answer sheet. */}
      {step === 'debrief' && (
        <div className="stage">
          <div className="stage-main">
            <div className="world" style={{ cursor: 'default' }}>
              <RealmArt realmId={realm.id} mood="after" />
            </div>
          </div>
          <aside className="stage-side">
            <div className="chapter-card">
              <span className="chapter-kicker">{level.chapter} · cleared</span>
              <h3>{level.name}</h3>
              <p>{door.pass}</p>
            </div>

            <h4 className="debrief-head">What was in your bag, and why</h4>
            <ul className="debrief-list">
              {bag.map((t) => (
                <li key={t.id} className={t.kind === 'real' ? 'good' : 'weak'}>
                  <code>{t.label}</code>
                  <span className="debrief-verdict">
                    {t.kind === 'real' ? 'Belongs in a password' : 'A robot already knows this'}
                  </span>
                  {t.why && <p>{t.why}</p>}
                </li>
              ))}
            </ul>

            {notesThisChapter.length > 0 && (
              <>
                <h4 className="debrief-head">Signposts you read</h4>
                <ul className="notes-list">
                  {notesThisChapter.map((n) => (
                    <li key={n.id} className="note-card">
                      <strong>{n.title}</strong>
                      <p>{n.text}</p>
                    </li>
                  ))}
                </ul>
                {notesThisChapter.length < (level.beacons ?? []).length && (
                  <p className="muted">
                    There were {(level.beacons ?? []).length} signposts in that chapter and you
                    walked through {notesThisChapter.length}. Replay it any time to find the rest.
                  </p>
                )}
              </>
            )}

            <div className="center">
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => {
                  if (isLast) {
                    setStep('rule');
                    return;
                  }
                  setLevelIndex((i) => i + 1);
                  resetLevelState();
                  setStep('chapter');
                }}
              >
                {isLast ? 'Out of the vault' : `Next: ${levels[levelIndex + 1].name}`}
                <ArrowRight size={19} />
              </button>
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
            {notes.length > 0 && (
              <>
                <h4 className="debrief-head">Everything the signposts told you</h4>
                <ul className="notes-list">
                  {notes.map((n) => (
                    <li key={n.id} className="note-card">
                      <strong>{n.title}</strong>
                      <p>{n.text}</p>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="center">
              <button
                type="button"
                className="btn btn-accent"
                onClick={() => {
                  onStamp(realm.id, banked);
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
