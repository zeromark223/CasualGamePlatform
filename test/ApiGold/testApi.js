var encryption = require('../../SharedModule/encrytion');
var http = require('http');
var key = {
    GMApiKey: 'nKtbqbo11GHk1Hl',
    GMApiIV: 'TzmN5Aw6q0i9iqL'
};
var hostname = "123.31.24.16";
var port = "8999";
var path = "/api";

var obj = {
    cmd: "gold",
    action: "update",
    AccountID: "iPIB5R8QE3peZ5x",
    MoneyUpdate: "100000",
    Desc: "ngoc test"
};

postToUrl();

function encryptData(obj) {
    var str = JSON.stringify(obj);
    return encryption.aesEncryptIV(str, key.GMApiKey, key.GMApiIV);
}

function postToUrl() {
    var params = encryptData(obj);

    const options = {
        hostname: hostname,
        port: port,
        path: path,
        method: 'POST'
    };

    const req = http.request(options, function (res) {
        res.setEncoding('utf8');
        var body = '';
        res.on('data', function (d) {
            body += d;
        });
        res.on('end', function () {
            console.log("Post succ " + body);

        });
    });

    req.on('error', function (e) {
        console.log("post failed: " + e);
    });

    req.write(params);
    req.end();
};