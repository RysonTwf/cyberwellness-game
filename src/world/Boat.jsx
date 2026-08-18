/**
 * The Traveler's rowboat — used in place of `Traveler` on the Atlas hub,
 * since the hub's ground is open water (design.md/AtlasMap.jsx), not a
 * walkable shore. Same plain-shapes style as `Traveler`: no realism, just
 * enough silhouette to read as "a small boat," coloured with the same
 * gold/ink palette as the Gate and the rest of the hub chrome.
 */
export default function Boat({ facing = 1, moving = false, accent = 'var(--gold)' }) {
  return (
    <svg
      className={`traveler boat${moving ? ' walking' : ''}`}
      viewBox="0 0 48 40"
      width="58"
      height="48"
      style={{ transform: `scaleX(${facing})` }}
      aria-hidden="true"
    >
      {/* wake ripples */}
      <ellipse className="tv-shadow" cx="24" cy="34" rx="18" ry="3.4" fill="#0d3a3f" opacity="0.22" />

      <g className="tv-body">
        {/* hull */}
        <path d="M6 24 Q24 34 42 24 L37 30 Q24 36 11 30 Z" fill="#7a5233" />
        <path d="M6 24 Q24 30 42 24 L42 24 Q24 26 6 24 Z" fill="#a06a3f" />

        {/* mast + sail */}
        <line x1="24" y1="24" x2="24" y2="6" stroke="#5c3a22" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M24 7 L24 22 Q13 20 12 12 Q18 8 24 7 Z" fill={accent} />

        {/* traveler's head peeking over the hull */}
        <circle cx="27" cy="21" r="5.5" fill="var(--ink)" />
        <circle cx="29" cy="21.6" r="1.1" fill="var(--paper)" />
      </g>
    </svg>
  );
}
