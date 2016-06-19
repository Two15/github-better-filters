var _        = require('lodash');
var gulp     = require('gulp');
var clean    = require('gulp-rimraf');
var es       = require('event-stream');
var rseq     = require('run-sequence');
var zip      = require('gulp-zip');
var shell    = require('gulp-shell');
var json     = require('gulp-json-editor');
var package  = require('./package');

function pipe(src, transforms, dest) {
  if (typeof transforms === 'string') {
    dest = transforms;
    transforms = null;
  }

  var stream = gulp.src(src);
  transforms && transforms.forEach(function(transform) {
    stream = stream.pipe(transform);
  });

  if (dest) {
    stream = stream.pipe(gulp.dest(dest));
  }

  return stream;
}

gulp.task('clean', function() {
  return pipe('./build', [clean()]);
});

function  manifestTransform() {
  return json({
    version: package.version,
    description: package.description,
    author: package.author
  });
}

gulp.task('chrome', function() {
  function  chromeTransform() {
    return json({
      name: package.name.split('-').map(_.capitalize).join(' '),
      homepage_url: package.homepage
    });
  }
  return es.merge(
    pipe('./libs/**/*', './build/chrome/libs'),
    pipe('./img/**/*', './build/chrome/img'),
    pipe('./js/**/*', './build/chrome/js'),
    pipe('./css/**/*', './build/chrome/css'),
    pipe('./vendor/chrome/*.js', './build/chrome/'),
    pipe('./vendor/chrome/manifest.json', [manifestTransform(), chromeTransform()], './build/chrome/'),
    pipe('./node_modules/jquery/dist/jquery.js', './build/chrome/js/'),
    pipe('./node_modules/node-uuid/uuid.js', './build/chrome/js/'),
    pipe('./node_modules/animate.css/animate.css', './build/chrome/css/vendor/')
  );
});

gulp.task('firefox', function() {
  function firefoxTransform() {
    return json({
      id: package.firefox_id,
      name: package.name,
      title: package.name.split('-').map(_.capitalize).join(' '),
      description: package.description,
      author: package.author,
      homepage: package.homepage,
      license: package.license,
      contributors: package.contributors,
      url: package.homepage
    });
  }
  return es.merge(
    pipe('./libs/**/*', './build/firefox/data/libs'),
    pipe('./img/**/*', './build/firefox/data/img'),
    pipe('./js/**/*', './build/firefox/data/js'),
    pipe('./css/**/*', './build/firefox/data/css'),
    pipe('./vendor/firefox/*.js', './build/firefox/data'),
    pipe('./vendor/firefox/package.json', [manifestTransform(), firefoxTransform()], './build/firefox/'),
    pipe('./node_modules/jquery/dist/jquery.js', './build/firefox/data/js/'),
    pipe('./node_modules/node-uuid/uuid.js', './build/firefox/data/js/'),
    pipe('./node_modules/animate.css/animate.css', './build/firefox/data/css/vendor/')
  );
});

gulp.task('chrome-dist', function () {
  gulp.src('./build/chrome/**/*')
    .pipe(zip('chrome-extension-' + package.version + '.zip'))
    .pipe(gulp.dest('./dist/chrome'));
});

gulp.task('firefox-dist', shell.task([
  'mkdir -p dist/firefox',
  'cd ./build/firefox && ../../node_modules/.bin/jpm xpi',
  'mv ./build/firefox/*.xpi ./dist/firefox/firefox-extension-' + package.version + '.xpi'
]));

gulp.task('firefox-run', shell.task([
  'cd ./build/firefox && ../../node_modules/.bin/jpm run',
]));

gulp.task('dist', function(cb) {
  return rseq('clean', ['chrome', 'firefox'], ['chrome-dist', 'firefox-dist'], cb);
});

gulp.task('watch', function() {
  gulp.watch(['./js/**/*', './css/**/*', './vendor/**/*', './img/**/*'], ['default']);
});

gulp.task('run', function (cb) {
  return rseq('firefox', 'firefox-run', cb);
});

gulp.task('default', function(cb) {
  return rseq('clean', ['chrome', 'firefox'], cb);
});
