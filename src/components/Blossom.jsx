import { useId } from 'react';

// The small blossom mark on a postcard front and on its stamps: a white blossom
// knocked out of a square of cherry ink, printed through the shared #stamp-ink
// filter (Seal.jsx). Each motif is one petal, repeated five times around the
// centre, so every postcard gets its own flower from very little drawing.
const MOTIFS = {
  // Five round, overlapping petals.
  plum: { petal: <circle cy="-17" r="13.5" />, core: 11, stamens: [9, 13.5] },
  // Notched petals, the same shape as the seal.
  cherry: {
    petal: <path d="M0 -4C7 -9 12 -19 8.5 -27C6.5 -31 3 -31.5 0 -27.5C-3 -31.5 -6.5 -31 -8.5 -27C-12 -19 -7 -9 0 -4Z" />,
    core: 6,
    stamens: [8, 12],
  },
  // Slim petals that come to a point.
  peach: { petal: <path d="M0 -3C9 -10 10 -22 0 -33C-10 -22 -9 -10 0 -3Z" />, core: 5, stamens: [7, 11] },
  // Broad pointed petals that join into a star.
  bellflower: { petal: <path d="M0 -2C15 -8 16 -20 0 -32C-16 -20 -15 -8 0 -2Z" />, core: 8, stamens: [6, 10] },
  // Separate upright ovals.
  quince: { petal: <ellipse cy="-19" rx="9" ry="13" />, core: 8, stamens: [7, 11] },
  // Small round petals held apart from each other.
  pear: { petal: <circle cy="-21" r="10" />, core: 12, stamens: [6, 9] },
  // Narrow petals, almost a pinwheel.
  apricot: { petal: <ellipse cy="-20" rx="6.5" ry="14" />, core: 7, stamens: [6, 10] },
};

const NAMES = Object.keys(MOTIFS);

/**
 * Which blossom a postcard gets: its "Front motif" cell if that names one of
 * the motifs above, otherwise one chosen by the postcard's position in the
 * sheet, so each postcard keeps a different flower.
 */
export const motifFor = (frontMotif, index = 0) =>
  MOTIFS[frontMotif?.toLowerCase()] ? frontMotif.toLowerCase() : NAMES[index % NAMES.length];

export default function Blossom({ motif, className = '' }) {
  const { petal, core, stamens } = MOTIFS[motif] ?? MOTIFS.plum;
  // Unique per instance, so two blossoms on screen never share a mask.
  const maskId = `blossom-${useId().replace(/[^a-z0-9]/gi, '')}`;

  return (
    <svg className={`blossom ${className}`} viewBox="0 0 100 100" aria-hidden="true" focusable="false">
      <defs>
        {/* Everything white prints; the blossom is left as bare paper. */}
        <mask id={maskId}>
          <rect x="6" y="6" width="88" height="88" fill="#fff" />
          <g transform="translate(50 51)" fill="#000">
            {[0, 72, 144, 216, 288].map((a) => (
              <g key={a} transform={`rotate(${a})`}>{petal}</g>
            ))}
            <circle r={core} />
          </g>
        </mask>
      </defs>
      <g filter="url(#stamp-ink)" fill="currentColor">
        <rect x="6" y="6" width="88" height="88" mask={`url(#${maskId})`} />
        {/* stamens, printed inside the bare-paper blossom */}
        <g transform="translate(50 51)" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
          {Array.from({ length: 10 }, (_, i) => {
            const a = ((i * 36 + 18) * Math.PI) / 180;
            const len = stamens[i % 2];
            const x = Math.sin(a) * len;
            const y = -Math.cos(a) * len;
            return (
              <g key={i}>
                <path d={`M0 0L${x.toFixed(1)} ${y.toFixed(1)}`} fill="none" />
                <circle cx={x} cy={y} r="1.1" stroke="none" />
              </g>
            );
          })}
          <circle r="2" stroke="none" />
        </g>
      </g>
    </svg>
  );
}
