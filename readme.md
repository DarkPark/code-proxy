A [Node.js](http://nodejs.org) tools that gives the ability to execute JavaScript code in one client browser and get the results in another.

## Installation and use

`npm install code-proxy`

Standalone server:

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

Host browser:

```html
<script type="text/javascript" src="host.js"></script>
```

```javascript
var proxy = new ProxyHost();
// default host/port/session
proxy.init();
```

Guest browser:

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
