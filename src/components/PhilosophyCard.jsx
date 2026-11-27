import { useEffect, useRef } from 'react';
import { Tagline } from './Landing.jsx';
import Seal from './Seal.jsx';

/**
 * "Leading Life Philosophy: ..." -> a small label + the line itself.
 * Display-only: straight quotes become curly ones. The data file is left as typed.
 */
function splitPhilosophy(text) {
  const split = text.match(/^([^:"“]{1,48}):\s*([\s\S]+)$/);
  return { label: split?.[1], body: (split ? split[2] : text).replace(/"([^"]*)"/g, '“$1”') };
}

export default function PhilosophyCard({ tagline, text, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { label, body } = splitPhilosophy(text);

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
