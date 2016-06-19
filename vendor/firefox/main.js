var pageMod = require('sdk/page-mod');
var storage = require('sdk/simple-storage');

pageMod.PageMod({
  include: "*.github.com",
  contentScriptFile: [
    './browser.js',
    './js/jquery.js',
    './js/uuid.js',
    './js/main.js'
  ],
  contentStyleFile: [
    "./css/content.css",
    "./css/vendor/animate.css"
  ],
  onAttach: function (worker) {
    worker.port.on('get-storage', function () {
      worker.port.emit('send-storage', storage.storage);
    });
    worker.port.on('update-storage', function (filters) {
      storage.storage.filters = filters;
      worker.port.emit('save-storage', storage.storage);
    });
  }
});
