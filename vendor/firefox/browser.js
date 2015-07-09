;(function (window, self) {
  var app = window.app = window.app || {};

  app.browser = {
    name: 'Firefox',

    getUrl: function (url) {
      return self.options.rootUrl + url;
    },
    clear: function () {
      return;
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
      self.port.on('save-storage', callback);
    },
    data: function (d) {
      return new Promise(function (resolve, reject) {
        if (d) {
          self.port.emit('update-storage', d);
          self.port.once('save-storage', resolve);
        } else {
          self.port.emit('get-storage');
          self.port.once('send-storage', resolve);
        }
      });
    }
  };
})(window, self);
