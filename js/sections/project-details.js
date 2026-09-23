import { el } from '../core/dom.js';
import { t, localize } from '../i18n/i18n.js';
import { openModal } from '../components/modal.js';
import { createStatus, createTags, createLinks } from './project-parts.js';

/** Opens the details modal for a project (video, full description, facts, tech, links). */
export function openProjectDetails(project) {
  const title = localize(project.title);
  const media = createMedia(project);

  const node = el('div', { class: 'project-details' }, [
    media?.node,
    el('div', { class: 'project-details__body' }, [
      el('header', { class: 'project-details__header' }, [
        el('div', {}, [
          project.kicker && el('p', { class: 'project-details__kicker', text: localize(project.kicker) }),
          el('h3', { class: 'project-details__title', text: title }),
        ]),
        createStatus(project.status),
      ]),
      el('p', {
        class: 'project-details__description',
        text: localize(project.description ?? project.summary),
      }),
      createMeta(project),
      createTags(project.tech),
      createLinks(project.links),
    ]),
  ]);

  openModal(node, {
    label: title,
    onClose: () => media?.stop(),
  });
  media?.start();
}

/** Video (if there is one) or thumbnail. Returns { node, start, stop } or null. */
function createMedia(project) {
  const { video, thumbnail } = project.media ?? {};

  if (video) {
    const player = el('video', {
      src: video,
      poster: thumbnail,
      controls: true,
      loop: true,
      playsinline: true,
    });
    return {
      node: el('div', { class: 'project-details__media' }, [player]),
      start: () => {
        const promise = player.play?.();
        if (promise?.catch) promise.catch(() => {});
      },
      // Unload the video so it stops downloading and playing
      stop: () => {
        player.pause?.();
        player.removeAttribute('src');
        player.load?.();
      },
    };
  }

  if (thumbnail) {
    const image = el('img', { src: thumbnail, alt: '' });
    image.addEventListener('error', () => image.closest('.project-details__media')?.remove());
    return {
      node: el('div', { class: 'project-details__media' }, [image]),
      start: () => {},
      stop: () => {},
    };
  }

  return null;
}

/** Only the facts a project actually has are shown. */
function createMeta(project) {
  const facts = [
    [t('projects.details.duration'), formatDuration(project.duration)],
    [t('projects.details.team'), formatTeam(project.team)],
    [t('projects.details.focus'), localize(project.focus)],
    [t('projects.details.platform'), project.platform],
  ].filter(([, value]) => value);

  if (!facts.length) return null;

  return el(
    'dl',
    { class: 'project-details__meta' },
    facts.map(([label, value]) =>
      el('div', { class: 'project-details__meta-item' }, [el('dt', { text: label }), el('dd', { text: value })]),
    ),
  );
}

function formatDuration(duration) {
  return duration ? t(`units.${duration.unit}`, { n: duration.value }) : '';
}

function formatTeam(team) {
  if (!team) return '';
  return team.type === 'solo' ? t('team.solo') : t('team.members', { n: team.size });
}
