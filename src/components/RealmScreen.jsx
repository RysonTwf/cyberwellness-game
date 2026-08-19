import { useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Key, Compass, Heart, Sun, Eye, RefreshCw, Check, X } from 'lucide-react';
import DialogueCard from './DialogueCard';
import ChoiceCard from './ChoiceCard';
import ReportBlock from './ReportBlock';
import StampMoment from './StampMoment';
import World from '../world/World';
import RealmArt from './RealmArt';
import MiniGameSort from '../minigames/MiniGameSort';
import MiniGameSpot from '../minigames/MiniGameSpot';
import MiniGameCompare from '../minigames/MiniGameCompare';
import MiniGameBalance from '../minigames/MiniGameBalance';
import MiniGamePlatformer from '../minigames/MiniGamePlatformer';
import MiniGameSteppingStones from '../minigames/MiniGameSteppingStones';
import PlatformerStoryRealm from './PlatformerStoryRealm';
import BogStoryRealm from './BogStoryRealm';

const REALM_ICONS = { passworld: Key, privacy: Compass, bullybog: Heart, balance: Sun, fablefalls: Eye };
// 'platformer' and 'steppingstones' are Phaser-backed (Milestones Phase 2) —
// importing their wrapper components here doesn't pull Phaser itself into
// the main bundle, only into a separate chunk fetched when one is actually
// mounted (see minigames/PhaserMiniGame.jsx).
const GAMES = {
  sort: MiniGameSort,
  spot: MiniGameSpot,
  compare: MiniGameCompare,
  balance: MiniGameBalance,
  platformer: MiniGamePlatformer,
  steppingstones: MiniGameSteppingStones,
};

// Realms that run as one continuous experience rather than the shared step
// machine, keyed by the `fullMechanic` their band content declares. Each takes
// the same props RealmScreen does and owns everything from story to stamp.
const FULL_MECHANICS = {
  platformerStory: PlatformerStoryRealm,
  bogCurrent: BogStoryRealm,
};

// Order the optional post-decision beats appear in, when a realm defines them
// (Improvement Plan §2: digital footprint, then "who would you tell").
const EXTRA_BEAT_ORDER = ['footprint', 'tellSomeone'];

/**
 * One realm, start to finish.
 *
 * The realm is a place you walk around, not a stack of cards. Each step puts
 * a pin somewhere in the scene; you walk to it and interact, and the step
 * opens as a panel over the world. Closing it moves the pin on.
 *
 *   story -> decision -> mini-game -> the rule, plainly -> stamp
 *
 * The unsafe choice is always reversible: it shows a warm redirect and hands
 * the decision back, so a child can never dead-end the story (design.md §5).
 */
export default function RealmScreen({ realm, progress, travelerName, onSettle, onStamp, onBackToAtlas }) {
  // A realm can opt out of the shared story→decision→game→rule→stamp
  // pattern entirely and own one continuous, multi-chapter experience
  // instead — Passworld P4–P6 as a platformer run (PlatformerStoryRealm.jsx)
  // and Bully Bog P4–P6 as the Bog Current (BogStoryRealm.jsx). Both are
  // opted into from the band's own content, so the other band of the same
  // realm still takes the shared path.
  //
  // This has to be the first thing in the function, before any hooks below,
  // since this component never calls its own hooks when it delegates.
  const FullMechanic = FULL_MECHANICS[realm.fullMechanic];
  if (FullMechanic) {
    return (
      <FullMechanic
        realm={realm}
        progress={progress}
        travelerName={travelerName}
        Icon={REALM_ICONS[realm.id]}
        onSettle={onSettle}
        onStamp={onStamp}
        onBackToAtlas={onBackToAtlas}
      />
    );
  }

  const [step, setStep] = useState('story'); // story | decision | game | rule | stamp
  const [open, setOpen] = useState(false); // is the step's panel showing?
  const [beat, setBeat] = useState(0);
  const [pick, setPick] = useState(null);
  const [score, setScore] = useState(0);

  // Optional post-decision beats (digital footprint / "who would you tell",
  // Improvement Plan §2) — only realms that define `extraBeats` show these.
  const extraBeatKeys = EXTRA_BEAT_ORDER.filter((k) => realm.extraBeats?.[k]);
  const [extraIndex, setExtraIndex] = useState(0);
  const [beatAcked, setBeatAcked] = useState(false);
  const [tellPick, setTellPick] = useState(null);
  const advanceExtra = () => {
    setBeatAcked(false);
    setTellPick(null);
    setExtraIndex((i) => i + 1);
  };

  const Icon = REALM_ICONS[realm.id];
  const Game = GAMES[realm.game.type];
  const accentVars = { '--accent': realm.accent, '--accent-wash': realm.accentWash };

  const picked = pick ? realm.decision.options.find((o) => o.id === pick) : null;
  const settled = Boolean(picked?.safe);
  // The world visibly changes once the Traveler makes the safe choice.
  const mood = settled || step === 'game' || step === 'rule' || step === 'stamp' ? 'after' : 'before';
  const currentExtraKey =
    picked?.safe && extraIndex < extraBeatKeys.length ? extraBeatKeys[extraIndex] : null;
  const currentExtra = currentExtraKey ? realm.extraBeats[currentExtraKey] : null;

  const OBJECTIVES = {
    story: `Walk over to ${realm.world.stops.story.label}`,
    decision: 'Say something',
    game: `Go to ${realm.world.stops.game.label}`,
    rule: `Meet Comet at ${realm.world.stops.rule.label}`,
  };

  function choose(optionId) {
    setPick(optionId);
    const option = realm.decision.options.find((o) => o.id === optionId);
    if (option.safe) onSettle(realm.id, optionId);
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

      <div className="realm-head">
        <span className="badge-ic">
          <Icon size={22} strokeWidth={2.2} />
        </span>
        <div>
          <h2>{realm.name}</h2>
          <span className="pin-label">{realm.topic}</span>
        </div>
      </div>

      <World
        sceneKey={realm.id}
        scene={<RealmArt realmId={realm.id} mood={mood} />}
        accent={realm.accent}
        spawn={realm.world.spawn}
        bounds={realm.world.bounds}
        hotspots={[realm.world.stops[step]]}
        objective={OBJECTIVES[step]}
        paused={open}
        onInteract={() => setOpen(true)}
      />

      {/* ---- The step panel, opened by walking up to the pin ----------------
          Portalled to <body>. `.fold` animates a perspective/rotateY transform,
          which makes it a containing block — so the scrim's `position: fixed`
          was resolving against the realm card instead of the viewport, trapping
          the panel inside the scene box and scrolling its buttons out of reach. */}
      {open && createPortal(
        <div className="panel-scrim" onClick={undefined}>
          <div className="panel" style={accentVars}>
            {/* ---------------------------------------------------- story -- */}
            {step === 'story' && (
              <div className="stack">
                {realm.story.slice(0, beat + 1).map((b, i) => (
                  <DialogueCard key={i} who={b.who} text={b.text} accent={realm.accent} />
                ))}
                <div className="center">
                  <button
                    type="button"
                    className="btn btn-accent"
                    onClick={() => {
                      if (beat < realm.story.length - 1) setBeat((b) => b + 1);
                      else {
                        setStep('decision');
                        // Stay open — the decision happens right here, in the
                        // same conversation, rather than sending them walking.
                      }
                    }}
                  >
                    {beat < realm.story.length - 1 ? 'Next' : 'What do I say?'}
                    <ArrowRight size={19} />
                  </button>
                </div>
              </div>
            )}

            {/* ------------------------------------------------- decision -- */}
            {step === 'decision' && (
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

                    {/* ---- optional post-decision beats (Improvement Plan §2) ---- */}
                    {currentExtraKey === 'footprint' && (
                      <>
                        <DialogueCard
                          who={currentExtra.who}
                          text={currentExtra.prompt}
                          accent={realm.accent}
                        />
                        {beatAcked ? (
                          <>
                            <DialogueCard
                              who={currentExtra.who}
                              text={currentExtra.followUp}
                              accent={realm.accent}
                            />
                            <div className="center">
                              <button type="button" className="btn btn-accent" onClick={advanceExtra}>
                                Continue
                                <ArrowRight size={19} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="center">
                            <button
                              type="button"
                              className="btn btn-accent"
                              onClick={() => setBeatAcked(true)}
                            >
                              {currentExtra.accept}
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {currentExtraKey === 'tellSomeone' && (
                      <>
                        <DialogueCard
                          who={currentExtra.who}
                          text={currentExtra.prompt}
                          accent={realm.accent}
                        />
                        {tellPick ? (
                          <>
                            <DialogueCard
                              who={currentExtra.who}
                              text={currentExtra.response}
                              accent={realm.accent}
                            />
                            <div className="center">
                              <button type="button" className="btn btn-accent" onClick={advanceExtra}>
                                Continue
                                <ArrowRight size={19} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div
                            className="row"
                            style={{ justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}
                          >
                            {currentExtra.options.map((o) => (
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

                    {/* ---- move on: game step (safe) or retry (unsafe) ---- */}
                    {!currentExtraKey && (
                      <div className="center">
                        {picked.safe ? (
                          <button
                            type="button"
                            className="btn btn-accent"
                            onClick={() => {
                              setStep('game');
                              setOpen(false);
                            }}
                          >
                            Look around
                            <ArrowRight size={19} />
                          </button>
                        ) : (
                          <div
                            className="row"
                            style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}
                          >
                            {/* Never a dead end — hand the decision straight back */}
                            <button
                              type="button"
                              className="btn btn-ghost"
                              onClick={() => setPick(null)}
                            >
                              <RefreshCw size={17} />
                              Let me look again
                            </button>
                            {realm.reportBlockEligible !== false && (
                              <ReportBlock accent={realm.accent} />
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ----------------------------------------------------- game -- */}
            {step === 'game' && (
              <>
                <button
                  type="button"
                  className="panel-close"
                  onClick={() => setOpen(false)}
                  aria-label="Step away and come back to this"
                >
                  <X size={18} />
                </button>
                <Game
                  game={realm.game}
                  onComplete={(result) => {
                    setScore(result);
                    setStep('rule');
                    setOpen(false);
                  }}
                />
              </>
            )}

            {/* ----------------------------------------------------- rule -- */}
            {step === 'rule' && (
              <div className="stack">
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
              </div>
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
