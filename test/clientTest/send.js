const WebSocket = require('ws');

const ws = new WebSocket('WS://127.0.0.1:2018');

ws.on('open', function open() {
    var header = new Buffer(4);
    header.writeUInt16LE(12345, 2);
    header.writeUInt16LE(4, 0);
    ws.send(header, {binary: true}); // Send to client
});