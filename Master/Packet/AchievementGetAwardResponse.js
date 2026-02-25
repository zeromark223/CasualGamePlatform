/**
 * Created by ngocnpt on 03-May-17.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function AchievementGetAwardResponse(IsError,ID) {

    return this.AddHeader(Define.AchievementGetAward, new BinaryBuilder(
        {
            ID:ID,
            IsError:IsError
        },
        Struct.AchievementGetAwardResponse
    ));

}

module.exports = AchievementGetAwardResponse;
AchievementGetAwardResponse.prototype = new Packet();
