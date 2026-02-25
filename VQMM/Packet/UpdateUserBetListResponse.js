var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UpdateUserBetListResponse(BetList) {
    return this.AddHeader(Define.UpdateUserBetList, new BinaryBuilder(
        {
            BetList:BetList
        },
        Struct.UpdateUserBetListResponse
    ));
}

module.exports = UpdateUserBetListResponse;
UpdateUserBetListResponse.prototype = new Packet();
