import { useId } from 'react';
import { when, yearOf } from '../data/index.js';
import Blossom from './Blossom.jsx';

/**
 * The circular cancellation over a "Past" stamp: Place around the top of the
 * ring, Dates around the bottom, wavy bars running across the stamp.
 * `fresh` is the newest stamp: the same crisp mark, in darker, newer ink.
 */
function Postmark({ place, dates, fresh }) {
  const id = `postmark-${useId().replace(/[^a-z0-9]/gi, '')}`;
  return (
    <svg className={`postmark${fresh ? ' postmark--fresh' : ''}`} viewBox="-50 -50 190 100" aria-hidden="true" focusable="false">
      <defs>
        {/* Top text sits outside its arc, bottom text inside, so both land in the ring. */}
        <path id={`${id}-top`} d="M-30 0A30 30 0 0 1 30 0" />
        <path id={`${id}-bottom`} d="M-36.5 0A36.5 36.5 0 0 0 36.5 0" />
      </defs>
      <g filter="url(#stamp-ink)" fill="none" stroke="currentColor">
        <circle r="41" strokeWidth="1.6" />
        <circle r="26" strokeWidth="1" />
        <path d="M0 -6Q0.8 -0.8 6 0Q0.8 0.8 0 6Q-0.8 0.8 -6 0Q-0.8 -0.8 0 -6Z" fill="currentColor" stroke="none" />
        <g fill="currentColor" stroke="none">
          {place && (
            <text>
              <textPath href={`#${id}-top`} startOffset="50%" textAnchor="middle">{place}</textPath>
            </text>
          )}
          {dates && (
            <text>
              <textPath href={`#${id}-bottom`} startOffset="50%" textAnchor="middle">{dates}</textPath>
            </text>
          )}
        </g>
        {[-18, -6, 6, 18].map((y) => (
          <path key={y} d={`M46 ${y}q11 -5 22 0t22 0t22 0t22 0`} strokeWidth="1.5" strokeLinecap="round" />
        ))}
      </g>
    </svg>
  );
}

/** One stamp: perforated paper, the postcard's blossom as the art, the year where a price would go. */
export default function Stamp({ stamp, motif }) {
  const year = yearOf(stamp.Dates);
  return (
    <div className="stamp-wrap">
      <div className="stamp">
        <Blossom motif={motif} className="stamp-art" />
        {year && <span className="stamp-year">{year}</span>}
      </div>
      {stamp.Status === 'Past' && <Postmark place={stamp.Place} dates={when(stamp.Dates)} fresh={stamp.newest} />}
    </div>
  );
}
