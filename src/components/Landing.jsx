import { useCallback, useEffect, useRef, useState } from 'react';
import { site, postcards, stampsFor } from '../data/index.js';
import PhilosophyCard from './PhilosophyCard.jsx';
import Postcard from './Postcard.jsx';
import Gratitude from './Gratitude.jsx';
import Blossom from './Blossom.jsx';

// A tab brings its postcard forward once that postcard has something on its
// back: a greeting, a note, a sticker, or at least one stamp.
const opens = (p) =>
  Boolean(p.Greeting || p['Note on the back'] || p.Sticker) || stampsFor(p.Postcard).length > 0;

/** Renders the tagline; the word "Thinking" is the only thing set in Style Script. */
export function Tagline({ text }) {
  if (!text) return null;
  return text.split(/(\s+)/).map((w, i) =>
    w === 'Thinking' ? (
      <span key={i} className="script">{w}</span>
    ) : (
      <span key={i}>{w}</span>
    ),
  );
}

export default function Landing() {
  const name = site('Name');
  const tagline = site('Tagline');
  const philosophy = site('Tagline card');
  const [cardOpen, setCardOpen] = useState(false);
  const [active, setActive] = useState(null);
  const trigger = useRef(null);
  const wasOpen = useRef(false);
  const [gratitudeOpen, setGratitudeOpen] = useState(false);
  const stampRef = useRef(null);
  const hadGratitude = useRef(false);
  const lastTab = useRef(null);
  const hadPostcard = useRef(false);
  const open = postcards.find((p) => p.Postcard === active && opens(p));

  // Stable identity, so the postcard's Escape listener isn't re-bound every render.
  const closePostcard = useCallback(() => setActive(null), []);

  // Hand focus back to the tagline when the card closes.
  useEffect(() => {
    if (wasOpen.current && !cardOpen) trigger.current?.focus();
    wasOpen.current = cardOpen;
  }, [cardOpen]);

  // ...and to the gratitude stamp when the gratitude card closes.
  useEffect(() => {
    if (hadGratitude.current && !gratitudeOpen) stampRef.current?.focus();
    hadGratitude.current = gratitudeOpen;
  }, [gratitudeOpen]);
  const closeGratitude = useCallback(() => setGratitudeOpen(false), []);

  // Same for a postcard: focus goes back to the tab that opened it.
  useEffect(() => {
    if (hadPostcard.current && !open) lastTab.current?.focus();
    hadPostcard.current = Boolean(open);
  }, [open]);

  return (
    <>
      <main
        className={`landing${cardOpen ? ' is-dimmed' : ''}${open || gratitudeOpen ? ' is-cleared' : ''}`}
        inert={cardOpen || gratitudeOpen || Boolean(open)}
      >
        <header className="hero">
          {/* The name, with a stamp stuck on beside it. The stamp opens the
              gratitude card; its invitation is printed where the
              denomination would go. */}
          <div className="name-line">
            {name && <h1 className="name">{name}</h1>}
            <button ref={stampRef} type="button" className="landing-stamp" aria-haspopup="dialog" onClick={() => setGratitudeOpen(true)}>
              <span className="stamp-wrap">
                <span className="stamp">
                  <Blossom motif="plum" className="stamp-art" />
                  <span className="stamp-year">click me to exchange gratitude!</span>
                </span>
              </span>
            </button>
          </div>
          {tagline &&
            (philosophy ? (
              <button ref={trigger} type="button" className="tagline" aria-haspopup="dialog" onClick={() => setCardOpen(true)}>
                <span className="tagline-text">
                  <Tagline text={tagline} />
                  <svg className="tagline-rule" viewBox="0 0 300 8" preserveAspectRatio="none" aria-hidden="true">
                    <path d="M2 5C40 2.5 78 6.5 120 4.5S210 3 298 5" pathLength="1" />
                  </svg>
                </span>
                <span className="tagline-arrow" aria-hidden="true">→</span>
              </button>
            ) : (
              <p className="tagline tagline--plain"><Tagline text={tagline} /></p>
            ))}
        </header>

        {postcards.length > 0 && (
          <nav className="tabs" aria-label="Postcards">
            {postcards.map((p) => (
              <button
                key={p.Postcard}
                type="button"
                className="tab"
                aria-pressed={active === p.Postcard}
                aria-haspopup={opens(p) ? 'dialog' : undefined}
                onClick={(e) => {
                  lastTab.current = e.currentTarget;
                  setActive(active === p.Postcard ? null : p.Postcard);
                }}
              >
                {p.Postcard}
              </button>
            ))}
          </nav>
        )}
      </main>

      {cardOpen && <PhilosophyCard tagline={tagline} text={philosophy} onClose={() => setCardOpen(false)} />}
      {gratitudeOpen && <Gratitude onClose={closeGratitude} />}
      {open && <Postcard key={open.Postcard} postcard={open} onClose={closePostcard} />}
    </>
  );
}
