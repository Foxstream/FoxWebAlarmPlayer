var gulp = require('gulp'), 
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    uglifycss = require('gulp-uglifycss'),
    sourcemaps = require('gulp-sourcemaps'),
    ngAnnotate = require('gulp-ng-annotate'),
    del = require('del'),
    bowerFiles = require('bower-files')({ json: './client/bower.json' }),
    gulpFilter = require('gulp-filter'),
    tar = require('gulp-tar'),
    gzip = require('gulp-gzip'),
    autoprefixer = require('gulp-autoprefixer');

gulp.task('default', ['sass'], function(){

});

gulp.task('js', function(){
    return gulp.src(['./client/js/app.js', './client/js/*.js'])
            .pipe(concat('app.min.js'))
            // .pipe(ngAnnotate())
            // .pipe(uglify({compress: {hoist_funs: false, hoist_vars: false}}))
        .pipe(gulp.dest('./client/'))
});

gulp.task('sass', function(){
    return gulp.src('./client/sass/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(uglifycss({
            "maxLineLength": 100
        }))
        .pipe(gulp.dest('./client/css'));
});

// Create a ready-to-install "release" directory
gulp.task('release', ['clean', 'sass', 'js'], function(){
    
    // package.json
    gulp.src('./package.json')
        .pipe(gulp.dest('./release/'));

    // main.js
    gulp.src('./main.js')
        .pipe(gulp.dest('./release/'));

    // Server files
    gulp.src(['./server/**/*', '!./server/data/**/*', '!./server/*.log*', '!./server/karma.conf.js'])
        .pipe(gulp.dest('./release/server/'));

    // Config
    gulp.src(['./config/default.json', './config/production.json'])
        .pipe(gulp.dest('./release/config/'));  

    // CSS files
    gulp.src('./client/css/*')
        .pipe(gulp.dest('./release/client/css'));

    gulp.src('./client/fonts/*')
        .pipe(gulp.dest('./release/client/fonts'))

    // Images
    gulp.src('./client/img/*')
        .pipe(gulp.dest('./release/client/img'));

    // Views
    gulp.src('./client/views/*')
        .pipe(gulp.dest('./release/client/views'));

    // Vendor
    gulp.src('./client/vendor/**/*')
        .pipe(gulp.dest('./release/client/vendor'));

    // Angular app and front-end dependencies
    gulp.src('./client/app.min.js')
        .pipe(gulp.dest('./release/client'));

    // Locale
    gulp.src(['./client/locale/*'])
        .pipe(gulp.dest('./release/client/locale'));

    // Windows service
    gulp.src('./win-service.js')
        .pipe(gulp.dest('./release/'));

});

gulp.task('watch', function(){
    gulp.watch("./client/sass/*.scss", ['sass'])
        .on('change', function(event){
            console.log('File ' + event.path + ' has been modified');
        });
    gulp.watch("./client/js/*.js", ['js'])
        .on('change', function(event){
            console.log('File ' + event.path + ' has been modified');
        });
});

gulp.task('tar', function(){
    gulp.src('./release/**/*')
        .pipe(tar('release.tar'))
        .pipe(gzip())
        .pipe(gulp.dest('.'));
})

gulp.task('clean', function(){
    return del(['./release', './release.tar.gz']);
});

gulp.task('web-assets', function(){
    gulp.src([
            './node_modules/angular/angular.js',
            './node_modules/angular-animate/angular-animate.min.js',
            './node_modules/angular-touch/angular-touch.min.js',
            './node_modules/angular-translate/dist/angular-translate.min.js',
            './node_modules/angular-translate-loader-static-files/angular-translate-loader-static-files.min.js',
            './node_modules/bootstrap/dist/css/bootstrap.min.css',
            './node_modules/bootstrap/dist/js/bootstrap.min.js',
            './node_modules/jquery/dist/jquery.min.js'
        ])
        .pipe(gulp.dest('./client/vendor'));
});










