var Packet = require('../Packet/Packet');
var Define = require('../Packet/Define');
var Struct = require('../Packet/Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function OnlineAward_GetAwardResponse(NextTime, MoneyAward, ErrorCode,AwardID) {
    return this.AddHeader(Define.OnlineAward_Get, new BinaryBuilder(
        {
            NextTime: NextTime,
            MoneyAward: MoneyAward,
            ErrorCode: ErrorCode,
            AwardID: AwardID
        },
        Struct.OnlineAward_Get
    ));
}

module.exports = OnlineAward_GetAwardResponse;
OnlineAward_GetAwardResponse.prototype = new Packet();