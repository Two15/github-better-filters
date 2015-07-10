"use strict";

var ua = detect.parse(navigator.userAgent);

function $find(selector) {
  return Array.prototype.slice.call(document.querySelectorAll(selector));
}

function hide ($e) {
  $e.className = 'hidden';
}

var lowerCasedName = ua.browser.family.toLowerCase();
if (lowerCasedName.match("firefox")) {
  $find('.chrome').forEach(hide);
} else if (lowerCasedName.match("chrome")) {
  $find('.firefox').forEach(hide);
} else {
  $find('.alternative').forEach(hide);
}
