/**
 * WebSocket pool.
 * Wraps all the work with ws instances.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

var log = require('./logger').ws,
	// named WebSocket list
	pool = {};


// exports the wrapper object
module.exports = {
	/**
	 * New WebSocket creation.
	 *
	 * @param {String} name unique identifier for session
	 * @param {Object} socket websocket resource
	 * @return {Boolean} true if was deleted successfully
	 */
	add: function ( name, socket ) {
		var self = this;

		// check input
		if ( name && socket ) {
			log('ws', 'init', name, 'connection');

			// main data structure
			pool[name] = {
				socket: socket,
				time: +new Date(),
				count: 0,
				active: true
			};

			// disable link on close
			pool[name].socket.on('close', function () {
				self.remove(name);
			});

			// await for an answer
			pool[name].socket.on('message', function ( message ) {
				// has link to talk back
				if ( pool[name].response ) {
					log('ws', 'get', name, message);
					pool[name].response.end(message);
				}
			});
			return true;
		}

		// failure
		log('ws', 'init', name, 'fail to connect (wrong name or link)');
		return false;
	},

	/**
	 * Clear resources on WebSocket deletion.
	 *
	 * @param {String} name session name
	 * @return {Boolean} true if was deleted successfully
	 */
	remove: function ( name ) {
		// valid connection
		if ( name in pool ) {
			log('ws', 'exit', name, 'close');
			return delete pool[name];
		}

		// failure
		log('ws', 'del', name, 'fail to remove (invalid connection)');
		return false;
	},

	/**
	 * Detailed information of the named WebSocket instance.
	 *
	 * @param {String} name session name
	 *
	 * @return {{active:Boolean, count:Number}|{active:Boolean}} info
	 */
	info: function ( name ) {
		// valid connection
		if ( name in pool ) {
			return {
				active: pool[name].active,
				count:  pool[name].count
			};
		}

		// failure
		return {active: false};
	},

	/**
	 * Forward the request to the given session.
	 *
	 * @param {String} name session name
	 * @param {String} data post data from guest to host
	 * @param {ServerResponse} response link to HTTP response object to send back data
	 */
	send: function ( name, data, response ) {
		log('ws', 'send', name, data);
		// store link to talk back when ready
		pool[name].response = response;
		// actual post
		pool[name].socket.send(data);
		pool[name].count++;
	}
};
