/**
 * Created by quinx on 7/11/2017.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function PlayRoomEffect(EffectID) {
    return this.AddHeader(Define.PlayRoomEffect, new BinaryBuilder(
        {
            EffectID: EffectID
        },
        Struct.PlayRoomEffectResponse
    ));

}
module.exports = PlayRoomEffect ;
PlayRoomEffect.prototype = new Packet();