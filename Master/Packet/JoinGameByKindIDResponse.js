/**
 * Created by ngocnpt on 03-May-17.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function JoinGameByKindIDResponse(IsError,KindID,LevelLimit,GoldLimit,Server,Token) {
    return this.AddHeader(Define.JoinGameByKindID, new BinaryBuilder(
        {
            IsError:IsError,
            KindID:KindID,
            GoldLimit:GoldLimit,
            LevelLimit:LevelLimit,
            Server:Server,
            Token:Token
        },
        Struct.JoinGameByKindIDResponse
    ));

}

module.exports = JoinGameByKindIDResponse;
JoinGameByKindIDResponse.prototype = new Packet();
