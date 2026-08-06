/**
 * The Traveler — the player's avatar.
 *
 * storyline.md gives the Traveler no fixed appearance on purpose, so this is
 * built from plain shapes: no skin tone, no hair, no gendered silhouette.
 * Just a small figure in a scarf, which takes the realm's accent colour so
 * the player visibly belongs to whichever realm they're standing in.
 */
export default function Traveler({ facing = 1, moving = false, accent = 'var(--ink)' }) {
  return (
    <svg
      className={`traveler${moving ? ' walking' : ''}`}
      viewBox="0 0 40 56"
      width="50"
      height="70"
      style={{ transform: `scaleX(${facing})` }}
      aria-hidden="true"
    >
      {/* soft ground shadow */}
      <ellipse className="tv-shadow" cx="20" cy="53" rx="12" ry="3.2" fill="var(--ink)" opacity="0.18" />

      <g className="tv-body">
        {/* legs */}
        <g stroke="var(--ink)" strokeWidth="4.5" strokeLinecap="round">
          <line className="tv-leg-back" x1="17" y1="40" x2="15" y2="51" />
          <line className="tv-leg-front" x1="23" y1="40" x2="25" y2="51" />
        </g>

        {/* pack */}
        <rect x="6" y="24" width="9" height="13" rx="3.5" fill={accent} opacity="0.85" />

        {/* torso */}
        <path d="M12 24 q8 -5 16 0 v14 q-8 4 -16 0 Z" fill="var(--ink)" />

        {/* scarf, in the realm's colour */}
        <path d="M12 24 q8 4 16 0 l1 5 q-9 4 -18 0 Z" fill={accent} />
        <path className="tv-scarf-tail" d="M27 27 q7 3 6 10 l-4 -1 q0 -6 -4 -7 Z" fill={accent} />

        {/* head */}
        <circle cx="20" cy="15" r="9" fill="var(--ink)" />
        {/* traveller's cap brim */}
        <path d="M11 13 q9 -9 18 0 q-9 -4 -18 0 Z" fill={accent} />
        {/* eyes */}
        <circle cx="23.5" cy="16" r="1.7" fill="var(--paper)" />
        <circle cx="17.5" cy="16" r="1.7" fill="var(--paper)" />
      </g>
    </svg>
  );
}
