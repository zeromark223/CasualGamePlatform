var crypto = require('crypto');//Sys library

exports.aesEncryptIV = function(binary, key, iv) {
    key = crypto.createHash('md5').update(key).digest("hex");
    iv = crypto.createHash('md5').update(iv).digest("hex").substr(0,16);
    try {
        var cipher = crypto.createCipheriv('aes-256-cbc', key.toString('binary'), iv.toString('binary'));
        var cryptedBuffers = [cipher.update(binary)];
        cryptedBuffers.push(cipher.final());
        return Buffer.concat(cryptedBuffers);
    }
    catch (e)
    {
        return e;
    }
};

exports.aesDecryptIV = function(binary, key, iv) {
    key = crypto.createHash('md5').update(key).digest("hex");
    iv = crypto.createHash('md5').update(iv).digest("hex").substr(0,16);
    try
    {

        var dcipher = crypto.createDecipheriv('aes-256-cbc', key.toString('binary'), iv.toString('binary'));
        var dcryptedBuffers = [dcipher.update(binary)];
        dcryptedBuffers.push(dcipher.final());
        return Buffer.concat(dcryptedBuffers);
    }
    catch(e)
    {
        return e;
    }
};


exports.makeAuth = function(str, key, iv) {
    key = crypto.createHash('md5').update(key).digest("hex");
    iv = crypto.createHash('md5').update(iv).digest("hex").substr(0,16);

    if(iv.length!=16){
        iv = make16Key(key);
    }
    try {
        var cipher = crypto.createCipheriv('aes-256-cbc', key.toString('binary'), iv.toString('binary'));
        var cryptedBuffers = [cipher.update(new Buffer(str))];
        cryptedBuffers.push(cipher.final());
        var crypted = Buffer.concat(cryptedBuffers).toString('base64');
        return crypted;
    }
    catch (e)
    {
        return e;
    }
};

exports.deAuth = function(str, key, iv) {
    key = crypto.createHash('md5').update(key).digest("hex");
    iv = crypto.createHash('md5').update(iv).digest("hex").substr(0,16);
    try
    {

        var dcipher = crypto.createDecipheriv('aes-256-cbc', key.toString('binary'), iv.toString('binary'));
        var dcryptedBuffers = [dcipher.update(new Buffer(str,'base64'))];
        dcryptedBuffers.push(dcipher.final());
        var dcrypted = Buffer.concat(dcryptedBuffers)
            .toString('utf8');
        return dcrypted;
    }
    catch(e)
    {
        return e;
    }
};