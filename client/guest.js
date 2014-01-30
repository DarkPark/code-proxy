/**
 * STB Proxy desktop browser (client) part
 * @constructor
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 * @author DarkPark
 */
function ProxyGuest () {

	'use strict';

	/**
	 * proxy instance configuration
	 * @namespace
	 */
	var config = {
		/** node.js server address */
		host : '127.0.0.1',

		/** http server port */
		port : 8800,

		/** session name */
		name : 'anonymous'
	},

	// cached url for posting requests
	urlPost = null,

	// cached url for info collecting
	urlInfo = null,

	// single ajax object for performance
	xhr = new XMLHttpRequest();

	/**
	 * Prepares the connection
	 * @param {Object} options set of initialization parameters (host, port, name)
	 */
	this.init = function ( options ) {
		var name;

		// validate and iterate input
		if ( options ) {
			for ( name in options ) {
				// rewrite defaults
				if ( options.hasOwnProperty(name) ) { config[name] = options[name]; }
			}
		}

		// cache final request urls
		urlPost = 'http://' + config.host + ':' + config.port + '/' + config.name;
		urlInfo = 'http://' + config.host + ':' + config.port + '/info/' + config.name;
	};

	/**
	 * Sends a sync request to the STB device from the desktop browser
	 * @param {Object} data JSON data to send
	 * @return {*} execution result from the STB
	 */
	this.send = function ( data ) {
		// prepare
		var time = +new Date(),
			response;

		// mandatory init check
		if ( !urlPost ) {
			return false;
		}

		// make request
		xhr.open('post', urlPost, false);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
		xhr.send(JSON.stringify(data));

		// proceed the result
		try {
			response = JSON.parse(xhr.responseText);
		} catch ( e ) {
			response = {error:e};
		}

		// detailed report
		console.groupCollapsed('%c[%s]\t%c%s\t%c(%d/%d ms)',
			'color:#aaa;font-weight:normal', data.type,
			'color:' + (response.error ? 'red' : 'green'), data.method || data.code || 'unhandled STB call',
			'color:#aaa;font-weight:normal', response.time || 0, +new Date() - time);
		if ( data.params    !== undefined ) { console.log('%c%s:\t', 'font-weight:bold', 'Params', data.params); }
		if ( response.data  !== undefined ) { console.log('%c%s:\t', 'font-weight:bold', 'Result', response.data); }
		if ( response.error !== undefined ) { console.error(response.error); }
		console.groupEnd();

		// ready
		return response.data;
	};

	/**
	 * Wrapper to send a line of js code to eval on the STB device
	 * @param {String} code javascript source code to execute on the device
	 * @return {*} execution result from the STB
	 */
	this.eval = function ( code ) {
		return this.send({type:'eval', code:code});
	};

	/**
	 * Wrapper to send one function of js code with arguments to eval on the STB device
	 * @param {String} method javascript function name (like "gSTB.Debug")
	 * @param {Array} params list of the function arguments
	 * @return {*} execution result from the STB
	 */
	this.call = function ( method, params ) {
		return this.send({type:'call', method:method, params:params});
	};

	/**
	 * Gets the detailed info about the current connection
	 * @return {{active:Boolean, count:Number}|{active:Boolean}|Boolean}
	 */
	this.info = function () {
		// mandatory init check
		if ( !urlInfo ) {
			return false;
		}

		// make request
		xhr.open('get', urlInfo, false);
		xhr.send();

		return JSON.parse(xhr.responseText || false);
	};
}