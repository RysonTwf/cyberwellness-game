import { Key, Compass, Heart, Sun, Eye, CircleDashed } from 'lucide-react';

/**
 * The ink stamp badge — the one recurring "wow" moment (design.md §3).
 *
 * A circular, slightly irregular-edged stamp in the realm's accent colour:
 * a roughened ring (not a perfect circle), a simple icon, and a monospace
 * label set along the bottom arc. Everything else in the UI stays quiet so
 * this doesn't have to compete.
 */

const ICONS = { key: Key, compass: Compass, heart: Heart, sun: Sun, eye: Eye };

/** Small deterministic PRNG so a given stamp always roughens the same way. */
function makeRandom(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function seedFrom(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * A closed path through jittered points around a circle, smoothed with
 * quadratic segments through the midpoints so the wobble reads as hand
 * pressure rather than a jagged polygon.
 */
function roughCircle(cx, cy, r, seed, { points = 46, jitter = 1.5 } = {}) {
  const rnd = makeRandom(seed);
  const pts = [];
  for (let i = 0; i < points; i += 1) {
    const a = (i / points) * Math.PI * 2;
    const rr = r + (rnd() - 0.5) * jitter * 2;
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
  }

  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const f = (n) => n.toFixed(2);

  let d = `M ${f(mid(pts[0], pts[1])[0])} ${f(mid(pts[0], pts[1])[1])}`;
  for (let i = 1; i <= points; i += 1) {
    const cur = pts[i % points];
    const next = pts[(i + 1) % points];
    const m = mid(cur, next);
    d += ` Q ${f(cur[0])} ${f(cur[1])} ${f(m[0])} ${f(m[1])}`;
  }
  return `${d} Z`;
}

export default function StampBadge({
  realmId,
  icon = 'key',
  label = '',
  accent = 'var(--ink)',
  earned = false,
  angle = 0,
  thunk = false,
  size = 96,
}) {
  const Icon = ICONS[icon] ?? CircleDashed;
  const seed = seedFrom(realmId ?? icon);
  const arcId = `stamp-arc-${realmId ?? icon}`;

  // Bottom arc for the label: 172° -> 8° around the centre, taken the short way
  // (through the bottom) so the text sits upright and reads left to right.
  //
  // The span is set by the longest label. At 155°->25° the arc was ~93 units
  // and "Privacy Peaks · Visited" needs ~104, so both ends were being clipped
  // ("LANCE BAY · VISIT"). 164° gives ~117 units — enough for every label with
  // room to spare. Widening it further would push the text past the ring's
  // waist, where it stops reading as a stamp.
  const r = 41;
  const pt = (deg) => [
    60 + r * Math.cos((deg * Math.PI) / 180),
    60 + r * Math.sin((deg * Math.PI) / 180),
  ];
  const [x1, y1] = pt(172);
  const [x2, y2] = pt(8);
  const arcPath = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 0 ${x2.toFixed(2)} ${y2.toFixed(2)}`;

  return (
    <div
      className={`stamp${earned ? '' : ' locked'}${thunk ? ' thunk' : ''}`}
      style={{ width: size, height: size, transform: `rotate(${earned ? angle : 0}deg)` }}
      role="img"
      aria-label={earned ? `${label} — stamp earned` : `${label} — not yet earned`}
    >
      <svg
        className="stamp-ring"
        viewBox="0 0 120 120"
        style={{ color: earned ? accent : 'var(--ink-soft)' }}
        aria-hidden="true"
      >
        {/* Outer roughened ring, broken like worn stamp ink */}
        <path
          d={roughCircle(60, 60, 53, seed)}
          fill="none"
          stroke="currentColor"
          strokeWidth={earned ? 3.4 : 2}
          strokeDasharray={earned ? '46 3 78 4 120 3' : '5 6'}
          strokeLinecap="round"
          opacity={earned ? 0.95 : 0.8}
        />
        {/* Inner hairline ring */}
        <path
          d={roughCircle(60, 60, 46, seed + 977)}
          fill="none"
          stroke="currentColor"
          strokeWidth={earned ? 1.3 : 1}
          opacity={earned ? 0.65 : 0.5}
        />
        {earned && (
          <>
            <path id={arcId} d={arcPath} fill="none" />
            <text
              fill="currentColor"
              fontSize="6.6"
              fontWeight="700"
              letterSpacing="0.55"
              style={{ fontFamily: 'var(--font-stamp)' }}
            >
              <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
                {label.toUpperCase()}
              </textPath>
            </text>
          </>
        )}
      </svg>

      <div className="stamp-icon" style={{ color: earned ? accent : 'var(--ink-soft)' }}>
        <Icon size={Math.round(size * 0.32)} strokeWidth={earned ? 2.4 : 1.8} />
      </div>
    </div>
  );
}
