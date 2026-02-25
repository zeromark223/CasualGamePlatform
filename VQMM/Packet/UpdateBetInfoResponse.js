var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UpdateBetInfoResponse (BetList) {
    return this.AddHeader(Define.UpdateBetInfo , new BinaryBuilder(
        {
            BetList: BetList
        },
        Struct.UpdateBetInfoResponse
    ));
}

module.exports = UpdateBetInfoResponse ;
UpdateBetInfoResponse.prototype = new Packet();
