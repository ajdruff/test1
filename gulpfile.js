var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
gulp.task('minify', function () {
    gulp.src('src/*.js')
            .pipe(uglify())
            .pipe(concat('test.min.js'))
            .pipe(gulp.dest('dist'));
    

});