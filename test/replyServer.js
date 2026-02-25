/**
 * Created by ngocnpt on 03-07-2017.
 */
var Net = require('net');

var ServerSock = Net.createServer(ServerHandle);
ServerSock.listen(9998);
var count = 0;
function ServerHandle(SocketServer) {
    SocketServer.on('error', function (err) {
        console.log("Server Err ",err);
        closeSock(SocketServer);
    });
    SocketServer.on('end', function () {
        console.log("Server End");
        closeSock(SocketServer);
    });

    var ClientSock = new Net.Socket();

    ClientSock.connect({host: 'ngoc.player.vn', port: 3389}, function () {
        ClientSock.refer = SocketServer;
        SocketServer.refer = ClientSock;
    });
    ClientSock.on('error', function (err) {
        console.log("Client Error ", err)
        closeSock(ClientSock);
    });
    ClientSock.on('end', function () {
        console.log("ClientSock End");
        closeSock(ClientSock);
    });

    ClientSock.on('data', function (data) {
        SocketServer.write(data);
    });
    SocketServer.on('data', function (data) {
        ClientSock.write(data)
    });



    function closeSock(sk) {
        if(sk.__isDestroyed)return;
        sk.__isDestroyed = true;
        sk.end();
        sk.destroy();
		if(typeof sk.refer == 'undefined' )return;
        sk.refer.end();
        sk.refer.destroy();
    }

}




