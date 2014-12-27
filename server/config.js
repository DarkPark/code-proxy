/**
 * Main server configuration.
 *
 * @author DarkPark
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 */

'use strict';

module.exports = {
	// listening HTTP port to serve proxy files
	portHttp: 8800,

	// listening WebSocket port to serve requests
	portWs: 8900,

	// time between connection/sending attempts (in ms)
	retryDelay: 100,

	// amount of connection/sending attempts before give up
	retryLimit: 30,

	// full logging
	logging: true,

	// session name
	name: 'anonymous'
};
