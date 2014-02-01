/**
 * Proxy server node.js part
 * handles all requests between desktop browser (client) and server (stb device)
 * @license GNU GENERAL PUBLIC LICENSE Version 3
 * @author DarkPark
 */

'use strict';

var ws     = require('ws'),
	http   = require('http'),
	wsPool = require('./wspool'),
	config = require('./config');

/**
 * Start HTTP and WebSocket servers
 * @param {Object} [options] ports to overwrite defaults
 */
module.exports = function ( options ) {
	var file = new (require('node-static').Server)({cache:0}),
		wss, name;

	// validate and iterate input
	if ( options ) {
		for ( name in options ) {
			// rewrite defaults
			if ( options.hasOwnProperty(name) ) { config[name] = options[name]; }
		}
	}

	// WebSocket server creation
	wss = new ws.Server({port: config.portWs});
	// push to the client list
	wss.on('connection', function ( socket ) {
		// new awaiting instance of WebSocket in the pool
		wsPool.add(socket.upgradeReq.url.slice(1), socket);
	});
	// report
	wss.on('listening', function () {
		console.log('Proxy server port: %s (WebSocket)', config.portWs);
	});

	// simple http listener
	http.createServer(function ( request, response ) {
		// prepare request query
		var post, query = request.url.slice(1).split('/');

		console.log('http\t%s\t%s', request.method, request.url);

		switch ( request.method ) {

			// simple serve info/file requests
			case 'GET':
				// first param holds the command name
				switch ( query[0] ) {
					// serving static files
					case 'client':
						file.serve(request, response, function ( error ) {
							if ( error ) {
								console.log(error);
								file.serveFile('client/index.html', 404, {}, request, response);
							}
						});
						break;
					// get connection info
					case 'info':
						response.writeHead(200, {
							'Access-Control-Allow-Origin': '*',
							'Content-Type': 'application/json; charset=utf-8'
						});
						response.end(JSON.stringify(wsPool.info(query[1])));
						break;
				}
				break;

			// security info call
			case 'OPTIONS':
				// allow cross-origin resource sharing
				response.writeHead(204, {
					'Access-Control-Allow-Origin' : '*',
					'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
					'Access-Control-Max-Age'      : 100
				});
				response.end();
				break;

			// accept connections from desktop clients
			case 'POST':
				post = '';

				// append all chunks
				request.on('data', function ( data ) {
					post += data;
				});

				// everything is ready to send to host
				request.on('end', function () {
					// prepare
					response.writeHead(200, {
						'Access-Control-Allow-Origin': '*',
						'Content-Type': 'application/json; charset=utf-8'
					});
					// make a call
					if ( !wsPool.send(query[0], post, response) ) {
						// no available connections so close
						response.end(JSON.stringify({error: 'no connections'}));
					}
				});
				break;

			default:
				response.end('wrong request!');
		}

	}).listen(config.portHttp).on('listening', function () {
		console.log('Proxy server port: %s (HTTP)', config.portHttp);
	});
};


// direct execution
if ( require.main === module ) {
	module.exports();
}
