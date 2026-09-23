import { el } from '../core/dom.js';

/**
 * Background particle system: small shapes float up the screen.
 * Skipped when the tab is hidden and when "reduce motion" is on.
 */

const PARTICLE_TYPES = [
  { color: '#a855f7', size: 2, round: true },
  { color: '#c084fc', size: 3, round: false },
  { color: '#e879f9', size: 2, round: false },
  { color: '#f3e8ff', size: 1, round: false },
];

export function initParticles(container, { interval = 400 } = {}) {
  if (!container) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  function spawn() {
    if (document.hidden) return;

    const type = PARTICLE_TYPES[Math.floor(Math.random() * PARTICLE_TYPES.length)];
    const particle = el('span', { class: 'particle' });
    if (typeof particle.animate !== 'function') return;

    Object.assign(particle.style, {
      left: `${Math.random() * 100}%`,
      width: `${type.size}px`,
      height: `${type.size}px`,
      background: type.color,
      borderRadius: type.round ? '50%' : '0',
    });
    container.append(particle);

    const animation = particle.animate(
      [
        { transform: 'translateY(0) rotate(0deg)', opacity: 0.6 },
        { transform: `translateY(-${window.innerHeight + 100}px) rotate(360deg)`, opacity: 0 },
      ],
      { duration: Math.random() * 4000 + 3000, easing: 'linear' },
    );
    animation.onfinish = () => particle.remove();
  }

  setInterval(spawn, interval);
}
