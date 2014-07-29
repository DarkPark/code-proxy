/**
 * Main server configuration
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 * @author DarkPark
 */

'use strict';

module.exports = {
	/**
	 * Enables proxy server
	 * @type {boolean}
	 */
	active: true,

	/**
	 * Listening HTTP port to serve proxy files
	 * @type {number}
	 */
	portHttp: 8800,

	/**
	 * Listening WebSocket port to serve requests
	 * @type {number}
	 */
	portWs: 8900,

	/**
	 * Time between connection/sending attempts (in ms)
	 * @type {number}
	 */
	retryDelay: 100,

	/**
	 * Amount of connection/sending attempts before give up
	 * @type {number}
	 */
	retryLimit: 30,

	/**
	 * Full logging
	 * @type {boolean}
	 */
	logging: false
};
