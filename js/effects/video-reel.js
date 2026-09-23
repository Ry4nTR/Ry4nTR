import { el } from '../core/dom.js';

/**
 * Rotating video reel.
 *
 *   const reel = createVideoReel(container, projects, {
 *     interval, fade,
 *     getTitle: (project) => 'caption text',
 *     getLabel: (project) => 'aria-label for the whole reel',
 *     onOpen:   (project) => …          // click / Enter on the reel
 *   });
 *   reel.repaint();                     // call after a language change
 *
 * `projects` must have media.video (and optionally media.thumbnail as poster).
 * The reel pauses while it is off-screen.
 */
export function createVideoReel(container, items, { interval = 6000, fade = 800, getTitle, getLabel, onOpen } = {}) {
  if (!items.length) return null;

  let index = 0;
  let timer = null;

  const videos = items.map((project, position) => {
    const video = el('video', {
      class: 'reel__video',
      src: project.media.video,
      poster: project.media.thumbnail,
      loop: true,
      playsinline: true,
      preload: position === 0 ? 'auto' : 'metadata',
      'aria-hidden': 'true',
      tabindex: '-1',
    });
    video.muted = true; // must be a property for autoplay to be allowed
    return video;
  });

  const captionText = el('span', { class: 'reel__caption-text' });
  const caption = el('span', { class: 'reel__caption' }, [
    el('span', { class: 'reel__caption-dot', 'aria-hidden': 'true' }),
    captionText,
  ]);
  const dots =
    items.length > 1
      ? el('span', { class: 'reel__dots', 'aria-hidden': 'true' }, items.map(() => el('span', { class: 'reel__dot' })))
      : null;

  container.replaceChildren(...videos, caption, ...(dots ? [dots] : []));
  container.setAttribute('role', 'button');
  container.tabIndex = 0;

  const play = (video) => {
    const promise = video.play?.();
    if (promise?.catch) promise.catch(() => {});
  };

  function repaint() {
    videos.forEach((video, position) => video.classList.toggle('is-active', position === index));
    dots?.childNodes.forEach((dot, position) => dot.classList.toggle('is-active', position === index));
    captionText.textContent = getTitle ? getTitle(items[index]) : '';
    if (getLabel) container.setAttribute('aria-label', getLabel(items[index]));
  }

  function next() {
    const previous = videos[index];
    index = (index + 1) % videos.length;
    repaint();
    play(videos[index]);
    // Let the cross-fade finish before pausing the outgoing clip
    setTimeout(() => {
      if (previous !== videos[index]) previous.pause?.();
    }, fade);
  }

  function start() {
    clearInterval(timer);
    if (videos.length > 1) timer = setInterval(next, interval);
    play(videos[index]);
  }

  function stop() {
    clearInterval(timer);
    timer = null;
    videos[index].pause?.();
  }

  container.addEventListener('click', () => onOpen?.(items[index]));
  container.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onOpen?.(items[index]);
    }
  });

  repaint();

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), { threshold: 0.25 }).observe(container);
  } else {
    start();
  }

  return { repaint };
}
