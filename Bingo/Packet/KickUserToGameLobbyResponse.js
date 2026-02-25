var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function KickUserToGameLobbyResponse() {
    return this.AddHeader(Define.KickUserToGameLobbyResponse, new BinaryBuilder(
        {
            ErrorCode: 0
        },
        Struct.KickUserToGameLobbyResponse
    ));
}

module.exports = KickUserToGameLobbyResponse;
KickUserToGameLobbyResponse.prototype = new Packet();
