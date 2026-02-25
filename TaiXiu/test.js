// var config = '{"VN":[{"min":"1.52.0.0","max":"1.55.255.255"}]}';
//
// config = JSON.parse(config);
//
// for (var i = 0; i < config.VN.length; i++) {
//     var iprange = config.VN[i];
//     console.log(getIpAllByRange(iprange));
// }
//
// function getIpAllByRange(range) {
//     var min = range.min;
//     var max = range.max;
//     var minOctan = min.split('.');
//     var maxOctan = max.split('.');
//     var list = [];
//
//     for (var i = 0; i < 4; i++) {
//         var obj = getOctan(minOctan[i], maxOctan[i]);
//         list.push(obj);
//     //    console.log("\r\n",list.toString());
//     }
//     for (var i = 0; i < list[0].length; i++) {
//         for (var j = 0; j < list[1].length; j++) {
//
//             for (var k = 0; k < list[2].length; k++) {
//
//                 for (var l = 0; l < list[3].length; l++) {
//                     var ip = list[0][i]+"."+list[1][j]+"."+list[2][k]+"."+list[3][l];
//                     console.log(ip);
//                 }
//             }
//         }
//     }
// }
//
// function getOctan(min, max) {
//     var list = [];
//     for (var i = min; i <= max; i++) {
//         list.push(i);
//     }
//
//     return list;
// }
//

var Net = require('net');

var server = Net.createServer(function (Socket) {
    console.log("connected ");
    Socket.on('data',function (data) {
        console.log("Data : ",Data);
    });
});

server.listen(18754,'0.0.0.0');
server.on('error',function (er) {
    console.log("error ",er);
})
