;(function () {
  var classPrefix = 'filters_extension';
  var rootClassPrefix = classPrefix + 'Root';
  var KEY_ENTER = 13;
  var KEY_ESCAPE = 27;

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
    var $button = $form.find('.btn');
    var inputWidth = $input.outerWidth();
    var buttonWidth = $button.outerWidth();
    $input.width(inputWidth - buttonWidth);
    return;
  }

  var storage = window.localStorage;
  storage[chrome.runtime.id] = storage[chrome.runtime.id] || [];
  storage = storage[chrome.runtime.id];

  console.log('Discover the APIs:', chrome);

  function maintainExtension(klass) {
    if (!$('.' + klass).length) {
      init();
    } else {
      setTimeout(maintainExtension.bind(undefined, klass), 200);
    }
  }

  function init () {
    function cancelSave (e) {
      $card.removeClass('toggled');
      e.preventDefault();
    }

    function doSave (e) {
      console.log('SAVING')
      $card.removeClass('toggled');
      e.preventDefault();
    }

    var $filters = $('.subnav-search-context');
    var $form = $('.subnav-search');
    $form.addClass(rootClassPrefix);

    var $btn = $('<a class="xc__ btn step1">Save</a>');

    var $container = $('<div class="xc__ card_container"></div>');
    var $card = $('<div class="xc__ card"></div>');
    $container.insertBefore($filters);
    $form.append($btn);
    $container.append($card);

    var $faceA = $('<div class="xc__ face"></div>');
    $faceA.append('<div class="subnav-search-context"></div>');
    $faceA.append($form);
    var $fix = $('<div class="xc__ clearfix"></div>');
    $faceA.append($fix);

    var $faceB = $faceA.clone();
    $faceA.addClass('front');
    $faceB.addClass('back');
    $faceB.find('input[type=text]').attr('placeholder', 'Name your favorite');
    $faceB.find('a.btn').text('Cancel');

    $card.append([$faceA, $faceB]);

    arrangeForm($faceA);
    arrangeForm($faceB);

    maintainExtension(rootClassPrefix);

    $faceA.on('click', '.btn', function (e) {
      $card.addClass('toggled');
      e.preventDefault();
    });
    $faceB.on('submit', 'form', function (e) {
      e.stopPropagation();
      e.preventDefault();
      console.log('ok');
    });
    $faceB.on('click', '.btn', cancelSave);
    $faceB.on('keyup', 'input.name', function (e) {
      if (e.keyCode === KEY_ENTER) {
        doSave(e);
      } else if (e.keyCode === KEY_ESCAPE) {
        cancelSave(e);
      }
    });
  }

  init();

})();
