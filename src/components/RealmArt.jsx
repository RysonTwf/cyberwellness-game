/**
 * Scene art — one illustrated 2D world per realm (design.md §4 layout, §9
 * "all character and scene art built from SVG shapes/icons").
 *
 * Each scene takes a `mood`:
 *   'before'  — how the realm looks when you arrive
 *   'after'   — how it looks once the Traveler has made the safe choice
 * The change is the reward for the decision: the vault opens, the fog lifts,
 * the water clears, the tide goes out.
 *
 * The viewBox is 560x280 and the bottom third is the walkable ground, which
 * is why nothing important is drawn below y=200 — the Traveler walks there.
 */

const SKY = '#e9eff1';
const INK = 'var(--ink)';

/** Shared: a soft sky panel behind everything. */
function Sky({ tint, opacity = 0.14 }) {
  return (
    <>
      <rect width="560" height="280" rx="18" fill={SKY} />
      <rect width="560" height="280" rx="18" fill={tint} opacity={opacity} />
    </>
  );
}

/* ------------------------------------------------------------ Passworld -- */
/* A walled kingdom of vault doors, all slightly different sizes. */
function PassworldScene({ mood }) {
  const open = mood === 'after';
  const gold = 'var(--gold)';

  return (
    <svg viewBox="0 0 560 280" width="100%" aria-hidden="true">
      <Sky tint={gold} />

      {/* clouds over the kingdom, filling the band of sky above the wall */}
      <g fill="#f6f9fa" opacity="0.9">
        <g>
          <ellipse cx="188" cy="54" rx="34" ry="14" />
          <ellipse cx="214" cy="47" rx="24" ry="16" />
          <ellipse cx="162" cy="48" rx="20" ry="11" />
        </g>
        <g>
          <ellipse cx="392" cy="40" rx="28" ry="12" />
          <ellipse cx="414" cy="34" rx="20" ry="14" />
        </g>
        <g>
          <ellipse cx="286" cy="26" rx="24" ry="10" />
          <ellipse cx="304" cy="22" rx="16" ry="11" />
        </g>
      </g>
      <g stroke={INK} strokeWidth="2" fill="none" opacity="0.22" strokeLinecap="round">
        <path d="M330 68 q7 -6 14 0" />
        <path d="M346 64 q7 -6 14 0" />
      </g>

      {/* distant towers */}
      <g fill={gold} opacity="0.45">
        <rect x="42" y="52" width="30" height="104" rx="6" />
        <rect x="490" y="64" width="28" height="92" rx="6" />
        <path d="M40 52 l17 -20 l17 20 Z" />
        <path d="M488 64 l16 -19 l16 19 Z" />
      </g>
      <g fill={INK} opacity="0.16">
        <rect x="52" y="74" width="10" height="14" rx="4" />
        <rect x="499" y="84" width="10" height="14" rx="4" />
      </g>

      {/* the wall */}
      <rect x="14" y="112" width="532" height="76" rx="8" fill={gold} opacity="0.6" />
      <rect x="14" y="112" width="532" height="76" rx="8" fill="none" stroke={INK} strokeWidth="2" opacity="0.16" />
      {/* stone courses */}
      <g stroke={INK} strokeWidth="1.5" opacity="0.13">
        <path d="M14 138 H546" />
        <path d="M14 164 H546" />
      </g>
      {/* crenellations */}
      <g fill={gold} opacity="0.75">
        {Array.from({ length: 16 }, (_, i) => (
          <rect key={i} x={22 + i * 33} y="96" width="20" height="18" rx="4" />
        ))}
      </g>

      {/* side vault doors, deliberately mismatched sizes */}
      {[
        { x: 74, y: 126, w: 40, h: 56 },
        { x: 138, y: 138, w: 30, h: 44 },
        { x: 408, y: 132, w: 34, h: 50 },
        { x: 466, y: 144, w: 26, h: 38 },
      ].map((d, i) => (
        <g key={i}>
          <rect x={d.x} y={d.y} width={d.w} height={d.h} rx={d.w / 2.6} fill={INK} opacity="0.42" />
          <circle cx={d.x + d.w / 2} cy={d.y + d.h / 2} r={d.w / 6} fill="none" stroke={SKY} strokeWidth="3" />
        </g>
      ))}

      {/* the main gate — swings open once Vex is satisfied */}
      <g>
        <rect x="228" y="86" width="104" height="102" rx="50" fill={INK} opacity="0.14" />
        {open ? (
          <>
            <rect x="242" y="98" width="76" height="90" rx="38" fill="#f6f9fa" />
            <path d="M258 188 L280 122 L302 188 Z" fill={gold} opacity="0.5" />
            <circle cx="280" cy="128" r="9" fill={gold} />
            {/* the way through */}
            <path d="M280 188 v-52" stroke={gold} strokeWidth="3" strokeDasharray="6 6" opacity="0.8" />
          </>
        ) : (
          <>
            <rect x="242" y="98" width="76" height="90" rx="38" fill={INK} opacity="0.62" />
            <path d="M280 98 v90" stroke={SKY} strokeWidth="3" opacity="0.8" />
            <circle cx="280" cy="140" r="17" fill="none" stroke={SKY} strokeWidth="4" />
            <path d="M280 140 L291 129" stroke={SKY} strokeWidth="4" strokeLinecap="round" />
          </>
        )}
      </g>

      {/* Keeper Vex, with a very long clipboard. Dropped so the base of the
          body lands on the ground line at y=188 instead of hovering above it. */}
      <g transform="translate(348 132)">
        <rect x="0" y="0" width="50" height="56" rx="16" fill={gold} />
        <rect x="0" y="0" width="50" height="56" rx="16" fill="none" stroke={INK} strokeWidth="2" opacity="0.2" />
        <circle cx="15" cy="20" r="4.4" fill={INK} opacity="0.75" />
        <circle cx="35" cy="20" r="4.4" fill={INK} opacity="0.75" />
        <path
          d={open ? 'M15 37 Q25 46 35 37' : 'M15 40 Q25 33 35 40'}
          stroke={INK}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* vault dial on Vex's belly */}
        <circle cx="25" cy="56" r="6" fill={INK} opacity="0.2" />
        {/* clipboard */}
        <rect x="54" y="12" width="18" height="64" rx="4" fill={INK} opacity="0.5" />
        {Array.from({ length: 7 }, (_, i) => (
          <rect key={i} x="58" y={19 + i * 8} width="10" height="2.5" rx="1.2" fill={SKY} opacity="0.95" />
        ))}
      </g>

      {/* ground */}
      <rect x="0" y="188" width="560" height="92" fill={gold} opacity="0.26" />
      <path d="M0 188 H560" stroke={INK} strokeWidth="2" opacity="0.14" />
    </svg>
  );
}

/* -------------------------------------------------------- Privacy Peaks -- */
function PrivacyScene({ mood }) {
  const clear = mood === 'after';
  const teal = 'var(--teal)';

  return (
    <svg viewBox="0 0 560 280" width="100%" aria-hidden="true">
      <Sky tint={teal} opacity="0.1" />

      {/* far ridge */}
      <path
        d="M0 168 L92 64 L166 132 L240 48 L330 148 L412 76 L484 140 L560 62 L560 280 L0 280 Z"
        fill={teal}
        opacity="0.3"
      />
      {/* near ridge */}
      <path
        d="M0 198 L78 116 L158 186 L254 98 L342 190 L436 118 L516 194 L560 152 L560 280 L0 280 Z"
        fill={teal}
        opacity="0.55"
      />
      {/* snow caps for definition */}
      <g fill="#f6f9fa" opacity="0.75">
        <path d="M254 98 l16 18 l-32 0 Z" />
        <path d="M436 118 l14 16 l-28 0 Z" />
        <path d="M78 116 l14 16 l-28 0 Z" />
      </g>

      {/* the lookout post */}
      <g transform="translate(66 158)">
        <rect x="0" y="18" width="62" height="10" rx="5" fill={INK} opacity="0.55" />
        <rect x="8" y="28" width="7" height="34" rx="3.5" fill={INK} opacity="0.4" />
        <rect x="47" y="28" width="7" height="34" rx="3.5" fill={INK} opacity="0.4" />
        <rect x="28" y="-22" width="5" height="40" rx="2.5" fill={INK} opacity="0.6" />
        <path d="M33 -22 l24 8 l-24 8 Z" fill={teal} />
      </g>

      {/* The path forward — only visible once the fog thins. It starts down on
          the walkable ground and recedes up the ridge, passing through the
          'rule' pin at (470, 213) so the pin sits on the path, not beside it. */}
      <path
        d="M360 262 Q424 238 462 214 T546 170"
        fill="none"
        stroke={teal}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="10 10"
        opacity={clear ? 0.95 : 0}
        style={{ transition: 'opacity 0.6s ease' }}
      />

      {/* A shape in the fog, never quite resolving. It is drawn UNDER the fog on
          purpose — the whole point of the Fog is that you can't make out who is
          on the other side, and painting the face on top resolved it perfectly. */}
      {!clear && (
        <g transform="translate(392 116)">
          <circle cx="24" cy="24" r="27" fill={teal} opacity="0.5" />
          <circle cx="15" cy="19" r="3.6" fill={INK} opacity="0.6" />
          <circle cx="33" cy="19" r="3.6" fill={INK} opacity="0.6" />
          <path d="M14 34 Q24 40 34 34" stroke={INK} strokeWidth="2.6" fill="none" opacity="0.45" strokeLinecap="round" />
        </g>
      )}

      {/* the fog */}
      <g style={{ transition: 'opacity 0.6s ease' }} opacity={clear ? 0.18 : 1}>
        <ellipse cx="176" cy="150" rx="132" ry="36" fill="#eef3f4" opacity="0.92" />
        <ellipse cx="372" cy="182" rx="164" ry="40" fill="#eef3f4" opacity="0.92" />
        <ellipse cx="292" cy="118" rx="120" ry="28" fill="#f2f6f7" opacity="0.9" />
        <ellipse cx="486" cy="140" rx="104" ry="30" fill="#eef3f4" opacity="0.86" />
      </g>

      {/* ground */}
      <rect x="0" y="222" width="560" height="58" fill={teal} opacity="0.24" />
    </svg>
  );
}

/* ------------------------------------------------------------ Bully Bog -- */
function BogScene({ mood }) {
  const clear = mood === 'after';
  const coral = 'var(--coral)';
  const green = 'var(--teal)';

  return (
    <svg viewBox="0 0 560 280" width="100%" aria-hidden="true">
      <Sky tint={green} opacity="0.1" />

      {/* The far side of the bog. Without it the water simply begins in mid-air
          at y=150; a treeline gives it another bank to start from and fills a
          sky that was otherwise empty. */}
      {/* Two overlapping layers of canopy at different depths — one row of
          evenly-sized circles reads as bubbles, not as trees. */}
      <g fill={green} opacity="0.2">
        {[
          [18, 116, 32],
          [92, 106, 27],
          [174, 114, 34],
          [258, 104, 29],
          [342, 116, 31],
          [424, 106, 28],
          [508, 114, 33],
          [556, 110, 26],
        ].map(([cx, cy, r]) => (
          <circle key={`b${cx}`} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <g fill={INK} opacity="0.16">
        {[52, 158, 274, 398, 520].map((x) => (
          <rect key={x} x={x - 3.5} y="124" width="7" height="30" rx="2.5" />
        ))}
      </g>
      <g fill={green} opacity="0.42">
        {[
          [52, 130, 23],
          [104, 138, 16],
          [158, 126, 25],
          [212, 136, 18],
          [274, 128, 22],
          [332, 138, 17],
          [398, 126, 26],
          [458, 136, 19],
          [520, 130, 23],
        ].map(([cx, cy, r]) => (
          <circle key={`f${cx}`} cx={cx} cy={cy} r={r} />
        ))}
      </g>
      <path d="M0 148 Q90 140 190 146 T380 144 T560 148 L560 158 L0 158 Z" fill={green} opacity="0.42" />

      {/* the water — darkens when unkind things land in it */}
      <rect
        x="0"
        y="150"
        width="560"
        height="130"
        fill={clear ? green : INK}
        opacity={clear ? 0.34 : 0.4}
        style={{ transition: 'fill 0.6s ease, opacity 0.6s ease' }}
      />
      <path d="M0 150 H560" stroke={INK} strokeWidth="2" opacity="0.2" />

      {/* ripples, kept inside the open water between y=150 and the bank */}
      <g stroke="#f6f9fa" strokeWidth="2.4" fill="none" opacity="0.5">
        <path d="M44 178 q18 -7 36 0 t36 0" />
        <path d="M436 162 q18 -7 36 0 t36 0" />
        <path d="M196 172 q18 -7 36 0 t36 0" />
      </g>

      {/* The near bank. The walkable strip starts at scene y=196, so the bog
          needs a shore under it — without this the Traveler walks on water. */}
      <path
        d="M0 188 Q130 178 270 186 T560 182 L560 280 L0 280 Z"
        fill={green}
        opacity="0.5"
      />
      <path d="M0 188 Q130 178 270 186 T560 182" fill="none" stroke={INK} strokeWidth="2" opacity="0.18" />

      {/* reeds */}
      <g stroke={green} strokeWidth="5" strokeLinecap="round" opacity="0.9">
        <path d="M26 158 q-8 -44 4 -62" />
        <path d="M48 158 q6 -36 -2 -52" />
        <path d="M532 158 q8 -42 -6 -60" />
        <path d="M510 158 q-6 -32 4 -48" />
      </g>

      {/* lily pads, floating on the water rather than beached on the bank */}
      <g fill={green} opacity="0.8">
        <ellipse cx="118" cy="160" rx="38" ry="12" />
        <ellipse cx="466" cy="176" rx="30" ry="10" />
      </g>

      {/* Pockets — sunk low, or up and singing again. Both positions keep them
          in the water, between the far edge at y=150 and the bank at y=186. */}
      <g transform={`translate(232 ${clear ? 96 : 118})`} style={{ transition: 'transform 0.6s ease' }}>
        <ellipse cx="48" cy="66" rx="54" ry="14" fill={green} opacity="0.85" />
        <path d="M12 62 Q48 30 84 62 Q84 72 48 72 Q12 72 12 62 Z" fill={green} />
        <circle cx="32" cy="34" r="12" fill={green} />
        <circle cx="64" cy="34" r="12" fill={green} />
        <circle cx="32" cy="34" r="5" fill="#f6f9fa" />
        <circle cx="64" cy="34" r="5" fill="#f6f9fa" />
        <circle cx={clear ? 32 : 33} cy={clear ? 32 : 36} r="2.6" fill={INK} />
        <circle cx={clear ? 64 : 65} cy={clear ? 32 : 36} r="2.6" fill={INK} />
        <path
          d={clear ? 'M34 52 Q48 62 62 52' : 'M36 57 Q48 51 60 57'}
          stroke="#f6f9fa"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* the song, back in the air once the water clears */}
      {clear && (
        <g fill={green}>
          <g transform="translate(342 52)">
            <rect x="11" y="0" width="3" height="19" rx="1.5" />
            <circle cx="8.5" cy="20" r="5" />
          </g>
          <g transform="translate(378 32)">
            <rect x="11" y="0" width="3" height="19" rx="1.5" />
            <circle cx="8.5" cy="20" r="5" />
          </g>
        </g>
      )}

      {/* the comment, hanging over the water until it's answered */}
      {!clear && (
        <g transform="translate(340 26)">
          <path
            d="M0 0 h164 a10 10 0 0 1 10 10 v38 a10 10 0 0 1 -10 10 h-118 l-19 17 v-17 h-27 a10 10 0 0 1 -10 -10 v-38 a10 10 0 0 1 10 -10 z"
            fill={coral}
          />
          <g fill="#fff" opacity="0.95">
            <rect x="18" y="18" width="98" height="5" rx="2.5" />
            <rect x="18" y="32" width="130" height="5" rx="2.5" />
          </g>
        </g>
      )}
    </svg>
  );
}

/* --------------------------------------------------------- Balance Bay -- */
function BayScene({ mood }) {
  const settled = mood === 'after';
  const peri = 'var(--periwinkle)';
  const warm = 'var(--gold)';

  // The horizon is fixed; it's the shoreline that moves. The Glimmer holds the
  // tide high up the beach, and letting go lets it draw back toward the sea —
  // so the whole beach group slides up the screen, exposing more sand.
  const tideShift = settled ? -26 : 0;

  return (
    <svg viewBox="0 0 560 280" width="100%" aria-hidden="true">
      <Sky tint={peri} opacity="0.12" />

      {/* dusk sun, low */}
      <circle cx="92" cy="82" r="32" fill={warm} opacity={settled ? 0.7 : 0.34} />

      {/* Sunset-lit cloud bars, and the first stars — which only really come out
          once the Glimmer is put down. Looking up is part of the reward. */}
      <g fill={warm} opacity="0.26">
        <g>
          <ellipse cx="112" cy="120" rx="46" ry="10" />
          <ellipse cx="146" cy="115" rx="30" ry="11" />
        </g>
        <g>
          <ellipse cx="396" cy="110" rx="40" ry="9" />
          <ellipse cx="422" cy="106" rx="26" ry="10" />
        </g>
        <ellipse cx="262" cy="136" rx="34" ry="8" />
      </g>
      <g
        fill={warm}
        opacity={settled ? 0.95 : 0.2}
        style={{ transition: 'opacity 0.6s ease' }}
      >
        <circle cx="300" cy="34" r="2.8" />
        <circle cx="356" cy="62" r="2.1" />
        <circle cx="414" cy="30" r="2.5" />
        <circle cx="466" cy="58" r="1.9" />
        <circle cx="514" cy="26" r="2.6" />
        <circle cx="238" cy="52" r="2" />
        <circle cx="486" cy="96" r="1.8" />
      </g>

      {/* gulls heading home */}
      <g stroke={INK} strokeWidth="2" fill="none" opacity="0.24" strokeLinecap="round">
        <path d="M148 62 q7 -6 14 0" />
        <path d="M164 58 q7 -6 14 0" />
      </g>

      {/* the sea, from a fixed horizon down to the beach */}
      <rect x="0" y="150" width="560" height="130" fill={peri} opacity="0.5" />
      <path d="M0 150 H560" stroke={INK} strokeWidth="2" opacity="0.12" />

      {/* The beach. Everything that belongs to the water's edge moves together,
          so the wet line and the breaking waves never come apart. The sand runs
          well past y=280 so sliding it up can't expose a gap at the bottom. */}
      <g style={{ transition: 'transform 0.6s ease' }} transform={`translate(0 ${tideShift})`}>
        {/* waves, breaking just short of the sand */}
        <g stroke="#f6f9fa" strokeWidth="2.6" fill="none" opacity="0.6">
          <path d="M34 180 q16 -8 32 0 t32 0" />
          <path d="M212 172 q16 -8 32 0 t32 0" />
          <path d="M396 182 q16 -8 32 0 t32 0" />
        </g>
        {/* wet sand, then dry sand further up the beach */}
        <path d="M0 192 Q140 182 300 198 T560 190 L560 340 L0 340 Z" fill={warm} opacity="0.26" />
        <path d="M0 206 Q140 196 300 212 T560 204 L560 340 L0 340 Z" fill={warm} opacity="0.42" />
      </g>

      {/* the Glimmer, out over the water */}
      <g
        transform="translate(196 88)"
        opacity={settled ? 0.42 : 1}
        style={{ transition: 'opacity 0.6s ease' }}
      >
        <circle cx="34" cy="34" r={settled ? 26 : 42} fill={peri} opacity="0.24" style={{ transition: 'r 0.6s ease' }} />
        <path d="M34 0 L42 26 L68 34 L42 42 L34 68 L26 42 L0 34 L26 26 Z" fill={peri} />
        <circle cx="34" cy="34" r="8" fill="#f6f9fa" />
      </g>

      {/* The bonfire down the beach, and friends waiting by it. Fixed to the dry
          sand, not to the tide group — a fire nobody moves when the water goes
          out. Its base sits at y=254, well clear of the wet line. */}
      <g transform="translate(438 202)">
        {/* firelight pooling on the sand — widens once the fire is properly lit */}
        <ellipse
          cx="22"
          cy="50"
          rx={settled ? 64 : 34}
          ry={settled ? 18 : 10}
          fill={warm}
          opacity={settled ? 0.3 : 0.12}
          style={{ transition: 'rx 0.6s ease, ry 0.6s ease, opacity 0.6s ease' }}
        />
        {/* crossed logs */}
        <path d="M2 54 L42 34 M42 54 L2 34" stroke={INK} strokeWidth="6" strokeLinecap="round" opacity="0.6" />
        {/* flame: a gold body with a pale heart, so it reads as fire at any size */}
        <path
          d="M22 0 Q40 22 31 40 Q22 50 22 50 Q22 50 13 40 Q4 22 22 0 Z"
          fill={warm}
          opacity={settled ? 1 : 0.4}
          style={{ transition: 'opacity 0.6s ease' }}
        />
        <path
          d="M22 16 Q31 28 26 40 Q22 46 22 46 Q22 46 18 40 Q13 28 22 16 Z"
          fill="#f6f9fa"
          opacity={settled ? 0.72 : 0.22}
          style={{ transition: 'opacity 0.6s ease' }}
        />
        {/* embers, only once you've actually sat down */}
        {settled && (
          <g fill={warm} opacity="0.85">
            <circle cx="10" cy="-12" r="2.6" />
            <circle cx="33" cy="-22" r="2" />
            <circle cx="20" cy="-31" r="1.6" />
          </g>
        )}
        {/* two friends, sitting, each in their own colour so they read as people */}
        <g>
          <circle cx="-22" cy="30" r="9" fill={INK} opacity="0.7" />
          <path d="M-34 54 q12 -18 24 0 Z" fill={peri} opacity="0.85" />
          <circle cx="68" cy="32" r="9" fill={INK} opacity="0.7" />
          <path d="M56 54 q12 -18 24 0 Z" fill={warm} opacity="0.9" />
        </g>
      </g>
    </svg>
  );
}

const SCENES = {
  passworld: PassworldScene,
  privacy: PrivacyScene,
  bullybog: BogScene,
  balance: BayScene,
};

export default function RealmArt({ realmId, mood = 'before' }) {
  const Scene = SCENES[realmId];
  return Scene ? <Scene mood={mood} /> : null;
}
