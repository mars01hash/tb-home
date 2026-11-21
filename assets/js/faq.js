/* FAQ: show more / show less */
(function (TB) {
  /* FAQ show more */
  var faqList = document.getElementById('faq-list');
  var faqToggle = document.getElementById('faq-toggle');
  faqToggle.addEventListener('click', function () {
    var all = faqList.classList.toggle('all');
    faqToggle.setAttribute('aria-expanded', String(all));
    faqToggle.textContent = all ? 'Show Less' : 'Show More';
  });
})(window.TB);
