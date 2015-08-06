var gulp = require('gulp');
var babel = require('gulp-babel');

gulp.task('build', function () {
    return gulp.src('src/index.js')
        .pipe(babel())
        .on('error', swallowError)
        .pipe(gulp.dest('dist'));
});

gulp.task('watch', function() {
	gulp.watch('src/index.js', ['build']);
});

gulp.task('default', ['build', 'watch']);

function swallowError (error) {
    console.log(error.toString());
    console.log(error.codeFrame);
    // console.log(JSON.stringify(error));
    this.emit('end');
}