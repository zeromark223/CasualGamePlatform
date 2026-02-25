var Packet = require('../Packet/Packet');
var Define = require('../Packet/Define');
var Struct = require('../Packet/Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function DailyAward_GetAwardResponse(MoneyAward,ErrorCode,AwardID) {
    return this.AddHeader(Define.DailyAward_Get, new BinaryBuilder(
        {
            MoneyAward: MoneyAward,
            ErrorCode:ErrorCode,
            AwardID:AwardID
        },
        Struct.DailyAward_Get
    ));
}

module.exports = DailyAward_GetAwardResponse;
DailyAward_GetAwardResponse.prototype = new Packet();