var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UpdateTreasureResponse (Treasure) {
    return this.AddHeader(Define.UpdateTreasure , new BinaryBuilder(
        {
            Treasure: Treasure
        },
        Struct.UpdateTreasureResponse
    ));
}

module.exports = UpdateTreasureResponse ;
UpdateTreasureResponse.prototype = new Packet();
