// A square cherry blossom stamp mark, printed like a rubber stamp:
// the #stamp-ink filter eats away at the ink so coverage is grainy and uneven.
const petal = 'M0 -4C7 -9 12 -19 8.5 -27C6.5 -31 3 -31.5 0 -27.5C-3 -31.5 -6.5 -31 -8.5 -27C-12 -19 -7 -9 0 -4Z';

export function StampInkFilter() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        <filter id="stamp-ink" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="3" seed="4" result="grain" />
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -3 2.5" result="pores" />
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="9" result="blotch" />
          <feColorMatrix in="blotch" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.8 1.9" result="pressure" />
          <feComposite in="SourceGraphic" in2="pores" operator="in" result="a" />
          <feComposite in="a" in2="pressure" operator="in" result="b" />
          <feGaussianBlur in="b" stdDeviation="0.15" />
        </filter>
        {/* Everything white prints; the blossom is knocked out of the inked square. */}
        <mask id="seal-knockout">
          <rect x="6" y="6" width="88" height="88" fill="#fff" />
          <g transform="translate(50 52)" fill="#000">
            {[0, 72, 144, 216, 288].map((a) => (
              <path key={a} d={petal} transform={`rotate(${a}) scale(1.22)`} />
            ))}
            <circle r="6" />
          </g>
        </mask>
      </defs>
    </svg>
  );
}

export default function Seal({ className = '' }) {
  return (
    <svg className={`seal ${className}`} viewBox="0 -34 100 134" aria-hidden="true" focusable="false">
      <g filter="url(#stamp-ink)" fill="currentColor">
        <rect x="6" y="6" width="88" height="88" mask="url(#seal-knockout)" />
        {/* stamens, printed inside the knocked-out blossom */}
        <g transform="translate(50 52)" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i * 36 * Math.PI) / 180;
            const len = i % 2 ? 9 : 12.5;
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
        {/* hairline and four-point sparkle rising from the stamp */}
        <path d="M78 -1V-9M78 -23V-33" stroke="currentColor" strokeWidth="0.8" fill="none" />
        <path d="M78 -21Q78.6 -16.6 82 -16Q78.6 -15.4 78 -11Q77.4 -15.4 74 -16Q77.4 -16.6 78 -21Z" />
      </g>
    </svg>
  );
}
