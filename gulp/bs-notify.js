'use strict';
var config = require( './config.json' ).notify;

// Config notify for Browser Sync.
module.exports = {
	styles: {
		backgroundColor: config.backgroundColor,
		fontSize: config.fontSize,
		top: config.top,
		borderBottomLeftRadius: '0',
		fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif'
	}
};
