//
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UserLeaveGameResponse(ErrorCode) {
    return this.AddHeader(Define.LeaveRoom, new BinaryBuilder(
        {
            ErrorCode: ErrorCode
        },
        Struct.UserLeaveGameResponse
    ));
}

module.exports = UserLeaveGameResponse;
UserLeaveGameResponse.prototype = new Packet();
