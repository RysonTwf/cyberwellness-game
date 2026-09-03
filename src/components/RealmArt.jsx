/**
 * Scene art — one illustrated 2D world per realm (design.md §4 layout, §9
 * "all character and scene art built from SVG shapes/icons").
 *
 * Most scenes take a `mood`:
 *   'before'  — how the realm looks when you arrive
 *   'after'   — how it looks once the Traveler has made the safe choice
 * The change is the reward for the decision: the vault opens, the fog lifts,
 * the water clears. Realms with no right/wrong "solved" state (Balance Bay,
 * Fable Falls) use a single backdrop and ignore `mood`.
 *
 * The viewBox is 560x280 and the bottom third is the walkable ground, which
 * is why nothing important is drawn below y=200 — the Traveler walks there.
 */

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
        y="120"
        width="200"
        height="66.6"
      />

      <image
        href={clear ? '/assets/BULLYBOG/PONDRIGHT_AFTER.png' : '/assets/BULLYBOG/PONDRIGHT_BEFORE.png'}
        x="310"
        y="110"
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
/* Real background art (1 Sep 2026, public/assets/FABLEFALLS/) — a cavern
 * with a waterfall spilling into a still pool, one lit shaft, a rock in the
 * middle and a bat off to the side. Like Balance Bay, only a single backdrop
 * was delivered (no before/after pair). That's a fine fit here: Fable Falls'
 * mini-game is now the five-question S.U.R.E. check, not a "solve it and the
 * scene changes" beat, so there's no mood flip for the art to track.
 *
 * The three ECHO_* pieces are the Echo's voice bouncing off the cave — a
 * little ripple at the rock (where the "Echo" pin sits), the falls and the
 * bat. Faint, so they read as ambience rather than clutter. */
function FableFallsScene() {
  // preserveAspectRatio 'slice': the scene box isn't always exactly 2:1
  // (PlatformerStoryRealm's two-column layout leaves it wider than tall), so
  // the art covers the box rather than letterboxing.
  return (
    <svg viewBox="0 0 560 280" width="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <image
        href="/assets/FABLEFALLS/FableFallsBG.png"
        x="0"
        y="0"
        width="560"
        height="280"
        preserveAspectRatio="xMidYMid slice"
      />
      <g opacity="0.7">
        <image href="/assets/FABLEFALLS/ECHO_WATERFALL.png" x="80" y="158" width="36" height="45" />
        <image href="/assets/FABLEFALLS/ECHO_ROCK.png" x="326" y="150" width="50" height="40" />
        <image href="/assets/FABLEFALLS/ECHO_BAT.png" x="438" y="96" width="38" height="53" />
      </g>
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
