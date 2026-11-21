/* Scroll reveals, number count-ups, active nav link, marquee duplication */
(function (TB) {
  var root = TB.root, reduce = TB.reduce, each = TB.each;

  /* reveals, counters, nav highlight */
  if ('IntersectionObserver' in window) {
    root.classList.add('js');
    if (!reduce) each('.track', function (t) { t.innerHTML += t.innerHTML; });

    each('[data-rv]', function (el) {
      var sibs = Array.prototype.filter.call(el.parentNode.children, function (c) { return c.hasAttribute('data-rv'); });
      el.style.setProperty('--i', sibs.indexOf(el) % 4);
    });
    var arrive = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        arrive.unobserve(el);
        el.classList.add('in');
        setTimeout(function () { el.removeAttribute('data-rv'); el.style.removeProperty('--i'); }, 1200);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    each('[data-rv]', function (el) { arrive.observe(el); });

    if (!reduce) {
      var counts = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target, end = +el.dataset.count, suffix = el.dataset.suffix || '', t0 = null;
          counts.unobserve(el);
          requestAnimationFrame(function step(t) {
            if (t0 === null) t0 = t;
            var p = Math.min((t - t0) / 1600, 1);
            el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4))) + suffix;
            if (p < 1) requestAnimationFrame(step);
          });
        });
      }, { threshold: 0.6 });
      each('[data-count]', function (el) { counts.observe(el); });
    }

    var links = {};
    each('.nav a', function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        each('.nav a.active', function (a) { a.classList.remove('active'); });
        if (links[en.target.id]) links[en.target.id].classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    each('main section[id]', function (s) { spy.observe(s); });
  }
})(window.TB);
