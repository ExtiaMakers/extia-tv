import watchify from 'watchify'
import browserify from 'browserify'
import gulp from 'gulp'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import gutil from 'gulp-util'
import sourcemaps from 'gulp-sourcemaps'
import babel from 'gulp-babel'
import babelify from 'babelify'
import { assign } from 'lodash'
import del from 'del'
import stylus from 'gulp-stylus'

/***********************************
----------------Js
***********************************/
const customOpts = {
  entries: ['src/index.js'],
  debug: true,
  transform: [babelify]
}
const opts = assign({}, watchify.args, customOpts)
const b = watchify(browserify(opts))
const bb = browserify(customOpts)

const customAdminOpts = {
  entries: ['src/admin.js'],
  debug: true,
  transform: [babelify]
}
const optsAdmin = assign({}, watchify.args, customAdminOpts)
const ba = watchify(browserify(optsAdmin))
const bba = browserify(customAdminOpts)

b.on('update', bundle)
ba.on('update', bundleA)

b.on('log', gutil.log)
bb.on('log', gutil.log)

ba.on('log', gutil.log)
bba.on('log', gutil.log)

function bundle() {
  return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public'))
}
function bundleB() {
  return bb.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('public'))
}


function bundleA() {
  return ba.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('admin.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('public'))
}

function bundleBA() {
  return bba.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('admin.js'))
    .pipe(buffer())
    .pipe(gulp.dest('public'))
}
/***********************************
----------------CSS
***********************************/
function wcss(){ gulp.watch('src/**/*.styl', ['css']) }
function css() {
  return gulp.src('src/app.styl')
  .pipe(stylus({compress: true}))
  .pipe(gulp.dest('public'))
}
/***********************************
----------------Taks
***********************************/

gulp.task('css', css)
gulp.task('js', bundleB)
gulp.task('js:admin', bundleBA)

gulp.task('watch:css', wcss)
gulp.task('watch:js', bundle)
gulp.task('watch:js:admin', bundleA)

gulp.task('build', ['css', 'js', 'js:admin'])
gulp.task('default', ['watch:css', 'watch:js', 'watch:js:admin'])
