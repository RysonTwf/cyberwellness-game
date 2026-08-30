import { useState } from 'react';
import { ArrowRight, Check, RefreshCw, Scale } from 'lucide-react';
import DialogueCard from './DialogueCard';
import ChoiceCard from './ChoiceCard';
import ReportBlock from './ReportBlock';
import StampMoment from './StampMoment';
import RealmArt from './RealmArt';
import World from '../world/World';
import BeachScene, { BEACH_OBSTACLES } from '../world/beach/BeachScene';

/**
 * Balance Bay, P1–3 only — the walkable stand-in for the shared
 * story→decision→game→rule→stamp panel flow (RealmScreen.jsx), opted into
 * via `realm.fullMechanic === 'balanceBeach'` (set on `balanceLower` only —
 * P4–6 Balance Bay keeps the plain tap-list MiniGameBalance, same scoping
 * trick Passworld/Privacy Peaks use for their own single-band upgrades).
 *
 * Story/decision/rule content is identical to what the shared flow already
 * uses — only the "game" step changes delivery: instead of tapping chips
 * off a pool, the Traveler walks the beach and picks activities up as
 * hotspots, watching a real seesaw (BeachScene) tip as they go. The state
 * machinery here (day array, tilt/verdict calc, the picked-items grid) is
 * lifted straight from minigames/MiniGameBalance.jsx — only the "pool" of
 * tappable chips is gone, replaced by the world.
 */
const SPAWN = { x: 50, y: 86 };
const BOUNDS = { minX: 8, maxX: 92, minY: 48, maxY: 92 };

// Where each activity waits on the sand. Screen-time items sit toward the
// water (the Glimmer's side); everything else sits toward drier sand — the
// same tide/dry-sand split RealmArt.jsx's BayScene already draws for this
// realm's story/decision/rule backdrop, just carried into a walkable space.
const ITEM_SPOTS = {
  b1: { x: 12, y: 88 }, // Watch videos
  b2: { x: 14, y: 70 }, // Play my game
  b3: { x: 35, y: 52 }, // Group chat
  b4: { x: 88, y: 52 }, // Video call my cousin
  b5: { x: 65, y: 54 }, // Homework
  b6: { x: 88, y: 70 }, // Play outside
  b7: { x: 70, y: 88 }, // Dinner with family
  b8: { x: 30, y: 90 }, // Read a book
  b9: { x: 55, y: 90 }, // Sleep
  b10: { x: 90, y: 88 }, // Help at home
};

// Short forms for the world pins — `.hotspot-label` is a single-line pill
// (no wrapping), and with 10 of these on screen at once, the full item text
// ("Video call my cousin") reads as a much wider, more crowded pill than
// anywhere else in the game normally shows. The sidebar's "your day" list
// still uses the full item.text.
const SHORT_LABELS = {
  b1: 'Videos',
  b2: 'My game',
  b3: 'Group chat',
  b4: 'Video call',
  b5: 'Homework',
  b6: 'Outside',
  b7: 'Dinner',
  b8: 'A book',
  b9: 'Sleep',
  b10: 'Help at home',
};

export default function BalanceBeachRealm({
  realm,
  progress,
  travelerName,
  avatar,
  onSettle,
  onStamp,
  onBackToAtlas,
}) {
  const [step, setStep] = useState('story'); // story | decision | beach | rule | stamp
  const [beat, setBeat] = useState(0);
  const [pick, setPick] = useState(null);
  const [day, setDay] = useState([]); // item ids added, in the order picked up
  const [score, setScore] = useState(0);

  const accentVars = { '--accent': realm.accent, '--accent-wash': realm.accentWash };
  const picked = pick ? realm.decision.options.find((o) => o.id === pick) : null;

  const { items, slots, verdicts } = realm.game;
  const chosen = day.map((id) => items.find((i) => i.id === id));
  const screenCount = chosen.filter((i) => i.screen).length;
  const lifeCount = chosen.length - screenCount;
  const full = day.length === slots;
  // Same formula as MiniGameBalance: more screen time tips one way, more of
  // everything else tips the other, capped by construction at the extremes.
  const tilt = day.length ? -((screenCount - lifeCount) / slots) * 15 : 0;

  const verdict = !full
    ? null
    : screenCount >= slots - 1
      ? { tone: 'rethink', text: verdicts.allScreen }
      : screenCount === 0
        ? { tone: 'rethink', text: verdicts.noScreen }
        : { tone: 'settled', text: verdicts.level };

  function choose(optionId) {
    setPick(optionId);
    const option = realm.decision.options.find((o) => o.id === optionId);
    if (option.safe) onSettle(realm.id, optionId);
  }

  function addToDay(id) {
    if (full || day.includes(id)) return;
    setDay((d) => [...d, id]);
  }

  function removeFromDay(id) {
    setDay((d) => d.filter((x) => x !== id));
  }

  // One hotspot per item still left to place — picking one up removes its
  // pin, same "no artificial scarcity" pattern as every other realm's world.
  // None once the day's full: with 10 items and only 6 slots, some are
  // always left over, and a pin that pings invitingly but silently does
  // nothing on interact is worse than no pin at all — full just means done
  // exploring, look at the sidebar. Labelled with the activity's own text
  // (not just a generic pin) since, unlike a single named spot like the
  // diary, there are up to 10 of these at once — a child needs to read
  // which is which before walking all the way over to one.
  const remainingHotspots = full
    ? []
    : items
        .filter((item) => !day.includes(item.id))
        .map((item) => ({
          id: item.id,
          ...ITEM_SPOTS[item.id],
          label: SHORT_LABELS[item.id] ?? item.text,
          action: 'Add to my day',
        }));

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
          see RealmScreen for why the heading row moved up there. */}

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
                  else setStep('decision');
                }}
              >
                {beat < realm.story.length - 1 ? 'Next' : 'What do I say?'}
                <ArrowRight size={19} />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ------------------------------------------------------- decision -- */}
      {step === 'decision' && (
        <div className="stage">
          <div className="stage-main">
            <div className="world" style={{ cursor: 'default' }}>
              <RealmArt realmId={realm.id} mood={picked?.safe ? 'after' : 'before'} />
            </div>
          </div>
          <aside className="stage-side">
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
                <div className="center">
                  {picked.safe ? (
                    <button type="button" className="btn btn-accent" onClick={() => setStep('beach')}>
                      Plan the day
                      <ArrowRight size={19} />
                    </button>
                  ) : (
                    <div className="row" style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                      {/* Never a dead end — hand the decision straight back */}
                      <button type="button" className="btn btn-ghost" onClick={() => setPick(null)}>
                        <RefreshCw size={17} />
                        Let me look again
                      </button>
                      {realm.reportBlockEligible !== false && <ReportBlock accent={realm.accent} />}
                    </div>
                  )}
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* ----------------------------------------------------------- beach -- */}
      {step === 'beach' && (
        <div className="stage">
          <div className="stage-main">
            <World
              sceneKey="balance-beach"
              scene={<BeachScene tilt={tilt} />}
              accent={realm.accent}
              spawn={SPAWN}
              bounds={BOUNDS}
              obstacles={BEACH_OBSTACLES}
              avatar={avatar}
              hotspots={remainingHotspots}
              objective={full ? 'See how the day sits' : 'Walk up to something you might do'}
              showComet={false}
              onInteract={(spot) => addToDay(spot.id)}
            />
          </div>

          <aside className="stage-side">
            <p className="instruction">{realm.game.instruction}</p>
            <p className="tile-hint">
              {day.length} / {slots} hours filled
            </p>

            <div className="slots">
              {Array.from({ length: slots }, (_, i) => {
                const item = chosen[i];
                if (!item) {
                  return (
                    <div key={`empty-${i}`} className="slot">
                      Hour {i + 1}
                    </div>
                  );
                }
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`slot filled ${item.screen ? 'screen' : 'life'}`}
                    onClick={() => removeFromDay(item.id)}
                    aria-label={`Take "${item.text}" back out of the day`}
                  >
                    {item.text}
                  </button>
                );
              })}
            </div>

            {verdict && (
              <div className={`redirect${verdict.tone === 'settled' ? ' settled' : ''}`}>
                <span className="ic">
                  <Scale size={22} />
                </span>
                <p>{verdict.text}</p>
              </div>
            )}

            <div className="row panel-actions" style={{ justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setDay([])}
                disabled={!day.length}
              >
                <RefreshCw size={16} />
                Clear the day
              </button>
              {full && (
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={() => {
                    setScore(lifeCount);
                    setStep('rule');
                  }}
                >
                  That's my day
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {/* ------------------------------------------------------------ rule -- */}
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
