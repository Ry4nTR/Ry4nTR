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
