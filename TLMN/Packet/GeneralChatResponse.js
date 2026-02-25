var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function GeneralChatResponse (UserName, Message) {
    return this.AddHeader(Define.GeneralChat , new BinaryBuilder(
        {
            UserName: UserName,
            Message: Message
        },
        Struct.GeneralChatResponse
    ));
}

module.exports = GeneralChatResponse ;
GeneralChatResponse.prototype = new Packet();
