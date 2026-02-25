var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function GetGameStateResponse(GetGameStateObject) {
    return this.AddHeader(Define.GetGameState, new BinaryBuilder(
        GetGameStateObject,
        Struct.GetGameStateResponse
    ));
}

module.exports = GetGameStateResponse;
GetGameStateResponse.prototype = new Packet();
