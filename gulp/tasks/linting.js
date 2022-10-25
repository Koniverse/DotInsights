'use strict';
var gulp  = require( 'gulp' ),
    $     = require( 'gulp-load-plugins' )(),
    spawn = require( 'child_process' ).spawn,
    paths = require( '../paths' ).linting;

gulp.task( 'lint:scss', function( done ) {
	spawn( 'stylelint', [ paths.scss, '--syntax scss' ], { stdio: 'inherit' } );
	done();
} );

gulp.task( 'lint:js', function( done ) {
	spawn( 'eslint', [ paths.js ], { stdio: 'inherit' } );
	done();
} );
