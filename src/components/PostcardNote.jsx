// The first name from Site.csv ("Charice"), which the greeting sets in the
// same script as "Thinking" in the tagline.
import { firstName } from '../data/index.js';

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The greeting, with the first name, wherever it appears, set in Style Script. */
function Greeting({ text }) {
  if (!firstName) return <p className="postcard-greeting">{text}</p>;
  const parts = text.split(new RegExp(`\\b(${escape(firstName)})\\b`));
  return (
    <p className="postcard-greeting">
      {parts.map((part, i) =>
        part === firstName ? (
          <span key={i} className="script">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </p>
  );
}

/**
 * What's written on the back of a postcard: the "Greeting" cell in bold,
 * then the "Note on the back" cell. A blank line inside a cell starts a new
 * paragraph. Blank cells are skipped.
 */
export default function PostcardNote({ postcard }) {
  const greeting = postcard.Greeting;
  const paragraphs = (postcard['Note on the back'] ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (!greeting && paragraphs.length === 0) return null;
  return (
    <div className="postcard-note">
      {greeting && <Greeting text={greeting} />}
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
}
