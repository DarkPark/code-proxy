A [Node.js](http://nodejs.org) tools that gives the ability to execute JavaScript code in one client browser and get the results in another.

Scheme to illustrate base principles of working:
![scheme](https://raw.github.com/DarkPark/code-proxy/master/client/scheme.png)

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

## Examples

[Host client](http://127.0.0.1:8800/client/host.html) (accepts requests, execute them and send back result of execution):

```html
<script type="text/javascript" src="host.js"></script>
```

```javascript
var proxy = new ProxyHost();
// default host/port/session
proxy.init();
```

[Guest client](http://127.0.0.1:8800/client/guest.html) (send requests to the host):

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
