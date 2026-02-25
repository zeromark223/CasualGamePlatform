var http = require('http');
var server = http.createServer(handle);
server.listen(12345);

function handle(req,res) {
    console.log(req.url);
    res.end(req.url);
}