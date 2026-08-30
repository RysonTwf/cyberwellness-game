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
    text: 'Each island teaches something different. Read here what a realm is about, and what you’ll learn. Tap a card to travel straight there.',
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
 * Island positions in the map's own viewBox, and in world (0-100) units.
 *
 * The map runs a 640x356 viewBox (`.world.atlas-map`, see styles.css) — a
 * true top-down spread rather than a single left-to-right row, so islands
 * sit at different heights as well as different widths (closer to a real
 * overworld map you'd walk in any direction on). `world.x` = svg.x / 640 ×
 * 100 and `world.y` = (svg.y + 22) / 356 × 100, so the pin lands right at
 * the island's shoreline.
 */
const ISLANDS = {
  passworld: { svg: { x: 190, y: 90 }, world: { x: 29.7, y: 31.5 } },
  privacy: { svg: { x: 420, y: 60 }, world: { x: 65.6, y: 23 } },
  bullybog: { svg: { x: 120, y: 230 }, world: { x: 18.8, y: 70.8 } },
  balance: { svg: { x: 340, y: 270 }, world: { x: 53.1, y: 82 } },
  fablefalls: { svg: { x: 560, y: 160 }, world: { x: 87.5, y: 51.1 } },
};

const GATE = { x: 8, y: 84 };
const GATE_SVG = { x: 50, y: 300 };

/**
 * One curved branch from the Gate to each island's shore (the point where
 * the island path in the render loop below starts, `x - 42, y + 14`), as a
 * quadratic control point rather than a finished path string — the render
 * loop below turns each into both the trail's `d` and its bead positions,
 * so the two can never drift apart. With islands spread across the whole
 * canvas instead of a single row, each branch heads in its own distinct
 * direction, so the beads fan out instead of bunching at the Gate.
 */
const BRANCH_CTRL = {
  passworld: { x: 70, y: 180 },
  privacy: { x: 180, y: 120 },
  bullybog: { x: 40, y: 260 },
  balance: { x: 170, y: 340 },
  fablefalls: { x: 340, y: 280 },
};

/** A simple palm tree, planted at (x, y) with its base on the ground. */
function PalmTree({ x, y, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 0 Q-3 -16 3 -30" fill="none" stroke="#7a5233" strokeWidth="3.4" strokeLinecap="round" />
      <g fill="#3f8f4f">
        <path d="M3 -30 Q-16 -34 -22 -22 Q-8 -26 3 -30" />
        <path d="M3 -30 Q22 -30 26 -16 Q10 -24 3 -30" />
        <path d="M3 -30 Q-6 -42 -22 -40 Q-8 -34 3 -30" />
        <path d="M3 -30 Q14 -44 30 -38 Q14 -36 3 -30" />
        <path d="M3 -30 Q3 -46 -6 -52 Q1 -38 3 -30" />
      </g>
    </g>
  );
}

/** A fish silhouette, swimming somewhere under the open water. */
function FishMark({ x, y, scale = 1, flip = false }) {
  return (
    <g
      transform={`translate(${x} ${y}) scale(${scale * (flip ? -1 : 1)}, ${scale})`}
      fill="#0d3a3f"
      opacity="0.18"
    >
      <path d="M-14 0 Q-6 -7 6 -4 Q14 -2 16 0 Q14 2 6 4 Q-6 7 -14 0 Z" />
      <path d="M-14 0 L-20 -5 L-20 5 Z" />
    </g>
  );
}

/** The map itself — five beaded trails branching out from the Gate. */
function AtlasScene({ realmProgress }) {
  return (
    <svg viewBox="0 0 640 356" width="100%" aria-hidden="true">
      <rect width="640" height="356" rx="18" fill="#2f8f96" />

      {/* A chart's furniture, pirate-map style: a ruled graticule over open
          water, drifting ship silhouettes, and a compass rose. */}
      <g stroke="#dff3f2" strokeWidth="1" opacity="0.16">
        {[40, 80, 120, 160, 200, 240, 280, 320].map((y) => (
          <path key={`h${y}`} d={`M0 ${y} H640`} />
        ))}
        {[60, 120, 180, 240, 300, 360, 420, 480, 540, 600].map((x) => (
          <path key={`v${x}`} d={`M${x} 0 V356`} />
        ))}
      </g>

      <FishMark x={300} y={40} scale={1.1} />
      <FishMark x={590} y={280} scale={0.9} flip />
      <FishMark x={230} y={330} scale={0.8} />
      <FishMark x={470} y={330} scale={0.95} flip />

      {/* open-water ripple texture, tucked into the gaps between islands */}
      <g stroke="#dff3f2" strokeWidth="2" fill="none" opacity="0.16" strokeLinecap="round">
        <path d="M300 130 q10 -6 20 0 t20 0" />
        <path d="M470 220 q10 -6 20 0 t20 0" />
        <path d="M220 60 q10 -6 20 0 t20 0" />
        <path d="M480 100 q10 -6 20 0 t20 0" />
      </g>

      {/* Five trails, fanning out from the Gate to each island — a plain
          wake line each, no waypoint markers cluttering the water. */}
      {ACTIVE_REALMS.map((realm) => {
        const ctrl = BRANCH_CTRL[realm.id];
        const end = ISLANDS[realm.id].svg;
        const shore = { x: end.x - 42, y: end.y + 14 };
        const d = `M${GATE_SVG.x} ${GATE_SVG.y} Q${ctrl.x} ${ctrl.y} ${shore.x} ${shore.y}`;
        return (
          <path
            key={`branch-${realm.id}`}
            d={d}
            fill="none"
            stroke="#dff3f2"
            strokeWidth="2.4"
            strokeDasharray="1 9"
            strokeLinecap="round"
            opacity="0.5"
          />
        );
      })}

      {ACTIVE_REALMS.map((realm) => {
        const { x, y } = ISLANDS[realm.id].svg;
        const visited = realmProgress[realm.id]?.stamped;
        return (
          <g key={realm.id}>
            <ellipse cx={x} cy={y + 22} rx="52" ry="14" fill="#0d3a3f" opacity="0.18" />
            <path
              d={`M ${x - 42} ${y + 14}
                  q 5 -32 19 -36
                  q 11 -15 25 -6
                  q 21 -4 27 19
                  q 13 8 9 23 Z`}
              fill={visited ? '#caa06b' : '#d8b686'}
            />
            <path
              d={`M ${x - 42} ${y + 14}
                  q 5 -32 19 -36
                  q 11 -15 25 -6
                  q 21 -4 27 19
                  q 13 8 9 23 Z`}
              fill="none"
              stroke="#8a6238"
              strokeWidth="2"
              opacity="0.4"
            />
            <PalmTree x={x - 20} y={y + 8} scale={0.85} />
            {/* a marker flag on each island, coloured per realm */}
            <rect x={x - 1} y={y - 56} width="3.5" height="30" rx="1.7" fill="var(--ink)" opacity="0.6" />
            <path d={`M ${x + 2.5} ${y - 56} l 22 8 l -22 8 Z`} fill={realm.accent} />
            {visited && (
              <g>
                <circle cx={x + 32} cy={y - 28} r="12" fill={realm.accent} />
                <path
                  d={`M ${x + 27} ${y - 28} l 3.5 3.7 l 6.5 -7.2`}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            )}
          </g>
        );
      })}

      {/* the Gate you arrived through, bottom-left corner */}
      <g transform={`translate(${GATE_SVG.x - 36} ${GATE_SVG.y - 24})`} opacity="0.7">
        <rect x="0" y="0" width="7" height="42" rx="3.5" fill="var(--ink)" />
        <rect x="32" y="0" width="7" height="42" rx="3.5" fill="var(--ink)" />
        <rect x="-5" y="-10" width="49" height="10" rx="5" fill="var(--ink)" />
      </g>

      {/* compass rose, top-left */}
      <g transform="translate(46 46)">
        <circle r="24" fill="#f6f9fa" opacity="0.85" />
        <circle r="24" fill="none" stroke="var(--ink)" strokeWidth="1.6" opacity="0.4" />
        <circle r="17" fill="none" stroke="var(--ink)" strokeWidth="1" opacity="0.28" />
        <path d="M-23 0 L0 -5 L23 0 L0 5 Z" fill="var(--ink)" opacity="0.26" />
        <path d="M0 23 L5 0 L0 -23 L-5 0 Z" fill="var(--ink)" opacity="0.42" />
        <path d="M0 -23 L5 0 L0 0 Z" fill="var(--gold)" />
        <text
          x="0"
          y="-27"
          textAnchor="middle"
          fill="var(--ink)"
          opacity="0.55"
          style={{ font: '700 10px var(--font-stamp), monospace', letterSpacing: '0.08em' }}
        >
          N
        </text>
      </g>

      {/* anchor badge, bottom-right */}
      <g transform="translate(602 320)">
        <circle r="17" fill="var(--ink)" opacity="0.16" />
        <g stroke="var(--ink)" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.6">
          <circle cx="0" cy="-8" r="3" />
          <path d="M0 -5 V9" />
          <path d="M-8 4 Q0 13 8 4" />
          <path d="M-6 0 H6" />
        </g>
      </g>
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
        // Wider than a single realm's 2:1 scene box — 5 islands need the
        // room (see .world.atlas-map in styles.css + AtlasScene's viewBox).
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
