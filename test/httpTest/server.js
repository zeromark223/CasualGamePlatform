/**
 * Created by Ngoc on 01-02-2019.
 */
var http = require('http');
var server = http.createServer(function (req,res) {
    res.end(req.socket.remoteAddress);
console.log("handle");
    req.on('error',function (err) {
        console.log("error ",err);
    })
});
server.listen(80);
server.on('error',function (fkerr) {
    console.log("fk err ",fkerr);
})