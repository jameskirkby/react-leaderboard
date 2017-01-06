/**
 * (c) 2017 James Kirkby - http://jkirkby.co.uk
 **/
 'use strict';

/*---------- [ Gulp Plugins ] ----------*/
const gulp = require('gulp'),
    args = require('yargs').argv,
    async = require('async'),
    $ = require('gulp-load-plugins')({
        pattern: ['gulp-*', 'gulp.*', 'postcss-*', 'autoprefixer', 'browser-sync', 'webpack', 'webpack-stream']
    });

/*---------- [ Asset Paths ] ----------*/

const paths = {
    js: {
        src: 'assets/js/app.js',
        dest: 'dist/js',
        output: 'app.min.js',
        watch: 'assets/js/**/*.js',
        lintFiles: 'assets/js/app.js',
    },
    sass: {
        src: 'assets/scss/*.scss',
        dest: 'dist/css',
        watch: 'assets/scss/**/*.scss',
        lintFiles: 'assets/scss/**/*.scss',
        lintConfig: '.sasslint.yml',
        autoprefixerBrowsers: ['last 3 version'],
    },
};

/*---------- [ Environment setup ] ----------*/
let isProduction = false;

if(args.env === 'production') {
    isProduction = true;
}

/*---------- [ Top Level Tasks ] ----------*/
// run: gulp
gulp.task('default', ['browserSync', 'watches']);

// run: gulp watch
gulp.task('watch', ['watches']);

// run: gulp deploy
gulp.task('deploy', ['js', 'sass']);

/*---------- [ Setup Tasks ] ----------*/
gulp.task('browserSync', () => {
    $.browserSync.init({
        server: {
            baseDir: './'
        }
    });
});

gulp.task('watches', () => {
    gulp.watch(paths.js.watch, ['jsLint', 'js']);
    gulp.watch(paths.sass.watch, ['sass', 'sasslint']);
});

/*---------- [ JavaScript Tasks ] ----------*/
gulp.task('js', () => {
    // set empty plugins array
    let webpackPlugins = [];

    if(isProduction) {
        webpackPlugins = [
            // set node environment to production
            new $.webpack.DefinePlugin({
                'process.env':{
                    'NODE_ENV': JSON.stringify('production')
                }
            }),
            // minify files
            new $.webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false
                }
            })
        ];
    }

    return gulp.src(paths.js.src)
        // run webpack
        .pipe($.webpackStream({
            // don't build sourcemaps on production
            devtool: (isProduction ? '' : 'source-map'),
            output: {
                filename: paths.js.output
            },
            debug: ! isProduction,
            plugins: webpackPlugins,
            module: {
                loaders: [{
                    exclude: /(node_modules|bower_components)/,
                    loader: 'babel',
                    query: {
                        presets: ['es2015', 'react']
                    }
                }]
            }
        }, $.webpack))
        .on('error', (error) => {
            $.util.log($.util.colors.red(error.message));
        })       
        .pipe(gulp.dest(paths.js.dest))
        .pipe(isProduction ? $.util.noop() : $.browserSync.reload({stream: true}));
});

gulp.task('jsLint', () => {
    return gulp.src(paths.js.watch)
        .pipe($.eslint())
        .pipe($.eslint.format())
        .pipe($.eslint.results((results) => {
            if (results.warningCount > 0 || results.errorCount > 0) {
                throw new $.util.PluginError({
                    plugin: 'ESLint',
                    message: `${results.warningCount} warning ${(results.warningCount !== 1 ? 's' : '')}. ${results.errorCount} error${(results.errorCount !== 1 ? 's' : '')}.`,
                });
            }
        }));
});

/*---------- [ SASS Tasks ] ----------*/
gulp.task('sass', () => {
    return gulp.src(paths.sass.src)
        // run sourcmaps if we're not on production
        .pipe(isProduction ? $.util.noop() : $.sourcemaps.init())
        // if we're on production, compress the CSS, if we're not, leave it as expanded
        .pipe($.sass({
            outputStyle: (isProduction ? 'compressed' : 'expanded')
        }).on('error', $.sass.logError))
        .pipe($.postcss([
            $.autoprefixer({
                browsers: paths.sass.autoprefixerBrowsers
            }),
        ]))
        .pipe($.rename({
            suffix: '.min'
        }))
        // run sourcmaps if we're not on production
        .pipe(isProduction ? $.util.noop() : $.sourcemaps.write('./'))
        .pipe(gulp.dest(paths.sass.dest))
        // reload browserSync if we're not on production
        .pipe(isProduction ? $.util.noop() : $.browserSync.reload({stream: true}));
});

gulp.task('sasslint', () => {
    return gulp.src(paths.sass.lintFiles)
        .pipe($.sassLint({
            configFile: paths.sass.lintConfig
        }))
        .pipe($.sassLint.format())
        .pipe($.sassLint.failOnError());
});