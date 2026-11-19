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
})();
