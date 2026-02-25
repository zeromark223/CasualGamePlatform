var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function NewUserComeResponse(NewUser) {
    return this.AddHeader(Define.NewUserCome, new BinaryBuilder(
        NewUser,
        Struct.NewUserComeResponse
    ));
}

module.exports = NewUserComeResponse;
NewUserComeResponse.prototype = new Packet();
