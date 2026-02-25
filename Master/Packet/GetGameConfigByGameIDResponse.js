var Packet = require('../Packet/Packet');
var Define = require('../Packet/Define');
var Struct = require('../Packet/Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function GetGameConfigByGameIDResponse(GameID,GameConfig) {
    return this.AddHeader(Define.GetGameConfigByGameID, new BinaryBuilder(
        {
            GameID:GameID,
            Config:GameConfig
        },
        Struct.GetGameConfigByGameIDResponse
    ));
}
module.exports = GetGameConfigByGameIDResponse;
GetGameConfigByGameIDResponse.prototype = new Packet();

