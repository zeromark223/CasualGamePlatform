var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function EndMatchResponse (PlayerList, EffectTime) {
    return this.AddHeader(Define.EndMatch , new BinaryBuilder(
        {
            PlayerList: PlayerList,
            EffectTime: EffectTime
        },
        Struct.EndMatchResponse
    ));
}

module.exports = EndMatchResponse ;
EndMatchResponse.prototype = new Packet();
