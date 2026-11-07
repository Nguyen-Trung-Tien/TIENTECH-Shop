/**
 * Lightweight, zero-dependency debounce helper function
 * Replaces lodash/debounce to eliminate bundle bloat
 */
export default function debounce(fn, delay = 300) {
  let timer = null;
  const debounced = function (...args) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
  };
  return debounced;
}

