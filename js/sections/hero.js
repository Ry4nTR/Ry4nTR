import { qs, el, icon } from '../core/dom.js';
import { TIMING } from '../config.js';
import { t, localize, onLanguageChange } from '../i18n/i18n.js';
import { initDropdown } from '../components/dropdown.js';
import { createTypewriter } from '../effects/typing.js';
import { createVideoReel } from '../effects/video-reel.js';

/** Hero section: everything that isn't plain static text. */
export function initHero({ site, languages, projects, onOpenProject }) {
  initTyping();
  initResumeMenu(site.resumes ?? [], languages);
  initSocialLinks(site.social ?? []);
  initReel(projects, onOpenProject);
}

/* --- Typing titles (texts come from locales/*.json -> hero.titles) --- */
function initTyping() {
  const target = qs('#typing-text');
  if (!target) return;

  const typewriter = createTypewriter(target, TIMING.typing);
  typewriter.setTexts(t('hero.titles'));
  typewriter.start();

  onLanguageChange(() => typewriter.setTexts(t('hero.titles')));
}

/* --- Resume dropdown (files come from data/site.json -> resumes) --- */
function initResumeMenu(resumes, languages) {
  const root = qs('#resume-dropdown');
  if (!root || !resumes.length) return;

  const label = el('span');
  const toggle = el(
    'button',
    {
      class: 'btn btn--outline dropdown__toggle',
      type: 'button',
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
    },
    [icon('fa-solid fa-download'), label, icon('fa-solid fa-chevron-down dropdown__chevron')],
  );
  const menu = el('div', { class: 'dropdown__menu dropdown__menu--center' });

  root.append(toggle, menu);
  initDropdown(root);

  function paint() {
    label.textContent = t('hero.resume');

    // One group per resume, one link per available language
    menu.replaceChildren(
      ...resumes.flatMap((resume) => [
        el('p', { class: 'dropdown__heading', text: localize(resume.label) }),
        ...languages
          .filter((language) => resume.files?.[language.code])
          .map((language) => {
            const file = resume.files[language.code];
            return el(
              'a',
              { class: 'dropdown__item', href: file, download: file.split('/').pop() },
              [el('span', { text: language.flag }), language.label],
            );
          }),
      ]),
    );
  }

  paint();
  onLanguageChange(paint);
}

/* --- Social icon buttons (data/site.json -> social) --- */
function initSocialLinks(links) {
  const root = qs('#hero-social');
  if (!root) return;

  links.forEach((link) => {
    root.append(
      el(
        'a',
        {
          class: 'btn btn--icon',
          href: link.url,
          target: link.url.startsWith('mailto:') ? null : '_blank',
          rel: link.url.startsWith('mailto:') ? null : 'noopener noreferrer',
          title: link.label,
          'aria-label': link.label,
        },
        [icon(link.icon)],
      ),
    );
  });
}

/* --- Video reel (projects with "inReel": true and a video in data/projects.json) --- */
function initReel(projects, onOpenProject) {
  const container = qs('#hero-reel');
  if (!container) return;

  const items = projects.filter((project) => project.inReel && project.media?.video);

  // No clips: drop the visual and let the text take the full width
  if (!items.length) {
    container.closest('.hero__visual')?.remove();
    qs('.hero__grid')?.classList.add('hero__grid--single');
    return;
  }

  const reel = createVideoReel(container, items, {
    interval: TIMING.reelInterval,
    fade: TIMING.reelFade,
    getTitle: (project) => localize(project.title),
    getLabel: (project) => `${t('hero.reelOpen')}: ${localize(project.title)}`,
    onOpen: onOpenProject,
  });

  onLanguageChange(() => reel.repaint());
}
