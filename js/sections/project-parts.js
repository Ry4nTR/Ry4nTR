import { el, icon } from '../core/dom.js';
import { t, localize } from '../i18n/i18n.js';

/**
 * Link button presets. In data/projects.json a link is { "kind": "view" | "source", "url": "…" }.
 * A link can also bring its own "icon" (Font Awesome classes) and "label" ({ en, it }).
 */
const LINK_KINDS = {
  view: { icon: 'fa-solid fa-arrow-up-right-from-square', labelKey: 'projects.links.view' },
  source: { icon: 'fa-brands fa-github', labelKey: 'projects.links.source' },
};

/** Status pill ("In progress", "Completed", …). Returns null when the project has no status. */
export function createStatus(status, extraClass = '') {
  if (!status) return null;
  return el('span', {
    class: `status status--${status} ${extraClass}`.trim(),
    text: t(`status.${status}`),
  });
}

/** Tech tags, optionally limited to `max` with a "+N" tag for the rest. Returns null if empty. */
export function createTags(tech = [], max = Infinity) {
  if (!tech.length) return null;

  const shown = tech.slice(0, max);
  const hidden = tech.length - shown.length;

  return el('ul', { class: 'tag-list' }, [
    ...shown.map((name) => el('li', { class: 'tag', text: name })),
    hidden > 0 && el('li', { class: 'tag tag--more', text: `+${hidden}` }),
  ]);
}

/** "View Project" / "Source Code" buttons. Returns null when there are no links. */
export function createLinks(links = []) {
  if (!links.length) return null;

  return el(
    'div',
    { class: 'project-links' },
    links.map((link) => {
      const preset = LINK_KINDS[link.kind] ?? {};
      const iconClasses = link.icon ?? preset.icon ?? 'fa-solid fa-link';
      const label = link.label ? localize(link.label) : preset.labelKey ? t(preset.labelKey) : link.kind;

      return el(
        'a',
        { class: 'btn btn--small', href: link.url, target: '_blank', rel: 'noopener noreferrer' },
        [icon(iconClasses), el('span', { text: label })],
      );
    }),
  );
}
