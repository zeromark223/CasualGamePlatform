var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function DealCardsResponse (StartMatchInfo) {
    return this.AddHeader(Define.DealCards , new BinaryBuilder(
        StartMatchInfo,
        Struct.DealCardsResponse
    ));
}

module.exports = DealCardsResponse ;
DealCardsResponse.prototype = new Packet();
