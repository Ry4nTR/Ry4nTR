/**
 * Mouse parallax: moves `target` a few pixels following the cursor.
 * Only on devices with a mouse, and never with "reduce motion".
 */
export function initParallax(target, strength = 20) {
  if (!target) return;
  if (!window.matchMedia?.('(hover: hover)').matches) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  let frame = null;

  document.addEventListener('mousemove', (event) => {
    if (frame) return;

    frame = requestAnimationFrame(() => {
      const x = (event.clientX / window.innerWidth - 0.5) * strength;
      const y = (event.clientY / window.innerHeight - 0.5) * strength;
      target.style.transform = `translate(${x}px, ${y}px)`;
      frame = null;
    });
  });
}
