/**
 * Created by ngocnpt on 03-May-17.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function MissionListResponse(List) {

    return this.AddHeader(Define.MissionList, new BinaryBuilder(
        {
            List: List
        },
        Struct.MissionListResponse
    ));

}

module.exports = MissionListResponse;
MissionListResponse.prototype = new Packet();
