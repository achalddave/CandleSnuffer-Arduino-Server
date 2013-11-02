var WebSocketServer = require('ws').Server
  , http = require('http')
  , express = require('express')
  , app = express()
  , port = process.env.PORT || 5000;

app.use(express.static(__dirname + '/'));

// off
var candleState = 0;

var server = http.createServer(app);
server.listen(port);

console.log('http server listening on %d', port);

var android_wss = new WebSocketServer({server: server, path: '/android'});
console.log('websocket server created');
android_wss.on('connection', function(ws) {
  var id = setInterval(function() {
    ws.send(''+candleState);
  }, 1000);

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
        console.log("Dunno what do, received message:", message);
        break;
    }
    console.log(message);
  });

  ws.on('close', function() {
    console.log('websocket connection close');
    clearInterval(id);
  });
});

function candleOff() {
  console.log("Turning candle off");
  if (candleState == 1) {
    // send candle off signal to hardware
  }
  candleState = 0;
}

function candleOn() {
  console.log("Turning candle on");
  if (candleState == 0) {
    // send candle on signal to hardware
  }
  candleState = 1;
}
