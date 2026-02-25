/**
 * Created by tainm on 7/11/2016.
 */

var Parser = require('binary-parser').Parser;

function LoginRequest(buf) {
    this.Buf = buf;
};

module.exports = LoginRequest;

LoginRequest.prototype.get = function () {
   var truct = new Parser()
        .endianess('little')
        .uint32('uRoomVer')
        .array('szName', {
            type: 'uint8',
            length: 64
        })
        .array('TML_SN', {
            type: 'uint8',
            length: 128
        })
        .array('szMD5Pass', {
            type: 'uint8',
            length: 52
        })
        .array('szMathineCode', {
            type: 'uint8',
            length: 64
        })
        .array('szCPUID', {
            type: 'uint8',
            length: 24
        })
        .array('szHardID', {
            type: 'uint8',
            length: 24
        })
        .array('szIDcardNo', {
            type: 'uint8',
            length: 64
        })
        .array('szMobileVCode', {
            type: 'uint8',
            length: 8
        })
        .int32('gsqPs')
        .int32('iUserID')
        .array('szIMEI', {
            type: 'uint8',
            length: 128
        })
        .int8('byPlatfromID')
        .int8('byteDu1')
        .int8('byteDu2')
        .int8('byteDu3')
        .int32('iOpenProviderID')
        .array('szOpenUserID', {
            type: 'uint8',
            length: 256
        });

    return truct.parse(this.Buf);
};
