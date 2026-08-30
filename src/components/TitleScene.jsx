/**
 * The title-screen backdrop: a soft green landscape at dawn — layered hills,
 * a winding path heading toward a low sun, grass and wildflowers in the five
 * realm accent colours. Same flat-SVG-shape vocabulary as RealmArt.jsx,
 * pitched calmer since it sits behind the journal cover card.
 *
 * Purely decorative (`aria-hidden`). The drifting pollen motes and the
 * looping Comet (in MainScreen) hold still under `prefers-reduced-motion`.
 */

/** A wildflower — stem, a dot of colour, a ring of petals. */
function Flower({ x, y, colour, scale = 1 }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M0 0 q-2 -10 1 -20" fill="none" stroke="#6a9a72" strokeWidth="2.4" strokeLinecap="round" />
      {[0, 72, 144, 216, 288].map((a) => (
        <circle key={a} cx={Math.cos((a * Math.PI) / 180) * 5} cy={-20 + Math.sin((a * Math.PI) / 180) * 5} r="3.6" fill={colour} opacity="0.9" />
      ))}
      <circle cx="0" cy="-20" r="3" fill="#f6efd8" />
    </g>
  );
}

/** A rounded far-off tree. */
function Tree({ x, y, scale = 1, tint = '#8fc39c' }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <rect x="-3" y="-14" width="6" height="18" rx="2" fill="#7a5233" opacity="0.55" />
      <circle cx="0" cy="-24" r="18" fill={tint} />
      <circle cx="-12" cy="-16" r="12" fill={tint} />
      <circle cx="12" cy="-16" r="12" fill={tint} />
    </g>
  );
}

export default function TitleScene() {
  return (
    <svg
      className="title-scene"
      viewBox="0 0 900 560"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="title-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e7f0ec" />
          <stop offset="0.62" stopColor="#eef2e6" />
          <stop offset="1" stopColor="#f6edd7" />
        </linearGradient>
        <radialGradient id="title-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe9b0" />
          <stop offset="1" stopColor="#ffe9b0" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="900" height="560" fill="url(#title-sky)" />

      {/* low sun + glow, sitting behind the hills */}
      <circle cx="648" cy="214" r="160" fill="url(#title-sun)" />
      <circle cx="648" cy="214" r="42" fill="#ffe1a0" opacity="0.92" />

      {/* a couple of distant birds */}
      <g stroke="#8ba2a0" strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.5">
        <path d="M300 150 q10 -9 20 0 q10 -9 20 0" />
        <path d="M360 128 q7 -6 14 0 q7 -6 14 0" />
      </g>

      {/* far hills */}
      <path d="M0 300 Q220 250 460 292 T900 276 V560 H0 Z" fill="#cfe6d6" />
      <path d="M0 336 Q260 292 520 330 T900 316 V560 H0 Z" fill="#b3dbbf" />

      {/* mid hill with the tree line */}
      <path d="M0 384 Q240 340 520 380 T900 372 V560 H0 Z" fill="#93cea6" />
      <Tree x={140} y={392} scale={1.1} tint="#7cbd8e" />
      <Tree x={215} y={402} scale={0.8} tint="#8fc79f" />
      <Tree x={760} y={388} scale={1} tint="#7cbd8e" />
      <Tree x={820} y={400} scale={0.75} tint="#8fc79f" />

      {/* foreground meadow */}
      <path d="M0 440 Q220 404 470 442 T900 436 V560 H0 Z" fill="#77c08c" />
      <path
        d="M0 440 Q220 404 470 442 T900 436"
        fill="none"
        stroke="var(--ink)"
        strokeOpacity="0.12"
        strokeWidth="2"
      />

      {/* the winding path, sweeping off to the right toward the sun */}
      <path
        d="M760 600 C 640 520, 706 456, 690 396 S 730 312, 650 224"
        fill="none"
        stroke="#e7d4ac"
        strokeWidth="40"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M760 600 C 640 520, 706 456, 690 396 S 730 312, 650 224"
        fill="none"
        stroke="#fbf4e4"
        strokeWidth="3"
        strokeDasharray="2 16"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* grass tufts along the meadow */}
      <g stroke="#5aa873" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.85">
        {[60, 130, 250, 330, 560, 640, 720, 840].map((gx, i) => (
          <g key={gx} transform={`translate(${gx} ${476 + (i % 3) * 8})`}>
            <path d="M0 0 q-4 -14 -1 -20" />
            <path d="M0 0 q0 -16 0 -22" />
            <path d="M0 0 q4 -14 1 -20" />
          </g>
        ))}
      </g>

      {/* wildflowers — one per realm accent */}
      <Flower x={95} y={498} colour="var(--gold)" scale={1.1} />
      <Flower x={300} y={512} colour="var(--teal)" />
      <Flower x={565} y={500} colour="var(--coral)" scale={1.15} />
      <Flower x={690} y={520} colour="var(--periwinkle)" />
      <Flower x={815} y={496} colour="var(--sage)" scale={1.05} />

      {/* drifting pollen */}
      <g fill="#fff6df">
        {[
          [180, 210, 0],
          [420, 160, 2.2],
          [560, 300, 4],
          [720, 190, 1.1],
          [300, 320, 3.3],
          [640, 360, 5.1],
        ].map(([cx, cy, delay]) => (
          <circle
            key={`${cx}-${cy}`}
            className="title-mote"
            cx={cx}
            cy={cy}
            r="3"
            style={{ animationDelay: `${delay}s` }}
          />
        ))}
      </g>
    </svg>
  );
}
