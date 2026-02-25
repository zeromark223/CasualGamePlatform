/**
 * Created by ngocnpt on 03-May-17.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function MissionGetAwardResponse(IsError,ID) {

    return this.AddHeader(Define.MissionGetAward, new BinaryBuilder(
        {
            ID:ID,
            IsError:IsError
        },
        Struct.MissionGetAwardResponse
    ));

}

module.exports = MissionGetAwardResponse;
MissionGetAwardResponse.prototype = new Packet();
