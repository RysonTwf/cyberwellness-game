import { Check, Sparkles } from 'lucide-react';
import DialogueCard from './DialogueCard';
import World from '../world/World';
import Tutorial from './Tutorial';
import { ACTIVE_REALMS, orderedActiveRealms } from '../data/realms';
import { applyScreenOverrides } from '../dev/contentOverrides';

// First look at the hub — taught once (progress `tutorialsSeen.atlas`),
// right after the room tour taught the basic walking controls.
// Exported for the dev-only Copy Editor (src/dev/CopyEditor.jsx).
export const ATLAS_TOUR = [
  {
    target: '.world.atlas-map',
    title: 'The Atlas',
    text: 'A map of every path the internet takes. Tap the water or WASD or arrow keys to sail your paper boat. Pull up close to an island to step ashore.',
  },
  {
    target: '.realm-strip',
    title: 'Five realms',
    text: 'Each island teaches something different. Read here what a realm is about, and what you will learn. Tap a card to travel straight there.',
  },
  {
    target: '.journal-count',
    title: 'Your passport',
    text: 'Finish a realm and it stamps your passport. Collect all five stamps and the Atlas Gate itself will open.',
  },
  {
    title: 'Off you go!',
    text: 'Explore in any order you like. The list is only a suggestion. Pick an island that looks interesting and sail over!',
  },
];

/**
 * Island positions, keyed to the painted map
 * (public/assets/ATLASGATE/Atlas Gate.png — a 2:1 illustration of six
 * islands and the Gate crest on open water). Each `svg` point is that
 * island's centre in the scene's 640x320 viewBox, which the art fills edge
 * to edge, so svg = art pixel ÷ 3. `world` is the same point in the
 * walkable layer's 0-100 units, nudged down a little so the boat pulls up
 * to the near shore rather than sitting on top of the island.
 */
const ISLANDS = {
  passworld: { svg: { x: 104, y: 199 }, world: { x: 16, y: 67 } }, // the castle
  privacy: { svg: { x: 220, y: 76 }, world: { x: 34, y: 30 } }, // the snowy peak
  bullybog: { svg: { x: 271, y: 279 }, world: { x: 42, y: 91 } }, // the frog's marsh
  balance: { svg: { x: 528, y: 242 }, world: { x: 82, y: 81 } }, // the bonfire beach
  fablefalls: { svg: { x: 462, y: 89 }, world: { x: 72, y: 33 } }, // the falls in the cliffs
};

// The Atlas Gate is the crest painted at the centre of the map — the boat
// starts there and every branch fans out from it.
const GATE = { x: 50, y: 55 };
const GATE_SVG = { x: 320, y: 175 };

/**
 * One curved wake from the Gate crest to each island, as a quadratic
 * control point rather than a finished path — the render loop turns each
 * into the trail's `d`, so they can't drift. Each heads off in its own
 * direction so the trails fan out instead of bunching at the crest.
 */
const BRANCH_CTRL = {
  passworld: { x: 205, y: 205 },
  privacy: { x: 250, y: 110 },
  bullybog: { x: 305, y: 240 },
  balance: { x: 435, y: 225 },
  fablefalls: { x: 405, y: 115 },
};

/** The map: the painted islands, a faint wake to each, and progress marks. */
function AtlasScene({ realmProgress }) {
  const allDone = ACTIVE_REALMS.every((r) => realmProgress[r.id]?.stamped);
  return (
    <svg
      viewBox="0 0 640 320"
      width="100%"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <image
        href="/assets/ATLASGATE/Atlas Gate.png"
        x="0"
        y="0"
        width="640"
        height="320"
        preserveAspectRatio="xMidYMid slice"
      />

      {/* A faint wake from the Gate crest out to each island — the "branches"
          the tour talks about, kept light so the painting carries. */}
      {ACTIVE_REALMS.map((realm) => {
        const ctrl = BRANCH_CTRL[realm.id];
        const end = ISLANDS[realm.id].svg;
        const d = `M${GATE_SVG.x} ${GATE_SVG.y} Q${ctrl.x} ${ctrl.y} ${end.x} ${end.y}`;
        return (
          <path
            key={`branch-${realm.id}`}
            d={d}
            fill="none"
            stroke="#f2fbfa"
            strokeWidth="2.4"
            strokeDasharray="1 9"
            strokeLinecap="round"
            opacity="0.4"
          />
        );
      })}

      {/* A stamp tick on each island whose passport stamp is earned — the
          realm pins themselves (World hotspots) already mark and colour each
          island, so nothing is drawn for the unvisited ones. */}
      {ACTIVE_REALMS.map((realm) => {
        if (!realmProgress[realm.id]?.stamped) return null;
        const { x, y } = ISLANDS[realm.id].svg;
        return (
          <g key={realm.id}>
            <circle cx={x + 30} cy={y - 26} r="11" fill={realm.accent} />
            <circle cx={x + 30} cy={y - 26} r="11" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.9" />
            <path
              d={`M ${x + 25} ${y - 26} l 3.2 3.4 l 6 -6.6`}
              fill="none"
              stroke="#fff"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        );
      })}

      {/* The Gate crest lights up once the whole Atlas is stamped. */}
      {allDone && (
        <circle
          cx={GATE_SVG.x}
          cy={GATE_SVG.y - 4}
          r="32"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="3"
          opacity="0.75"
        />
      )}
    </svg>
  );
}

/**
 * The Atlas — hub screen. The Traveler walks out from the Gate along
 * whichever branch they like and steps onto that island — every realm is
 * reachable from the start.
 */
export default function AtlasMap({
  travelerName,
  realmProgress,
  allStamped,
  band,
  atlasPos,
  onAtlasMove,
  onEnter,
  onFinale,
  showTutorial,
  onTutorialDone,
}) {
  const visitedCount = ACTIVE_REALMS.filter((r) => realmProgress[r.id]?.stamped).length;
  // Suggested play order (Improvement Plan §4) — only orders the list below,
  // free exploration on the map itself is unaffected.
  const orderedRealms = orderedActiveRealms(band);

  const greeting = allStamped
    ? `${ACTIVE_REALMS.length} stamps, Traveller ${travelerName}. The Gate's been waiting for you.`
    : visitedCount === 0
      ? `Here it is: the whole Atlas. Pick a branch, ${travelerName}, and step onto any island you like.`
      : `${visitedCount} down, ${ACTIVE_REALMS.length - visitedCount} to go. Where to next, ${travelerName}?`;

  const hotspots = ACTIVE_REALMS.map((realm) => ({
    id: realm.id,
    ...ISLANDS[realm.id].world,
    label: realm.name,
    action: realmProgress[realm.id]?.stamped ? 'Visit again' : 'Travel here',
    accent: realm.accent,
  }));

  if (allStamped) {
    hotspots.push({
      id: 'finale',
      x: GATE.x + 2,
      y: GATE.y - 4,
      label: 'The Atlas Gate',
      action: 'Finish',
      accent: 'var(--gold)',
    });
  }

  return (
    <div className="fold">
      {showTutorial && (
        <Tutorial
          steps={applyScreenOverrides(ATLAS_TOUR, 'atlasTour')}
          accent="var(--gold)"
          onDone={onTutorialDone}
        />
      )}

      {/* Map on one side, Comet and the realm list on the other, so the whole
          hub fits the window without the page ever scrolling. */}
      <div className="stage">
        <div className="stage-main">
          <World
        sceneKey="atlas"
        scene={<AtlasScene realmProgress={realmProgress} />}
        // Same 2:1 box as a realm scene, matching the painted map art
        // (see .world.atlas-map in styles.css + AtlasScene's viewBox), just
        // with a tighter width cap.
        className="atlas-map"
        // The Atlas has no realm colour of its own; gold ties the Traveler to
        // the passport and the Gate, and keeps them from reading as a dark
        // smudge against the pale map.
        accent="var(--gold)"
        // Back to wherever the boat was left, not the Gate — see onAtlasMove.
        spawn={atlasPos ?? GATE}
        bounds={{ minX: 4, maxX: 96, minY: 12, maxY: 92 }}
        hotspots={hotspots}
        vehicle="boat"
        onMove={onAtlasMove}
        objective={
          allStamped ? 'Walk back to the Atlas Gate' : 'Pick a branch and step onto an island'
        }
            onInteract={(spot) => (spot.id === 'finale' ? onFinale() : onEnter(spot.id))}
          />
        </div>

        <aside className="stage-side">
          <div className="atlas-head">
            <h2>The Atlas</h2>
            <p style={{ marginTop: 6 }}>
              {ACTIVE_REALMS.length} realm{ACTIVE_REALMS.length === 1 ? '' : 's'}, branching out
              from the Gate.
            </p>
          </div>

          <DialogueCard who="Comet" text={greeting} />

        {/* A plain list as well as the map — walking isn't the only way in.
            Ordered per the suggested pacing for this band (Improvement Plan
            §4); the map above stays free-exploration regardless of order. */}
        <div className="realm-strip">
          {orderedRealms.map((realm) => {
            const visited = realmProgress[realm.id]?.stamped;
            return (
              <button
                key={realm.id}
                type="button"
                className={`strip-card${visited ? ' visited' : ''}`}
                style={{ '--accent': realm.accent, '--accent-wash': realm.accentWash }}
                onClick={() => onEnter(realm.id)}
              >
                <span className="strip-top">
                  <span className="pin-label">{realm.name}</span>
                  {visited && <Check size={15} strokeWidth={3} style={{ color: realm.accent }} />}
                </span>
                <span className="strip-topic">{realm.topic}</span>
                {/* What the realm is about and what's taught there — the
                    entry popup (RealmIntro) tells the fuller story. */}
                <span className="strip-blurb">{realm.blurb}</span>
                {realm.intro?.learnShort && (
                  <span className="strip-learn">{realm.intro.learnShort}</span>
                )}
              </button>
            );
          })}
        </div>

        {allStamped && (
          <button
            type="button"
            className="btn btn-accent"
            style={{ '--accent': 'var(--gold)', width: '100%' }}
            onClick={onFinale}
          >
            <Sparkles size={19} />
            Return to the Atlas Gate
          </button>
        )}
        </aside>
      </div>
    </div>
  );
}
