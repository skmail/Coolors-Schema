var gulp = require('gulp'),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    merge = require('merge-stream'),
    del = require('del');


//Styles
gulp.task('styles', function () {

    var scssStream = gulp.src('src/scss/main.scss')
        .pipe(sass({outputStyle: 'expand'}).on('error', sass.logError))
        .pipe(concat('scss.css'));

    var cssStream = gulp.src(['node_modules/normalize.css/normalize.css'])
        .pipe(concat('css.css'));


    return merge(scssStream, cssStream)
        .pipe(concat('main.css'))
        .pipe(autoprefixer('last 10 versions', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest('dist/css'))
        .pipe(cssnano())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/css'));
});

// Clean
gulp.task('clean', function() {
    return del(['dist/css', 'dist/scripts']);
});

var scriptPipes = function(paths,name){
    return gulp.src(paths)
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(concat(name))
        .pipe(gulp.dest('dist/scripts'))
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify())
        .pipe(gulp.dest('dist/scripts'));
};

// Scripts
gulp.task('scripts', function () {
    scriptPipes([
        'src/scripts/utils.js',
        'src/scripts/tabs.js',
        'src/scripts/slider.js',
        'src/scripts/color-converter.js',
        'src/scripts/color-picker.js'
    ],'bundle.js');
});
// Scripts
gulp.task('app_script', function () {
    scriptPipes([
        'src/scripts/app.js'
    ],'app.js');
});


// Default task
gulp.task('default', ['clean'], function() {
    gulp.start('styles', 'scripts','app_script');
});
