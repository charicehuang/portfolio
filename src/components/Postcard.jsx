import { useEffect, useRef, useState } from 'react';
import { site, postcards, stampsFor, photoFor } from '../data/index.js';
import Blossom, { motifFor } from './Blossom.jsx';
import StampRing from './StampRing.jsx';
import PostcardNote from './PostcardNote.jsx';

/**
 * One postcard, brought forward over the blue.
 * Front: the name pressed into the paper + a blossom mark.
 * Back: a divided postcard back. Left is what's written; right is the
 * postage side (a photo, or the blank stamp box and address lines).
 * A postcard with stamps is a set of cards instead, stood round a drum: the
 * picture side first, then one card per stamp (StampRing).
 */
export default function Postcard({ postcard, onClose }) {
  const name = postcard.Postcard;
  const sticker = postcard.Sticker;
  const stamps = stampsFor(name);
  const photo = photoFor(name);
  const motif = motifFor(postcard['Front motif'], postcards.indexOf(postcard));
  const [flipped, setFlipped] = useState(false);
  const firstRef = useRef(null); // the first button under the card, focused on open

  useEffect(() => {
    firstRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const flip = () => setFlipped((f) => !f);
  // Clicking the card turns it over, unless the click was on something that
  // does its own thing.
  const onCardClick = (e) => {
    if (!e.target.closest('button, a, iframe')) flip();
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="postcard-stage" role="dialog" aria-modal="true" aria-label={name} onClick={(e) => e.stopPropagation()}>
        {stamps.length > 0 ? (
          <StampRing postcard={postcard} motif={motif} stamps={stamps} onClose={onClose} />
        ) : (
          // The card is not itself a button, because the back can hold links;
          // "Turn over" below is the keyboard and screen-reader route.
          <div className={`postcard${flipped ? ' is-flipped' : ''}`} onClick={onCardClick}>
            <div className="postcard-inner">
              {/* The face turned away is inert so it can't be focused or read out. */}
              <section className="paper postcard-face postcard-front" inert={!!flipped}>
                <Blossom motif={motif} className="postcard-motif" />
                <h2 className="postcard-title deboss">{name}</h2>
              </section>

              <section className="paper postcard-face postcard-back" inert={!flipped}>
                <div className="postcard-message">
                  <p className="label">{name}</p>
                  <PostcardNote postcard={postcard} />
                </div>
                {photo ? (
                  // A photo takes the postage side, with the "Sticker" cell
                  // stuck on it as a little card.
                  <div className="postcard-postage has-photo">
                    <div className="postcard-photo">
                      <img src={photo} alt={site('Name') ?? ''} />
                      {sticker && <p className="photo-sticker">{sticker}</p>}
                    </div>
                  </div>
                ) : (
                  // Otherwise: the printed stamp box and address rules of a
                  // blank postcard (with the sticker, if any, stuck above them).
                  <div className="postcard-postage">
                    {sticker && <p className="photo-sticker">{sticker}</p>}
                    <span className="postcard-stampbox" aria-hidden="true" />
                    <div className="postcard-address" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

        {/* The drum of stamps has nothing to turn over: its picture side is
            just the first card. */}
        <div className="postcard-controls">
          {stamps.length === 0 && (
            <button ref={firstRef} type="button" className="tab" aria-pressed={flipped} onClick={flip}>
              Turn over
            </button>
          )}
          <button ref={stamps.length > 0 ? firstRef : null} type="button" className="tab" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
