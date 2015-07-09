var pageMod = require('sdk/page-mod');

pageMod.PageMod({
  include: "*.github.com",
  contentScriptFile: [
    './browser.js',
    './js/jquery.js',
    './js/main.js'
  ],
  contentStyleFile: [
    "./css/content.css"
  ]
});
