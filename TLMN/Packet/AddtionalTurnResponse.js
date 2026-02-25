var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function AddtionalTurnResponse (Time) {
    return this.AddHeader(Define.AdditionalTurn , new BinaryBuilder(
        {Time: Time},
        Struct.AdditionalTurnResponse
    ));
}

module.exports = AddtionalTurnResponse ;
AddtionalTurnResponse.prototype = new Packet();
