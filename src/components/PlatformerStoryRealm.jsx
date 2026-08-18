import { useRef, useState } from 'react';
import { ArrowRight, Check, RefreshCw } from 'lucide-react';
import DialogueCard from './DialogueCard';
import ChoiceCard from './ChoiceCard';
import ReportBlock from './ReportBlock';
import StampMoment from './StampMoment';
import RealmArt from './RealmArt';
import PhaserMiniGame from '../minigames/PhaserMiniGame';
import { makePasswordFortressLevelConfig } from '../minigames/phaser-scenes/passwordFortressLevelScene';

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
  Icon,
  onSettle,
  onStamp,
  onBackToAtlas,
}) {
  const [step, setStep] = useState('story'); // story | level | rule | stamp
  const [beat, setBeat] = useState(0);
  const [pick, setPick] = useState(null);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [collected, setCollected] = useState(0);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);

  const controlsRef = useRef({ left: false, right: false, jump: false });
  const sceneRef = useRef(null);

  const accentVars = { '--accent': realm.accent, '--accent-wash': realm.accentWash };
  const total = realm.game.tiles.filter((t) => t.kind === 'real').length;
  const picked = pick ? realm.decision.options.find((o) => o.id === pick) : null;

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

  function restartLevel() {
    setPick(null);
    setDecisionOpen(false);
    setCollected(0);
    controlsRef.current = { left: false, right: false, jump: false };
    setRound((r) => r + 1);
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
                onWin: (finalScore) => {
                  setScore(finalScore);
                  setStep('rule');
                },
                onSceneReady: (scene) => {
                  sceneRef.current = scene;
                },
              })
            }
            />
          </div>

          <aside className="stage-side">
          {!decisionOpen && (
            <>
              <p className="instruction">{realm.game.instruction}</p>
              <p className="tile-hint">{collected} of {total} secured</p>
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
