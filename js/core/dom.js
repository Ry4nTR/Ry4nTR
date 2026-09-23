/** Tiny DOM helpers so the rest of the code stays readable. */

export const qs = (selector, root = document) => root.querySelector(selector);
export const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/**
 * Create an element.
 *
 *   el('a', { class: 'btn', href: '#', onClick: fn, dataset: { id: 1 } }, ['Text', otherNode])
 *
 * - `class`   sets className
 * - `text`    sets textContent
 * - `dataset` assigns data-* attributes
 * - `onXxx`   functions become event listeners (onClick -> "click")
 * - null / undefined / false attributes and children are skipped
 */
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined || value === false) continue;

    if (key === 'class') node.className = value;
    else if (key === 'text') node.textContent = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key.startsWith('on') && typeof value === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else node.setAttribute(key, value === true ? '' : value);
  }

  for (const child of [].concat(children)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child.nodeType ? child : String(child));
  }

  return node;
}

/** Font Awesome icon: icon('fa-solid fa-play') */
export const icon = (classes) => el('i', { class: classes, 'aria-hidden': 'true' });

/** Remove all children. */
export function clear(node) {
  node.replaceChildren();
  return node;
}
