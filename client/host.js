/**
 * Host client side
 * @constructor
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 * @author DarkPark
 */
function ProxyHost () {

	'use strict';

	/**
	 * proxy instance configuration
	 * @namespace
	 */
	var config = {
		/** node.js server address */
		host : '127.0.0.1',

		/** websocket server port */
		port : 8900,

		/** session name */
		name : 'anonymous'
	};

	/**
	 * Prepares the connection
	 * @param {Object} options set of initialization parameters (host, port, name)
	 */
	this.init = function ( options ) {
		var self = this,
			name;

		// validate and iterate input
		if ( options ) {
			for ( name in options ) {
				// rewrite defaults
				if ( options.hasOwnProperty(name) ) { config[name] = options[name]; }
			}
		}

		// there may be some special chars
		name = encodeURIComponent(config.name);

		// establish the connection
		config.socket = new WebSocket('ws://' + config.host + ':' + config.port + '/' + name);

		// event hook
		config.socket.onopen = function(){
			self.log('core', 0, true, 'open connection');
		};

		// event hook
		config.socket.onclose = function(){
			self.log('core', 0, true, 'close connection');
		};

		// message from a desktop browser
		config.socket.onmessage = function ( message ) {
			// prepare
			var response = {time:+new Date()},
				request;

			// proceed the message
			try {
				request = JSON.parse(message.data || false);
				switch ( request.type ) {
					case 'call':
						response.data = eval(request.method).apply(window, request.params);
						break;
					case 'eval':
						response.data = eval(request.code);
						break;
					case 'json':
						response.data = JSON.stringify(eval(request.code));
						break;
					default:
						response.error = 'invalid incoming request';
				}
			} catch ( e ) {
				response.error = e.toString();
			}

			// time taken
			response.time = +new Date() - response.time;
			// wrap and send back
			config.socket.send(JSON.stringify(response));

			// detailed report
			self.log(request.type, response.time, !response.error, request.method || request.code, request.params);
		};
	};

	/**
	 * Logging wrapper
	 * @param {String} type
	 * @param {Number} time
	 * @param {Boolean} status
	 * @param {String} message
	 * @param {*} [params]
	 */
	this.log = function ( type, time, status, message, params ) {
		console.log('%c[%s]\t%c%s\t%c%s\t%c%s\t',
			'color:grey', type,
			'color:purple', config.name,
			'color:grey', time,
			'color:' + (status ? 'green' : 'red'), message,
			params || ''
		);
	};

	/**
	 * Finish the connection
	 */
	this.close = function () {
		config.socket.close();
	};
}
