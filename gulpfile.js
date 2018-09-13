var fs = require('fs');
var child = require('child_process');
var gulp = require('gulp');
var size = require('gulp-size');
//var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var minifyCSS = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');
var clean = require('gulp-clean');
var chalk = require('chalk');
var config = require('./config');

gulp.task('concat_js', function() {
  return gulp.src(config.sourceFiles)
  .pipe(concat('all.js'))
  //.pipe(uglify())
  .pipe(gulp.dest('min'));
});

gulp.task('minify_css', function() {
  return gulp.src('style.css')
  .pipe(minifyCSS())
  .pipe(rename('style.min.css'))
  .pipe(gulp.dest('min'));
});

gulp.task('minify_html', function() {
  var pattern = /<!-- Begin imports -->([\s\S]*)<!-- End imports -->/;

  return gulp.src(['index.html'])
  .pipe(replace(pattern, '<script src="all.min.js"></script>'))
  .pipe(replace(/style.css/, 'style.min.css'))
  .pipe(gulp.dest('min'))
  .on('end', function() {
    return gulp.src('min/index.html')
    .pipe(minifyHTML())
    .pipe(gulp.dest('min'));
  });
});

gulp.task('clean', function() {
  gulp.src('min/*.zip', {read: false})
  .pipe(clean());
  gulp.src('min/*.css', {read: false})
  .pipe(clean());
  gulp.src('min/*.js', {read: false})
  .pipe(clean());
  gulp.src('min/*.html', {read: false})
  .pipe(clean());
});

gulp.task('build', ['minify_html'], function() {
  var s = size();
  gulp.src(['min/all.min.js', 'min/index.html', 'min/style.min.css'])
  .pipe(zip(config.appName + '.zip'))
  .pipe(s)
  .pipe(gulp.dest('min'))
  .on('end', function() {
    var r = (13312 - s.size) + ' bytes';
    var time = new Date().toTimeString().slice(0, 8);
    var sizeText;
    if (r < 0)
      sizeText = chalk.red(r);
    else
      sizeText = chalk.green(r);
    console.log('[' + chalk.gray(time) + '] ' + chalk.yellow('Remaining size: ') + sizeText);
  });
});

gulp.task('minify_js', ['concat_js'], function() {
  child.spawn('closure-compiler', [
    //'--warning_level', 'QUIET',
    '--compilation_level', 'ADVANCED',
    '--create_source_map', 'min/all.min.js.map',
    '--js', 'min/all.js',
    '--language_out', 'ECMASCRIPT_2015',
    '--js_output_file', 'min/all.min.js'
  ], { stdio: 'inherit' });
});

gulp.task('zip', function() {
  var outputFileName = 'min/' + config.appName + '.zip';
  const cmd = child.spawn('advzip', ['-p', '-4', '--add', outputFileName, 'min/all.min.js', 'min/index.html', 'min/style.min.css']);

  cmd.on('close', (code) => {
    if (code === 0) {
      var fstats = fs.statSync(outputFileName);
      var r = (13312 - fstats.size) + ' bytes';
      var time = new Date().toTimeString().slice(0, 8);
      var sizeText;
      if (r < 0)
        sizeText = chalk.red(r);
      else
        sizeText = chalk.green(r);
      console.log('[' + chalk.gray(time) + '] ' + chalk.yellow('Remaining size: ') + sizeText);
    }
  });
});
