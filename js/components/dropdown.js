/**
 * Dropdown behaviour. Expected markup inside `root` (which gets the .dropdown class):
 *
 *   <div class="dropdown">
 *     <button class="dropdown__toggle">…</button>
 *     <div class="dropdown__menu">…items…</div>
 *   </div>
 *
 * - Devices with a mouse: opens on hover.
 * - Touch and keyboard: opens on click / Enter, closes on Esc or outside click.
 * - Picking an item closes the menu.
 */
export function initDropdown(root, { hover = true, closeDelay = 150 } = {}) {
  const toggle = root.querySelector('.dropdown__toggle');
  if (!toggle) return;

  let closeTimer = null;
  const canHover = () => hover && Boolean(window.matchMedia?.('(hover: hover)').matches);
  const isOpen = () => root.classList.contains('is-open');

  function open() {
    clearTimeout(closeTimer);
    root.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function close() {
    clearTimeout(closeTimer);
    root.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', (event) => {
    // A real mouse click on a hover device is already handled by hover.
    // Keyboard clicks have detail === 0, touch devices have no hover.
    if (canHover() && event.detail > 0) return;
    if (isOpen()) close();
    else open();
  });

  root.addEventListener('mouseenter', () => {
    if (canHover()) open();
  });

  root.addEventListener('mouseleave', () => {
    if (canHover()) closeTimer = setTimeout(close, closeDelay);
  });

  root.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) {
      close();
      toggle.focus();
    }
  });

  root.addEventListener('click', (event) => {
    if (event.target.closest('.dropdown__item')) close();
  });

  document.addEventListener('click', (event) => {
    if (!root.contains(event.target)) close();
  });
}
