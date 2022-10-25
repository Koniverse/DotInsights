'use strict';
var gulp        = require( 'gulp' ),
    $           = require( 'gulp-load-plugins' )(),
    dist        = require( '../paths' ).javascript.dist,
    config      = require( '../config.json' ),
    log         = require( 'fancy-log' ),
    reportError = require( '../report-bug' ),
    list        = config.compileMinifyJS,
    min         = '.min',
    extension   = '.js';

gulp.task( 'javascript:dev', function() {
	var results;
	list.forEach( function( item ) {
		results = gulp.src( item.files )
		              .pipe( $.plumber( { errorHandler: reportError } ) )
		              .pipe( $.concat( item.name + extension ) )
		              .pipe( gulp.dest( dist ) );
	} );
	return results;
} );

gulp.task( 'javascript:production', function() {
	var results;
	list.forEach( function( item ) {
		results = gulp.src( item.files )
		              .pipe( $.plumber( { errorHandler: reportError } ) )
		              .pipe( $.concat( item.name + extension ) )
		              .pipe( $.uglify() )
		              .on( 'error', function( err ) {
			              log.error( err.toString() );
			              this.emit( 'end' );
		              } )
		              .pipe( gulp.dest( dist ) );
	} );
	return results;
} );
