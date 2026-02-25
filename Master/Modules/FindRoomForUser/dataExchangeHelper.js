/**
 * Created by Ngoc on 01-02-2019.
 */
var http = require('http');
var encryption = require('../../../SharedModule/encrytion');
exports.requestUrl = function (url, cb) {
    var flag = 1;
    var req = http.get(url, function (res) {
        var statusCode = res.statusCode;
        var error = 0;
        if (statusCode !== 200) {
            error = 'Request Failed' + 'Status Code: ' + statusCode;
        }
        if (error) {
            endRequest(1, error);
            res.abort();
            return;
        }
        var rawData = '';
        res.on('data', function (chunk) {
            rawData += chunk;
        });
        res.on('end', function () {
            endRequest(0, rawData);
        });
    });
    req.on('error', function (e) {
        endRequest(1, e.stack);
    });
    req.setTimeout(3000, function () {
        endRequest(1,'Timeout');
        req.abort();
    });
    function endRequest(err, data) {
        if (flag) {
            flag = 0;
            cb(err, data);
        }
    }
};
exports.sendData = function (url,obj,key,iv,cb) {
    var str = this.encryptData(obj,key,iv);
    this.requestUrl(url+str,cb);
};
exports.encryptData  = function (obj,key,iv) {
    var str = JSON.stringify(obj);
    str = encryption.aesEncryptIV(str,key,iv);
    return str;
};
exports.decryptData  = function (str,key,iv) {
    var obj = encryption.aesDecryptIV(str,key,iv);
    try{
        obj = JSON.parse(obj);
    }catch (e){

    }
    return obj;
};