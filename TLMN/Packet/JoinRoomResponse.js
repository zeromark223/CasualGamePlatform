var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function JoinRoomResponse (UserArray, DeskID, GoldBet) {
    return this.AddHeader(Define.JoinRoom , new BinaryBuilder(
        {
            UserArray: UserArray,
            DeskID: DeskID,
            GoldBet: GoldBet
        },
        Struct.JoinRoomResponse
    ));
}

module.exports = JoinRoomResponse ;
JoinRoomResponse.prototype = new Packet();
