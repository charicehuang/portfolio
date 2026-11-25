// Cyanotype "sun print" background: white botanical silhouettes on blue.
// Everything is drawn in code (no image files) from a seeded random generator,
// so the flowers look hand-placed but render identically on every visit.
// To rearrange them, edit the PRINTS list at the bottom of this file.

const rand = (seed) => {
  let s = seed >>> 0;
  return () => (s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296;
};
// A petal/leaf that starts at 0,0 and points up. L = length, W = half-width.
const petal = (L, W) =>
  `M0 0C${W} ${-L * 0.18} ${W * 1.15} ${-L * 0.72} 0 ${-L}C${-W * 1.15} ${-L * 0.72} ${-W} ${-L * 0.18} 0 0Z`;

/** Large open flower: broad translucent petals that go whiter where they overlap. */
function Bloom({ seed }) {
  const r = rand(seed);
  const n = 5 + Math.floor(r() * 2);
  const tilt = r() * 360;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const L = 82 + r() * 16;
        const rot = tilt + (360 / n) * i + (r() - 0.5) * 16;
        return (
          <g key={i} transform={`rotate(${rot})`}>
            <path d={petal(L, L * 0.36)} fill="url(#petal-fade)" />
            <path d={`M0 ${-L * 0.12}Q${(r() - 0.5) * 8} ${-L * 0.55} 0 ${-L * 0.9}`} stroke="#fff" strokeWidth="1.6" fill="none" opacity="0.5" />
          </g>
        );
      })}
      {Array.from({ length: 3 }, (_, i) => (
        <path key={i} d={petal(40 + r() * 10, 15)} transform={`rotate(${tilt + 40 + 120 * i + (r() - 0.5) * 30})`} fill="#fff" opacity="0.55" />
      ))}
      <circle r="7" className="flora-hole" />
    </>
  );
}

/** Small five-petal blossom, nearly solid white. */
function Floret({ seed }) {
  const r = rand(seed);
  const tilt = r() * 72;
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => {
        const a = ((tilt + 72 * i) * Math.PI) / 180;
        return <circle key={i} cx={Math.sin(a) * 46} cy={-Math.cos(a) * 46} r={38 + r() * 6} fill="#fff" opacity={0.78 + r() * 0.17} />;
      })}
      <circle r="24" fill="#fff" opacity="0.9" />
      <circle r="8" className="flora-hole" />
    </>
  );
}

/** Curved stem with paired oval leaves. */
function Sprig({ seed }) {
  const r = rand(seed);
  const pts = Array.from({ length: 5 }, (_, i) => {
    const t = 0.22 + i * 0.19;
    // points along the stem curve M-90,70 Q-10,60 85,-80
    const x = (1 - t) ** 2 * -90 + 2 * (1 - t) * t * -10 + t * t * 85;
    const y = (1 - t) ** 2 * 70 + 2 * (1 - t) * t * 60 + t * t * -80;
    const dx = 2 * (1 - t) * 80 + 2 * t * 95;
    const dy = 2 * (1 - t) * -10 + 2 * t * -140;
    return { x, y, a: (Math.atan2(dx, -dy) * 180) / Math.PI, t };
  });
  return (
    <>
      <path d="M-90 70Q-10 60 85 -80" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9" />
      {pts.map((p, i) =>
        (i === pts.length - 1 ? [0] : [-1, 1]).map((side) => {
          const L = 44 - p.t * 12 + r() * 6;
          return (
            <path
              key={`${i}${side}`}
              d={petal(L, L * 0.34)}
              transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${(p.a + side * (58 + r() * 14)).toFixed(1)})`}
              fill="#fff"
              opacity={0.72 + r() * 0.2}
            />
          );
        }),
      )}
    </>
  );
}

const SHAPES = { bloom: Bloom, floret: Floret, sprig: Sprig };

// x / y: where the centre sits, as a % of the screen. size: in vmin (% of the
// screen's shorter side). The middle of the page is kept empty on purpose.
const PRINTS = [
  { kind: 'bloom', x: 8, y: 80, size: 46, rot: 18, seed: 5 },
  { kind: 'bloom', x: 95, y: 20, size: 40, rot: -24, seed: 9 },
  { kind: 'sprig', x: 15, y: 18, size: 34, rot: -8, seed: 3 },
  { kind: 'sprig', x: 86, y: 88, size: 28, rot: 150, seed: 4 },
  { kind: 'floret', x: 29, y: 93, size: 8, rot: 0, seed: 21 },
  { kind: 'floret', x: 4, y: 46, size: 6.5, rot: 0, seed: 22 },
  { kind: 'floret', x: 71, y: 7, size: 6, rot: 0, seed: 23 },
  { kind: 'floret', x: 95, y: 52, size: 9, rot: 0, seed: 24 },
  { kind: 'floret', x: 64, y: 95, size: 5, rot: 0, seed: 25 },
];

export default function Background() {
  return (
    <div className="bg" aria-hidden="true">
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="petal-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.92" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="1" stopColor="#fff" stopOpacity="0.38" />
          </linearGradient>
          {/* Wobbles and softens the edges, then lets blue speckle through,
              like light leaking under a pressed flower. */}
          <filter id="sunprint" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="2" seed="3" result="warp" />
            <feDisplacementMap in="SourceGraphic" in2="warp" scale="9" result="warped" />
            <feGaussianBlur in="warped" stdDeviation="1.1" result="soft" />
            <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="8" result="speckle" />
            <feColorMatrix in="speckle" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -1.3 1.5" result="mask" />
            <feComposite in="soft" in2="mask" operator="in" />
          </filter>
        </defs>
      </svg>
      <div className="bg-wash" />
      {PRINTS.map(({ kind, x, y, size, rot, seed }) => {
        const Shape = SHAPES[kind];
        return (
          <svg
            key={seed}
            className="flora"
            viewBox="-110 -110 220 220"
            style={{ left: `${x}%`, top: `${y}%`, width: `${size}vmin`, transform: `translate(-50%, -50%) rotate(${rot}deg)` }}
            focusable="false"
          >
            <g filter="url(#sunprint)">
              <Shape seed={seed} />
            </g>
          </svg>
        );
      })}
      <div className="bg-grain" />
    </div>
  );
}
