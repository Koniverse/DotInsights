'use strict';
var gulp        = require( 'gulp' ),
    browserSync = require( 'browser-sync' ).create(),
    paths       = require( '../paths' ),
    bsNotify    = require( '../bs-notify' );

gulp.task( 'bs', function() {
	browserSync.use( require( 'bs-snippet-injector' ), {
		// path to the file containing the closing </body> tag
		file: paths.root.main + 'index.html'
	} );

	browserSync.init( {
		files: paths.bs.main,
		notify: bsNotify,
		ghostMode: {
			clicks: false,
			forms: false,
			scroll: false
		}
	} );
} );
