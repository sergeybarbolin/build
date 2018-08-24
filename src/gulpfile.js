var
    gulp 				= require('gulp'),
    pug                 = require('gulp-pug');
    styl 				= require('gulp-stylus'),
    browserSync 	    = require('browser-sync'),
    concat 				= require('gulp-concat'),
    svgSprite 		    = require("gulp-svg-sprites"),
    plumber 			= require('gulp-plumber'),
    rename 				= require('gulp-rename'),
    uglify 				= require('gulp-uglify'),
    cssmin 				= require('gulp-cssmin'),
    replace 			= require('gulp-replace'),
    autoprefixer 	    = require('gulp-autoprefixer'),
    notify 				= require("gulp-notify"),
    babel 				= require('gulp-babel'),
    tinypng 			= require('gulp-tinypng-compress'),
    cheerio 			= require('gulp-cheerio');


gulp.task('pug', function buildHTML() {
  return gulp.src('index.pug')
  .pipe(pug({pretty: true}))
  .pipe(gulp.dest('../dist/'))  
  .pipe(browserSync.reload({ stream: true }))
});

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
        // .pipe(notify('Добавлены css библеотеки'))
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

    gulp.src([
        
        // 'bower_components/jquery/dist/jquery.min.js',
        'blocks/**/*.js'
        
        ])
        .pipe(concat('script.min.js'))
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(uglify())
        .pipe(gulp.dest('../dist/js'))
        .pipe(browserSync.reload({ stream: true }))
});

gulp.task('tinypng', function () {
    return gulp.src('blocks/**/*.{png,jpg,jpeg}')
				.pipe(tinypng({
				    key: 'MqUNEWa0vy_9z5Wj_EQydwHBCRK4_8x8',
				    sigFile: '../dist/img/.tinypng-sigs',
				    summarize: true,
				    log: true
    		}))
		.pipe(gulp.dest('../dist/img'))
		.pipe(notify('Сжато <%= file.relative %>!'))
});

gulp.task('fonts', function () {
    return gulp.src('fonts/**/*')
        .pipe(gulp.dest('../dist/fonts'))
});

gulp.task('sprites', function () {
    return gulp.src('blocks/**/*.svg')


        // remove all fill, style and stroke declarations in out shapes
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode: true}
        }))
        // cheerio plugin create unnecessary string '&gt;', so replace it.
        .pipe(replace('&gt;', '>'))
        // build svg sprite
        .pipe(svgSprite({
            mode: "symbols",
            preview: false,
            selector: "%f",
            svg: {
               symbols: 'sprite.svg' 
            }
        }))
        .pipe(gulp.dest('../dist/img'));
});

gulp.task('watch', 
	[
		'browser-sync',
        'tinypng',
        'styl',
        'fonts',
        'pug'
	], 
	function () {
    gulp.watch('stylus/libs.styl', ['styl-lib']);
    gulp.watch(['blocks/**/*.styl','stylus/**/*.styl'], ['styl']);
    gulp.watch(['./*.pug'], ['pug']);
    gulp.watch(['blocks/**/*.js'], ['js']);
	gulp.watch(['blocks/**/*.svg'], ['sprites']);
    gulp.watch(['blocks/**/*.{png,jpg,jpeg}'], ['tinypng']);
});

