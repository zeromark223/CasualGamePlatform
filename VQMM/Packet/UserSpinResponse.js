var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UserSpinResponse (UserSpinObj) {
    return this.AddHeader(Define.UserSpin , new BinaryBuilder(
        UserSpinObj,
        Struct.UserSpinResponse
    ));
}

module.exports = UserSpinResponse ;
UserSpinResponse.prototype = new Packet();
