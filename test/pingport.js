var net = require('net');
var track = 0;
ping('125.212.242.37',5622);

function ping(ip,port) {
    if(track == 1){
        console.log("Connected ");
        return;
    }
    console.log("try to connect ",ip+":"+port);
    var client = net.connect(port,ip,function (socket) {
        console.log("what")
        track = 1;

    });
    client.on('data',function (data) {
        console.log(data,data.length,data.readUInt32LE(1));
        //client.write(data);
    });
    client.on('error',function (e) {
        track = -1;
        console.log("Connect error ");
    });
    setTimeout(function () {
        // ping(ip,port);
    },1000)
}