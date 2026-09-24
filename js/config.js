/**
 * Site-wide configuration.
 * Nothing here contains logic: it is the one place to tweak paths, keys and timings.
 * All paths are relative to index.html (so the site works from a sub-folder, e.g. GitHub Pages).
 */

export const PATHS = {
  languages: 'data/languages.json',
  site: 'data/site.json',
  projects: 'data/projects.json',
  skills: 'data/skills.json',
  timeline: 'data/timeline.json',
  locale: (code) => `locales/${code}.json`,
};

export const I18N = {
  defaultLang: 'en',
  storageKey: 'portfolio:lang',
};

/** EmailJS ids (the public key is meant to be public). */
export const EMAILJS = {
  publicKey: 'aKwa51w0joXLCCtYv',
  serviceId: 'service_t5w9rmq',
  templateId: 'template_zxf9m8g',
};

/** Durations in milliseconds. */
export const TIMING = {
  typing: { type: 100, erase: 50, hold: 2000, gap: 500, startDelay: 1000 },
  reelInterval: 6000,
  reelFade: 800,
  descriptionType: 16, // ms per character when the project category text types in (0 = off)
  particleInterval: 400,
  formStatus: 5000,
};

/** Names of the custom events modules use to talk to each other. */
export const EVENTS = {
  filterTech: 'portfolio:filter-tech',
};
