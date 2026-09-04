import { useState } from 'react';
import { ArrowRight, Check, RefreshCw, Scale } from 'lucide-react';
import DialogueCard from './DialogueCard';
import StampMoment from './StampMoment';
import StepTrail from './StepTrail';
import MethodTrack from './MethodTrack';
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
 * seesaw maths lives here and nowhere else (the unreachable panel
 * version, minigames/MiniGameBalance.jsx, was deleted 31 Aug 2026).
 *
 * The school revision pass cut this realm's branching choice and its
 * Glimmer character, so the flow here is just story → your day → rule.
 */
// Spawn off to the side, clear of the seesaw (BeachScene draws it dead
// centre) so the Traveler doesn't start standing on top of it.
const SPAWN = { x: 26, y: 88 };
const BOUNDS = { minX: 8, maxX: 92, minY: 48, maxY: 92 };

// The six slots are one evening, school to bed, an hour per activity — so the
// planner reads as a real timetable and the sky clock can be read straight
// off how many are filled. 3pm start, 9pm once all six are placed.
const DAY_START_HOUR = 15;

function formatClockHour(hour24) {
  const period = hour24 < 12 ? 'AM' : 'PM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:00 ${period}`;
}

// Where each activity waits on the sand. Screen-time items sit toward the
// water; everything else sits toward the drier sand, and both are kept clear
// of the seesaw and the palm-hammock (BeachScene's SEESAW_SPOT / HAMMOCK_SPOT).
const ITEM_SPOTS = {
  b1: { x: 24, y: 74 }, // Watching television
  b2: { x: 44, y: 52 }, // Play my video game
  b5: { x: 86, y: 64 }, // Homework
  b6: { x: 88, y: 82 }, // Play outside
  b7: { x: 74, y: 90 }, // Dinner with family
  b8: { x: 40, y: 90 }, // Reading a book
  b9: { x: 58, y: 90 }, // Rest
  b10: { x: 14, y: 88 }, // Help at home
};

// Short forms for the world pins — `.hotspot-label` is a single-line pill,
// and with several of these on screen at once the full item text reads far
// wider than anywhere else in the game. The sidebar planner keeps `item.text`.
const SHORT_LABELS = {
  b1: 'Television',
  b2: 'Video game',
  b5: 'Homework',
  b6: 'Outside',
  b7: 'Dinner',
  b8: 'A book',
  b9: 'Rest',
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

  const { items, slots, verdicts, musts, purpose } = realm.game;
  const chosen = day.map((id) => items.find((i) => i.id === id));
  const screenCount = chosen.filter((i) => i.screen).length;
  const lifeCount = chosen.length - screenCount;
  const full = day.length === slots;
  // The seesaw sits level at exactly two hours of screen time; every hour
  // short of that leans it. With only two screen activities on the beach it
  // never leans the other way — the "no more than two" side is held by the
  // must, and its verdict copy.
  const tilt = day.length ? (musts.screenHours - screenCount) * 6 : 0;

  /**
   * The must haves: the realm's actual gate.
   *
   * Filling six slots used to be the entire requirement: the verdict below
   * was computed, shown, and then never required, so six hours of screens
   * passed exactly as readily as a balanced day. Comet said the seesaw had
   * tipped over and let you through anyway, which made this the one realm
   * that was not merely guessable but unfailable (thingstoimproveon.md §1).
   *
   * These replace that invisible threshold with conditions a child can
   * reason from and watch tick off live. Still no penalty and no buzzer
   * "Clear the day" is right there, and a day that doesn't meet them just
   * isn't finished yet (design.md §8).
   */
  const met = {
    R: day.includes(musts.rest),
    O: musts.somethingElse.some((id) => day.includes(id)),
    S: screenCount === musts.screenHours,
  };
  const cleared = new Set(Object.keys(met).filter((k) => met[k]));
  const balanced = full && purpose.checks.every((c) => met[c.key]);

  const verdict = !full
    ? null
    : screenCount < musts.screenHours
      ? { tone: 'rethink', text: verdicts.tooFewScreen }
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
              scene={
                <BeachScene tilt={tilt} clock={formatClockHour(DAY_START_HOUR + day.length)} />
              }
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

            {/* The gate, on screen and ticking off live, so it reads as three
                things to get right rather than a hidden pass mark. */}
            <MethodTrack purpose={purpose} cleared={cleared} />

            <div className="scale-legend">
              <span style={{ color: 'var(--periwinkle)' }}>Screen time · {screenCount}</span>
              <span style={{ color: 'var(--teal)' }}>Everything else · {lifeCount}</span>
            </div>
            <p className="tile-hint">
              {day.length} / {slots} hours planned
            </p>

            {/* A planner, not a row of numbered boxes: each hour of the
                evening on its own line with the time down the side. */}
            <div className="slots planner">
              {Array.from({ length: slots }, (_, i) => {
                const item = chosen[i];
                const time = formatClockHour(DAY_START_HOUR + i);
                if (!item) {
                  return (
                    <div key={`empty-${i}`} className="slot">
                      <span className="slot-time">{time}</span>
                      <span className="slot-activity is-empty">Open</span>
                    </div>
                  );
                }
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`slot filled ${item.screen ? 'screen' : 'life'}`}
                    onClick={() => removeFromDay(item.id)}
                    aria-label={`Take "${item.text}" out of ${time}`}
                  >
                    <span className="slot-time">{time}</span>
                    <span className="slot-activity">{item.text}</span>
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
              {balanced && (
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={() => {
                    setScore(lifeCount);
                    setStep('rule');
                  }}
                >
                  That is my day
                </button>
              )}
              {full && !balanced && (
                <p className="tile-hint">
                  {purpose.checks
                    .filter((c) => !met[c.key])
                    .map((c) => c.sub)
                    .join('. ')}
                  . Swap something out and try again.
                </p>
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
