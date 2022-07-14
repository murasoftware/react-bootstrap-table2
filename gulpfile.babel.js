import gulp from 'gulp';
import babel from 'gulp-babel';
// import sass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import cleanDir from 'gulp-clean';
import rename from 'gulp-rename';
import shell from 'gulp-shell';

const LIB = 'lib';
const DIST = 'dist';
const TEST = 'test';
const PKG_PATH = './packages';
const NODE_MODULES = 'node_modules';
const sass = require('gulp-sass')(require('sass'));

const JS_PKGS = [
  'react-bootstrap-table2',
  'react-bootstrap-table2-editor',
  'react-bootstrap-table2-filter',
  'react-bootstrap-table2-overlay',
  'react-bootstrap-table2-paginator',
  'react-bootstrap-table2-toolkit'
].reduce((pkg, curr) => `${curr}|${pkg}`, '');

const JS_SKIPS = `+(${TEST}|${LIB}|${DIST}|${NODE_MODULES})`;

const STYLE_PKGS = [
  'react-bootstrap-table2',
  'react-bootstrap-table2-filter',
  'react-bootstrap-table2-paginator',
  'react-bootstrap-table2-toolkit',
].reduce((pkg, curr) => `${curr}|${pkg}`, '');

const STYLE_SKIPS = `+(${NODE_MODULES})`;


function clean() {
  return gulp
    .src(`./packages/+(${JS_PKGS})/+(${LIB}|${DIST})`, { allowEmpty: true })
    .pipe(cleanDir());
}

function scripts() {
  return gulp
    .src([
      `./packages/+(${JS_PKGS})/**/*.js`,
      `!packages/+(${JS_PKGS})/${JS_SKIPS}/**/*.js`
    ])
    .pipe(babel({
      presets: ['@babel/preset-react']
    }))
    .pipe(rename((path) => {
      if (path.dirname.indexOf('src') > -1) {
        path.dirname = path.dirname.replace('src', `${LIB}/src`);
      } else {
        path.dirname += `/${LIB}`;
      }
    }))
    .pipe(gulp.dest(PKG_PATH));
}

function styles() {
  return gulp
    .src([
      `./packages/+(${STYLE_PKGS})/style/**/*.scss`,
      `!packages/+(${STYLE_PKGS})/${STYLE_SKIPS}/**/*.scss`
    ])
    .pipe(sass().on('error', sass.logError))
    .pipe(rename((path) => {
      path.dirname = path.dirname.replace('style', DIST);
    }))
    .pipe(gulp.dest(PKG_PATH))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(rename((path) => {
      path.extname = '.min.css';
    }))
    .pipe(gulp.dest(PKG_PATH));
}

function umd(done) {
  gulp.parallel(
    (done) => gulp.task('./webpack/next.umd.babel.js', shell.task(['webpack --config <%= file.path %>']), done()),
    (done) => gulp.task('./webpack/editor.umd.babel.js', shell.task(['webpack --config <%= file.path %>']), done()),
    (done) => gulp.task('./webpack/filter.umd.babel.js', shell.task(['webpack --config <%= file.path %>']), done()),
    (done) => gulp.task('./webpack/overlay.umd.babel.js', shell.task(['webpack --config <%= file.path %>']), done()),
    (done) => gulp.task('./webpack/paginator.umd.babel.js', shell.task(['webpack --config <%= file.path %>']), done()),
    (done) => gulp.task('./webpack/toolkit.umd.babel.js', shell.task(['webpack --config <%= file.path %>']), done())
  )();
  done();
}

const buildJS = gulp.parallel(umd, scripts);
const buildCSS = styles;
const build = gulp.series(clean, gulp.parallel(buildJS, buildCSS));

gulp.task('prod', build, function(done){done();});
gulp.task('default', build, function(done){done();});
