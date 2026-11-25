import { useEffect, useRef } from 'react';
import { Tagline } from './Landing.jsx';
import Seal from './Seal.jsx';

export default function PhilosophyCard({ tagline, text, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // "Leading Life Philosophy: ..." -> small label + the line itself.
  const split = text.match(/^([^:"“]{1,48}):\s*([\s\S]+)$/);
  const label = split?.[1];
  // Display-only: straight quotes become curly ones. The data file is left as typed.
  const body = (split ? split[2] : text).replace(/"([^"]*)"/g, '“$1”');

  return (
    <div className="overlay" onClick={onClose}>
      <article
        className="paper philosophy"
        role="dialog"
        aria-modal="true"
        aria-labelledby="philosophy-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="philosophy-title" className="philosophy-title">
          <Tagline text={tagline} />
        </h2>
        <div className="philosophy-body">
          {label && <p className="label">{label}</p>}
          <p className="philosophy-text">{body}</p>
        </div>
        <Seal className="philosophy-seal" />
        <button ref={closeRef} type="button" className="link philosophy-close" onClick={onClose}>
          Close
        </button>
      </article>
    </div>
  );
}
