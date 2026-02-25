/**
 * Created by quinx on 7/11/2017.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function StopRoomEffect(EffectID) {
    return this.AddHeader(Define.StopRoomEffect, new BinaryBuilder(
        {
            EffectID: EffectID
        },
        Struct.StopRoomEffectResponse
    ));

}
module.exports = StopRoomEffect ;
StopRoomEffect.prototype = new Packet();