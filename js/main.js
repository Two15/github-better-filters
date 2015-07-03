;(function () {
  var classPrefix = 'filters_extension';
  var rootClassPrefix = classPrefix + 'Root';
  var KEY_ENTER = 13;
  var KEY_ESCAPE = 27;

  var $filters;
  var $form;

  function log () {
    console.log.apply(console, ['GITHUB FILTERS EXTENSION'].concat(Array.prototype.slice.call(arguments)));
  };
  //Copied from https://gist.github.com/mathewbyrne/1280286
  function slugify () {
    log('slugify');
    return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
  }

  function arrangeForm($form) {
    log('arrangeForm');
    var $input = $form.find('input[type=text]');
    var $button = $form.find('.btn');
    var inputWidth = $input.outerWidth();
    var buttonWidth = $button.outerWidth();
    $input.width(inputWidth - buttonWidth);
  }

  var storage = window.localStorage;
  try {
    storage = JSON.parse(storage[chrome.runtime.id]);
    if (!(storage instanceof Array)) {
      throw '';
    }
  } catch (e) {
    storage = [];
  }

  function heartBeat() {
    log('heartBeat');
    if (!$('.' + rootClassPrefix).length) {
      setTimeout(function () {
        if (initAnchors()) {
          initEditor();
          initSelector();
        }
      }, 0);
    }
    setTimeout(heartBeat, 200);
  }

  function initEditor () {
    log('initEditor');

    function cancelSave (e) {
      log('cancelSave');
      $card.removeClass('toggled');
      e.preventDefault();
    }

    function doSave (e) {
      log('doSave');
      e.stopPropagation();
      e.preventDefault();
      var filter = $faceA.find("input[type=text]").val();
      var name = $faceB.find("input[type=text]").val();
      storage.push({
        name: name,
        filter: filter
      });
      localStorage.setItem(chrome.runtime.id, JSON.stringify(storage));
      $card.removeClass('toggled');
    }


    var $btn = $('<a class="xc__ btn step1">Save</a>');

    var $container = $('<div class="xc__ card_container"></div>');
    var $card = $('<div class="xc__ card"></div>');
    $container.addClass(rootClassPrefix);
    $container.insertBefore($filters);
    $form.append($btn);
    $container.append($card);

    var $faceA = $('<div class="xc__ face"></div>');
    $faceA.append('<div class="subnav-search-context"></div>');
    $faceA.append($form);
    var $fix = $('<div class="xc__ clearfix"></div>');
    $faceA.append($fix);

    var $faceB = $faceA.clone();
    $faceB.find('input[type=text]')
      .attr('placeholder', 'Name your favorite')
      .val('');
    $faceB.find('a.btn').text('Cancel');

    $faceA.addClass('front');
    $faceB.addClass('back');
    $card.append([$faceA, $faceB]);

    arrangeForm($faceA);
    arrangeForm($faceB);

    $faceA.on('click', '.btn', function (e) {
      log('faceAClick');
      $card.addClass('toggled');
      e.preventDefault();
    });
    $faceB.on('click', '.btn', cancelSave);
    $faceB.on('submit', 'form', doSave);
    $faceB.on('keyup', 'input[type=text]', function (e) {
      log('faceBKeyUp');
      if (e.keyCode === KEY_ESCAPE) {
        cancelSave(e);
      }
    });
  }

  function initSelector() {
    log('initSelector');
    var $list = $filters.find('.select-menu-list');
    $list.prepend('<a class="select-menu-item js-navigation-item"><div class="select-menu-item-text"> <strong>Predefined Queries:</strong></div></a>');
    storage.reverse().map(function (query) {
      $list.prepend('<a href="' + window.location.pathname + '?q='+ encodeURIComponent(query.filter) + '" class="select-menu-item js-navigation-item"><div class="select-menu-item-text">' + query.name + '</div></a>');
    });
    $list.prepend('<a class="select-menu-item js-navigation-item"><div class="select-menu-item-text"> <strong>Your Queries:</strong></div></a>');
  }

  function initAnchors() {
    $filters = $('.subnav-search-context');
    $form = $('.subnav-search');
    return $filters.length && $form.length;
  }

  heartBeat();

})();
