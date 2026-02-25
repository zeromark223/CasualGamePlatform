/**
 * Created by quinx on 5/9/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function UserStartRollResponse (ErrorCode) {

    return this.AddHeader(Define.UserStartRoll, new BinaryBuilder(
        {
            ErrorCode: ErrorCode
        },
        Struct.UserStartRollResponse
    ));

}
module.exports = UserStartRollResponse ;
UserStartRollResponse.prototype = new Packet();