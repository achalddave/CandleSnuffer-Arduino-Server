var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/'));

var candleState = 1;
var androidClient;

var server = http.createServer(app);
server.listen(port);

console.log('http server listening on %d', port);

var androidWss = new WebSocketServer({server: server, path: '/android'});
console.log('websocket server created');
androidWss.on('connection', function(ws) {
  console.log('websocket connection open');

  ws.on('message', function(message) {
    switch (Number(message)) {
      case 0:
        candleOff();
        break;
      case 1:
        candleOn();
        break;
      default:
        ws.send("Received unrecognized message:", message);
        break;
    }
  });

  ws.on('close', function() {
    console.log('websocket connection close');
  });

  androidClient = ws;
  sendState();
});

function candleOff() {
  console.log("Turning candle off");
  setTimeout(function() {
    candleState = 0;
    sendState();
  }, 2000);
  candleState = 2;
  sendState();
}

function candleOn() {
  console.log("Turning candle on");
  candleState = 1;
  sendState();
}

function sendState() {
  if (androidClient) {
    androidClient.send(''+candleState);
    console.log("Sending state"+candleState);
  } else {
    console.log("No client!");
  }
}
