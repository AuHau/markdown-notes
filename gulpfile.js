var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();
var appRoot = require('app-root-path');
var notifier = require('node-notifier');

var mainBowerFiles = require('main-bower-files');
var merge = require('merge-stream');
var exec = require('child_process').exec;

var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'expanded'
};

var googleWebFontsOptions = {
    cssFilename: 'googleFonts.css'
};

// TODO: Figure out MathJAX bundling
// TODO: Implement nhAnnotate to use Uglify

gulp.task('mobile:js:libs', function () {
    return gulp.src(mainBowerFiles('**/*.js'))
        .pipe(plugins.concat('libs.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest('mobile/www/build/'))
        .pipe(plugins.notify('JS:libs build finished!'));
});

gulp.task('mobile:js:src', function () {
    var jsSrc = gulp.src(['frontend/js/modules.js', 'frontend/js/**/*.js', 'mobile/www/js/**/*.js'])
        .pipe(plugins.ignore.exclude('*-config.js'))
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.concat('main.js'))
        //.pipe(plugins.uglify())
        //.pipe(plugins.ngAnnotate())
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest('mobile/www/build/'))
        .pipe(plugins.notify('JS build finished!'));

    var htmlTemplates = gulp.src('frontend/js/views/*.html')
        .pipe(plugins.flatten())
        .pipe(gulp.dest('mobile/www/build/views/'));

    return merge(jsSrc, htmlTemplates);

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
        .pipe(gulp.dest('mobile/www/build/css/'))
        .pipe(plugins.notify('CSS build finished!'));
});

gulp.task('mobile:img', function () {
    var images = ['jpg', 'jpeg', 'png', 'gif'].join(',');

    return gulp.src(mainBowerFiles('**/*.{' + images + '}'))
        .pipe(plugins.addSrc('frontend/img/**/*.{' + images + '}'))
        .pipe(plugins.addSrc('mobile/img/**/*.{' + images + '}'))
        .pipe(gulp.dest('mobile/www/build/img/'));
});

gulp.task('mobile:fonts', function () {
    var fontTypes = ['ttf', 'woff', 'eot', 'svg'].join(',');

    var fonts = gulp.src(mainBowerFiles('**/*.{' + fontTypes + '}'))
        .pipe(plugins.flatten())
        .pipe(gulp.dest('mobile/www/build/fonts/'));

    var googleFonts = gulp.src('frontend/css/fonts.list')
        .pipe(plugins.googleWebfonts(googleWebFontsOptions))
        .pipe(gulp.dest('mobile/www/build/fonts/'));

    return merge(fonts, googleFonts);
});

gulp.task('mobile:watch', function () {
    gulp.watch('frontend/css/**/*', ['mobile:css']);
    gulp.watch('mobile/www/css/**/*', ['mobile:css']);
    gulp.watch('frontend/js/**/*', ['mobile:js:src']);
    gulp.watch('mobile/www/js/**/*', ['mobile:js:src']);
});

gulp.task('mobile:assets', ['mobile:js:libs', 'mobile:js:src', 'mobile:css', 'mobile:img', 'mobile:fonts']);

gulp.task('mobile:browser', ['mobile:assets'], function (cb) {
    exec('python manage.py runserver', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (err) cb(err);
    });

    process.chdir('mobile/');
    exec('cordova run browser -- --port=8001', function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        if (err) cb(err);
    });

    process.chdir('../');
    gulp.watch('frontend/css/**/*', ['mobile:css']);
    gulp.watch('mobile/www/css/**/*', ['mobile:css']);
    gulp.watch('frontend/js/**/*', ['mobile:js:src']);
    gulp.watch('mobile/www/js/**/*', ['mobile:js:src']);
    gulp.watch('mobile/www/build/*', function () {
        exec('pwd', function (err, stdout, stderr) {
            console.log(stdout);
        });
        process.chdir(appRoot.toString() + '/mobile');
        exec('cordova prepare browser', function (err, stdout, stderr) {
            notifier.notify({ title: 'Cordova', message: 'Browser files updated!' });
        });
    });
});

gulp.task('default', ['mobile:assets', 'mobile:watch']);