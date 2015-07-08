var data = require('sdk/self').data;
var pageMod = require('sdk/page-mod');

pageMod.PageMod({
  include: [
    "js/browser.js",
    "js/main.js"
  ],


  contentScriptOptions: {
    rootUrl: data.url("")
  },

  contentScriptFile: [
    data.url("libs/jquery-2.1.1.min.js"),
    data.url("libs/jquery-wait.until.js"),
    data.url("libs/markup-1.5.18.min.js"),
    data.url("libs/purl-2.3.1.js"),
    data.url("libs/base64.js"),
    data.url("js/browser.js"),
    data.url("js/linkify.js"),
    data.url("js/analytics.js"),
    data.url("js/content.js")
  ],

  contentStyleFile: [
    data.url("css/content.css")
  ],

  contentScriptWhen: 'start'
});
