var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function GameChatResponse(UserID, GameName, Msg) {
    return this.AddHeader(Define.GameChat, new BinaryBuilder(
        {
            UserID: UserID,
            GameName: GameName,
            Msg: Msg
        },
        Struct.GameChatResponse
    ));
}

module.exports = GameChatResponse;
GameChatResponse.prototype = new Packet();
