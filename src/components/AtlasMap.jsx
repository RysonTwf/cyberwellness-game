import { Check, Sparkles, Sprout, GraduationCap } from 'lucide-react';
import DialogueCard from './DialogueCard';
import World from '../world/World';
import { ACTIVE_REALMS, orderedActiveRealms } from '../data/realms';

// Same labels/icons as the band-select step in AtlasGate.jsx — shown again
// here so a returning player can see which one they picked, since it's
// asked only once, right at the start.
const BAND_INFO = {
  lower: { label: 'P1–P3', Icon: Sprout },
  higher: { label: 'P4–P6', Icon: GraduationCap },
};

/**
 * Island positions in the map's own viewBox, and in world (0-100) units.
 *
 * The map runs a wider 700x280 viewBox (`.world.atlas-world`, see styles.css)
 * rather than every other scene's 560x280 — 5 islands read as cramped at
 * the narrower width. `world.x` = svg.x / 700 × 100 and `world.y` =
 * (svg.y + 22) / 2.8, so the pin lands right at the island's shoreline.
 * The heights are deliberately uneven so the islands don't read as a row
 * of identical bumps; the x-spacing is roughly even now that there's
 * actually room for it (~125px, pulled in slightly for Fable Falls so it
 * keeps clear of the compass rose).
 */
const ISLANDS = {
  passworld: { svg: { x: 150, y: 190 }, world: { x: 21, y: 76 } },
  privacy: { svg: { x: 275, y: 176 }, world: { x: 39, y: 71 } },
  bullybog: { svg: { x: 400, y: 196 }, world: { x: 57, y: 78 } },
  balance: { svg: { x: 525, y: 178 }, world: { x: 75, y: 71 } },
  // Placeholder position pending the designer's real island art (Milestones
  // Phase 3) — otherwise same even spacing as everyone else now.
  fablefalls: { svg: { x: 630, y: 184 }, world: { x: 90, y: 74 } },
};

const GATE = { x: 6, y: 88 };

/** The map itself — the islands strung along a winding Stream. */
function AtlasScene({ realmProgress }) {
  return (
    <svg viewBox="0 0 700 280" width="100%" aria-hidden="true">
      <rect width="700" height="280" rx="18" fill="#e9eff1" />

      {/* This is a map drawn in a journal, so it gets a chart's furniture: a
          ruled graticule, clouds, birds and a compass rose. Without them the
          top half of the hub — the screen the player returns to most — is a
          large empty grey rectangle. */}
      <g stroke="var(--ink)" strokeWidth="1" opacity="0.055">
        {[40, 80, 120, 160, 200, 240].map((y) => (
          <path key={`h${y}`} d={`M0 ${y} H700`} />
        ))}
        {[70, 140, 210, 280, 350, 420, 490, 560, 630].map((x) => (
          <path key={`v${x}`} d={`M${x} 0 V280`} />
        ))}
      </g>

      {/* a band of open water the Stream runs through */}
      <rect y="150" width="700" height="130" fill="var(--ink)" opacity="0.05" />

      {/* clouds */}
      <g fill="#f6f9fa" opacity="0.9">
        <g>
          <ellipse cx="118" cy="60" rx="34" ry="15" />
          <ellipse cx="144" cy="53" rx="24" ry="17" />
          <ellipse cx="94" cy="54" rx="20" ry="12" />
        </g>
        <g>
          <ellipse cx="352" cy="42" rx="30" ry="13" />
          <ellipse cx="376" cy="36" rx="21" ry="15" />
        </g>
        <g>
          <ellipse cx="238" cy="112" rx="26" ry="10" />
          <ellipse cx="256" cy="107" rx="18" ry="12" />
        </g>
        <g>
          <ellipse cx="560" cy="52" rx="28" ry="12" />
          <ellipse cx="584" cy="46" rx="20" ry="14" />
        </g>
      </g>

      {/* birds, because an empty sky reads as unfinished */}
      <g stroke="var(--ink)" strokeWidth="2" fill="none" opacity="0.3" strokeLinecap="round">
        <path d="M196 82 q7 -6 14 0" />
        <path d="M211 79 q7 -6 14 0" />
        <path d="M300 60 q6 -5 12 0" />
        <path d="M470 96 q7 -6 14 0" />
      </g>

      {/* compass rose */}
      <g transform="translate(642 66)">
        <circle r="27" fill="#f6f9fa" opacity="0.7" />
        <circle r="27" fill="none" stroke="var(--ink)" strokeWidth="1.6" opacity="0.4" />
        <circle r="19" fill="none" stroke="var(--ink)" strokeWidth="1" opacity="0.28" />
        <path d="M-26 0 L0 -6 L26 0 L0 6 Z" fill="var(--ink)" opacity="0.26" />
        <path d="M0 26 L6 0 L0 -26 L-6 0 Z" fill="var(--ink)" opacity="0.42" />
        <path d="M0 -26 L6 0 L0 0 Z" fill="var(--gold)" />
        <text
          x="0"
          y="-30"
          textAnchor="middle"
          fill="var(--ink)"
          opacity="0.55"
          style={{ font: '700 11px var(--font-stamp), monospace', letterSpacing: '0.08em' }}
        >
          N
        </text>
      </g>

      {/* open-water texture, so the sea isn't a flat wash either */}
      <g stroke="var(--ink)" strokeWidth="2" fill="none" opacity="0.12" strokeLinecap="round">
        <path d="M46 252 q10 -6 20 0 t20 0" />
        <path d="M266 258 q10 -6 20 0 t20 0" />
        <path d="M414 246 q10 -6 20 0 t20 0" />
        <path d="M158 268 q10 -6 20 0 t20 0" />
        <path d="M580 256 q10 -6 20 0 t20 0" />
      </g>

      {/* The Stream, running behind the islands */}
      <path
        d="M 4 222 C 70 214, 60 182, 96 176 S 176 168, 224 174 S 306 184, 352 176 S 436 164, 476 170 S 546 174, 558 156 S 618 148, 648 158 S 690 168, 696 150"
        fill="none"
        stroke="var(--ink)"
        strokeWidth="3.5"
        strokeDasharray="9 9"
        strokeLinecap="round"
        opacity="0.32"
      />

      {ACTIVE_REALMS.map((realm) => {
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
 * The Atlas — hub screen. The Traveler walks the Stream between the
 * islands and steps onto whichever one they like the look of.
 */
export default function AtlasMap({ travelerName, realmProgress, allStamped, band, onEnter, onFinale }) {
  const visitedCount = ACTIVE_REALMS.filter((r) => realmProgress[r.id]?.stamped).length;
  const { label: bandLabel, Icon: BandIcon } = BAND_INFO[band] ?? BAND_INFO.lower;
  // Suggested play order (Improvement Plan §4) — only orders the list below,
  // free exploration on the map itself is unaffected.
  const orderedRealms = orderedActiveRealms(band);

  const greeting = allStamped
    ? `${ACTIVE_REALMS.length} stamps, Traveler ${travelerName}. The Gate's been waiting for you.`
    : visitedCount === 0
      ? `Here it is — the whole Atlas. Walk the Stream, ${travelerName}, and step onto whichever island you like the look of.`
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
        <span className="band-chip">
          <BandIcon size={13} strokeWidth={2.4} />
          {bandLabel}
        </span>
        <p style={{ marginTop: 6 }}>
          {ACTIVE_REALMS.length} realm{ACTIVE_REALMS.length === 1 ? '' : 's'}, one Stream running
          between them.
        </p>
      </div>

      <World
        sceneKey="atlas"
        scene={<AtlasScene realmProgress={realmProgress} />}
        // Wider than a single realm's 2:1 scene box — 5 islands need the
        // room (see .world.atlas-world in styles.css + AtlasScene's viewBox).
        className="atlas-world"
        // The Atlas has no realm colour of its own; gold ties the Traveler to
        // the passport and the Gate, and keeps them from reading as a dark
        // smudge against the pale map.
        accent="var(--gold)"
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
