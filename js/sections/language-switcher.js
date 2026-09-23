import { qs, qsa, el, icon } from '../core/dom.js';
import { t, getLanguage, setLanguage, onLanguageChange } from '../i18n/i18n.js';
import { initDropdown } from '../components/dropdown.js';

/** Builds the language dropdown in the navbar. To add a language: see the README. */
export function initLanguageSwitcher(languages) {
  const root = qs('#lang-switcher');
  if (!root) return;

  const code = el('span');
  const toggle = el(
    'button',
    {
      class: 'navbar__lang-toggle dropdown__toggle',
      type: 'button',
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
    },
    [icon('fa-solid fa-globe'), code, icon('fa-solid fa-chevron-down dropdown__chevron')],
  );

  const menu = el(
    'div',
    { class: 'dropdown__menu dropdown__menu--right' },
    languages.map((language) =>
      el(
        'button',
        {
          class: 'dropdown__item',
          type: 'button',
          dataset: { lang: language.code },
          onClick: () => setLanguage(language.code),
        },
        [el('span', { text: language.flag }), language.label],
      ),
    ),
  );

  root.classList.add('dropdown');
  root.append(toggle, menu);
  initDropdown(root);

  function paint() {
    const active = getLanguage();
    code.textContent = active.toUpperCase();
    toggle.setAttribute('aria-label', t('nav.language'));
    qsa('.dropdown__item', menu).forEach((item) => {
      item.setAttribute('aria-current', String(item.dataset.lang === active));
    });
  }

  paint();
  onLanguageChange(paint);
}
