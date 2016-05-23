var gulp = require('gulp'),
    nodemon = require('gulp-nodemon'),
    mocha = require('gulp-mocha'),
    env = require('gulp-env');
var concat = require('gulp-concat');
var cssnano = require('gulp-cssnano');
var uglify = require('gulp-uglify');
var inject = require('gulp-inject');
var pipeLine = require('./tasks/pipeline');

gulp.task('nodemon', function () {
    nodemon({
        script: "bin/www",
        env: {
            NODE_ENV: 'development',
            PORT: '3000'
        }
    });
});

gulp.task('watch', function () {
    gulp.watch(
        ['bin/www', './**/*.js'],
        ['mocha']
        );
});

gulp.task('mocha', function () {
    env({
        vars: {
            NODE_ENV: 'testing',
            PORT: 3001
        }
    });
    return gulp.src('test/**/AuthController.test.js')
        .pipe(mocha({
            bail: false
        }).on('error', function () { })
        //do nothing
            );
});

gulp.task('inject', function () {
    var sources = gulp.src(pipeLine.injectFile, { read: false });
    // Read templates 
    gulp.src('./views/layout*.html')
    // Link the JavaScript and css
        .pipe(inject(sources, { ignorePath: 'public' }))
    // Write modified files to views 
        .pipe(gulp.dest('./views'));
});

gulp.task("production", function () {
    //min css
    gulp.src(require('./tasks/pipeline').cssFilesToInject)
        .pipe(concat('production.min.css'))
        .pipe(cssnano())
        .pipe(gulp.dest('./public/dist'));
    //min js
    gulp.src(require('./tasks/pipeline').jsFilesToInject)
        .pipe(concat('production.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./public/dist'));
    //inject
    var sources = gulp.src(["./public/dist/production.min.js", "./public/dist/production.min.css"], { read: false });
    // Read templates 
    gulp.src('./views/layout*.html')
    // Link the JavaScript and css
        .pipe(inject(sources, { ignorePath: 'public' }))
    // Write modified files to views 
        .pipe(gulp.dest('./views'));
});

gulp.task('default', ['inject', 'nodemon']);
