/* Header: mobile menu, scrolled state, back-to-top button, footer year */
(function (TB) {
  /* menu */
  var nav = document.getElementById('nav');
  var menuBtn = document.querySelector('.menu-btn');
  function setOpen(open) {
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  menuBtn.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  document.getElementById('year').textContent = new Date().getFullYear();

  /* header + back to top */
  var header = document.querySelector('.site-header');
  var toTop = document.querySelector('.to-top');
  var ticking = false;
  function onScroll() {
    ticking = false;
    header.classList.toggle('scrolled', scrollY > 16);
    toTop.classList.toggle('show', scrollY > innerHeight);
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();
})(window.TB);
