var Packet = require('../Packet/Packet');
var Define = require('../Packet/Define');
var Struct = require('../Packet/Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function GetMasterConfigResponse(DailyLoginConfig,OnlineAwardConfig) {
    return this.AddHeader(Define.GetMasterConfig, new BinaryBuilder(
        {
            DailyLoginConfig:DailyLoginConfig,
            OnlineAwardConfig:OnlineAwardConfig
        },
        Struct.GetMasterConfigResponse
    ));
}
module.exports = GetMasterConfigResponse;
GetMasterConfigResponse.prototype = new Packet();

