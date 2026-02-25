var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function MatchHistoryResponse (Result) {
    return this.AddHeader(Define.MatchHistory , new BinaryBuilder(
        {
            Result: Result
        },
        Struct.MatchHistoryResponse
    ));
}

module.exports = MatchHistoryResponse ;
MatchHistoryResponse.prototype = new Packet();
