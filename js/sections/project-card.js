import { el, icon } from '../core/dom.js';
import { localize } from '../i18n/i18n.js';
import { createStatus, createTags, createLinks } from './project-parts.js';

const MAX_TAGS_ON_CARD = 4;

/**
 * One project card.
 *   createProjectCard(project, { index, categoryIcon, onOpen })
 *
 * The whole card opens the details modal (through the title button), while the
 * "View Project" / "Source Code" buttons go straight to their links.
 */
export function createProjectCard(project, { index = 0, categoryIcon = 'fa-solid fa-folder', onOpen } = {}) {
  const card = el('article', {
    class: 'project-card',
    style: `--i:${index}`,
    dataset: { id: project.id, category: project.category },
  });

  card.append(createMedia(card, project, categoryIcon), createBody(project, onOpen));
  return card;
}

function createMedia(card, project, categoryIcon) {
  const media = el('div', { class: 'project-card__media' }, [
    el('div', { class: 'project-card__fallback' }, [icon(categoryIcon)]),
  ]);

  if (project.media?.thumbnail) {
    const image = el('img', {
      class: 'project-card__thumb',
      src: project.media.thumbnail,
      alt: '',
      loading: 'lazy',
      decoding: 'async',
    });
    // Missing file: fall back to the gradient + icon behind it
    image.addEventListener('error', () => image.remove());
    media.append(image);
  }

  if (project.media?.video) {
    const preview = el('video', {
      class: 'project-card__preview',
      loop: true,
      playsinline: true,
      preload: 'none',
      'aria-hidden': 'true',
      tabindex: '-1',
    });
    preview.muted = true;

    media.append(preview, el('span', { class: 'project-card__play', 'aria-hidden': 'true' }, [icon('fa-solid fa-play')]));
    attachHoverPreview(card, preview, project.media.video);
  }

  const status = createStatus(project.status, 'status--overlay project-card__status');
  if (status) media.append(status);

  return media;
}

/** On devices with a mouse, the muted clip plays while the card is hovered. */
function attachHoverPreview(card, video, source) {
  if (!window.matchMedia?.('(hover: hover)').matches) return;

  card.addEventListener('mouseenter', () => {
    if (!video.getAttribute('src')) video.src = source; // loaded lazily, on first hover

    const playing = video.play?.();
    if (playing?.then) {
      playing.then(() => video.classList.add('is-playing')).catch(() => {});
    }
  });

  card.addEventListener('mouseleave', () => {
    video.pause?.();
    video.classList.remove('is-playing');
  });
}

function createBody(project, onOpen) {
  return el('div', { class: 'project-card__body' }, [
    project.kicker && el('p', { class: 'project-card__kicker', text: localize(project.kicker) }),
    el('h3', { class: 'project-card__title' }, [
      el('button', {
        class: 'project-card__open',
        type: 'button',
        'aria-haspopup': 'dialog',
        text: localize(project.title),
        onClick: () => onOpen?.(project),
      }),
    ]),
    el('p', { class: 'project-card__summary', text: localize(project.summary) }),
    createTags(project.tech, MAX_TAGS_ON_CARD),
    createLinks(project.links),
  ]);
}
