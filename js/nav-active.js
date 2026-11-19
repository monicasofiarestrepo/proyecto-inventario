(function () {
  var file = (location.pathname.split('/').pop() || '').toLowerCase();
  if (!file) file = 'index.html';

  var nav = document.querySelector('.navbar-nav');
  if (!nav) return;

  var topItems = [];
  for (var i = 0; i < nav.children.length; i++) {
    if (nav.children[i].tagName === 'LI') {
      topItems.push(nav.children[i]);
      nav.children[i].classList.remove('active');
    }
  }

  var match = null;
  var anchors = nav.getElementsByTagName('a');
  for (var j = 0; j < anchors.length; j++) {
    var href = (anchors[j].getAttribute('href') || '').split('?')[0].split('#')[0].toLowerCase();
    if (!href || href === '#') continue;
    if (href === file) {
      match = anchors[j];
      break;
    }
  }
  if (!match) return;

  var node = match.parentNode;
  while (node && node !== nav) {
    if (node.tagName === 'LI') node.classList.add('active');
    node = node.parentNode;
  }
})();
