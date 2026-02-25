var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UserChatResponse (UserID, Message) {
    return this.AddHeader(Define.UserChat , new BinaryBuilder(
        {
            UserID: UserID,
            Message: Message
        },
        Struct.UserChatResponse
    ));
}

module.exports = UserChatResponse ;
UserChatResponse.prototype = new Packet();
