# Portfolio: Rostyslav Terletskyy

Static site (HTML, CSS and vanilla JavaScript modules). No build step, no dependencies.
Everything you are likely to edit lives in JSON files, so the HTML and the JS rarely need to change.

## Run it locally

The site loads its data with `fetch()`, which browsers block when a page is opened straight from disk
(`file://`). Serve the folder instead:

- **VS Code:** install the *Live Server* extension, then "Go Live".
- **Terminal:** `python -m http.server 8000`, then open <http://localhost:8000>.

GitHub Pages works as is (all paths are relative, so it also works from a sub-folder).

## Folder map

```
index.html            Structure only. No visible text, no lists: those come from the files below.
data/                 CONTENT (edit these)
  projects.json         Categories (Web / Game) and every project
  skills.json           Tech stack groups and chips
  timeline.json         "Journey" list in the About section
  site.json             Social links and downloadable CVs
  languages.json        Languages available in the switcher
locales/              UI TEXT, one file per language (en.json, it.json)
assets/               Images, videos, icons and the CV PDFs (cv/)
css/
  main.css              Only @imports the files below
  base/                 tokens (colors!), reset, typography, animations, loading state
  layout/               container, navbar, footer
  components/           buttons, dropdown, chips, tabs, timeline, modal, form, project card/details
  sections/             hero, about, skills, projects, contact
  effects/              particles, type-in (the line that types itself under the project tabs)
js/
  main.js               Entry point: loads data + translations, starts every module
  config.js             Paths, EmailJS ids, timings
  core/                 dom helpers, storage, JSON loader, tiny event bus
  i18n/                 translation engine + date formatting
  components/           dropdown, tabs, modal (reusable, know nothing about the portfolio)
  effects/              typing, particles, parallax, scroll reveal, video reel
  sections/             one file per page section + project card/details
```

## Recipes

### Add a project
Open `data/projects.json` and copy an object inside `"projects"`. Only `id`, `category`, `title`
and `summary` are required; anything you leave out is simply not shown.

| Field | Meaning |
| --- | --- |
| `id` | Unique, no spaces |
| `category` | `id` of an entry in `"categories"` (`web` or `game`) |
| `title` | Project name (plain string) |
| `kicker` | Short label above the title, e.g. `{ "en": "Multiplayer FPS", "it": "FPS multigiocatore" }` |
| `status` | `in-progress`, `mvp` or `completed` (leave it out for no badge) |
| `summary` | Short text shown on the card (2 to 3 lines fit) |
| `description` | Long text shown in the details window (falls back to `summary`). A blank line (`\n\n`) starts a new paragraph |
| `duration` | `{ "value": 3, "unit": "month" }`, unit is `day`, `week`, `month` or `year` |
| `team` | `{ "type": "solo" }` or `{ "type": "team", "size": 4 }` |
| `focus` | Free label, e.g. "AI programming" |
| `platform` | e.g. `"PC"`, `"Browser"` |
| `tech` | List of technologies. Names matching a skill in `skills.json` update its project counter |
| `media` | `{ "thumbnail": "assets/thumbnail/X.png", "video": "assets/videos/x.mp4" }` |
| `links` | `[{ "kind": "view", "url": "…" }, { "kind": "source", "url": "…" }]`. No URL, no button |
| `inReel` | `true` to also show the clip in the hero video reel (needs `media.video`) |

Text fields can be a plain string or `{ "en": "…", "it": "…" }`. A missing language falls back to English.

### Add a project category (e.g. "Tools")
Add an object to `"categories"` in `data/projects.json` (`id`, `icon`, `label`, `description`), then use its
`id` as the `category` of your projects. A new tab appears automatically.

### Add or change a skill
Edit `data/skills.json`. To make an item count the projects that use it, its `name` (or one of its
`aliases`) must match a name in the projects' `tech` list. A group with `"showProjectCount": false`
never shows counters or filters (the Areas of Work and Tools groups use it). Want an IDE group? Add one:

```json
{ "id": "ides", "icon": "fa-solid fa-terminal",
  "title": { "en": "IDEs & Editors", "it": "IDE ed Editor" },
  "showProjectCount": false,
  "items": [ { "name": "Visual Studio" }, { "name": "VS Code" } ] }
```

### Add a language (e.g. Spanish)
1. Copy `locales/en.json` to `locales/es.json` and translate the values.
2. Add `{ "code": "es", "label": "Español", "flag": "🇪🇸" }` to `data/languages.json`.
3. Add `"es": "…"` next to `en` / `it` in the JSON files wherever you want a Spanish text
   (texts without it fall back to English). Optionally add `"es"` files in `data/site.json` → `resumes`.

### Change text on the page
Everything visible is in `locales/en.json` and `locales/it.json` (hero titles that type out under your name are
`hero.titles`). The name in the `<h1>` is the only text written directly in `index.html`.

### Add or change a social / contact link
Edit `social` in `data/site.json`. Every entry shows as an icon button in the hero. Entries with `"contact": true` are
also shown as buttons above the contact form (`display` is the text shown instead of `label`, useful for an e-mail
address). A `url` starting with `mailto:` opens the mail app instead of a new tab.

### Change the quick facts in About
Availability, location, languages and interests are the four `<li class="about-fact">` rows in `index.html`;
their texts are `about.availability`, `about.location`, `about.languages` and `about.interests` in the locale files.

### Add a CV
Drop the PDF in `assets/cv/` and add an entry to `resumes` in `data/site.json`.

### Add an item to the Journey timeline
Add an object to `data/timeline.json`. Dates are `"YYYY-MM"` or `"YYYY"`; `"end": "present"` shows "Present".

### Change colors
`css/base/tokens.css` is the only place colors are defined.

### Change sizes (and support bigger screens)
Everything is sized in `rem`, so the whole page scales from one value: the root font size in `css/base/reset.css`.
It stays at the browser default (16px) up to a 1920x1080 window and grows on 2K, 4K and ultrawide screens, so the
layout keeps the same proportions there. `--container-width`, `--gutter` and `--section-space` in `css/base/tokens.css`
control how wide the content is and how much space sits around sections. When you write new CSS, use `rem`
(pixels are only kept for 1 to 3px borders and for media query breakpoints).

### Typing effects
- Hero titles: `createTypewriter` in `js/effects/typing.js` (types, holds, erases, loops). Texts are `hero.titles` in the locale files.
- Text under the project tabs: `createTypeIn` in the same file. It types the new text once when a category is picked.
  Speed is `TIMING.descriptionType` in `js/config.js` (milliseconds per character, `0` turns it off).

## Files the site expects in `assets/`

```
assets/cv/CV_Programmer_ENG.pdf         CV_Programmatore_ITA.pdf
assets/cv/CV_GameProgrammer_ENG.pdf     CV_GameProgrammer_ITA.pdf     (already included)
assets/icons/unity-logo.png             unreal-logo.png
assets/thumbnail/AlphaExilemet.png      SyncedRush.png    StayRoom.png    ProjectARK.png
                 LaScatolaDelNonno.png  3DConfigurator.png  (new: add a screenshot)
assets/videos/alpha_exilemet_clip.mp4   synced_rush_clip.mp4
```

A missing thumbnail or logo is not an error: the card falls back to a gradient with an icon.

## Contact form
Sent through EmailJS. The ids are in `js/config.js`; the form field names (`from_name`, `reply_to`, `message`)
must match the variables of the EmailJS template.
