var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UserHistoryResponse (History) {
    return this.AddHeader(Define.UserHistory , new BinaryBuilder(
        {
            History: History
        },
        Struct.UserHistoryResponse
    ));
}

module.exports = UserHistoryResponse ;
UserHistoryResponse.prototype = new Packet();
