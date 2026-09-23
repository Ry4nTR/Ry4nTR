/**
 * Translation engine.
 *
 *  - UI strings live in locales/<code>.json (nested keys, read with t('nav.home')).
 *  - Static HTML is translated through attributes:
 *        data-i18n="key"                      -> sets textContent
 *        data-i18n-attr="aria-label:key;..."  -> sets attributes
 *  - Content coming from data/*.json carries its own { "en": "...", "it": "..." } objects;
 *    read those with localize().
 *  - Modules that render dynamic content subscribe with onLanguageChange().
 */
import { I18N, PATHS } from '../config.js';
import { loadJSON } from '../core/data.js';
import { getItem, setItem } from '../core/storage.js';
import { qsa } from '../core/dom.js';

const dictionaries = {};
const listeners = new Set();
let supported = [];
let current = I18N.defaultLang;

async function ensureLoaded(code) {
  if (!dictionaries[code]) dictionaries[code] = await loadJSON(PATHS.locale(code));
}

/** Saved choice first, then the browser language, then the default. */
function detectLanguage() {
  const saved = getItem(I18N.storageKey);
  if (saved && supported.includes(saved)) return saved;

  const preferred = [...(navigator.languages || []), navigator.language].filter(Boolean);
  for (const tag of preferred) {
    const code = tag.toLowerCase().split('-')[0];
    if (supported.includes(code)) return code;
  }
  return I18N.defaultLang;
}

function lookup(dictionary, path) {
  return path
    .split('.')
    .reduce((node, key) => (node && typeof node === 'object' ? node[key] : undefined), dictionary);
}

/**
 * Translate a key.
 *   t('nav.home')
 *   t('footer.rights')                 -> {year} is always available
 *   t('units.month', { n: 3 })         -> picks "one" / "other" from the plural object
 *   t('hero.titles')                   -> arrays are returned as they are
 */
export function t(key, vars = {}) {
  let value = lookup(dictionaries[current], key);
  if (value === undefined) value = lookup(dictionaries[I18N.defaultLang], key);

  if (value === undefined) {
    console.warn(`[i18n] Missing translation key "${key}"`);
    return key;
  }
  if (Array.isArray(value)) return value;

  const params = { year: new Date().getFullYear(), ...vars };

  if (value && typeof value === 'object') {
    if (typeof params.n !== 'number' || !('other' in value)) return key;
    const form = new Intl.PluralRules(current).select(params.n);
    value = value[form] ?? value.other;
  }

  return String(value).replace(/\{(\w+)\}/g, (match, name) => (name in params ? params[name] : match));
}

/** Pick the current language from a { en: "...", it: "..." } object (plain strings pass through). */
export function localize(field) {
  if (field === null || field === undefined) return '';
  if (typeof field !== 'object' || Array.isArray(field)) return field;
  return field[current] ?? field[I18N.defaultLang] ?? Object.values(field)[0] ?? '';
}

/** Translate every data-i18n / data-i18n-attr element inside `root`. */
export function applyTranslations(root = document) {
  qsa('[data-i18n]', root).forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  qsa('[data-i18n-attr]', root).forEach((node) => {
    node.dataset.i18nAttr.split(';').forEach((pair) => {
      const [attr, key] = pair.split(':').map((part) => part.trim());
      if (attr && key) node.setAttribute(attr, t(key));
    });
  });
}

function applyToDocument() {
  document.documentElement.lang = current;
  document.title = t('meta.title');
  document.querySelector('meta[name="description"]')?.setAttribute('content', t('meta.description'));
  applyTranslations();
}

export async function initI18n(languages) {
  supported = languages.map((language) => language.code);
  current = detectLanguage();
  await ensureLoaded(I18N.defaultLang); // always loaded: it is the fallback
  await ensureLoaded(current);
  applyToDocument();
}

export async function setLanguage(code) {
  if (!supported.includes(code) || code === current) return;
  await ensureLoaded(code);
  current = code;
  setItem(I18N.storageKey, code);
  applyToDocument();
  listeners.forEach((callback) => callback(code));
}

export const getLanguage = () => current;

/** Subscribe to language changes. Returns an unsubscribe function. */
export function onLanguageChange(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}
