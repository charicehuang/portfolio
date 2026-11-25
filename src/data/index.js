// All site content lives in the CSV files in this folder.
// To update the site: re-export a tab from the Portfolio Stamps sheet and
// replace the matching .csv here. Column names are used exactly as written.
import Papa from 'papaparse';
import siteCsv from './Site.csv?raw';
import postcardsCsv from './Postcards.csv?raw';
import stampsCsv from './Stamps.csv?raw';
import gratitudeCsv from './Gratitude-Affirmations.csv?raw';

const clean = (v) => (typeof v === 'string' ? v.trim() : v);

/** Parse a CSV into row objects, dropping blank rows and blank cells. */
export function parseCsv(text) {
  const { data } = Papa.parse(text, { header: true, skipEmptyLines: 'greedy' });
  return data
    .map((row) =>
      Object.fromEntries(
        Object.entries(row)
          .map(([k, v]) => [clean(k), clean(v)])
          .filter(([k, v]) => k && v !== '' && v != null),
      ),
    )
    .filter((row) => Object.keys(row).length > 0);
}

// Site.csv is a two-column lookup: first column = field name, second = value.
// Read by position so the header wording can be anything.
const siteRows = Papa.parse(siteCsv, { skipEmptyLines: 'greedy' }).data.slice(1);
const siteMap = new Map(
  siteRows.map(([k, v]) => [clean(k), clean(v)]).filter(([k, v]) => k && v),
);

/**
 * Look up a Site value by field name, e.g. site('Email').
 * Falls back to "starts with", so site('Tagline card') finds
 * "Tagline card (shown on click)". Blank -> undefined.
 */
export const site = (field) => {
  if (siteMap.has(field)) return siteMap.get(field);
  const key = [...siteMap.keys()].find((k) => k.toLowerCase().startsWith(field.toLowerCase() + ' '));
  return key ? siteMap.get(key) : undefined;
};

/** Postcards, in sheet order. Each: { Postcard, 'Front motif'?, 'Note on the back'? } */
export const postcards = parseCsv(postcardsCsv).filter((p) => p.Postcard);

// Photos live in src/photos/ and are matched to a postcard by file name:
// the postcard's name in lowercase with dashes, e.g. "About Me!" -> about-me.jpg.
// Drop a file in to add a photo; remove it to take the photo away.
const photoFiles = import.meta.glob('../photos/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' });
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const photos = new Map(Object.entries(photoFiles).map(([path, url]) => [slug(path.split('/').pop().replace(/\.\w+$/, '')), url]));

/** The photo for a postcard, if a file named after it exists in src/photos/. */
export const photoFor = (postcard) => photos.get(slug(postcard));

/** A stamp's photo: the file in src/photos/ named in its "Photo" cell (extension optional). */
export const photoNamed = (file) => (file ? photos.get(slug(file.replace(/\.\w+$/, ''))) : undefined);

// Every Stamps.csv row that names a postcard and a stamp, in sheet order.
// The last row of the file is the newest stamp (its postmark is still wet).
const stampRows = parseCsv(stampsCsv).filter((s) => s.Postcard && s.Stamp);
export const stamps = stampRows.map((s, i) => ({ ...s, newest: i === stampRows.length - 1 }));

/** The stamps that belong on one postcard, matched on the "Postcard" column. */
export const stampsFor = (postcard) => stamps.filter((s) => s.Postcard === postcard);

/**
 * Dates as shown on the site: never a range. Anything ongoing is just
 * "Present"; otherwise a range keeps its end ("2022-2024" -> "2024",
 * "August - October 2026" -> "October 2026"). The CSV keeps the full dates.
 */
export const when = (dates) => {
  if (!dates) return undefined;
  if (/present/i.test(dates)) return 'Present';
  return dates.split(/\s*[-–—]\s*/).filter(Boolean).pop();
};

/** The year printed on a stamp where the price would go: the latest year in Dates. */
export const yearOf = (dates) => dates?.match(/\d{4}/g)?.pop();

// Gratitude-Affirmations.csv: one list, split on its "Type" column.
const gratitudeRows = parseCsv(gratitudeCsv).filter((r) => r.Text);
export const gratitudes = gratitudeRows.filter((r) => r.Type === 'Gratitude');
export const affirmations = gratitudeRows.filter((r) => r.Type === 'Affirmation');
