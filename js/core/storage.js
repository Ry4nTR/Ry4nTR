/** localStorage wrapper that never throws (private mode, blocked storage, ...). */

export function getItem(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setItem(key, value) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: the preference just won't be remembered */
  }
}
