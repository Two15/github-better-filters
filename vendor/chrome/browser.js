;(function (window) {
  var app = window.app = window.app || {};

  app.browser = {
    name: 'Chrome',

    getUrl: function (url) {
      return chrome.extension.getURL(url);
    },
    clear: function () {
      return new Promise(function (resolve, reject) {
          chrome.storage.sync.clear(function () {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
      });
    },
    onDataUpdate: function (callback) {
      chrome.storage.onChanged.addListener(callback);
    },
    data: function (d) {
      return new Promise(function (resolve, reject) {
        if (d) {
          chrome.storage.sync.set({ filters: d }, function () {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        } else {
          chrome.storage.sync.get(null, function (items) {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(items)
            }
          });
        }
      });
    }
  };
})(window);
