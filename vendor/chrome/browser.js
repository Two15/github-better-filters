;(function (window) {
  var app = window.app = window.app || {};

  app.browser = {
    name: 'Chrome',

    getUrl: function (url) {
      return chrome.extension.getURL(url);
    },
    id: function () {
      return chrome.runtime.id;
    }
  };
})(window);
