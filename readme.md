A [Node.js](http://nodejs.org) tools that gives the ability to execute JavaScript code in one client browser and get the results in another.

## Installation

`npm install code-proxy`

## Use

Start as a standalone server:

`node server/main.js`

Connect to an existing project:

```javascript
require('code-proxy')();

// or it's possible to redefine some options

require('code-proxy')({
	portHttp : 8800,
	portWs   : 8900,
	logging  : true
});
```

## Client-side examples

Host browser (accepts requests, execute them and send back result of execution):

```html
<script type="text/javascript" src="host.js"></script>
```

```javascript
var proxy = new ProxyHost();
// default host/port/session
proxy.init();
```

Guest browser (send requests to the host):

```html
<script type="text/javascript" src="guest.js"></script>
```

```javascript
var proxy = new ProxyGuest();
// default host/port/session
proxy.init();

// examples
proxy.eval('1+1');
proxy.eval('window.navigator.userAgent');
proxy.json('screen');
proxy.call('localStorage.getItem', ['test'], 'localStorage');
```

Proxy server host/port and session name can be redefined on both host and guest:

```javascript
proxy.init({
	host : '127.0.0.1',
	port : 8800,
	name : 'anonymous'
});
```
