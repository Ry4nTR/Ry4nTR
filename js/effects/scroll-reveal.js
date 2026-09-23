import { qsa } from '../core/dom.js';

/**
 * Adds .is-visible to every .reveal element once it scrolls into view
 * (the fade itself is defined in css/base/animations.css).
 */
export function initScrollReveal(selector = '.reveal') {
  const nodes = qsa(selector);

  if (!('IntersectionObserver' in window)) {
    nodes.forEach((node) => node.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0, rootMargin: '0px 0px -60px 0px' },
  );

  nodes.forEach((node) => observer.observe(node));
}
