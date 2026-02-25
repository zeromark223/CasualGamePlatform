var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function PreGameResponse (PreGameInfo) {
    return this.AddHeader(Define.PreGame , new BinaryBuilder(
        PreGameInfo,
        Struct.PreGameResponse
    ));
}

module.exports = PreGameResponse ;
PreGameResponse.prototype = new Packet();
