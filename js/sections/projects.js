import { qs, el, icon, clear } from '../core/dom.js';
import { EVENTS, TIMING } from '../config.js';
import { on } from '../core/events.js';
import { t, localize, onLanguageChange } from '../i18n/i18n.js';
import { createTabs } from '../components/tabs.js';
import { createTypeIn } from '../effects/typing.js';
import { createProjectCard } from './project-card.js';
import { openProjectDetails } from './project-details.js';

const normalize = (value) => String(value).trim().toLowerCase();

/**
 * Projects section (data/projects.json).
 *
 * The person picks a path with the tabs (All / Web Developer / Game Programmer, taken from
 * "categories") and the grid is rebuilt from the matching "projects". Clicking a skill chip in the
 * Tech Stack section adds a technology filter on top.
 */
export function initProjects({ categories, projects }) {
  const tabsElement = qs('#project-tabs');
  const descriptionElement = qs('#project-description');
  const filterElement = qs('#project-filter');
  const gridElement = qs('#projects-grid');
  const emptyElement = qs('#projects-empty');
  if (!tabsElement || !gridElement) return;

  /** category: 'all' or a category id. tech: null or { label, match: Set of normalised names } */
  const state = { category: 'all', tech: null };

  // The line under the tabs types itself in when another category is picked
  const description = createTypeIn(descriptionElement, { speed: TIMING.descriptionType });

  const tabs = createTabs(tabsElement, {
    panelId: 'projects-grid',
    onSelect: (id) => {
      state.category = id;
      renderDescription(true);
      renderGrid();
    },
  });

  const matchesTech = (project) =>
    !state.tech || (project.tech ?? []).some((name) => state.tech.match.has(normalize(name)));
  const matchesCategory = (project) => state.category === 'all' || project.category === state.category;

  function renderTabs() {
    // Counts respect the technology filter, so the tabs always show what the grid would contain
    const filtered = projects.filter(matchesTech);
    const countIn = (id) => (id === 'all' ? filtered.length : filtered.filter((p) => p.category === id).length);

    tabs.setTabs(
      [
        { id: 'all', label: t('projects.tabs.all'), icon: 'fa-solid fa-layer-group', count: countIn('all') },
        ...categories.map((category) => ({
          id: category.id,
          label: localize(category.label),
          icon: category.icon,
          count: countIn(category.id),
        })),
      ],
      state.category,
    );
  }

  function renderDescription(animate = false) {
    const category = categories.find((item) => item.id === state.category);
    description.set(category ? localize(category.description) : t('projects.allDescription'), animate);
  }

  function renderFilter() {
    clear(filterElement);
    filterElement.hidden = !state.tech;
    if (!state.tech) return;

    filterElement.append(
      el('span', { text: t('projects.filteredBy') }),
      el('strong', { class: 'project-filter__name', text: state.tech.label }),
      el(
        'button',
        {
          class: 'project-filter__clear',
          type: 'button',
          title: t('projects.clearFilter'),
          'aria-label': t('projects.clearFilter'),
          onClick: () => setTech(null),
        },
        [icon('fa-solid fa-xmark')],
      ),
    );
  }

  function renderGrid() {
    clear(gridElement);
    gridElement.setAttribute('aria-labelledby', `tab-${state.category}`);

    const visible = projects.filter((project) => matchesCategory(project) && matchesTech(project));

    visible.forEach((project, index) => {
      const category = categories.find((item) => item.id === project.category);
      gridElement.append(
        createProjectCard(project, {
          index,
          categoryIcon: category?.icon,
          onOpen: openProjectDetails,
        }),
      );
    });

    emptyElement.hidden = visible.length > 0;
    emptyElement.textContent = t('projects.empty');
  }

  function render() {
    renderTabs();
    renderDescription();
    renderFilter();
    renderGrid();
  }

  function setTech(tech) {
    state.tech = tech;
    if (tech) state.category = 'all'; // a technology filter always starts from the full list
    render();
  }

  // A skill chip was clicked in the Tech Stack section
  on(EVENTS.filterTech, (event) => {
    const { label, match } = event.detail;
    setTech({ label, match: new Set(match.map(normalize)) });
    document.getElementById('projects')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  });

  render();
  onLanguageChange(render);
}
