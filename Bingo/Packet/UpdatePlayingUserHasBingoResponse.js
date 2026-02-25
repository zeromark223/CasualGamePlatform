//
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UpdatePlayingUserHasBingoResponse(Data) {
    return this.AddHeader(Define.UpdatePlayingUserHasBingo, new BinaryBuilder(
        {
            Data: Data
        },
        Struct.UpdatePlayingUserHasBingoResponse
    ));
}

module.exports = UpdatePlayingUserHasBingoResponse;
UpdatePlayingUserHasBingoResponse.prototype = new Packet();
