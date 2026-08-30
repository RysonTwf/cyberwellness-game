import { useState } from 'react';
import { ArrowRight, Check, RefreshCw, Scale } from 'lucide-react';
import DialogueCard from './DialogueCard';
import StampMoment from './StampMoment';
import StepTrail from './StepTrail';
import RealmArt from './RealmArt';
import World from '../world/World';
import BeachScene, { BEACH_OBSTACLES } from '../world/beach/BeachScene';

/**
 * Balance Bay — the walkable version of the story→game→rule flow, used for
 * both bands (opted into via `realm.fullMechanic === 'balanceBeach'`, set at
 * the realm level in data/realms.js).
 *
 * Instead of tapping chips off a pool in a panel, the Traveler walks the
 * beach and picks activities up as hotspots, watching a real seesaw
 * (world/beach/BeachScene.jsx) tip as they go. The day / tilt / verdict
 * maths is the same as minigames/MiniGameBalance.jsx.
 *
 * The school revision pass cut this realm's branching choice and its
 * Glimmer character, so the flow here is just story → your day → rule.
 */
// Spawn off to the side, clear of the seesaw (BeachScene draws it dead
// centre) so the Traveler doesn't start standing on top of it.
const SPAWN = { x: 26, y: 88 };
const BOUNDS = { minX: 8, maxX: 92, minY: 48, maxY: 92 };

// Where each activity waits on the sand. Screen-time items sit toward the
// water; everything else sits toward the drier sand, and both are kept clear
// of the seesaw and the palm-hammock (BeachScene's SEESAW_SPOT / HAMMOCK_SPOT).
const ITEM_SPOTS = {
  b1: { x: 24, y: 74 }, // Watch videos
  b2: { x: 40, y: 52 }, // Play my game
  b3: { x: 54, y: 50 }, // Group chat
  b4: { x: 72, y: 52 }, // Video call my cousin
  b5: { x: 86, y: 64 }, // Homework
  b6: { x: 88, y: 82 }, // Play outside
  b7: { x: 74, y: 90 }, // Dinner with family
  b8: { x: 40, y: 90 }, // Read a book
  b9: { x: 58, y: 90 }, // Sleep
  b10: { x: 14, y: 88 }, // Help at home
};

// Short forms for the world pins — `.hotspot-label` is a single-line pill,
// and with up to 10 of these on screen at once the full item text reads far
// wider than anywhere else in the game. The sidebar list keeps `item.text`.
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
  onStamp,
  onBackToAtlas,
}) {
  const [step, setStep] = useState('story'); // story | beach | rule | stamp
  const [beat, setBeat] = useState(0);
  const [day, setDay] = useState([]); // item ids added, in the order picked up
  const [score, setScore] = useState(0);

  const accentVars = { '--accent': realm.accent, '--accent-wash': realm.accentWash };

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

  function addToDay(id) {
    if (full || day.includes(id)) return;
    setDay((d) => [...d, id]);
  }

  function removeFromDay(id) {
    setDay((d) => d.filter((x) => x !== id));
  }

  // One hotspot per item still to place — picking one up removes its pin.
  // None once the day's full (with 10 items and 6 slots some are always left
  // over, and a pin that does nothing on interact is worse than no pin).
  const remainingHotspots = full
    ? []
    : items
        .filter((item) => !day.includes(item.id))
        .map((item) => ({
          id: item.id,
          ...ITEM_SPOTS[item.id],
          label: SHORT_LABELS[item.id] ?? item.text,
          action: 'Add to my day',
          // Colour the pin the way it weighs the seesaw — screen time
          // periwinkle (the side the sidebar legend calls "Screen time"),
          // everything else teal — so a player can read the lean before
          // they walk over.
          accent: item.screen ? 'var(--periwinkle)' : 'var(--teal)',
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

      <StepTrail
        steps={['Story', 'Your day', 'Rule']}
        current={{ story: 0, beach: 1, rule: 2 }[step] ?? 0}
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
                  else setStep('beach');
                }}
              >
                {beat < realm.story.length - 1 ? 'Next' : 'Take a look'}
                <ArrowRight size={19} />
              </button>
            </div>
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
              objective={full ? 'See how the seesaw sits' : 'Walk up to something you might do'}
              showComet={false}
              onInteract={(spot) => addToDay(spot.id)}
            />
          </div>

          <aside className="stage-side">
            <p className="instruction">{realm.game.instruction}</p>

            <div className="scale-legend">
              <span style={{ color: 'var(--periwinkle)' }}>Screen time · {screenCount}</span>
              <span style={{ color: 'var(--teal)' }}>Everything else · {lifeCount}</span>
            </div>
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
                  That&apos;s my day
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
