var gulp = require('gulp'), 
    sass = require('gulp-sass'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    uglifycss = require('gulp-uglifycss'),
    sourcemaps = require('gulp-sourcemaps'),
    ngAnnotate = require('gulp-ng-annotate');

gulp.task('default', ['sass'], function(){

});

gulp.task('watch', function(){
    gulp.watch("./sass/*.scss", ['sass'])
        .on('change', function(event){
            console.log('File ' + event.path + ' has been modified');
        });
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

// gulp.task('prepare-frontend-dependencies', function(){
//     gulp.src('./client/bower_components/bootstrap/dist/css/bootstrap.min.css')
//         .pipe(gulp.dest('./client/css/'))
//     gulp.src('./client/bower_components/bootstrap/dist/css/bootstrap.min.css')
//         .pipe(gulp.dest('./client/css/'))
// });