var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/'));

var candleState = 1;
var androidClient;

// hack for websockets
// github.com/einaros/ws/blob/8743aab3a2454701017d1a72712ddba6de6ffe44/examples/serverstats-express_3/server.js
var server = http.createServer(app);
server.listen(port);

console.log('http server listening on %d', port);

app.get('/arduino', function(req, res) {
  res.set('Content-Type', 'text');
  res.send(''+(candleState == 2 ? 0 : candleState));
});

app.get('/candle_off', function(req, res) {
  candleOff();
  res.end();
});

var androidWss = new WebSocketServer({server: server, path: '/android'});
console.log('websocket server created');
androidWss.on('connection', function(ws) {
  console.log('websocket connection open');

  androidClient = ws;
  sendState();

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

});

function candleOff() {
  console.log("Turning candle off");
  if (candleState == 1) {
    setTimeout(function() {
      candleState = 0;
      sendState();
    }, Math.random() * 1000);
    candleState = 2;
    sendState();
  } else {
    candleState =0;
    sendState();
  }
}

function candleOn() {
  console.log("Turning candle on");
  candleState = 1;
  sendState();
}

function sendState() {
  if (androidClient) {
    androidClient.send(''+candleState);
    console.log("Sending state "+candleState);
  } else {
    console.log("No client!");
  }
}
