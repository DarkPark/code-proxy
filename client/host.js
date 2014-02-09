/**
 * Client-side host part
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 * @author DarkPark
 */

'use strict';

/**
 * @constructor
 * @param {Object} [options] set of initialization parameters (host, port, name)
 */
function ProxyHost ( options ) {
	// prepare
	var name;

	/**
	 * proxy instance configuration
	 * @namespace
	 */
	this.config = {
		/** proxy server address */
		host : '127.0.0.1',

		/** proxy server websocket port */
		port : 8900,

		/** session name */
		name : 'anonymous',

		/** automatically try to restore connection on disconnect */
		reconnect : true,

		/** time between connection attempts (5s) */
		reconnectInterval : 5000
	};

	/**
	 * @type {WebSocket}
	 */
	this.socket = null;

	// validate and iterate input
	if ( options && typeof options === 'object' ) {
		for ( name in options ) {
			// rewrite defaults
			if ( options.hasOwnProperty(name) ) { this.config[name] = options[name]; }
		}
	}

	// try to establish connection
	this.connect();
}


/**
 * Connect to the proxy server
 */
ProxyHost.prototype.connect = function () {
	// prepare
	var self = this;

	// establish the connection
	// there may be some special chars in name
	this.socket = new WebSocket('ws://' + this.config.host + ':' + this.config.port + '/' + encodeURIComponent(this.config.name));

	/**
	 * event hook
	 * @callback
	 */
	this.socket.onopen = function(){
		self.log('core', 0, true, 'connection established');
	};

	/**
	 * event hook
	 * @callback
	 */
	this.socket.onclose = function(){
		self.log('core', 0, false, 'no connection');
		if ( self.config.reconnect ) {
			setTimeout(function () {
				self.connect();
			}, self.config.reconnectInterval);
		}
	};

	/**
	 * message from a desktop browser
	 * @callback
	 */
	this.socket.onmessage = function ( message ) {
		// prepare
		var response = {time:+new Date()},
			request, context;

		// proceed the message
		try {
			request = JSON.parse(message.data || false);
			switch ( request.type ) {
				case 'call':
					context = request.context ? eval(request.context) : window;
					response.data = eval(request.method).apply(context, request.params);
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
		this.send(JSON.stringify(response));

		// detailed report
		self.log(request.type, response.time, !response.error, request.method || request.code, request.params);
	};
};


/**
 * Finish the connection and strop reconnection if any
 */
ProxyHost.prototype.disconnect = function () {
	// stop auto connection
	this.config.reconnect = false;
	this.socket.close();
};


/**
 * Logging wrapper
 * @param {String} type
 * @param {Number} time
 * @param {Boolean} status
 * @param {String} message
 * @param {*} [params]
 */
ProxyHost.prototype.log = function ( type, time, status, message, params ) {
	console.log('%c[%s]\t%c%s\t%c%s\t%c%s\t',
		'color:grey', type,
		'color:purple', this.config.name,
		'color:grey', time,
		'color:' + (status ? 'green' : 'red'), message,
		params || ''
	);
};


// CommonJS modules support
if ( typeof module !== 'undefined' && module.exports ) {
	module.exports = ProxyHost;
}
