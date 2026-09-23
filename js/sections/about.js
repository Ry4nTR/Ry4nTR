import { qs, el, icon, clear } from '../core/dom.js';
import { t, localize, onLanguageChange } from '../i18n/i18n.js';
import { formatPeriod } from '../i18n/format.js';

const MARKER_ICONS = {
  work: 'fa-solid fa-briefcase',
  education: 'fa-solid fa-graduation-cap',
};

/** About section: the bio text is static HTML, the journey timeline comes from data/timeline.json. */
export function initAbout(timeline) {
  const list = qs('#timeline');
  if (!list) return;

  function render() {
    clear(list);
    timeline.forEach((entry) => list.append(createEntry(entry)));
  }

  render();
  onLanguageChange(render);
}

function createEntry(entry) {
  return el('li', { class: 'timeline__item' }, [
    el('span', { class: 'timeline__marker', 'aria-hidden': 'true' }, [icon(MARKER_ICONS[entry.type] ?? MARKER_ICONS.work)]),
    el('p', { class: 'timeline__period', text: formatPeriod(entry.period, t('about.present')) }),
    el('h4', { class: 'timeline__title', text: localize(entry.title) }),
    el('p', { class: 'timeline__place', text: localize(entry.place) }),
    entry.summary && el('p', { class: 'timeline__summary', text: localize(entry.summary) }),
  ]);
}
