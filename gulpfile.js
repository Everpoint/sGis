const gulp = require('gulp');
const babel = require('gulp-babel');
const concat = require('gulp-concat');
const replace = require('gulp-replace');

gulp.task('default', ['build', 'build-babel', 'minify', 'minify-babel'], () => {
});

gulp.task('build', () => {
    return gulp.src(['./source/sGis.js', './source/**/*.js'])
        .pipe(concat('sGis.js'))
        .pipe(gulp.dest('./dist/'))
});

gulp.task('build-babel', () => {
    return gulp.src(['./source/sGis.js', './source/**/*.js', '!./source/interfaces/*'])
        .pipe(babel({
            presets: ['es2015'],
            plugins: ['remove-comments']
        }))
        .pipe(concat('sGis.babel.js'))
        .pipe(gulp.dest('./dist/'))
});

gulp.task('minify', () => {
    return gulp.src(['./source/sGis.js', './source/**/*.js', '!./source/interfaces/*'])
        .pipe(babel({
            presets: ['babili'],
            plugins: ['remove-comments']
        }))
        .pipe(concat('sGis.min.js'))
        .pipe(gulp.dest('./dist/'))
});

gulp.task('minify-babel', () => {
    return gulp.src(['./source/sGis.js', './source/**/*.js', '!./source/interfaces/*'])
        .pipe(babel({
            presets: ['es2015'],
            plugins: ['remove-comments'],
            passPerPreset: true
        }))
        .pipe(concat('sGis.babel.min.js'))
        .pipe(gulp.dest('./dist/'))
});

gulp.task('version', () => {
    var version = process.env.npm_package_version;
    console.log(version);

    gulp.src(['./source/sGis.js'])
        .pipe(replace(/sGis\.version\s*=\s*".+"/, 'sGis.version = "' + version + '"'))
        .pipe(replace(/sGis\.releaseDate\s*=\s*".+"/, 'sGis.releaseDate = "' + today() + '"'))
        .pipe(gulp.dest('./source/'));
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