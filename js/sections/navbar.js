import { qs, qsa } from '../core/dom.js';

/**
 * Navigation bar behaviour:
 *  - shadow once the page is scrolled
 *  - hamburger menu on mobile (closes on link click, outside click and Esc)
 *  - highlights the link of the section currently in view
 */
export function initNavbar() {
  const nav = qs('.navbar');
  const toggle = qs('.navbar__toggle');
  const links = qs('.navbar__links');
  if (!nav || !toggle || !links) return;

  // --- Shadow on scroll ---
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // --- Mobile menu ---
  function setOpen(open) {
    links.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.firstElementChild?.setAttribute('class', open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars');
  }

  toggle.addEventListener('click', () => setOpen(!links.classList.contains('is-open')));
  links.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('click', (event) => {
    if (!nav.contains(event.target)) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });

  // --- Active section highlight ---
  if (!('IntersectionObserver' in window)) return;

  const linkBySection = new Map(
    qsa('.navbar__link[href^="#"]').map((link) => [link.getAttribute('href').slice(1), link]),
  );

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        linkBySection.forEach((link) => {
          link.classList.remove('is-active');
          link.removeAttribute('aria-current');
        });
        const active = linkBySection.get(entry.target.id);
        active?.classList.add('is-active');
        active?.setAttribute('aria-current', 'true');
      });
    },
    // A thin band across the middle of the viewport
    { rootMargin: '-40% 0px -55% 0px' },
  );

  qsa('main section[id]').forEach((section) => observer.observe(section));
}
