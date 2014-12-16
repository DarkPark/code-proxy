/**
 * Console logger for http/ws communication
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 * @author DarkPark
 */

'use strict';

var config = require('./config');


// enable colors in console
require('tty-colors');


/**
 * Output detailed log for HTTP communications
 * @param {String} type
 * @param {String} method
 * @param {String} name
 * @param {String} message
 */
module.exports.http = function ( type, method, name, message ) {
	if ( config.logging ) {
		console.log('%s\t%s\t%s\t%s',
			type.toUpperCase().cyan, method.toUpperCase().green, name.grey, message || ''
		);
	}
};


/**
 * Output detailed log for HTTP communications
 * @param {String} type
 * @param {String} method
 * @param {String} name
 * @param {String} message
 */
module.exports.ws = function ( type, method, name, message ) {
	if ( config.logging ) {
		console.log('%s\t%s\t[%s]\t%s',
			type.toUpperCase().cyan, method.toUpperCase().green, name.magenta, message || ''
		);
	}
};
