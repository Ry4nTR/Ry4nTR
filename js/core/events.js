/** Lets modules talk without importing each other (see EVENTS in config.js). */

export function emit(name, detail) {
  document.dispatchEvent(new CustomEvent(name, { detail }));
}

/** Returns a function that removes the listener. */
export function on(name, handler) {
  document.addEventListener(name, handler);
  return () => document.removeEventListener(name, handler);
}
