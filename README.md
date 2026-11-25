# Charice Huang — portfolio

React + Vite static site. Postcards and stamps, driven entirely by the CSV files in `src/data/`.

## Run it

    npm install
    npm run dev      # local preview at http://localhost:5173
    npm run build    # production build into dist/

## Deploy

The repo is connected to Vercel, which rebuilds the site on every push to `main`. `vercel.json` tells
it how: build with `npm run build`, serve the `dist` folder.

The same settings work on Cloudflare Pages:

- Build command: `npm run build`
- Output directory: `dist`

## Update content

Everything shown on the site comes from `src/data/*.csv`, exported from the Portfolio Stamps sheet
(one file per sheet tab: `Stamps`, `Postcards`, `Site`, `Gratitude-Affirmations`).
To change content, re-export the tab as CSV and replace the file. Keep the column names as they are.
Blank rows and blank cells are skipped automatically.

### What's written on a postcard

`Postcards.csv` has three columns for the writing on a postcard's back:

- `Greeting`: the opening line, shown in bold. Your first name (from `Name` in `Site.csv`) is set in
  the script font, like "Thinking".
- `Note on the back`: the rest of the note. A blank line inside the cell starts a new paragraph.
- `Sticker`: a short message shown as a little card stuck on the postcard's photo.

### Photos

A postcard with no stamps can show a photo on its back. Put the image in `src/photos/`, named after the
postcard in lowercase with dashes (`About Me!` -> `about-me.jpg`). jpg, png and webp all work.

A stamp can show a photo too: put the image in `src/photos/` and write its file name in that row's
`Photo` column in `Stamps.csv`. Text in the `Caption` column shows under it.

## Build status

1. Landing page: background, name, tagline, philosophy card, tabs — done
2. About Me! postcard with flip — done
3. Stamps on every postcard, one card per stamp, stood round a turning drum — done
4. Gratitude card (opened by the "click me to exchange gratitude!" stamp beside the name; its form emails via formsubmit.co, then mail comes back: one line from `Gratitude-Affirmations.csv`, picked at random each time) — done
5. Footer — next
