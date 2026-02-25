/**
 * Created by ngocnpt on 03-07-2017.
 */
var Net = require('net');
var ws = require('../node_modules/ws');
var client = require('../node_modules/websocket').client;
var port = 9998;
var ServerSock = new WebSocket.Server({
    port: port,
    perMessageDeflate: false
}, function (err) {
    console.log("err ",err);
}.bind(this));
ServerSock.on('connection', ServerHandle);//Bind This vs IsWSS
var count = 0;

function ServerHandle(SocketServer) {
    SocketServer.on('error', function (err) {
        console.log("Server Err ", err);
        closeSock(SocketServer);
    });
    SocketServer.on('end', function () {
        console.log("Server End");
        closeSock(SocketServer);
    });

    var ClientSock = client.connect('ws://127.0.0.1:'+port);
    ClientSock.on('connection',function () {
        ClientSock.refer = SocketServer;
        SocketServer.refer = ClientSock;
    });
    ClientSock.on('error', function (err) {
        console.log("Client Error ", err);
        closeSock(ClientSock);
    });
    ClientSock.on('end', function () {
        console.log("ClientSock End");
        closeSock(ClientSock);
    });

    ClientSock.on('data', function (data) {
        SocketServer.send(data, {binary: true});
    });
    SocketServer.on('data', function (data) {
        ClientSock.send(data, {binary: true});
    });


    function closeSock(sk) {
        if (sk.__isDestroyed) return;
        sk.__isDestroyed = true;
        sk.close();
        if (typeof sk.refer == 'undefined') return;
        sk.refer.close();
    }

}




