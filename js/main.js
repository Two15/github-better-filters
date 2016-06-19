/*global app, uuid */

;(function () {
  var classPrefix = 'filters_extension';
  var rootClassPrefix = classPrefix + 'Root';
  var KEY_ENTER = 13;
  var KEY_ESCAPE = 27;
  var animationEvents = [
    'webkitAnimationEnd',
    'mozAnimationEnd',
    'MSAnimationEnd',
    'oanimationend',
    'animationend'
  ];
  var animateClass = 'swing';

  var $filters;
  var $form;

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

  var writeFilters = app.browser.data;

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
    }).then(function (filters) {
      return filters.map(function(filter) {
        // Backward compatibility when 1.2.0 did not have UUID
        if (!filter.uuid) {
          filter.uuid = uuid();
        }
        return filter;
      });
    });
  }

  app.browser.onDataUpdate(initSelector);

  function deleteFilter(filter, e) {
    if (window.confirm('Delete the query "' + filter.name + '"?')) {
      readFilters().then(function (filters) {
        return filters.filter(function (f) {
          return f.uuid !== filter.uuid;
        });
      }).then(writeFilters);
    }
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

  function icon(icon) {
    var boxes = {
      bookmark: '0 0 10 16',
      check: '0 0 12 16',
      x: '0 0 12 16'
    };
    var paths = {
      bookmark: 'M9 0H1C.27 0 0 .27 0 1v15l5-3.09L10 16V1c0-.73-.27-1-1-1zm-.78 4.25L6.36 5.61l.72 2.16c.06.22-.02.28-.2.17L5 6.6 3.12 7.94c-.19.11-.25.05-.2-.17l.72-2.16-1.86-1.36c-.17-.16-.14-.23.09-.23l2.3-.03.7-2.16h.25l.7 2.16 2.3.03c.23 0 .27.08.09.23h.01z',
      check: 'M12 5l-8 8-4-4 1.5-1.5L4 10l6.5-6.5z',
      x: 'M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48z'
    };
    var svg = '<svg aria-hidden="true" class="octicon" height="16" version="1.1" viewBox="' + boxes[icon]  + '" width="16">';
    svg += '<path d="' + paths[icon] + '"></path>';
    svg += '</svg>';
    return svg;
  }

  function iconizedButton(iconName) {
    return $('<a class="xc__ btn step1">' + icon(iconName) + '</a>');
  }

  function initEditor () {
    var $faceA, $faceB, $card, $container;

    function closeSave (e) {
      $card.removeClass('toggled');
      $faceB.find('input[type=text]').val('');
      $faceB.find('.save').addClass('disabled');
      $faceA.find('input[type=text]').focus();
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
            uuid: uuid(),
            name: name,
            filter: filter
          });
          return filters;
        })
        .then(writeFilters)
        .then(function () {
          $filters.addClass(animateClass);
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
      return 1;
    }
    if (aName < bName) {
      return -1;
    }
    return 0;
  }

  function queryToElt(query, index) {
    var $item = $('<a href="' + window.location.pathname + '?q='+ encodeURIComponent(query.filter) + '" class="select-menu-item js-navigation-item"><div class="select-menu-item-text">' + query.name + '</div></a>');
    var $remove = $('<div class="ib"></div>').append(icon('x'));
    $item.find('.select-menu-item-text').append($remove);
    $remove.on('click', deleteFilter.bind(null, query));
    return $item;
  }

  function initSelector() {
    if (!$filters.length) {
      return;
    }
    $filters.addClass('animated'); //Animate.css
    $filters.on(animationEvents.join(' '), function () {
      $filters.removeClass(animateClass);
    });
    $filters.find('.xc__').remove(); // Flush
    var $list = $filters.find('.select-menu-list');
    var $header = $('<a class="xc__ select-menu-item js-navigation-item"><div class="select-menu-item-text"> <strong>Your Queries:</strong></div></a>');
    $list.prepend('<a class="xc__ select-menu-item js-navigation-item"><div class="select-menu-item-text"> <strong>Predefined Queries:</strong></div></a>');
    readFilters().then(function (filters) {
      return filters.sort(sortByName);
    }).then(function (filters) {
      return filters
      .map(queryToElt)
      .map(function (item) {
        item.addClass('xc__');
        return item;
      });
    }).then(function (filters) {
      $list.prepend(filters);
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
