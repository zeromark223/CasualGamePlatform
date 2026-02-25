var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function SignToQuitResponse (Status) {
    return this.AddHeader(Define.SignToQuit , new BinaryBuilder(
        {
            Status: Status
        },
        Struct.SignToQuitResponse
    ));
}

module.exports = SignToQuitResponse ;
SignToQuitResponse.prototype = new Packet();
