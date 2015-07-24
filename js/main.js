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

  function arrangeForm($face) {
    var $faceForm = $face.find('form');
    var $input = $faceForm.find('input[type=text]');
    var $button = $faceForm.find('.btn').toArray();
    var buttonWidth = $button.reduce(function (sum, elt) {
      return sum + $(elt).outerWidth();
    }, 0);
    var inputMargins = $input.outerWidth() - $input.width();
    $input.width($faceForm.width() - buttonWidth - inputMargins);
  }

  writeFilters = app.browser.data;

  function readFilters() {
    return app.browser.data().then(function (data) {
      if (!(data.filters instanceof Array)) {
        data.filters = [];
      }
      return data;
    }, function (e) {
      return { filters: [] };
    }).then(function (data) {
      return data.filters;
    });
  }

  app.browser.onDataUpdate(initSelector);

  function deleteFilter(filter, index, e) {
    if (confirm('Delete the query "' + filter.name + '"?')) {
      readFilters().then(function (filters) {
        filters.splice(index, 1);
        return filters;
      }).then(writeFilters);
    };
    e.preventDefault();
    e.stopPropagation();
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
        readFilters().then(function (filters) {
          filters.push({
            name: name,
            filter: filter
          });
          return filters;
        })
        .then(writeFilters)
        .then(function () {
          closeSave(e);
        });
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

  function sortByName(a, b) {
    var aName = a.name.toLowerCase();
    var bName = b.name.toLowerCase();
    if (aName > bName) {
      return -1;
    }
    if (aName < bName) {
      return 1;
    }
    return 0;
  }

  function queryToElt(query, index) {
    var $item = $('<a href="' + window.location.pathname + '?q='+ encodeURIComponent(query.filter) + '" class="select-menu-item js-navigation-item"><div class="select-menu-item-text">' + query.name + '</div></a>');
    var $remove = $('<div class="octicon octicon-x right"></div>');
    $item.find('.select-menu-item-text').append($remove);
    $remove.on('click', deleteFilter.bind(null, query, index));
    return $item;
  }

  function initSelector() {
    if (!$filters.length) {
      return;
    }
    $filters.find('.xc__').remove(); // Flush
    var $list = $filters.find('.select-menu-list');
    var $header = $('<a class="xc__ select-menu-item js-navigation-item"><div class="select-menu-item-text"> <strong>Your Queries:</strong></div></a>');
    $list.prepend('<a class="xc__ select-menu-item js-navigation-item"><div class="select-menu-item-text"> <strong>Predefined Queries:</strong></div></a>');
    readFilters().then(function (filters) {
      return filters.sort(sortByName);
    }).then(function (filters) {
      return filters
      .map(queryToElt)
      .map(function (items) {
        items.addClass('xc__');
        $list.prepend(items);
      });
    }).then(function () {
      $list.prepend($header);
    });
  }

  function initAnchors() {
    $filters = $('.subnav-search-context');
    $form = $('.subnav-search');
    return $filters.length && $form.length;
  }

  heartBeat();

})();
