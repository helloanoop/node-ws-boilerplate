'use strict';

import path from 'path';
import del from 'del';
import gulp from 'gulp';
import plugins from 'gulp-load-plugins';

const $ = plugins();
const jsdoc3 = require('gulp-jsdoc3');

const SRC = 'src';
const DEST = 'lib';

const PATHS = {
  src: path.join(SRC, '**/*.js')
};

// gulp.task('jsdoc', function (cb) {
//   gulp.src(['readme.md', PATHS.src], {read: false})
//       .pipe(jsdoc3(cb));
// });

// test code
let mochaopts = {
  timeout: 10000
};

gulp.task('test.functional', () => {
  return gulp.src(['tests/functional/**/*.js'])
    .pipe($.mocha(mochaopts));
});

gulp.task('test', ['test.unit', 'test.functional']);

// default task builds and tests code
gulp.task('default', ['start']);
gulp.task('start',  ['clean', 'build', 'nodemon']);

// start the server + watch for changes
gulp.task('nodemon', function () {
  $.nodemon({
    script: 'lib/index.js',
    ext: 'js html',
    watch : 'lib',
    env: { 'NODE_ENV': 'development' }
  });
});

// build generator by transpiling es6 code
// gulp.task('build', ['babel', 'views', 'vendor', 'sass']);
gulp.task('build', ['babel']);

// returns a function that lints code
const lintTask = (src) =>
  () =>
    gulp.src(src)
      .pipe($.plumber())
      .pipe($.eslint())
      .pipe($.eslint.format())
      .pipe($.eslint.failAfterError());

// lint code
gulp.task('lint', ['lint:app']);
gulp.task('lint:app', lintTask(PATHS.src));

// returns a function that transpiles es6 code to js
const babelTask = (obj) =>
  () =>
    gulp.src(obj.src)
      .pipe($.changed(obj.dest))
      .pipe($.babel())
      .pipe(gulp.dest(obj.dest))
      .pipe($.print(fp => `babel'd: ${fp}`));

// transpile es6
gulp.task('babel', ['babel:app']);
gulp.task('babel:app', ['lint:app'], babelTask({
    src: PATHS.src,
    dest: DEST
  }));

// cleanup directory
gulp.task('clean', ['clean:app']);
gulp.task('clean:app', () => del.sync([DEST]));

