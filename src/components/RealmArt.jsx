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

      {/* Keeper Vex, with a very long clipboard */}
      <g transform="translate(348 112)">
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

      {/* the path forward — only visible once the fog thins */}
      <path
        d="M130 244 Q250 224 320 206 T496 168"
        fill="none"
        stroke={teal}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="10 10"
        opacity={clear ? 0.95 : 0}
        style={{ transition: 'opacity 0.6s ease' }}
      />

      {/* the fog */}
      <g style={{ transition: 'opacity 0.6s ease' }} opacity={clear ? 0.18 : 1}>
        <ellipse cx="176" cy="150" rx="132" ry="36" fill="#eef3f4" />
        <ellipse cx="372" cy="182" rx="164" ry="40" fill="#eef3f4" />
        <ellipse cx="292" cy="118" rx="120" ry="28" fill="#f2f6f7" />
        <ellipse cx="486" cy="140" rx="104" ry="30" fill="#eef3f4" />
      </g>

      {/* a shape in the fog, never quite resolving */}
      {!clear && (
        <g transform="translate(392 116)">
          <circle cx="24" cy="24" r="27" fill={teal} opacity="0.5" />
          <circle cx="15" cy="19" r="3.6" fill={INK} opacity="0.6" />
          <circle cx="33" cy="19" r="3.6" fill={INK} opacity="0.6" />
          <path d="M14 34 Q24 40 34 34" stroke={INK} strokeWidth="2.6" fill="none" opacity="0.45" strokeLinecap="round" />
        </g>
      )}

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

      {/* ripples */}
      <g stroke="#f6f9fa" strokeWidth="2.4" fill="none" opacity="0.5">
        <path d="M44 184 q18 -7 36 0 t36 0" />
        <path d="M436 206 q18 -7 36 0 t36 0" />
        <path d="M196 232 q18 -7 36 0 t36 0" />
      </g>

      {/* reeds */}
      <g stroke={green} strokeWidth="5" strokeLinecap="round" opacity="0.9">
        <path d="M26 158 q-8 -44 4 -62" />
        <path d="M48 158 q6 -36 -2 -52" />
        <path d="M532 158 q8 -42 -6 -60" />
        <path d="M510 158 q-6 -32 4 -48" />
      </g>

      {/* lily pads */}
      <g fill={green} opacity="0.8">
        <ellipse cx="118" cy="206" rx="38" ry="12" />
        <ellipse cx="466" cy="176" rx="30" ry="10" />
      </g>

      {/* Pockets — sunk low, or up and singing again */}
      <g transform={`translate(232 ${clear ? 84 : 106})`} style={{ transition: 'transform 0.6s ease' }}>
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

  // The tide sits high while the Glimmer has hold of you, and drops when you go.
  const tideY = settled ? 196 : 152;

  return (
    <svg viewBox="0 0 560 280" width="100%" aria-hidden="true">
      <Sky tint={peri} opacity="0.12" />

      {/* dusk sun, low */}
      <circle cx="92" cy="82" r="32" fill={warm} opacity={settled ? 0.7 : 0.34} />

      {/* sea */}
      <rect
        x="0"
        y={tideY}
        width="560"
        height={280 - tideY}
        fill={peri}
        opacity="0.5"
        style={{ transition: 'y 0.6s ease, height 0.6s ease' }}
      />
      <g
        stroke="#f6f9fa"
        strokeWidth="2.6"
        fill="none"
        opacity="0.6"
        style={{ transition: 'transform 0.6s ease' }}
        transform={`translate(0 ${tideY})`}
      >
        <path d="M34 20 q16 -8 32 0 t32 0" />
        <path d="M188 38 q16 -8 32 0 t32 0" />
        <path d="M320 24 q16 -8 32 0 t32 0" />
      </g>

      {/* sand */}
      <path d="M0 226 Q140 212 300 230 T560 220 L560 280 L0 280 Z" fill={warm} opacity="0.4" />

      {/* the Glimmer, out over the water */}
      <g
        transform="translate(196 70)"
        opacity={settled ? 0.42 : 1}
        style={{ transition: 'opacity 0.6s ease' }}
      >
        <circle cx="34" cy="34" r={settled ? 26 : 42} fill={peri} opacity="0.24" style={{ transition: 'r 0.6s ease' }} />
        <path d="M34 0 L42 26 L68 34 L42 42 L34 68 L26 42 L0 34 L26 26 Z" fill={peri} />
        <circle cx="34" cy="34" r="8" fill="#f6f9fa" />
      </g>

      {/* the bonfire down the beach, and friends waiting by it */}
      <g transform="translate(438 156)">
        <circle cx="22" cy="34" r={settled ? 34 : 18} fill={warm} opacity={settled ? 0.34 : 0.14} style={{ transition: 'r 0.6s ease, opacity 0.6s ease' }} />
        <path d="M6 52 L40 36 M40 52 L6 36" stroke={INK} strokeWidth="5" strokeLinecap="round" opacity="0.6" />
        <path
          d="M22 6 Q34 24 27 36 Q22 44 22 44 Q22 44 17 36 Q10 24 22 6 Z"
          fill={warm}
          opacity={settled ? 1 : 0.42}
          style={{ transition: 'opacity 0.6s ease' }}
        />
        {/* two friends, sitting */}
        <g fill={INK} opacity="0.55">
          <circle cx="-20" cy="32" r="8" />
          <path d="M-30 52 q10 -15 20 0 Z" />
          <circle cx="66" cy="34" r="8" />
          <path d="M56 52 q10 -15 20 0 Z" />
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
