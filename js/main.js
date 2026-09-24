/**
 * Entry point. Loads the data + translations, then starts each module.
 * (This file only wires things together: the logic lives in the modules.)
 */
import { PATHS, TIMING } from './config.js';
import { qs } from './core/dom.js';
import { loadJSON } from './core/data.js';
import { initI18n } from './i18n/i18n.js';

import { initNavbar } from './sections/navbar.js';
import { initLanguageSwitcher } from './sections/language-switcher.js';
import { initHero } from './sections/hero.js';
import { initAbout } from './sections/about.js';
import { initSkills } from './sections/skills.js';
import { initProjects } from './sections/projects.js';
import { openProjectDetails } from './sections/project-details.js';
import { initContact } from './sections/contact.js';

import { initParticles } from './effects/particles.js';
import { initParallax } from './effects/parallax.js';
import { initScrollReveal } from './effects/scroll-reveal.js';

/**
 * Optional data: if a file is missing or has a typo (e.g. a trailing comma in projects.json),
 * only that section ends up empty and the rest of the site keeps working.
 */
async function loadOptional(path, fallback) {
  try {
    return await loadJSON(path);
  } catch (error) {
    console.error(`[portfolio] ${path} could not be loaded, so its section will be empty.`, error);
    return fallback;
  }
}

async function loadData() {
  const [languages, site, projectsData, skillsData, timeline] = await Promise.all([
    loadJSON(PATHS.languages), // required: without it the site cannot be translated
    loadOptional(PATHS.site, { social: [], resumes: [] }),
    loadOptional(PATHS.projects, { categories: [], projects: [] }),
    loadOptional(PATHS.skills, { groups: [] }),
    loadOptional(PATHS.timeline, []),
  ]);

  return {
    languages,
    site,
    timeline,
    categories: projectsData.categories ?? [],
    projects: projectsData.projects ?? [],
    groups: skillsData.groups ?? [],
  };
}

/** A bug in one module should never take the whole page down. */
function safely(name, start) {
  try {
    start();
  } catch (error) {
    console.error(`[portfolio] "${name}" failed to start`, error);
  }
}

async function boot() {
  let data;

  try {
    data = await loadData();
    await initI18n(data.languages);
  } catch (error) {
    // Leave the page in its loading state: css/base/loading.css then explains what to check
    console.error('[portfolio] Could not load the site data.', error);
    return;
  }

  safely('navbar', initNavbar);
  safely('language switcher', () => initLanguageSwitcher(data.languages));
  safely('hero', () => initHero({ ...data, onOpenProject: openProjectDetails }));
  safely('about', () => initAbout(data.timeline));
  safely('skills', () => initSkills(data));
  safely('projects', () => initProjects(data));
  safely('contact', () => initContact(data.site));

  safely('particles', () => initParticles(qs('.particles'), { interval: TIMING.particleInterval }));
  safely('parallax', () => initParallax(qs('.hero__visual')));
  safely('scroll reveal', initScrollReveal);

  document.body.classList.remove('is-loading');
}

boot();
