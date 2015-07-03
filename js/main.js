;(function () {
  var classPrefix = 'filters_extension';
  var rootClassPrefix = classPrefix + 'Root';
  var KEY_ENTER = 13;
  var KEY_ESCAPE = 27;

  var $filters;
  var $form;

  //Copied from https://gist.github.com/mathewbyrne/1280286
  function slugify () {
    return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
  }

  function arrangeForm($form) {
    var $input = $form.find('input[type=text]');
    var $button = $form.find('.btn').toArray();
    var buttonWidth = $button.reduce(function (sum, elt) {
      return sum + $(elt).outerWidth();
    }, 0);
    var inputMargins = $input.outerWidth() - $input.width();
    $input.width($form.outerWidth() - buttonWidth - inputMargins);
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

  function saveQueries() {
    localStorage.setItem(chrome.runtime.id, JSON.stringify(storage));
    initSelector();
  }

  function heartBeat() {
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

  function iconizedButton(icon) {
    return $('<a class="xc__ btn step1"><span class="octicon octicon-' + icon + '"></span></a>');
  }

  function initEditor () {
    var $faceA, $faceB, $card, $container;

    function closeSave (e) {
      $card.removeClass('toggled');
      $faceB.find('input[type=text]').val('');
      $faceA.find('input[type=text]').focus();
      $faceB.find('.save').addClass('disabled');
      e.preventDefault();
    }

    function doSave (e) {
      e.stopPropagation();
      e.preventDefault();
      var name = $faceB.find("input[type=text]").val();
      if (name) {
        var filter = $faceA.find("input[type=text]").val();
        storage.push({
          name: name,
          filter: filter
        });
        saveQueries();
        closeSave(e);
      }
    }

    $container = $('<div class="xc__ card_container"></div>');
    $card = $('<div class="xc__ card"></div>');
    $container.addClass(rootClassPrefix);
    $container.insertBefore($filters);
    $container.append($card);
    $container.width($form.outerWidth());

    //We do it now because we need the original form width above
    $form.append(iconizedButton('bookmark'));

    $faceA = $('<div class="xc__ face"></div>');
    $faceA.append('<div class="subnav-search-context"></div>');
    $faceA.append($form);
    $faceA.append($('<div class="xc__ clearfix"></div>'));

    $faceB = $faceA.clone();
    $faceB.find('input[type=text]')
      .attr('placeholder', 'Name your favorite')
      .val('');
    var $group = $('<div class="btn-group"></div>"')
      .append(iconizedButton('check').addClass('text-open save disabled'))
      .append(iconizedButton('x').addClass('text-muted close'));
    $faceB.find('a.btn')
      .after($group)
      .remove();

    $faceA.addClass('front');
    $faceB.addClass('back');
    $card.append([$faceA, $faceB]);

    arrangeForm($faceA);
    arrangeForm($faceB);

    $faceA.on('click', '.btn', function (e) {
      $card.addClass('toggled');
      $faceB.find('input[type=text]').focus();
      e.preventDefault();
    });
    $faceB.on('click', '.close', closeSave);
    $faceB.on('click', '.save', doSave);
    $faceB.on('submit', 'form', doSave);
    $faceB.on('keyup', 'input[type=text]', function (e) {
      if (e.keyCode === KEY_ESCAPE) {
        closeSave(e);
      }
      if ($faceB.find('[type=text]').val()) {
        $faceB.find('.save').removeClass('disabled');
      } else {
        $faceB.find('.save').addClass('disabled');
      }
    });
  }

  function initSelector() {
    $filters.find('.xc__').remove(); // Flush
    var $list = $filters.find('.select-menu-list');
    $list.prepend('<a class="xc__ select-menu-item js-navigation-item"><div class="select-menu-item-text"> <strong>Predefined Queries:</strong></div></a>');
    storage
    .sort(function (a, b) {
      var aName = a.name.toLowerCase();
      var bName = b.name.toLowerCase();
      if (aName > bName) {
        return -1;
      }
      if (aName < bName) {
        return 1;
      }
      return 0;
    })
    .map(function (query, index) {
      var $item = $('<a href="' + window.location.pathname + '?q='+ encodeURIComponent(query.filter) + '" class="select-menu-item js-navigation-item"><div class="select-menu-item-text">' + query.name + '</div></a>');
      var $remove = $('<div class="octicon octicon-x right"></div>'); 
      $item.find('.select-menu-item-text').append($remove);
      $remove.on('click', function (e) {
        if (confirm('Delete the query "' + query.name + '"?')) {
          storage.splice(index, 1);
          saveQueries();
          $item.remove();
        };
        e.preventDefault();
        e.stopPropagation();
      });
      return $item;
    })
    .map(function (items) {
      items.addClass('xc__');
      $list.prepend(items);
    });
    var $header = $('<a class="xc__ select-menu-item js-navigation-item"><div class="select-menu-item-text"> <strong>Your Queries:</strong></div></a>');
    $list.prepend($header);
  }

  function initAnchors() {
    $filters = $('.subnav-search-context');
    $form = $('.subnav-search');
    return $filters.length && $form.length;
  }

  heartBeat();

})();
