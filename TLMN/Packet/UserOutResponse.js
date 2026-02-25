var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UserOutResponse (UserID) {
    return this.AddHeader(Define.UserOut , new BinaryBuilder(
        {
            UserID: UserID
        },
        Struct.UserOutResponse
    ));
}

module.exports = UserOutResponse ;
UserOutResponse.prototype = new Packet();
