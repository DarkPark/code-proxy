/**
 * Guest client part
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
	 * @param {Object} [options] set of initialization parameters (host, port, name)
	 */
	this.init = function ( options ) {
		var name, info, active;

		// validate and iterate input
		if ( options ) {
			for ( name in options ) {
				// rewrite defaults
				if ( options.hasOwnProperty(name) ) { config[name] = options[name]; }
			}
		}

		// there may be some special chars
		name = encodeURIComponent(config.name);

		// cache final request urls
		urlPost = 'http://' + config.host + ':' + config.port + '/' + name;
		urlInfo = 'http://' + config.host + ':' + config.port + '/info/' + name;

		info = this.info();
		// check connection status
		active = info && info.active;

		console.log('%c[core]\t%c%s\t%c0\t%cconnection to the host %c(%s:%s): %c%s',
			'color:grey',
			'color:purple', config.name,
			'color:grey',
			'color:black',
			'color:grey', config.host, config.port,
			'color:' + (active ? 'green' : 'red'), active ? 'available' : 'not available'
		);

		return active;
	};

	/**
	 * Sends a synchronous request to the host system
	 * @param {Object} request JSON data to send
	 * @return {*} execution result from the host
	 */
	this.send = function ( request ) {
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
		xhr.send(JSON.stringify(request));

		// proceed the result
		try {
			response = JSON.parse(xhr.responseText);
		} catch ( e ) {
			response = {error:e};
		}

		// detailed report
		console.groupCollapsed('%c[%s]\t%c%s\t%c%s\t%c%s',
			'color:grey;font-weight:normal', request.type,
			'color:purple;font-weight:normal', config.name,
			'color:grey;font-weight:normal', +new Date() - time,
			'color:' + (response.error ? 'red' : 'green'), request.method || request.code
		);
		if ( request.params !== undefined ) { console.log('%c%s:\t', 'font-weight:bold', 'Params', request.params); }
		if ( response.data  !== undefined ) { console.log('%c%s:\t', 'font-weight:bold', 'Result', response.data); }
		if ( response.error !== undefined ) { console.error(response.error); }
		console.groupEnd();

		// ready
		return response.data;
	};

	/**
	 * Wrapper to send a line of js code to eval on the host
	 * @param {String} code javascript source code to execute on the device
	 * @return {*} execution result from the host
	 */
	this.eval = function ( code ) {
		return this.send({type:'eval', code:code});
	};

	/**
	 * Wrapper to send one function of js code with arguments to eval on the host
	 * @param {String} method javascript function name (like "encodeURIComponent")
	 * @param {Array} params list of the function arguments
	 * @param {String} [context=window] remote call context
	 * @return {*} execution result from the host
	 */
	this.call = function ( method, params, context ) {
		return this.send({type:'call', method:method, params:params, context:context});
	};

	/**
	 * Wrapper to send a var name to get json
	 * @param {String} name javascript var name to serialize
	 * @return {*} execution result from the host
	 */
	this.json = function ( name ) {
		var data = this.send({type:'json', code:name});
		return data ? JSON.parse(data) : null;
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
