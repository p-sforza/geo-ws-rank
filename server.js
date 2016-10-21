var WebSocketServer = require('websocket').server;
var WebSocketClient = require('websocket').client;

var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(200);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  return true;
}

//New connection handling
requestRegister = [ ];

function notify() {
	var countryCode = Math.round(Math.random() * 0x64);
	//var countryColor = "#24179E"; // Country in blue
 	var countryColor = "#f00"; // Country in red!
	var delay       = Math.round((Math.random() * 2) + 2)*1000;
	var saleValue   = Math.round((Math.random() * 1000) + 1);
	var sales       = [];
	
	sales.push ({
        "cc": countryCode.toString(),
        "countryColor": countryColor,
        "value": saleValue.toString()
    });
	console.log((new Date()) + ' Object: ' + JSON.stringify(sales));
	
	for(c in requestRegister) 
		//requestRegister[c].send(sales.toString());
	    requestRegister[c].send(JSON.stringify(sales));
        //console.log((new Date()) + ' Server Send: ' + countryCode.toString());
        //console.log((new Date()) + ' Server Send: ' + JSON.parse(JSON.stringify(sales)));
        //Introduce a rand delay
	    setTimeout(notify, delay);
}
//notify();
 
wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');

    requestRegister.push(connection);

    connection.on('close', function(reasonCode, description) {
    	requestRegister = [ ];
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

// CLient implementation
var url = "ws://geo-ws-rand.demo-websocket.svc:8080";
var client;
var salesRegister = {};

var buildWsClient = function(){
	client = new WebSocketClient();
    console.log ('New ws client built!');
    client.on('connectFailed', function(error) {
        console.log('Connect Error: ' + error.toString());
        setTimeout(function(){buildWsClient()}, 5000);
    });
    client.on('connect', function(connection) {
        console.log('WebSocket Client Connected');
        connection.on('error', function(error) {
            console.log("Connection Error: " + error.toString());
            setTimeout(function(){buildWsClient()}, 5000);
        });
        connection.on('close', function() {
            console.log('echo-protocol Connection Closed');
            setTimeout(function(){buildWsClient()}, 5000);
        });
        connection.on('message', function(message) {
            if (message.type === 'utf8') {
                console.log("Received: '" + message.utf8Data + "'");
                messageJson     = JSON.parse(message.utf8Data);
                var countryCode = messageJson[0]["cc"];
                var saleValue   = messageJson[0]["value"];
                var prevIncome  = salesRegister.countryCode; 
                salesRegister[countryCode] = prevIncome + saleValue;

                console.log("Sales Register: " + JSON.stringify(salesRegister));
            }
        });
    });
    client.connect(url, 'echo-protocol');
    return client;
}

buildWsClient();
//client.connect(url, 'echo-protocol');



	
	
	