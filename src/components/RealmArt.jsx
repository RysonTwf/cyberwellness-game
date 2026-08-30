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
/* Real background art (30 Aug 2026, public/assets/PASSWORLD/) — a walled
 * kingdom with the main gate pre-drawn as an empty archway and the two side
 * vault doors baked into the wall. Door/Vex placements below are measured
 * against that archway (roughly x 223-337, y 86-192 in this 560x280 space)
 * and the wall's grass line (~y 195) — close by eye, not pixel-verified live. */
function PassworldScene({ mood }) {
  const open = mood === 'after';

  // preserveAspectRatio 'slice': the scene box isn't always exactly 2:1
  // (PlatformerStoryRealm's two-column layout leaves it
  // wider than tall), so the art covers the box rather than letterboxing.
  return (
    <svg viewBox="0 0 560 280" width="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <image href="/assets/PASSWORLD/PassworldBG.png" x="0" y="0" width="560" height="280" preserveAspectRatio="xMidYMid slice" />

      {/* The main gate, filling the archway cutout exactly (`none` rather
          than `meet`/`slice` — the door art is a plain arch shape, so a
          slight stretch to flush-fit the cutout reads better than a gap). */}
      <image
        href={open ? '/assets/PASSWORLD/DOOR_OPEN.png' : '/assets/PASSWORLD/DOOR_CLOSED.png'}
        x="223"
        y="86"
        width="114"
        height="107"
        preserveAspectRatio="none"
      />

      {/* Keeper Vex, standing on the plain stretch of wall between the
          archway and the right tower, feet at the grass line. */}
      <image
        href={open ? '/assets/PASSWORLD/VEX_HAPPY.png' : '/assets/PASSWORLD/VEX_ANGRY.png'}
        x="344"
        y="125"
        width="64"
        height="70"
      />
    </svg>
  );
}

/* -------------------------------------------------------- Privacy Peaks -- */
/* Real background art (30 Aug 2026, public/assets/PRIVACYPEAKS/) — the
 * torii-style gate and the path to it are already painted into the
 * background, so unlike the old procedural version the fog is now the only
 * thing that changes: it banks up over the gate and thins once resolved,
 * revealing what was behind it the whole time. The fog art itself carries a
 * silhouetted shape mid-fog, so the separate "shape in the fog" placeholder
 * this used to draw is gone too. */
function PrivacyScene({ mood }) {
  const clear = mood === 'after';

  // preserveAspectRatio 'slice': the scene box isn't always exactly 2:1
  // (PlatformerStoryRealm's two-column layout leaves it
  // wider than tall), so the art covers the box rather than letterboxing.
  return (
    <svg viewBox="0 0 560 280" width="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <image href="/assets/PRIVACYPEAKS/PrivacyPeaksBG.png" x="0" y="0" width="560" height="280" preserveAspectRatio="xMidYMid slice" />

      {/* Thins to a trace rather than vanishing outright — echoes the old
          "the fog thins out and drifts away" line better than a hard cut. */}
      <image
        href="/assets/PRIVACYPEAKS/FOG.png"
        x="0"
        y="108"
        width="560"
        height="102.4"
        opacity={clear ? 0.15 : 1}
        style={{ transition: 'opacity 0.6s ease' }}
      />
    </svg>
  );
}

/* ------------------------------------------------------------ Bully Bog -- */
/* Real background art (30 Aug 2026, public/assets/BULLYBOG/) — the meadow
 * and its scattered small ponds are baked into the background; the two
 * larger foreground ponds carry the actual story beat and get swapped by
 * mood. PONDLEFT is Pockets (alone, sunk low → back up and relaxed) and
 * roughly tracks the "Pockets"/"the murky water" hotspots (realms.js,
 * x 24–48%); PONDRIGHT is the ones being unkind about it (crowded and
 * grinning → Pockets' neighbour alone and calm again) and roughly tracks
 * "the comment" (x 66%) — both pieces of art tell that story on their own
 * now, so the old separate comment-bubble/song-note overlays are gone. */
function BogScene({ mood }) {
  const clear = mood === 'after';

  // preserveAspectRatio 'slice': the scene box isn't always exactly 2:1
  // (PlatformerStoryRealm's two-column layout leaves it
  // wider than tall), so the art covers the box rather than letterboxing.
  return (
    <svg viewBox="0 0 560 280" width="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <image href="/assets/BULLYBOG/BullyBogBG.png" x="0" y="0" width="560" height="280" preserveAspectRatio="xMidYMid slice" />

      <image
        href={clear ? '/assets/BULLYBOG/PONDLEFT_AFTER.png' : '/assets/BULLYBOG/PONDLEFT_BEFORE.png'}
        x="60"
        y="210"
        width="200"
        height="66.6"
      />

      <image
        href={clear ? '/assets/BULLYBOG/PONDRIGHT_AFTER.png' : '/assets/BULLYBOG/PONDRIGHT_BEFORE.png'}
        x="310"
        y="200"
        width="200"
        height="79.3"
      />
    </svg>
  );
}

/* --------------------------------------------------------- Balance Bay -- */
/* Real background art (30 Aug 2026, public/assets/BALANCEBAY/) — a single
 * sunset beach scene, fire already lit and a sparkle over the water; no
 * separate before/after pair was delivered for this one, unlike the other
 * three realms. That's a reasonable fit rather than a gap: Balance Bay is
 * already the one realm exempted from a right/wrong "solved" state
 * (design.md §8, Milestones 19 Aug changelog is a values exercise, not a
 * pass/fail one), so a single backdrop for both moods doesn't misrepresent
 * anything the way it would elsewhere. */
function BayScene() {
  // preserveAspectRatio 'slice': the scene box isn't always exactly 2:1
  // (PlatformerStoryRealm's two-column layout leaves it
  // wider than tall), so the art covers the box rather than letterboxing.
  return (
    <svg viewBox="0 0 560 280" width="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <image href="/assets/BALANCEBAY/BalanceBayBG.png" x="0" y="0" width="560" height="280" preserveAspectRatio="xMidYMid slice" />
      <image href="/assets/BALANCEBAY/SHELLS.png" x="240" y="215" width="90" height="52.8" />
    </svg>
  );
}

/* --------------------------------------------------------- Fable Falls -- */
/* A waterfall of tales, some of which are true. Deliberately minimal —
   placeholder art (Milestones Phase 3's real designer pass is still
   pending), just enough that the realm doesn't read as broken/blank. */
function FableFallsScene({ mood }) {
  const clear = mood === 'after';
  const sage = 'var(--sage)';

  // preserveAspectRatio 'slice': the scene box isn't always exactly 2:1
  // (PlatformerStoryRealm's two-column layout leaves it
  // wider than tall), so the art covers the box rather than letterboxing.
  return (
    <svg viewBox="0 0 560 280" width="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <Sky tint={sage} opacity="0.12" />

      {/* canyon walls either side */}
      <path d="M0 0 L70 0 Q40 120 60 280 L0 280 Z" fill={INK} opacity="0.08" />
      <path d="M560 0 L500 0 Q530 120 510 280 L560 280 Z" fill={INK} opacity="0.08" />

      {/* the falls themselves */}
      <g opacity={clear ? 0.85 : 0.6}>
        <path d="M150 0 Q158 90 148 190 Q170 90 162 0 Z" fill={sage} opacity="0.5" />
        <path d="M190 0 Q198 90 186 190 Q210 90 200 0 Z" fill={sage} opacity="0.4" />
      </g>
      <g stroke={sage} strokeWidth="2" fill="none" opacity={clear ? 0.5 : 0.3} strokeLinecap="round">
        <path d="M158 20 q6 60 -4 150" />
        <path d="M198 30 q6 60 -6 140" />
      </g>

      {/* mist at the base — thick and swallowing shapes before, thin after */}
      <g fill="#f6f9fa" opacity={clear ? 0.4 : 0.75}>
        <ellipse cx="175" cy="196" rx="90" ry="20" />
        <ellipse cx="230" cy="188" rx="60" ry="14" />
      </g>

      {/* floating tales — little lantern shapes drifting downstream; fewer
          and calmer once the water's settled */}
      <g fill={sage} opacity="0.55">
        <ellipse cx="330" cy="90" rx="16" ry="10" />
        <ellipse cx="380" cy="60" rx="12" ry="8" />
        {!clear && <ellipse cx="420" cy="110" rx="14" ry="9" />}
        {!clear && <ellipse cx="290" cy="50" rx="10" ry="7" />}
      </g>

      {/* the ground the Traveler walks — solid across the whole band */}
      <path
        d="M0 196 Q140 186 280 194 T560 190 L560 280 L0 280 Z"
        fill={sage}
        opacity="0.28"
      />
      <path
        d="M0 196 Q140 186 280 194 T560 190"
        fill="none"
        stroke={INK}
        strokeWidth="2"
        opacity="0.16"
      />
    </svg>
  );
}

const SCENES = {
  passworld: PassworldScene,
  privacy: PrivacyScene,
  bullybog: BogScene,
  balance: BayScene,
  fablefalls: FableFallsScene,
};

export default function RealmArt({ realmId, mood = 'before' }) {
  const Scene = SCENES[realmId];
  return Scene ? <Scene mood={mood} /> : null;
}
