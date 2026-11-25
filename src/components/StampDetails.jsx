import { when, photoNamed } from '../data/index.js';

// youtu.be/ID, youtube.com/watch?v=ID, /shorts/ID, /embed/ID -> ID
const youtubeId = (url) =>
  url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/))([\w-]{11})/)?.[1];

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
};

/** A stamp's Link: a YouTube video is embedded right on the postcard, anything else opens in a new tab. */
function StampLink({ url, title, active }) {
  const video = youtubeId(url);

  if (!video) {
    return (
      <a className="link stamp-link" href={url} target="_blank" rel="noreferrer">
        {hostOf(url)}
      </a>
    );
  }
  // Every stamp's card is out at once, so the player is only loaded on the
  // card in front; the cards at the side show the video's still instead.
  // Turning away removes the player, which stops a video that's playing.
  if (!active) {
    return <img className="stamp-video" src={`https://i.ytimg.com/vi/${video}/hqdefault.jpg`} alt="" loading="lazy" />;
  }
  return (
    <iframe
      className="stamp-video"
      src={`https://www.youtube-nocookie.com/embed/${video}?rel=0`}
      title={title}
      allow="encrypted-media; picture-in-picture; fullscreen"
      allowFullScreen
    />
  );
}

/** What is written beside a stamp. Every line is skipped if its cell is blank. */
export default function StampDetails({ stamp, active = true }) {
  const dates = when(stamp.Dates);
  const photo = photoNamed(stamp.Photo);
  return (
    <div className="stamp-details">
      <h3 className="stamp-name">{stamp.Stamp}</h3>
      {stamp.Role && <p className="stamp-role">{stamp.Role}</p>}
      {(dates || stamp.Place) && (
        <p className="stamp-meta">
          {dates && <span>{dates}</span>}
          {stamp.Place && <span>{stamp.Place}</span>}
        </p>
      )}
      {stamp['One line'] && <p className="stamp-line">{stamp['One line']}</p>}
      {stamp.Link && <StampLink url={stamp.Link} title={stamp.Stamp} active={active} />}
      {photo && (
        <figure className="stamp-photo">
          <img src={photo} alt={stamp.Caption ? '' : stamp.Stamp} />
          {stamp.Caption && <figcaption>{stamp.Caption}</figcaption>}
        </figure>
      )}
    </div>
  );
}
