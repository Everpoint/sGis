const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const replace = require('gulp-replace');
const argv = require('yargs').argv;

gulp.task('default', () => {
    return gulp.src('source/**/*.js')
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', () => {
    return gulp.src(['./source/sGis.js', './source/**/*.js', '!./source/interfaces/*'])
        .pipe(babel({
            presets: ['babili'],
            plugins: ['remove-comments']
        }))
        .pipe(concat('sGis.js'))
        .pipe(gulp.dest('./dist/'))
});

gulp.task('build-babel', () => {
    return gulp.src(['./source/sGis.js', './source/**/*.js', '!./source/interfaces/*'])
        .pipe(babel({
            presets: ['es2015', 'babili'],
            plugins: ['remove-comments']
        }))
        .pipe(concat('sGis.babel.js'))
        .pipe(gulp.dest('./dist/'))
});

gulp.task('version', () => {
    var version = argv.v;
    console.log(version);

    gulp.src(['./source/sGis.js'])
        .pipe(replace(/sGis\.version\s*=\s*".+"/, 'sGis.version = "' + version + '"'))
        .pipe(replace(/sGis\.releaseDate\s*=\s*".+"/, 'sGis.releaseDate = "' + today() + '"'))
        .pipe(gulp.dest('./dist/'));

    gulp.src('./package.json')
        .pipe(replace(/"version"\s*:\s*".+"/, '"version": "' + version + '"'))
        .pipe(gulp.dest('./dist/'));
});

function today() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1;
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd='0'+dd
    }

    if(mm<10) {
        mm='0'+mm
    }

    today = dd + '.' + mm + '.' + yyyy;
    return today;
}