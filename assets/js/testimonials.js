/* Testimonials: featured story slider and review wall */
(function (TB) {
  var reduce = TB.reduce;

  /* testimonials: featured stories advance on their own; a tab jumps to a story; hover pauses */
  (function () {
    var feature = document.getElementById('tm-feature');
    if (!feature) return;
    var slides = feature.querySelectorAll('.tm-slide');
    var tabs = feature.querySelectorAll('.tm-tab');
    var DUR = 7000, idx = 0, timer = null, left = DUR, started = 0;
    feature.style.setProperty('--tm-dur', DUR + 'ms');
    function show(n) {
      idx = (n + slides.length) % slides.length;
      Array.prototype.forEach.call(slides, function (s, i) { s.classList.toggle('on', i === idx); });
      Array.prototype.forEach.call(tabs, function (t, i) {
        t.setAttribute('aria-selected', String(i === idx));
        var bar = t.querySelector('i');
        bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = '';
      });
      schedule(DUR);
    }
    function schedule(ms) {
      clearTimeout(timer);
      if (reduce) return;
      left = ms; started = Date.now();
      timer = setTimeout(function () { show(idx + 1); }, ms);
    }
    Array.prototype.forEach.call(tabs, function (t, i) {
      t.addEventListener('click', function () { show(i); });
      t.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { show(i + 1); tabs[idx].focus(); }
        if (e.key === 'ArrowLeft') { show(i - 1); tabs[idx].focus(); }
      });
    });
    feature.addEventListener('pointerenter', function () {
      clearTimeout(timer); left -= Date.now() - started; feature.classList.add('paused');
    });
    feature.addEventListener('pointerleave', function () { feature.classList.remove('paused'); schedule(Math.max(600, left)); });
    schedule(DUR);
    /* repeat each review row once so the scroll loops seamlessly */
    if (!reduce) Array.prototype.forEach.call(document.querySelectorAll('.tm-track'), function (t) { t.innerHTML += t.innerHTML; });
  })();
})(window.TB);
