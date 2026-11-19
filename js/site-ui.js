(function () {
  var header = document.querySelector('header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.pageYOffset > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var year = document.getElementById('footer-year');
  if (year) year.textContent = new Date().getFullYear();

  // Años desde la fundación (2007): se actualiza solo cada año
  var now = new Date().getFullYear();
  document.querySelectorAll('.js-years-since').forEach(function (el) {
    var since = parseInt(el.getAttribute('data-since'), 10);
    if (since) el.textContent = now - since;
  });
})();
