var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UpdateTurnResponse (CurrentTurn, CountDown) {
    return this.AddHeader(Define.UpdateTurn , new BinaryBuilder(
        {
            CurrentTurn: CurrentTurn,
            CountDown: CountDown
        },
        Struct.UpdateTurnResponse
    ));
}

module.exports = UpdateTurnResponse ;
UpdateTurnResponse.prototype = new Packet();
