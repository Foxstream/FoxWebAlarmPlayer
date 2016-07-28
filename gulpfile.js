var gulp = require('gulp'), 
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    uglifycss = require('gulp-uglifycss'),
    sourcemaps = require('gulp-sourcemaps'),
    ngAnnotate = require('gulp-ng-annotate'),
    del = require('del'),
    bowerFiles = require('bower-files')({ json: './client/bower.json' }),
    gulpFilter = require('gulp-filter');

gulp.task('default', ['sass'], function(){

});

gulp.task('js', function(){
    return gulp.src(['./client/js/app.js', './client/js/*.js'])
            .pipe(concat('app.min.js'))
            .pipe(ngAnnotate())
            .pipe(uglify({compress: {hoist_funs: false, hoist_vars: false}}))
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
    gulp.src('./server/**/*')
        .pipe(gulp.dest('./release/server/'));

    // Config
    gulp.src('./config/default.json')
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

    // Angular app and front-end dependencies
    gulp.src(['./client/app.min.js', './client/bower.json', './client/.bowerrc'])
        .pipe(gulp.dest('./release/client'));

});

gulp.task('publish-bower', function(){
    gulp.src(bowerFiles.ext('js').files)
        .pipe(concat('lib.min.js'))
        .pipe(gulp.dest('./lib'));
});

gulp.task('watch', function(){
    gulp.watch("./sass/*.scss", ['sass'])
        .on('change', function(event){
            console.log('File ' + event.path + ' has been modified');
        });
});

gulp.task('clean', function(){
    return del(['./release']);
});