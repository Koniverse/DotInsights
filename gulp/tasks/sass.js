'use strict';
var gulp        = require( 'gulp' ),
    $           = require( 'gulp-load-plugins' )(),
    paths       = require( '../paths' ),
    processors  = require( '../processors' ),
    reportError = require( '../report-bug' );

// Build SASS.
gulp.task( 'sass', function() {
	return gulp.src( paths.sass.src )
	           .pipe( $.plumber( { errorHandler: reportError } ) )
	           .pipe( $.sourcemaps.init() )
	           .pipe( $.sass() )
	           .pipe( $.sourcemaps.write( 'sourcemap/', {
		           includeContent: false,
		           sourceRoot: '../scss/'
	           } ) )
	           .pipe( $.lineEndingCorrector() )
	           .pipe( gulp.dest( paths.sass.dist ) );
} );

// Build SASS final.
gulp.task( 'sass:production', function() {
	return gulp.src( paths.sass.src )
	           .pipe( $.plumber( { errorHandler: reportError } ) )
	           .pipe( $.sourcemaps.init() )
	           .pipe( $.sass() )
	           .pipe( $.postcss( processors.modules ) )
	           .pipe( $.stripCssComments() )
	           .pipe( $.cssnano( processors.nano ) )
	           .pipe( $.lineEndingCorrector() )
	           .pipe( gulp.dest( paths.sass.dist ) )
	           .pipe( $.sourcemaps.write( 'sourcemap/', {
		           addComment: false,
		           includeContent: false,
		           sourceRoot: '../scss/'
	           } ) );
} );
