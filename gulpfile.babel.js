/* Gulp Modules */
import gulp from "gulp";
import gpug from "gulp-pug";
import del from "del";
import gwebserver from "gulp-webserver";
import gimagemin from "gulp-imagemin";
import autoprefixer from "gulp-autoprefixer";
import csso from "gulp-csso";
import sourcemaps from "gulp-sourcemaps";
import bro from "gulp-bro";
import babelify from "babelify";
import uglify from "gulp-uglify";
import plumber from "gulp-plumber";
import ghPages from "gulp-gh-pages";
import htmlExtend from "gulp-html-extend";
import htmlMin from "gulp-htmlmin";
import gsprite from "gulp.spritesmith";
import gpostcss from "gulp-postcss";
import gpurgecss from "gulp-purgecss";
import tailwindcss from "tailwindcss";
import concat from "gulp-concat";

const sass = require('gulp-sass')(require('sass'));

/* Files Directory */
const routes = {
	build: {
		html: "build/html",
		css: "build/css",
		js: "build/js",
		img: "build/img",
		index: "build/index.html"
	},
	pug: {
		watch: "src/**/*.pug",
		src: "src/*.pug",
		dest: "build/pug"
	},
	html: {
		watch: "src/html/**/*.html",
		src: "src/html/**/*.html",
		except: "!src/html/_components/*.html",
		dest: "build/html"
	},
	index_html: {
		watch: "src/index.html",
		src: "src/index.html",
		dest: "build"
	},
	img: {
		src: "src/img/**/*",
		dest: "build/img"
	},
	img_sprite: {
		src: "src/img/**/*.png",
		dest: "build/img_sprite"
	},
	scss: {
		watch: "src/scss/**/*.scss",
		src: "src/scss/*",
		dest: "build/css"
	},
	tailwind: {
		watch: "src/tailwind/**/*.css",
		src: "src/tailwind/*",
		dest: "build/css",
		config: "tailwind.config.js"
	},
	css: {
		src: "build/css"
	},
	js: {
		watch: "src/js/**/*.js",
		src: "src/js/main.js",
		dest: "build/js"
	}
	// js: {
	// 	warch: "src/js/**/*.js",
	// 	src: "src/js/*",
	// 	dest: "build/js"
	// }
}

/* Gulp Tasks */
const clean = () => del([routes.build.html, routes.build.css, routes.build.js, routes.build.img, routes.build.index, ".publish"]);

const webserver = () => 
	gulp
		.src("build")
		.pipe(plumber())
		.pipe(gwebserver({ 
			// port: 8080,
			livereload : true, 
			open: true 
		}));

const gh = () => 
	gulp
		.src("build/**/*")
		.pipe(ghPages());

const watch = () => {
	gulp.watch(routes.index_html.watch, index_html);
	gulp.watch(routes.html.watch, html);
	gulp.watch(routes.pug.watch, pug);
	gulp.watch(routes.scss.watch, styles);
	gulp.watch(routes.tailwind.src, tailwind);
	gulp.watch(routes.scss.dest, purgecss);
	gulp.watch(routes.js.watch, js);
	// gulp.watch(routes.img.src, img);
}

const index_html = () =>
	gulp
		.src(routes.index_html.src)
		.pipe(plumber())
		.pipe(
      htmlExtend({ annotations:false, verbose:false })
    )
    .pipe(htmlMin({ collapseWhitespace: false }))
    .pipe(gulp.dest(routes.index_html.dest));

const html = () =>
	gulp
		.src([routes.html.src, routes.html.except])
		.pipe(plumber())
		.pipe(
      htmlExtend({ annotations:false, verbose:false })
    )
    .pipe(htmlMin({ collapseWhitespace: false }))
    .pipe(gulp.dest(routes.html.dest));

const pug = () =>
	gulp
		.src(routes.pug.src)
		.pipe(plumber())
		.pipe(gpug())
		.pipe(gulp.dest(routes.pug.dest));

const js = () => 
	gulp	
		.src(routes.js.src)
		.pipe(plumber())
		.pipe(bro({
			transform: [
				// babelify.configure({ presets: ["es2015"] }),
				// babelify.configure({ presets: ["@babel/preset-env"] }),
				// [ 'uglifyify', { global: true } ]
				babelify.configure({ presets: ["@babel/preset-env"] })
			]
		}))
		.pipe(uglify())
		.pipe(gulp.dest(routes.js.dest));

const img = () => 
	gulp
		.src(routes.img.src)
		.pipe(plumber())
		.pipe(gimagemin())
		.pipe(gulp.dest(routes.img.dest));

const sprite = () =>
	gulp
		.src(routes.img_sprite.src)
		.pipe(plumber())
		.pipe(gsprite({
			imgName: 'sprite.png',
			cssName: 'sprite.css',
			padding: 10
		}))
		.pipe(gulp.dest(routes.img_sprite.dest));

const styles = () => 
	gulp
		.src(routes.scss.src)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(csso())
		.pipe(sourcemaps.write("./"))
		.pipe(gulp.dest(routes.scss.dest));

const tailwind = () =>
	gulp
		.src(routes.tailwind.src)
		.pipe(plumber())
		// .pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(gpostcss([
			tailwindcss()
		]))
		// .pipe(gpostcss([
		// 	tailwindcss(routes.tailwind.config)
		// ]))
		.pipe(autoprefixer())
		// .pipe(concat("tailwind.css"))
		// .pipe(concat({ path : 'tailwind.css' }))
		.pipe(csso())
		// .pipe(sourcemaps.write("./"))
		.pipe(gulp.dest(routes.scss.dest));

const purgecss = () =>
	gulp
		.src(routes.scss.dest)
		.pipe(plumber())
		.pipe(gpurgecss({
			content: [routes.html.src]
		}))
		.pipe(gulp.dest(routes.scss.dest));

/* Gulp Builds */
const prepare = gulp.series([clean, img, sprite]);

const assets = gulp.series([pug, index_html, html, styles, tailwind, purgecss, js]);

const live = gulp.parallel([webserver, watch]);

export const build = gulp.series([prepare, assets]);
export const dev = gulp.series([build, live]);
export const deploy = gulp.series([build, gh, clean]);