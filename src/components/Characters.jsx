/**
 * Character and scene art, built entirely from SVG shapes — no image assets
 * (design.md §9). Flat vector look: geometric, few shapes, realm accent for
 * colour so each character sits inside its realm's palette.
 */

/** Comet — a paper-airplane spirit. The guide, present in every realm. */
export function Comet({ size = 44, accent = 'var(--ink)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {/* dotted flight trail */}
      <path
        d="M3 40 C 12 38, 16 32, 15 27"
        fill="none"
        stroke={accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray="0.5 5"
        opacity="0.45"
      />
      {/* upper wing */}
      <path d="M44 7 L14 24 L23 27 Z" fill={accent} />
      {/* lower wing, folded — darker via opacity so it reads as one paper */}
      <path d="M44 7 L23 27 L26 38 Z" fill={accent} opacity="0.55" />
      {/* fold crease */}
      <path d="M44 7 L23 27" stroke="var(--paper)" strokeWidth="1.2" opacity="0.9" />
    </svg>
  );
}

/** Keeper Vex — a vault door with a face. Good-natured, far too chatty. */
function Vex({ size = 44, accent = 'var(--gold)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <rect x="6" y="6" width="36" height="36" rx="11" fill={accent} opacity="0.22" />
      <rect
        x="6"
        y="6"
        width="36"
        height="36"
        rx="11"
        fill="none"
        stroke={accent}
        strokeWidth="2.5"
      />
      {/* vault dial */}
      <circle cx="24" cy="30" r="7" fill="none" stroke={accent} strokeWidth="2.5" />
      <path d="M24 30 L28 26" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      {/* eyes */}
      <circle cx="17" cy="18" r="2.6" fill={accent} />
      <circle cx="31" cy="18" r="2.6" fill={accent} />
    </svg>
  );
}

/** The Fog — not a villain, just mist that hides who's really there. */
function Fog({ size = 44, accent = 'var(--teal)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="18" cy="24" r="12" fill={accent} opacity="0.22" />
      <circle cx="30" cy="21" r="10" fill={accent} opacity="0.28" />
      <circle cx="26" cy="30" r="11" fill={accent} opacity="0.18" />
      {/* two vague shapes where a face would be, never resolving */}
      <circle cx="21" cy="23" r="2.2" fill={accent} opacity="0.75" />
      <circle cx="30" cy="23" r="2.2" fill={accent} opacity="0.75" />
    </svg>
  );
}

/** Pockets — a shy frog who was, until a moment ago, singing. */
function Pockets({ size = 44, accent = 'var(--coral)' }) {
  const green = 'var(--teal)';
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      {/* eye bumps */}
      <circle cx="15" cy="17" r="7" fill={green} opacity="0.9" />
      <circle cx="33" cy="17" r="7" fill={green} opacity="0.9" />
      <circle cx="15" cy="17" r="2.6" fill="var(--paper-card)" />
      <circle cx="33" cy="17" r="2.6" fill="var(--paper-card)" />
      <circle cx="15" cy="17" r="1.3" fill="var(--ink)" />
      <circle cx="33" cy="17" r="1.3" fill="var(--ink)" />
      {/* head */}
      <path d="M8 24 Q24 14 40 24 Q40 40 24 40 Q8 40 8 24 Z" fill={green} />
      {/* mouth */}
      <path
        d="M16 31 Q24 35 32 31"
        fill="none"
        stroke="var(--paper-card)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* a note, still hanging in the air */}
      <path
        d="M40 10 v7"
        stroke={accent}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.85"
      />
      <circle cx="38.5" cy="17.5" r="2" fill={accent} opacity="0.85" />
    </svg>
  );
}

/** The Glimmer — very good at being fun, which is exactly the problem. */
function Glimmer({ size = 44, accent = 'var(--periwinkle)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="15" fill={accent} opacity="0.16" />
      <path d="M24 6 L28 20 L42 24 L28 28 L24 42 L20 28 L6 24 L20 20 Z" fill={accent} />
      <circle cx="24" cy="24" r="4.5" fill="var(--paper-card)" opacity="0.85" />
    </svg>
  );
}

/** An unattributed comment appearing over the bog water. */
function CommentBubble({ size = 44, accent = 'var(--coral)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        d="M8 12 h32 a4 4 0 0 1 4 4 v16 a4 4 0 0 1 -4 4 h-18 l-8 7 v-7 h-6 a4 4 0 0 1 -4 -4 v-16 a4 4 0 0 1 4 -4 z"
        fill={accent}
        opacity="0.2"
        stroke={accent}
        strokeWidth="2.2"
      />
      <circle cx="17" cy="24" r="2" fill={accent} />
      <circle cx="24" cy="24" r="2" fill={accent} />
      <circle cx="31" cy="24" r="2" fill={accent} />
    </svg>
  );
}

const BY_NAME = {
  Comet,
  'Keeper Vex': Vex,
  'The Fog': Fog,
  Pockets,
  'The Glimmer': Glimmer,
  'A comment appears': CommentBubble,
};

export default function CharacterArt({ who, size = 44, accent = 'var(--ink)' }) {
  const Art = BY_NAME[who] ?? Comet;
  // Comet keeps its own ink colour everywhere so the guide reads as constant
  // across all four realms; realm characters take the realm accent.
  const colour = who === 'Comet' ? 'var(--ink)' : accent;
  return <Art size={size} accent={colour} />;
}
