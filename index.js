/**
 * STB Proxy server node.js part
 * handles all requests between desktop browser (client) and server (stb device)
 * @author DarkPark
 */

'use strict';

// globals
var WebSocketServer = require('ws').Server,
	wsPool = require('./wspool.js'),
	http = require('http'),
	fs = require('fs');

// files allowed to be served
var fileList = ['client.js', 'server.js'];

module.exports = function ( config ) {

	// set defaults connection ports
	config.portHttp = config.portHttp || 8800;
	config.portWs   = config.portWs   || 8900;

	// WebSocket server creation
	var wss = new WebSocketServer({port: config.portWs});
	wss.on('connection', function ( socket ) {
		// new awaiting instance of WebSocket in the pool
		wsPool.add(socket.upgradeReq.url.slice(1), socket);
	});
	wss.on('listening', function () {
		console.log('Proxy server port: %s (WebSocket)', config.portWs);
	});

	// simple http listener
	http.createServer(function ( request, response ) {
		console.log('http\t%s\t%s', request.method, request.url);
		// prepare request query
		var query = request.url.slice(1).split('/');

		switch ( request.method ) {

			// simple serve info/file requests
			case 'GET':
				// first param holds the command name
				switch ( query[0] ) {
					// serving files
					case 'file':
						// one of the allowed files
						if ( fileList.indexOf(query[1]) !== -1 ) {
							response.writeHead(200, {'Content-Type': 'application/javascript; charset=utf-8'});
							response.end(fs.readFileSync(__dirname + '/pub/' + query[1]));
						}
						break;
					// get connection info
					case 'info':
						//var wsItem = wsList.get(query[1]);
						response.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
						response.end(JSON.stringify(wsPool.info(query[1])));
						break;
					// show help page
					default:
						// not valid url or root
						response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
						response.end(fs.readFileSync(__dirname + '/pub/start.html'));
				}
				break;

			// security info call
			case 'OPTIONS':
				// allow cross-origin resource sharing
				response.writeHead(204, {
					'Access-Control-Allow-Origin' : '*',
					'Access-Control-Allow-Methods': 'POST',
					'Access-Control-Allow-Headers': 'Content-Type',
					'Access-Control-Max-Age'      : 100
				});
				response.end();
				break;

			// accept connections from desktop clients
			case 'POST':
				var post = '';
				// append all chunks
				request.on('data', function ( data ) {
					post += data;
				});
				// everything is ready to send to the STB
				request.on('end', function () {
					// prepare
					response.writeHead(200, {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json; charset=utf-8'});
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
