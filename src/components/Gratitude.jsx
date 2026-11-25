import { useEffect, useRef, useState } from 'react';
import { site, gratitudes, affirmations } from '../data/index.js';

/**
 * The gratitude postcard, opened by the "click me to exchange gratitude!"
 * stamp on the landing page.
 * It starts as a blank card for the visitor to fill in. Once their note has
 * been sent, the card answers in kind: what Charice is grateful for, then her
 * affirmations (both from Gratitude-Affirmations.csv).
 */
export default function Gratitude({ onClose }) {
  const closeRef = useRef(null);
  const [status, setStatus] = useState('');
  const [sending, setSending] = useState(false);
  const [shared, setShared] = useState(false);
  const email = site('Email');

  useEffect(() => {
    // preventScroll: Close sits under the card, and on a phone focusing it
    // would otherwise open the card scrolled to the bottom.
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Sends the note to Charice's inbox through FormSubmit (formsubmit.co), the
  // same way the earlier "coming soon" page did. The address is Email in Site.csv.
  const onSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    // Honeypot: people never see this field, so anything in it came from a bot.
    if (form.elements._honey.value) return;
    setSending(true);
    setStatus('Sending...');
    try {
      const res = await fetch(`https://formsubmit.co/ajax/${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          name: form.elements.name.value,
          message: form.elements.message.value,
          _subject: 'Someone shared what they are grateful for',
          _template: 'basic',
        }),
      });
      const data = await res.json();
      if (!res.ok || data.success === 'false' || data.success === false) throw new Error(data.message);
      setStatus('Thank you for sharing!');
      setShared(true);
    } catch {
      setStatus('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="postcard-stage gratitude-stage" role="dialog" aria-modal="true" aria-label="Gratitude" onClick={(e) => e.stopPropagation()}>
        <article className="paper gratitude">
          {shared ? (
            <div className="gratitude-side">
              <p className="label gratitude-thanks" role="status">
                {status}
              </p>
              {gratitudes.length > 0 && (
                <section>
                  <h2 className="gratitude-title">I am grateful for…</h2>
                  <ul className="gratitude-list">
                    {gratitudes.map((g) => (
                      <li key={g.Text}>{g.Text}</li>
                    ))}
                  </ul>
                </section>
              )}
              {affirmations.length > 0 && (
                <section>
                  <p className="label">Affirmations</p>
                  <ul className="gratitude-list gratitude-list--plain">
                    {affirmations.map((a) => (
                      <li key={a.Text}>{a.Text}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          ) : (
            <form className="gratitude-form" onSubmit={onSubmit}>
              <label className="gratitude-title" htmlFor="gratitude-message">
                What are you grateful for today?
              </label>
              <label className="sr-only" htmlFor="gratitude-name">
                Name
              </label>
              <input
                id="gratitude-name"
                name="name"
                type="text"
                className="gratitude-input"
                placeholder="Name <3"
                required
                maxLength={100}
                autoComplete="name"
              />
              <textarea
                id="gratitude-message"
                name="message"
                className="gratitude-input gratitude-input--ruled"
                placeholder="Your Message"
                rows="6"
                required
                maxLength={2000}
              />
              <input className="honey" type="text" name="_honey" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="gratitude-send">
                <button type="submit" className="link" disabled={sending}>
                  Send
                </button>
                <p className="gratitude-status" role="status">
                  {status}
                </p>
              </div>
            </form>
          )}
        </article>

        <div className="postcard-controls">
          <button ref={closeRef} type="button" className="tab" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
