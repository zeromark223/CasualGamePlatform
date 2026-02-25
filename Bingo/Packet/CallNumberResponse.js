var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function CallNumberResponse(Number, CallLeft) {
    return this.AddHeader(Define.CallNumber, new BinaryBuilder(
        {
            Number: Number,
            CallLeft: CallLeft
        },
        Struct.CallNumberResponse
    ));
}

module.exports = CallNumberResponse;
CallNumberResponse.prototype = new Packet();
