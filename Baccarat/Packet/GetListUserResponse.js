var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function GetListUserResponse (ListUser) {
    return this.AddHeader(Define.GetListUser , new BinaryBuilder(
        {
            ListUser: ListUser
        },
        Struct.GetListUserResponse
    ));
}

module.exports = GetListUserResponse ;
GetListUserResponse.prototype = new Packet();
