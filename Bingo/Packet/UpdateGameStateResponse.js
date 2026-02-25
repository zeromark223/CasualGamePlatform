var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UpdateGameStateResponse(GameState, TimeLeft) {
    return this.AddHeader(Define.UpdateGameState, new BinaryBuilder(
        {
            GameState: GameState,
            TimeLeft: TimeLeft
        },
        Struct.UpdateGameStateResponse
    ));
}

module.exports = UpdateGameStateResponse;
UpdateGameStateResponse.prototype = new Packet();
