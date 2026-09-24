import { el } from '../core/dom.js';

/**
 * Typewriter effect.
 *
 *   const typewriter = createTypewriter(element, { type, erase, hold, gap, startDelay });
 *   typewriter.setTexts(['Programmer', 'Game Programmer']);   // can be called again (e.g. language change)
 *   typewriter.start();
 *
 * With "reduce motion" enabled it just shows the first title, without animation.
 */
export function createTypewriter(target, { type = 100, erase = 50, hold = 2000, gap = 500, startDelay = 0 } = {}) {
  const reduceMotion = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  let texts = [];
  let textIndex = 0;
  let charIndex = 0;
  let erasing = false;
  let running = false;
  let timer = null;

  function tick() {
    const text = texts[textIndex] ?? '';
    charIndex += erasing ? -1 : 1;
    target.textContent = text.slice(0, charIndex);

    let delay = erasing ? erase : type;

    if (!erasing && charIndex === text.length) {
      erasing = true;
      delay = hold;
    } else if (erasing && charIndex === 0) {
      erasing = false;
      textIndex = (textIndex + 1) % texts.length;
      delay = gap;
    }

    timer = setTimeout(tick, delay);
  }

  function reset() {
    clearTimeout(timer);
    textIndex = 0;
    charIndex = 0;
    erasing = false;
    target.textContent = '';
  }

  function begin(delay) {
    if (!texts.length) return;
    if (reduceMotion) {
      target.textContent = texts[0];
      return;
    }
    timer = setTimeout(tick, delay);
  }

  return {
    setTexts(next) {
      texts = Array.isArray(next) ? next : [String(next)];
      reset();
      if (running) begin(200);
    },
    start() {
      running = true;
      begin(startDelay);
    },
    stop() {
      running = false;
      clearTimeout(timer);
    },
  };
}

/**
 * One-shot "type-in": writes a text into `target`, and can type it out character by character.
 * Unlike the typewriter above it does not loop or erase: it is meant for a line that changes
 * when the person does something (for example, picking another project category).
 *
 *   const line = createTypeIn(element, { speed: 18 });   // speed = ms per character, 0 turns the effect off
 *   line.set('New text', true);                          // true = type it out, false = show it at once
 *
 * The text is first written in an invisible copy that holds the final size, so the layout never
 * jumps while the visible copy is still typing. With "reduce motion" enabled the text just appears.
 */
export function createTypeIn(target, { speed = 18 } = {}) {
  const reduceMotion = Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  let timer = null;

  target.classList.add('type-in');

  return {
    set(text, animate = false) {
      clearTimeout(timer);

      const live = el('span', { class: 'type-in__live' });

      if (!animate || reduceMotion || speed <= 0) {
        live.textContent = text;
        target.replaceChildren(live);
        return;
      }

      const ghost = el('span', { class: 'type-in__ghost', 'aria-hidden': 'true', text });
      target.replaceChildren(ghost, live);
      live.classList.add('is-typing');

      let count = 0;
      const step = () => {
        count += 1;
        live.textContent = text.slice(0, count);

        if (count < text.length) timer = setTimeout(step, speed);
        else live.classList.remove('is-typing');
      };
      timer = setTimeout(step, speed);
    },
  };
}
