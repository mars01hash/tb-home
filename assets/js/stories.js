/* Success stories: pinned heading and stacking cards */
(function (TB) {
  var reduce = TB.reduce;

  /* success stories: measure the pinned heading, and dim each card as the next one covers it */
  var header = document.querySelector('.site-header');
  var storiesSec = document.querySelector('.stories-sec');
  if (!storiesSec) return;
  var storiesHead = document.getElementById('stories-head');
  var stories = document.querySelectorAll('#stack .story');
  function measureStories() {
    storiesSec.style.setProperty('--hdr', header.offsetHeight + 'px');
    storiesSec.style.setProperty('--head-h', storiesHead.offsetHeight + 'px');
  }
  function stackStories() {
    for (var i = 0; i < stories.length - 1; i++) {
      var a = stories[i].getBoundingClientRect(), b = stories[i + 1].getBoundingClientRect();
      var p = Math.max(0, Math.min(1, 1 - (b.top - a.top) / a.height));
      stories[i].style.setProperty('--p', p.toFixed(3));
      stories[i].style.transform = reduce ? '' : 'scale(' + (1 - p * 0.05).toFixed(4) + ')';
    }
  }
  measureStories();
  addEventListener('resize', function () { measureStories(); stackStories(); });
  addEventListener('scroll', function () { requestAnimationFrame(stackStories); }, { passive: true });
  stackStories();
})(window.TB);
