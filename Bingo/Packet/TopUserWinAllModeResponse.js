var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function TopUserWinAllModeResponse(ListUser) {
    return this.AddHeader(Define.TopUserWinAllMode, new BinaryBuilder(
        {
            ListUser: ListUser
        },
        Struct.TopUserWinAllModeResponse
    ));
}

module.exports = TopUserWinAllModeResponse;
TopUserWinAllModeResponse.prototype = new Packet();
