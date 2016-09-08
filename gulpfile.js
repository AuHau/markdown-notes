var gulp = require('gulp');
var gulpLoadPlugins = require('gulp-load-plugins');
var plugins = gulpLoadPlugins();

var mainBowerFiles = require('main-bower-files');

var sassOptions = {
  errLogToConsole: true,
  outputStyle: 'expanded'
};

// TODO: Figure out MathJAX bundling

gulp.task('mobile:js:libs', function () {
    return gulp.src(mainBowerFiles('**/*.js'))
        .pipe(plugins.concat('libs.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest('mobile/www/build/'))
        .pipe(plugins.notify('JS:libs build finished!'));
});

gulp.task('mobile:js:src', function () {
    return gulp.src(['frontend/js/**/*.js', 'mobile/www/js/**/*.js'])
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('main.js'))
        .pipe(plugins.sourcemaps.write())
        .pipe(plugins.uglify())
        .pipe(gulp.dest('mobile/www/build/'))
        .pipe(plugins.notify('JS build finished!'));

});

gulp.task('mobile:css', function () {
    return gulp.src('mobile/www/css/main.scss')
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass(sassOptions)
             .on('error', plugins.notify.onError("CSS build failed!"))
             .on('error', plugins.sass.logError)
        )
        .pipe(plugins.sourcemaps.write())
        .pipe(plugins.addSrc.prepend(mainBowerFiles('**/*.css')))
        .pipe(plugins.concat('main.css'))
        .pipe(gulp.dest('mobile/www/build/'))
        .pipe(plugins.notify('CSS build finished!'));
});

gulp.task('mobile:img', function () {
    var images = ['jpg', 'jpeg', 'png', 'gif'].join(',');

    return gulp.src(mainBowerFiles('**/*.{' + images + '}'))
        .pipe(plugins.addSrc('frontend/img/**/*.{' + images + '}'))
        .pipe(plugins.addSrc('mobile/img/**/*.{' + images + '}'))
        .pipe(gulp.dest('mobile/www/build/img/'));
});

gulp.task('mobile:fonts', function() {
    var fonts = ['ttf', 'woff', 'eot', 'svg'].join(',');

    return gulp.src(mainBowerFiles('**/*.{'+ fonts +'}'))
        .pipe(plugins.flatten())
        .pipe(gulp.dest('mobile/www/build/fonts/'))
});


gulp.task('mobile:assets', ['mobile:js:libs', 'mobile:js:src', 'mobile:css', 'mobile:img', 'mobile:fonts']);

gulp.task('default', ['mobile:assets'], function () {
    gulp.watch('frontend/css/**', ['mobile:css']);
    gulp.watch('frontend/js/**', ['mobile:js:src']);
});