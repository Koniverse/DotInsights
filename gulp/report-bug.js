'use strict';
var $   = require( 'gulp-load-plugins' )(),
    log = require( 'fancy-log' );

module.exports = function( error ) {
	$.notify( {
		title: 'src' + ' | ' + error.plugin,
		subtitle: 'Failed!',
		message: 'See console for more info.',
		sound: true
	} ).write( error );

	log.error( error.message );

	// Prevent the 'watch' task from stopping.
	this.emit( 'end' );
};
