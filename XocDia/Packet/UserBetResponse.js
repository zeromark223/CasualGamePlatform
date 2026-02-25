var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UserBetResponse (ErrorCode) {
    return this.AddHeader(Define.UserBet , new BinaryBuilder(
        {
            ErrorCode: ErrorCode
        },
        Struct.UserBetResponse
    ));
}

module.exports = UserBetResponse ;
UserBetResponse.prototype = new Packet();
