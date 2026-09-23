import { el, icon, qsa } from '../core/dom.js';
import { t } from '../i18n/i18n.js';

/**
 * One shared modal for the whole site.
 *
 *   openModal(node, { label: 'Dialog name', onClose: () => … });
 *   closeModal();
 */

const FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, select, video[controls], [tabindex]:not([tabindex="-1"])';

let root = null;
let dialog = null;
let content = null;
let closeButton = null;
let lastFocused = null;
let closeHandler = null;

function build() {
  closeButton = el('button', { class: 'modal__close', type: 'button', onClick: closeModal }, [
    icon('fa-solid fa-xmark'),
  ]);
  content = el('div', { class: 'modal__content' });
  dialog = el(
    'div',
    { class: 'modal__dialog', role: 'dialog', 'aria-modal': 'true', tabindex: '-1' },
    [closeButton, content],
  );
  root = el('div', { class: 'modal' }, [dialog]);

  // Click on the dark backdrop closes the modal
  root.addEventListener('mousedown', (event) => {
    if (event.target === root) closeModal();
  });
  document.addEventListener('keydown', handleKeydown);
  document.body.append(root);
}

function handleKeydown(event) {
  if (!root?.classList.contains('is-open')) return;

  if (event.key === 'Escape') {
    closeModal();
    return;
  }

  // Keep Tab inside the dialog
  if (event.key !== 'Tab') return;
  const focusable = qsa(FOCUSABLE, dialog);
  if (!focusable.length) {
    event.preventDefault();
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function openModal(node, { label = '', onClose = null } = {}) {
  if (!root) build();

  lastFocused = document.activeElement;
  closeHandler = onClose;

  content.replaceChildren(node);
  dialog.setAttribute('aria-label', label);
  closeButton.setAttribute('aria-label', t('modal.close'));
  dialog.scrollTop = 0;

  document.documentElement.classList.add('modal-open');
  root.classList.add('is-open');
  dialog.focus({ preventScroll: true });
}

export function closeModal() {
  if (!root?.classList.contains('is-open')) return;

  root.classList.remove('is-open');
  document.documentElement.classList.remove('modal-open');

  closeHandler?.();
  closeHandler = null;
  lastFocused?.focus?.({ preventScroll: true });

  // Empty the content after the fade-out finishes
  setTimeout(() => {
    if (!root.classList.contains('is-open')) content.replaceChildren();
  }, 350);
}
