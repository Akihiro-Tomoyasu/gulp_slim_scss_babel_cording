/**
 *インストールコマンド：npm install gulp gulp-plumber gulp-clean-css gulp-ruby-sass browser-sync gulp-postcss gulp-csscomb gulp-slim gulp-prettify gulp-replace gulp-rename gulp-uglify gulp-babel @babel/core @babel/preset-env babel-preset-env --save-dev
**/

//読み込み
const gulp = require('gulp');
const browserSync = require('browser-sync');
const plumber = require('gulp-plumber');
const rename = require("gulp-rename");
const replace = require('gulp-replace');

const prettify = require('gulp-prettify'); //html整形
const slim = require("gulp-slim");

const postcss = require('gulp-postcss');
const sass = require('gulp-ruby-sass');
const csscomb = require('gulp-csscomb');
const cleanCSS = require('gulp-clean-css');

const babel = require("gulp-babel");
const uglify = require('gulp-uglify'); //JS圧縮


//ブラウザシンクindex
const index_path = 'top_pc.html';


//ソースディレクトリ
const srcs = {
	'scss':'./src/scss',
	'slim':'./src/slim',
	'babel':'./src/babel'
}

//書き出し先ディレクトリ
const dests = {
	'css':'./dest/css',
	'html':'./dest',
	'js':'./dest/js'
}



//デフォルト
gulp.task('default', ['browser-sync','watch']);



//watch
gulp.task('watch', function() {
	//SLIM
	gulp.watch([srcs.slim + '/**/*.slim'],['slim']);

	//SCSS
	gulp.watch([srcs.scss + '/**/*.scss'],['scss']);
	
	//Babel
	gulp.watch([srcs.babel + '/**/*.js'],['babel']);

	//画面リロード
	gulp.watch([dests.html + '/**/*.+(html|js|css|png|jpg)'],['reload']);
});



//ブラウザシンク
gulp.task('browser-sync', function() {
	browserSync({
		server: {
			browser: 'Chrome',
			baseDir: './dest',
			index  : index_path
		}
	});
});

//リロード
gulp.task('reload', function(){ 
	browserSync.reload();
});



//SLIM
gulp.task('slim', () => {
	return gulp.src([
			srcs.slim + '/**/*.slim',
			'!' + srcs.slim + '/inc/**/*.slim'
		])
		.pipe(plumber({
			errorHandler: function(err) {
				console.log(err);
				this.emit('end');
			}
		}))
		//slimをhtmlに
		.pipe(slim({
			pretty: true,
			require: 'slim/include',
			options: 'include_dirs=["' + srcs.slim + '/inc"]'
		}))
		//htmlを整形
		.pipe(prettify({
			'end_with_newline':false,
			'indent_inner_html':false,
			'indent_with_tabs':true
		}))
		//整形が不完全な所を置換で修正
		.pipe(replace(/^\t(\t+?)<(.*?)> <\/(.*?)>/mg, '\t$1<$2>\n$1</$3>'))
		.pipe(gulp.dest(dests.html));
});



//SCSS
gulp.task('scss', () => {
	return sass(srcs.scss + '/**/*.scss',{
			style : 'expanded',
			precision: 8
		})
		.on('error', sass.logError)
		.pipe(plumber())
		.pipe(csscomb())
		.pipe(postcss([
			require('autoprefixer')({browsers: ["last 2 versions", "ie >= 11", "Android >= 4","ios_saf >= 8"]})
		]))
		.pipe(gulp.dest(dests.css))
		.pipe(cleanCSS())
		.pipe(rename({
			extname: '.min.css'
		}))
		.pipe(gulp.dest(dests.css));
});



//babel
gulp.task("babel", function () {
	return gulp.src(srcs.babel + '/**/*.js')
		.pipe(plumber())
		.pipe(babel({
			presets: ['es2015','stage-0', 'react'],
		}))
		.pipe(gulp.dest(dests.js))
		.pipe(uglify({
			output:{
				comments: /^!/
			}
		}))
		.pipe(rename({
			extname: '.min.js'
		}))
		.pipe(gulp.dest(dests.js));
});

