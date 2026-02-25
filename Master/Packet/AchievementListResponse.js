/**
 * Created by ngocnpt on 03-May-17.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function AchievementListResponse(List) {

    return this.AddHeader(Define.AchievementList, new BinaryBuilder(
        {
            List: List
        },
        Struct.AchievementListResponse
    ));

}

module.exports = AchievementListResponse;
AchievementListResponse.prototype = new Packet();
