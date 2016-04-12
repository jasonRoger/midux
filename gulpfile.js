var gulp = require("gulp");
var browserSync = require("browser-sync").create();
var webpack = require("gulp-webpack");
var named = require("vinyl-named");
var clean = require("gulp-clean");
var webpackAppConfig = require("./webpack.config.app");
var webpackMiduxConfig = require("./webpack.config.midux");
gulp.task("browserSyncServer", function() {
    browserSync.init({
        server: {
            baseDir: "."
        },
        port: 8080,
        ui: {
            port: 8081
        },
        browser: "google chrome"
    });
});
gulp.task("clean", function() {
    gulp.src(["./dist/", "./lib"])
    .pipe(clean());
});
gulp.task("reload", function() {
    browserSync.reload();
});
gulp.task("webpackApp", function() {
    return gulp.src(["./test/app.js"])
    .pipe(named())
    .pipe(webpack(webpackAppConfig))
    .pipe(gulp.dest("./dist/"));
});
gulp.task("webpackMidux", function() {
    return gulp.src(["./src/index.js"])
    .pipe(named())
    .pipe(webpack(webpackMiduxConfig))
    .pipe(gulp.dest("./lib/"));
});
gulp.task("watch", function() {
    gulp.watch(["./src/**/*.js", "./test/**/*.js"], ["webpackApp", "webpackMidux"]);
    gulp.watch(["./lib/**/*.js", "./dist/**/*.js", "./test/**/*.@(js|html)"], ["reload"]);
});
gulp.task("server", ["browserSyncServer", "watch"]);
