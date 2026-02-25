var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UserResultResponse (BetList) {
    return this.AddHeader(Define.UserResult , new BinaryBuilder(
        {
            BetList: BetList
        },
        Struct.UserResultResponse
    ));
}

module.exports = UserResultResponse ;
UserResultResponse.prototype = new Packet();
