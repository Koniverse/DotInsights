'use strict';

module.exports = {
	root: {
		main: 'docs/'
	},
	javascript: {
		src: 'src/assets/js-code/**/*.js',
		dist: 'docs/assets/js/'
	},
	sass: {
		watch: [
			'src/assets/scss/**/*.scss'
		],
		src: [
			'src/assets/scss/*.scss'
		],
		dist: 'docs/assets/css/'
	},
	bs: {
		main: [
			'docs/*.html',
			'docs/assets/css/*.css',
			'docs/assets/js/*.js',
			'docs/assets/libs/**/**/*.js'
		]
	},
	linting: {
		js: 'src/assets/js-code/',
		scss: 'src/assets/scss/**/*.scss'
	}
};
