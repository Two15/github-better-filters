;(function () {
  var classPrefix = 'filters_extension';
  var rootClassPrefix = classPrefix + 'Root';

  function children(node) {
    return Array.prototype.slice.call(node.childNodes);
  }

  //Copied from https://gist.github.com/mathewbyrne/1280286
  function slugify () {
    return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
  }

  function createDOM (str) {
    var div = document.createElement('div');
    div.innerHTML = str;
    return children(div).map(function (node) {
      node.className += ' ' + classPrefix;
      return node;
    });
  }

  function append(nodes, to) {
    nodes.map(function (node) {
      to.appendChild(node);
    });
  }

  var storage = window.localStorage;
  storage[chrome.runtime.id] = storage[chrome.runtime.id] || [];
  storage = storage[chrome.runtime.id];

  console.log('Discover the APIs:', chrome);

  function maintainExtension(klass) {
    if (!document.querySelectorAll('.' + klass).length) {
      init();
    } else {
      setTimeout(maintainExtension.bind(undefined, klass), 200);
    }
  }

  function init () {
    var $filters = document.getElementsByClassName('subnav-search-context').item();
    var $form = document.getElementsByClassName('subnav-search').item();
    $form.className = $form.className + ' ' + rootClassPrefix;

    var $btn = createDOM('<a class="btn">Save</a>');
    append($btn, $form);

    var $container = createDOM('<div></div>').pop();
    append(children($form), $container);
    append([$container], $form);

    $form.addEventListener('submit', function () {
      console.log('GO GO GO ');
    });
    maintainExtension(rootClassPrefix);
  }

  init();

})();
