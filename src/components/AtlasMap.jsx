import { Check, Sparkles } from 'lucide-react';
import DialogueCard from './DialogueCard';
import World from '../world/World';
import { REALMS } from '../data/realms';

/** Island positions in the map's own viewBox, and in world (0-100) units. */
const ISLANDS = {
  passworld: { svg: { x: 96, y: 186 }, world: { x: 17, y: 74 } },
  privacy: { svg: { x: 224, y: 186 }, world: { x: 40, y: 74 } },
  bullybog: { svg: { x: 352, y: 186 }, world: { x: 63, y: 74 } },
  balance: { svg: { x: 476, y: 186 }, world: { x: 85, y: 74 } },
};

const GATE = { x: 6, y: 88 };

/** The map itself — four islands strung along a winding Stream. */
function AtlasScene({ realmProgress }) {
  return (
    <svg viewBox="0 0 560 280" width="100%" aria-hidden="true">
      <rect width="560" height="280" rx="18" fill="#e9eff1" />
      {/* a band of open water the Stream runs through */}
      <rect y="150" width="560" height="130" fill="var(--ink)" opacity="0.05" />

      {/* The Stream, running behind the islands */}
      <path
        d="M 4 222 C 70 214, 60 182, 96 176 S 176 168, 224 174 S 306 184, 352 176 S 436 164, 476 170 S 546 174, 558 156"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="3.5"
        strokeDasharray="9 9"
        strokeLinecap="round"
        opacity="0.32"
      />

      {REALMS.map((realm) => {
        const { x, y } = ISLANDS[realm.id].svg;
        const visited = realmProgress[realm.id]?.stamped;
        return (
          <g key={realm.id}>
            <ellipse cx={x} cy={y + 22} rx="52" ry="14" fill={realm.accent} opacity="0.22" />
            <path
              d={`M ${x - 42} ${y + 14}
                  q 5 -32 19 -36
                  q 11 -15 25 -6
                  q 21 -4 27 19
                  q 13 8 9 23 Z`}
              fill={realm.accent}
              opacity={visited ? 0.92 : 0.55}
            />
            <path
              d={`M ${x - 42} ${y + 14}
                  q 5 -32 19 -36
                  q 11 -15 25 -6
                  q 21 -4 27 19
                  q 13 8 9 23 Z`}
              fill="none"
              stroke="var(--ink)"
              strokeWidth="2"
              opacity="0.14"
            />
            {/* a marker flag on each island */}
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

      {/* the Gate you arrived through */}
      <g opacity="0.55">
        <rect x="14" y="186" width="7" height="42" rx="3.5" fill="var(--ink)" />
        <rect x="46" y="186" width="7" height="42" rx="3.5" fill="var(--ink)" />
        <rect x="9" y="176" width="49" height="10" rx="5" fill="var(--ink)" />
      </g>
    </svg>
  );
}

/**
 * The Atlas — hub screen. The Traveler walks the Stream between the four
 * islands and steps onto whichever one they like the look of.
 */
export default function AtlasMap({ travelerName, realmProgress, allStamped, onEnter, onFinale }) {
  const visitedCount = REALMS.filter((r) => realmProgress[r.id]?.stamped).length;

  const greeting = allStamped
    ? `Four stamps, Traveler ${travelerName}. The Gate's been waiting for you.`
    : visitedCount === 0
      ? `Here it is — the whole Atlas. Walk the Stream, ${travelerName}, and step onto whichever island you like the look of.`
      : `${visitedCount} down, ${REALMS.length - visitedCount} to go. Where to next, ${travelerName}?`;

  const hotspots = REALMS.map((realm) => ({
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
      y: 78,
      label: 'The Atlas Gate',
      action: 'Finish',
      accent: 'var(--gold)',
    });
  }

  return (
    <div className="fold">
      <div className="atlas-head">
        <h2>The Atlas</h2>
        <p style={{ marginTop: 6 }}>Four realms, one Stream running between them.</p>
      </div>

      <World
        sceneKey="atlas"
        scene={<AtlasScene realmProgress={realmProgress} />}
        spawn={GATE}
        bounds={{ minX: 4, maxX: 94, minY: 68, maxY: 92 }}
        hotspots={hotspots}
        objective={
          allStamped ? 'Walk back to the Atlas Gate' : 'Walk to an island and step onto it'
        }
        onInteract={(spot) => (spot.id === 'finale' ? onFinale() : onEnter(spot.id))}
      />

      <div className="stack" style={{ marginTop: 18 }}>
        <DialogueCard who="Comet" text={greeting} />

        {/* A plain list as well as the map — walking isn't the only way in. */}
        <div className="realm-strip">
          {REALMS.map((realm) => {
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
      </div>
    </div>
  );
}
