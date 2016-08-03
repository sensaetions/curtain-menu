// fix for autoprefixer
require('es6-promise').polyfill();

// Plugins
var gulp = require('gulp'),
    rename = require('gulp-rename'),
    gutil = require('gulp-util'),
    watch = require('gulp-watch'),

    // sass related plugins
    combineMq = require('gulp-combine-mq'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    pixrem = require('gulp-pixrem'),
    sass = require('gulp-sass'),

    // images related plugins
    svgmin = require('gulp-svgmin'),
    svgsymbols = require('gulp-svg-symbols'),

    // scripts related plugins
    concat = require('gulp-concat'),

    // server related plugins
    connect = require('gulp-connect'), // server for HTML static files
    connectPhp = require('gulp-connect-php'), // server for dynamic PHP files
    browserSync = require('browser-sync'), // required for reloading dynamic files

    reload = browserSync.reload; // required for reloading dynamic files

var dynamicMarkupInput = [
    '*.php',
    '**/*.php',
    'assets/**/*.php'
];

var sassInput = [
    'assets/sass/**/*.scss'
];

var svgInput = [
    'assets/images/svg/*.svg'
];

var scriptInput = [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/matchHeight/dist/jquery.matchHeight.js',
    'assets/scripts/rainbow.offcanvas.1.4.3.min.js',
    'assets/scripts/jquery.infieldlabel.min.js',
    'assets/scripts/smooth-scroll.js',
    'assets/scripts/functions.js'
];
var outputDir = ['assets/'];


// PLUGIN OPTIONS
var sassOptions = {
    errLogToConsole: true,
    includePaths: [
        'bower_components/susy/sass',
        'bower_components/breakpoint-sass/stylesheets',
        'bower_components/normalize-css/'],
    outputStyle: 'expanded',
    sourceComments: 'map'
};
var autoprefixerOptions = {
    browsers: ['last 2 versions', '> 1%', 'ie 8', 'ie 9']
};
var combineMqOptions = {
    beautify: true
};


// BEGIN TASKS
gulp.task('html', function () {
    return gulp.src(staticMarkupInput)
        .pipe(browserSync.reload({
            stream: true
        }))
})

gulp.task('php', function () {
    return gulp.src(dynamicMarkupInput)
        .pipe(reload({
            stream: true
        }));
})

gulp.task('sass', function () {
    return gulp.src(sassInput)
        .pipe(sourcemaps.init())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(combineMq(combineMqOptions))
        .pipe(autoprefixer(autoprefixerOptions))
        .pipe(pixrem())
        .pipe(sourcemaps.write('/maps'))
        .pipe(gulp.dest(outputDir + 'styles'))
        .pipe(browserSync.reload({
            stream: true
        }))
});


gulp.task('svgstore', function () {
    return gulp.src(svgInput)
        .pipe(svgmin())
        .pipe(svgsymbols({
            templates: ['default-svg', 'default-css']
        }))
        .pipe(browserSync.reload({
            stream: true
        }))
        .pipe(gulp.dest(outputDir + 'images'));
});

gulp.task('scripts', function () {
    return gulp.src(scriptInput)
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest(outputDir + 'scripts'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('connect', function () {
    connect.server({
        root: '',
        livereload: true
    });
});

gulp.task('connectPhp', function () {
    connectPhp.server({
        hostname: '0.0.0.0',
        port: 8000,
        base: '',
    });
});

gulp.task('connectSync', ['connectPhp'], function () {
    connectPhp.server({}, function () {
        browserSync({
            proxy: 'localhost:8000',
            open: {
                browser: 'Google Chrome'
            }
        });
    });

    gulp.watch(dynamicMarkupInput).on('change', function () {
        browserSync.reload();
    });
});

// run 'default' task before running watch
gulp.task('watch', function () {
    gulp.watch(dynamicMarkupInput, ['php']);
    gulp.watch(sassInput, ['sass']);
    gulp.watch(scriptInput, ['scripts']);
});

// Default task
gulp.task('dynamic', ['php', 'sass', 'svgstore', 'scripts', 'connectSync', 'watch']);
gulp.task('default', ['dynamic']);
