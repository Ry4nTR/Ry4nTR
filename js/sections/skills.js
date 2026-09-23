import { qs, el, icon, clear } from '../core/dom.js';
import { EVENTS } from '../config.js';
import { emit } from '../core/events.js';
import { t, localize, onLanguageChange } from '../i18n/i18n.js';

const normalize = (value) => String(value).trim().toLowerCase();

/**
 * Tech stack section (data/skills.json).
 *
 * Instead of subjective progress bars, every technology shows how many of the projects in
 * data/projects.json use it. Chips with a count are buttons: clicking one filters the projects.
 */
export function initSkills({ groups, projects }) {
  const grid = qs('#skills-grid');
  if (!grid) return;

  // Tech tags of each project, normalised once
  const projectTech = projects.map((project) => (project.tech ?? []).map(normalize));

  /** Names a skill can be matched by: its own name (if it is a plain string) + aliases. */
  const namesOf = (item) =>
    [typeof item.name === 'string' ? item.name : null, ...(item.aliases ?? [])].filter(Boolean).map(normalize);

  const countProjects = (names) =>
    projectTech.filter((tags) => tags.some((tag) => names.includes(tag))).length;

  function createChip(item, showCounts) {
    const label = localize(item.name);
    const names = namesOf(item);
    const count = showCounts ? countProjects(names) : 0;

    let logo = null;
    if (item.logo) {
      logo = el('img', { class: 'chip__logo', src: item.logo, alt: '', width: 18, height: 18, loading: 'lazy' });
      logo.addEventListener('error', () => logo.remove());
    }

    const parts = [
      logo,
      el('span', { class: 'chip__name', text: label }),
      item.note && el('span', { class: 'chip__note', text: localize(item.note) }),
      count > 0 && el('span', { class: 'chip__count', text: String(count), 'aria-hidden': 'true' }),
    ];

    if (count === 0) return el('span', { class: 'chip' }, parts);

    const usedIn = t('skills.usedIn', { n: count });
    return el(
      'button',
      {
        class: 'chip chip--interactive',
        type: 'button',
        title: usedIn,
        'aria-label': `${label}: ${usedIn}`,
        onClick: () => emit(EVENTS.filterTech, { label, match: names }),
      },
      parts,
    );
  }

  function createGroup(group) {
    const showCounts = group.showProjectCount !== false;

    return el('article', { class: 'skill-group' }, [
      el('header', { class: 'skill-group__header' }, [
        icon(group.icon),
        el('h3', { class: 'skill-group__title', text: localize(group.title) }),
      ]),
      el(
        'ul',
        { class: 'chip-list' },
        group.items.map((item) => el('li', {}, [createChip(item, showCounts)])),
      ),
    ]);
  }

  function render() {
    clear(grid);
    groups.forEach((group) => grid.append(createGroup(group)));
  }

  render();
  onLanguageChange(render);
}
