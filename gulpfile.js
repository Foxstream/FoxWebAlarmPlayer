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
    gzip = require('gulp-gzip');

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

    // Server files
    gulp.src(['./server/**/*', '!./server/data/**/*', '!./server/*.log*', '!./server/karma.conf.js'])
        .pipe(gulp.dest('./release/server/'));

    // Config
    gulp.src(['./config/default.json', './config/production.json'])
        .pipe(gulp.dest('./release/config/'));  

    // CSS files
    gulp.src('./client/css/*')
        .pipe(gulp.dest('./release/client/css'));

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

    // Windiws service
    gulp.src('./install.js')
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