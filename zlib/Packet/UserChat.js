/**
 * Created by quinx on 11/10/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

/*
 DeskStation: Define.UInt8,
 Angle: Define.Float,
 BulletKind: Define.UInt8,
 BulletMultiple: Define.UInt32,
 LockedFishID: Define.UInt32,
 Gold: Define.UInt64
 */

function UserChat(StationID, ChatID) {

    return this.AddHeader(Define.OnUserChat, new BinaryBuilder(
        {
            StationID: StationID,
            ChatID: ChatID
        },
        Struct.OnUserChatResponse
    ));

}
module.exports = UserChat ;
UserChat.prototype = new Packet();