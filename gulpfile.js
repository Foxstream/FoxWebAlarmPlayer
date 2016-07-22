var gulp = require('gulp'), 
    sass = require('gulp-sass'),
    uglifycss = require('gulp-uglifycss');

gulp.task('default', ['sass'], function(){

});

gulp.task('watch', function(){
    gulp.watch("./sass/*.scss", ['sass'])
        .on('change', function(event){
            console.log('File ' + event.path + ' has been modified');
        });
});

gulp.task('sass', function(){
    return gulp.src('./sass/main.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(uglifycss({
            "maxLineLength": 100
        }))
        .pipe(gulp.dest('./static/css'));
});