'use strict';
var gulp = require( 'gulp' );

require( './gulp/tasks/linting' );
require( './gulp/tasks/sass' );
require( './gulp/tasks/browser-sync' );
require( './gulp/tasks/javascript' );
require( './gulp/tasks/watch' );

gulp.task( 'development', gulp.series( gulp.parallel( 'bs', 'sass', 'watch:main' ) ) );

gulp.task( 'production', gulp.series( gulp.parallel( 'javascript:production', 'sass:production' ) ) );
