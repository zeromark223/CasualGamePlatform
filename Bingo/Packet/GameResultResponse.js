//
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function GameResultResponse(Data) {
    return this.AddHeader(Define.GameResultResponse, new BinaryBuilder(
        {
            WinGold: Data.WinGold,
            MaxBingo: Data.MaxBingo,
            TotalChecked: Data.TotalChecked
        },
        Struct.GameResultResponse
    ));
}

module.exports = GameResultResponse;
GameResultResponse.prototype = new Packet();
