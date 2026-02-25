var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function TopUserWinResponse (ListUser) {
    return this.AddHeader(Define.TopUserWin , new BinaryBuilder(
        {
            ListUser: ListUser
        },
        Struct.TopUserWinResponse
    ));
}

module.exports = TopUserWinResponse ;
TopUserWinResponse.prototype = new Packet();
