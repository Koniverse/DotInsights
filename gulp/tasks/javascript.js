'use strict';
var gulp        = require( 'gulp' ),
    browserify  = require( 'browserify' ),
    tap         = require( 'gulp-tap' ),
    buffer      = require( 'gulp-buffer' ),
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
		if ( item.bundle ) {
			results = gulp.src( item.files, { read: false } )
			              .pipe( tap( function( file ) {

				              log.info( 'bundling ' + file.path );

				              // replace file contents with browserify's bundle stream
				              file.contents = browserify( file.path, { debug: true } ).bundle();

			              } ) )
			              // transform streaming contents into buffer contents (because gulp-sourcemaps does not support streaming contents)
			              .pipe( buffer() );

		} else {
			results = gulp.src( item.files );
		}

		results.pipe( $.plumber( { errorHandler: reportError } ) )
		       .pipe( $.concat( item.name + extension ) )
		       .pipe( gulp.dest( dist ) );
	} );
	return results;
} );

gulp.task( 'javascript:production', function() {
	var results;
	list.forEach( function( item ) {
		if ( item.bundle ) {
			results = gulp.src( item.files, { read: false } )
			              .pipe( tap( function( file ) {

				              log.info( 'bundling ' + file.path );

				              // replace file contents with browserify's bundle stream
				              file.contents = browserify( file.path, { debug: true } ).bundle();

			              } ) )
			              // transform streaming contents into buffer contents (because gulp-sourcemaps does not support streaming contents)
			              .pipe( buffer() );

		} else {
			results = gulp.src( item.files );
		}

		results.pipe( $.plumber( { errorHandler: reportError } ) )
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
