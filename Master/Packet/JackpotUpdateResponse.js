/**
 * Created by ngocnpt on 03-May-17.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function JackpotUpdateResponse(GameID, KindID, JackpotValue) {
    return this.AddHeader(Define.JackpotUpdate, new BinaryBuilder(
        {
            GameID: GameID,
            KindID: KindID,
            JackpotValue: JackpotValue
        },
        Struct.JackpotUpdateResponse
    ));
}

module.exports = JackpotUpdateResponse;
JackpotUpdateResponse.prototype = new Packet();
