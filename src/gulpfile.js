var
    gulp 					= require('gulp'),
    styl 					= require('gulp-stylus');
    browserSync 	= require('browser-sync'),
    concat 				= require('gulp-concat'),
    svgSprite 		= require("gulp-svg-sprites"),
    plumber 			= require('gulp-plumber'),
    rename 				= require('gulp-rename'),
    uglify 				= require('gulp-uglify'),
    cssmin 				= require('gulp-cssmin'),
    replace 			= require('gulp-replace'),
    autoprefixer 	= require('gulp-autoprefixer'),
    notify 				= require("gulp-notify"),
    babel 				= require('gulp-babel'),
    sourcemaps 		= require('gulp-sourcemaps'),
    tinypng 			= require('gulp-tinypng-compress'),
    cheerio 			= require('gulp-cheerio');
    jsLibs 				= require('./jsLibs.json');

gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: '../dist'
        },
        notify: false,
        open: false,
        // online: false,
        // tunnel: true, tunnel: "projectname", // Demonstration page: http://projectname.localtunnel.me
    })
}); 

gulp.task('styl-lib', function () {
    gulp.src('bower_components/**/*.css')
        .pipe(rename(function (path) {
            path.extname = ".styl"
        }))
        .pipe(gulp.dest("stylus/libs"));
    gulp.src('stylus/libs.styl')
        .pipe(styl())
        .pipe(cssmin())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('../dist/css/'))	
        .pipe(browserSync.reload({ stream: true }))
        .pipe(notify('Добавлены css библеотеки'))
});

gulp.task('js-libs', function () {
    gulp.src(jsLibs)
        .pipe(sourcemaps.init())
        .pipe(concat('libs.min.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('../dist/js'))
        .pipe(browserSync.reload({ stream: true }))
        .pipe(notify('Добавлены js библеотеки'))
});

gulp.task('styl', function () {
    return gulp.src('stylus/style.styl')
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(styl())
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('../dist/css/'))
        .pipe(browserSync.reload({ stream: true }))	
});


gulp.task('js', function () {
    gulp.src('blocks/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(concat('script.js'))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('../dist/js'))
        .pipe(browserSync.reload({ stream: true }))
});

gulp.task('tinypng', function () {
    gulp.src('./blocks/**/*.{png,jpg,jpeg}')
				.pipe(tinypng({
				    key: 'MqUNEWa0vy_9z5Wj_EQydwHBCRK4_8x8',
				    sigFile: '../dist/img/.tinypng-sigs',
				    summarize: true,
				    log: true
    		}))
		.pipe(gulp.dest('../dist/img'))
		.pipe(notify('Сжато <%= file.relative %>!'))
});

gulp.task('sprites', function () {
		return gulp.src('./blocks/**/*.svg')
		.pipe(cheerio({
		    run: function ($) {
		       $('[fill]').removeAttr('fill');
		       $('[style]').removeAttr('style');
		   }
		 }))
		.pipe(svgSprite({
		    mode: "symbols",
		    preview: false,
		    selector: "%f",
		    svg: {
		       symbols: 'sprite.svg' 
		    }
		  }
		))
			.pipe(replace('NaN ', '-'))
		.pipe(gulp.dest("../dist/imag"));
});

gulp.task('watch', 
	[
		'styl', 
		'js',
		'browser-sync',
	], 
	function () {
    gulp.watch('stylus/libs.styl', ['styl-lib']);
    gulp.watch('jsLibs.json', ['js-libs']);
    gulp.watch('blocks/**/*.styl', ['styl']);
    gulp.watch('stylus/**/*.styl', ['styl']);
		gulp.watch('./blocks/**/*.svg', ['sprites']);
    gulp.watch('./blocks/**/*.{png,jpg,jpeg}', ['tinypng']);
});

