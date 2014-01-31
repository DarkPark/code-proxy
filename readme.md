A [Node.js](http://nodejs.org) tools that gives the ability to execute JavaScript code in one client browser and get the results in another.

## Installation

`npm install commander`

## Configuration

Host browser:

```html
<script type="text/javascript" src="http://127.0.0.1:8800/client/host.js"></script>
```

```javascript
var proxy = new ProxyHost();
proxy.init();
```

Guest browser:

```html
<script type="text/javascript" src="http://127.0.0.1:8800/client/guest.js"></script>
```

```javascript
var proxy = new ProxyGuest();
proxy.init();
proxy.eval('1+1');
```
