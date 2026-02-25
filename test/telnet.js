var net = require('net');
var track = 0;


ping('123.31.24.16',1230);
// ping('123.31.24.16',2230);
var start;
function ping(ip,port) {
    var client = net.connect(port,ip,function (socket) {
        start = + new Date();
        console.log("connected");
    });
    client.on('data',function (data) {
        console.log(data,data.length,data.readUInt32LE(1));
    });
    client.on('error',function (e) {
        console.log("Connect error ",e);
    });
    client.on('end',function (e) {
        console.log("Connect End ",+ new Date()-start);

    });
}