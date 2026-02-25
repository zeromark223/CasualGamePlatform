var crypto = require('crypto');//Sys library
var rc4 = require('./rc4');

var debug = false;
// TODO : Đợi webservice chuyển RC4 sang AES, code lại các function sử dụng biến debug.
exports.sha256 = function (str) {
    try {
        var sha256 = crypto.createHash('sha256').update(str).digest('hex');
        return sha256;
    }
    catch (e) {
        return e;
    }

};


exports.aesEncrypt = function (str, key) {

    try {
        var cipher = crypto.createCipher('aes-256-cbc', key);
        var cryptedBuffers = [cipher.update(new Buffer(str))];
        cryptedBuffers.push(cipher.final());
        var crypted = Buffer.concat(cryptedBuffers).toString('hex');
        return crypted;
    }
    catch (e) {
        return e;
    }


};
exports.aesDecrypt = function (str, key, isGame) {

    if (debug || isGame == true) {
        try {
            var dcipher = crypto.createDecipher('aes-256-cbc', key);
            var dcryptedBuffers = [dcipher.update(new Buffer(str, 'hex'))];
            dcryptedBuffers.push(dcipher.final());
            var dcrypted = Buffer.concat(dcryptedBuffers)
                .toString('utf8');
            return dcrypted;
        }
        catch (e) {
            return e;
        }

    }
    else {
        return rc4.decrypt(str, key);
    }


};

exports.md5 = function (str) {
    try {
        return crypto.createHash('md5').update(str).digest('hex');
    }
    catch (e) {
        return e;
    }

};


exports.aesEncryptIV = function (str, key, iv) {
    key = crypto.createHash('md5').update(key).digest("hex");
    iv = crypto.createHash('md5').update(iv).digest("hex").substr(0, 16);
    try {
        var cipher = crypto.createCipheriv('aes-256-cbc', key.toString('binary'), iv.toString('binary'));
        var cryptedBuffers = [cipher.update(new Buffer(str))];
        cryptedBuffers.push(cipher.final());
        var crypted = Buffer.concat(cryptedBuffers).toString('hex');
        return crypted;
    }
    catch (e) {
        return e;
    }
};

exports.aesDecryptIV = function (str, key, iv) {
    key = crypto.createHash('md5').update(key).digest("hex");
    iv = crypto.createHash('md5').update(iv).digest("hex").substr(0, 16);
    try {
        var dcipher = crypto.createDecipheriv('aes-256-cbc', key.toString('binary'), iv.toString('binary'));
        var dcryptedBuffers = [dcipher.update(new Buffer(str, 'hex'))];
        dcryptedBuffers.push(dcipher.final());
        var dcrypted = Buffer.concat(dcryptedBuffers)
            .toString('utf8');
        return dcrypted;
    }
    catch (e) {
        return e;
    }
};
