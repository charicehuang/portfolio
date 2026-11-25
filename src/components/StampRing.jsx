import { useEffect, useRef, useState } from 'react';
import Blossom from './Blossom.jsx';
import Stamp from './Stamp.jsx';
import StampDetails from './StampDetails.jsx';
import PostcardNote from './PostcardNote.jsx';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * A postcard with stamps: a set of cards stood round a drum. First comes the
 * postcard's picture side (the blossom and its name), then one card per
 * stamp, written side out. The card in front faces you; its neighbours turn
 * away round the curve, and the ones furthest round show their other side.
 *
 * The drum is turned by a single number, --pos (which stamp is in front, with
 * fractions in between). It is moved a frame at a time from here rather than
 * by a CSS transition, so a hand on it (finger, mouse, trackpad, wheel) and
 * the glide afterwards are one continuous motion, and grabbing it mid-glide
 * picks it up exactly where it is.
 * Ways to turn it: swipe or drag anywhere on the screen, a mouse wheel or
 * trackpad anywhere on the screen, the arrow keys, or a click on a card at
 * the side.
 */
export default function StampRing({ postcard, motif, stamps, onClose }) {
  const name = postcard.Postcard;
  const [at, setAt] = useState(0);
  // The picture side arrives first and the other cards fan out after it.
  const [spread, setSpread] = useState(false);
  const ringRef = useRef(null);
  const atRef = useRef(0); // the same as `at`, for listeners registered once
  const dragged = useRef(false);
  // pos: where the drum is drawn; target: where it's heading. Each frame pos
  // closes part of the gap: a quick start that slows as it arrives.
  const motion = useRef({ pos: 0, target: 0, tau: 240, raf: 0, t: 0 });
  // Card 0 is the picture side; stamp k is card k + 1.
  const last = stamps.length;

  const draw = (p) => ringRef.current?.style.setProperty('--pos', p);

  const stop = () => {
    const m = motion.current;
    cancelAnimationFrame(m.raf);
    m.raf = 0;
    ringRef.current?.classList.remove('is-moving');
  };

  const run = () => {
    const m = motion.current;
    if (m.raf) return;
    // While the drum moves, the CSS glide is switched off so it can't lag behind.
    ringRef.current?.classList.add('is-moving');
    m.t = performance.now();
    const frame = (now) => {
      m.pos += (m.target - m.pos) * (1 - Math.exp(-(now - m.t) / m.tau));
      m.t = now;
      // Within about a pixel: arrive, rather than creep the last of the way.
      if (Math.abs(m.target - m.pos) < 0.002) {
        m.pos = m.target;
        draw(m.pos);
        stop();
        return;
      }
      draw(m.pos);
      m.raf = requestAnimationFrame(frame);
    };
    m.raf = requestAnimationFrame(frame);
  };

  /** Head for position p: slowly (a glide), or quickly (following a wheel). */
  const glideTo = (p, tau = 240) => {
    const m = motion.current;
    m.target = p;
    m.tau = tau;
    if (reducedMotion()) {
      stop();
      m.pos = p;
      draw(p);
    } else {
      run();
    }
  };

  /** Turn to card i. The drum has ends: it doesn't wrap round. */
  const go = (i) => {
    const n = Math.max(0, Math.min(last, i));
    atRef.current = n;
    setAt(n);
    glideTo(n);
  };

  useEffect(() => stop, []);

  useEffect(() => {
    const t = setTimeout(() => setSpread(true), reducedMotion() ? 0 : 700);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') go(atRef.current - 1);
      if (e.key === 'ArrowRight') go(atRef.current + 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [last]);

  // Turning by hand. The listeners go on the whole overlay, not just the
  // cards, so a drag or a scroll works anywhere on the screen.
  useEffect(() => {
    const ring = ringRef.current;
    const host = ring?.closest('.overlay');
    if (!host) return;
    const m = motion.current;
    const card = () => ring.querySelector('.ring-card').offsetWidth;
    // Past either end the drum gives a little, and no more.
    const give = (p) => Math.max(-0.3, Math.min(last + 0.3, p));

    // Where to come to rest after a hand lets go: the nearest card, except
    // that a deliberate nudge (or a quick flick) always reaches the next one.
    const settle = (from, p, nudge) => {
      let to = Math.round(p);
      if (to === from && nudge) to = from + nudge;
      go(to);
    };

    // Drag, by finger or mouse. Up-and-down swipes are left to the page
    // (touch-action: pan-y), so a tall card can still be scrolled on a phone.
    let drag = null;
    const onPointerDown = (e) => {
      dragged.current = false;
      if (e.button !== 0 || e.target.closest('a, button, iframe, input, textarea')) return;
      drag = { x: e.clientX, y: e.clientY, id: e.pointerId, start: m.pos, from: atRef.current, step: card() * 0.8, v: 0, lx: e.clientX, lt: e.timeStamp };
    };
    const onPointerMove = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (!dragged.current) {
        if (Math.abs(dx) < 6 || Math.abs(dx) < Math.abs(e.clientY - drag.y)) return;
        dragged.current = true;
        // Catch the drum wherever it is, even mid-glide.
        stop();
        drag.start = m.pos;
        ring.classList.add('is-moving');
        host.classList.add('is-dragging');
        host.setPointerCapture(drag.id);
        window.getSelection()?.removeAllRanges();
      }
      const dt = e.timeStamp - drag.lt;
      if (dt > 0) drag.v = 0.7 * ((e.clientX - drag.lx) / dt) + 0.3 * drag.v;
      drag.lx = e.clientX;
      drag.lt = e.timeStamp;
      m.pos = m.target = give(drag.start - dx / drag.step);
      draw(m.pos);
    };
    const onPointerUp = (e) => {
      const d = drag;
      drag = null;
      if (!d || !dragged.current) return;
      host.classList.remove('is-dragging');
      if (e.type === 'pointercancel') return go(d.from);
      const moved = m.pos - d.from;
      const flick = Math.abs(d.v) > 0.45 ? -Math.sign(d.v) : 0;
      settle(d.from, m.pos, Math.abs(moved) > 1 / 6 ? Math.sign(moved) : flick);
    };
    // The click that ends a drag isn't a click on anything.
    const onClickCapture = (e) => {
      if (!dragged.current) return;
      dragged.current = false;
      e.stopPropagation();
      e.preventDefault();
    };

    // Wheel and trackpad: the drum follows the scroll as it happens, then
    // glides to the nearest card once the scrolling stops. Any small, single
    // wheel notch still moves it a whole card. If the card is taller than the
    // screen, scrolling up and down keeps its normal job of scrolling the page.
    const wheel = { on: false, from: 0, moved: 0, idle: 0 };
    const onWheel = (e) => {
      if (drag && dragged.current) return;
      const sideways = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!sideways && host.scrollHeight > host.clientHeight) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? host.clientWidth : 1;
      const delta = (sideways ? e.deltaX : e.deltaY) * unit;
      if (!wheel.on) {
        wheel.on = true;
        wheel.from = atRef.current;
        wheel.moved = 0;
      }
      wheel.moved += delta;
      glideTo(give(m.target + delta / card()), 90);
      clearTimeout(wheel.idle);
      wheel.idle = setTimeout(() => {
        wheel.on = false;
        settle(wheel.from, m.target, Math.abs(wheel.moved) >= 2 ? Math.sign(wheel.moved) : 0);
      }, 180);
    };

    host.addEventListener('pointerdown', onPointerDown);
    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerup', onPointerUp);
    host.addEventListener('pointercancel', onPointerUp);
    host.addEventListener('click', onClickCapture, true);
    host.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      clearTimeout(wheel.idle);
      host.classList.remove('is-dragging');
      host.removeEventListener('pointerdown', onPointerDown);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerup', onPointerUp);
      host.removeEventListener('pointercancel', onPointerUp);
      host.removeEventListener('click', onClickCapture, true);
      host.removeEventListener('wheel', onWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [last]);

  // A click on a card at the side brings that card round; a click on the
  // picture side, in front, moves on to the first stamp; a click on the blue
  // around the cards closes.
  const onClick = (e) => {
    const card = e.target.closest('.ring-card');
    if (!card) return onClose();
    const i = Number(card.dataset.i);
    if (i !== atRef.current) {
      e.preventDefault();
      go(i);
    } else if (i === 0) {
      go(1);
    }
  };

  return (
    <div className="ring-stage" onClick={onClick}>
      <div
        ref={ringRef}
        className={`ring${spread ? ' is-spread' : ''}`}
        role="region"
        aria-roledescription="carousel"
        aria-label={name}
      >
        {/* Card 0: the postcard's picture side, facing out. Round the back
            of it, the blank back of a postcard. */}
        <div
          data-i={0}
          className={`ring-card is-title${at === 0 ? ' is-active' : ''}`}
          style={{ '--i': 0 }}
          role="group"
          aria-roledescription="slide"
          aria-label={name}
          aria-hidden={at !== 0}
        >
          <section className="paper postcard-face postcard-front">
            <Blossom motif={motif} className="postcard-motif" />
            <h2 className="postcard-title deboss">{name}</h2>
            <p className="carousel-hint title-hint" aria-hidden="true">
              <span className="hint-mouse">scroll</span>
              <span className="hint-touch">swipe</span> →
            </p>
          </section>
          <section className="paper postcard-face postcard-back" aria-hidden="true">
            <div className="postcard-message" />
            <div className="postcard-postage">
              <span className="postcard-stampbox" />
              <div className="postcard-address">
                <span />
                <span />
                <span />
              </div>
            </div>
          </section>
        </div>

        {/* Then one card per stamp, written side out. Round the back of each,
            the picture side. */}
        {stamps.map((stamp, k) => {
          const i = k + 1;
          const active = i === at;
          return (
            <div
              key={i}
              data-i={i}
              className={`ring-card${active ? ' is-active' : ''}`}
              style={{ '--i': i }}
              role="group"
              aria-roledescription="slide"
              aria-label={stamp.Stamp}
              aria-hidden={!active}
            >
              <section className="paper postcard-face postcard-front" aria-hidden="true">
                <Blossom motif={motif} className="postcard-motif" />
                <p className="postcard-title deboss">{name}</p>
              </section>

              {/* On a card at the side the writing is inert, so its links
                  can't be reached, but the card itself still takes the click
                  that brings it round. */}
              <section className="paper postcard-face postcard-back stamp-side">
                <div className="postcard-message" inert={!active}>
                  <p className="label">{name}</p>
                  <PostcardNote postcard={postcard} />
                  <StampDetails stamp={stamp} active={active} />
                </div>
                <div className="postcard-postage" inert={!active}>
                  <Stamp stamp={stamp} motif={motif} />
                </div>
              </section>
            </div>
          );
        })}
      </div>
    </div>
  );
}
