A [Node.js](http://nodejs.org) tools that give the ability to execute JavaScript code in one client browser and to get the results in another.
Based on HTTP (for static files and sync post requests) and WebSocket (for server-host communications) technologies.
Supports [CommonJS](http://www.commonjs.org/) modules and can be used with [Browserify](http://browserify.org/) on the client-side.

Scheme to illustrate base working principles:
![scheme](https://raw.github.com/DarkPark/code-proxy/master/client/scheme.png)

## Installation

`npm install code-proxy`

## Use

Start as a standalone server:

`node server/main.js`

Connect to an existing project:

```js
require('code-proxy')();

// or it's possible to redefine default options
require('code-proxy')({
	portHttp:   8800,
	portWs:     8900,
	retryDelay: 100,
	retryLimit: 30,
	logging:    true
});
```

## Examples

[Host client](http://127.0.0.1:8800/client/host.html) (accepts requests, execute them and send back result of execution):

```html
<script type="text/javascript" src="host.js"></script>
```

```js
// default host/port/session
var proxy = new ProxyHost();

// prepare for guest call
localStorage.setItem('test', 'localStorage test string on the host');

// test func for remote exec
function doSomething ( param ) {
	return 'some host work with "' + param + '" is done';
}
```

[Guest client](http://127.0.0.1:8800/client/guest.html) (send requests to the host):

```html
<script type="text/javascript" src="guest.js"></script>
```

```js
// default host/port/session
var proxy = new ProxyGuest();

// examples
proxy.eval('1+1');
proxy.eval('window.navigator.userAgent');
proxy.json('screen');
proxy.call('localStorage.getItem', ['test'], 'localStorage');
proxy.call('doSomething', ['test data']);
```

Proxy server host/port and session name can be redefined on both host and guest:

```js
var proxy = new ProxyGuest({
	host: '127.0.0.1',
	port: 8800,
	name: 'anonymous'
});
```

Both host and guest proxy instance have `active` boolean flag to determine the current connection to the proxy server status.

ProxyHost has some additional options: `reconnect` and `reconnectInterval` to automatically try to restore connection on disconnect every 5 seconds. It's active be default.
