var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function TopUserWinResponse (TopUser) {
    return this.AddHeader(Define.TopUserWin , new BinaryBuilder(
        {
            TopUser: TopUser
        },
        Struct.TopUserWinResponse
    ));
}

module.exports = TopUserWinResponse ;
TopUserWinResponse.prototype = new Packet();
