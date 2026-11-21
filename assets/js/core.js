/* Shared helpers used by every feature script. Load this first. */
window.TB = (function () {
  var root = document.documentElement;
  return {
    root: root,
    reduce: matchMedia('(prefers-reduced-motion: reduce)').matches,
    each: function (sel, fn, ctx) { Array.prototype.forEach.call((ctx || document).querySelectorAll(sel), fn); }
  };
})();
