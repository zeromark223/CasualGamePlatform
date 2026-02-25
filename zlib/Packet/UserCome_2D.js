/**
 * Created by quinx on 5/8/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function UserCome_2D(UserID, Gold, Nickname, Level, StationID, PosX, PosY, Exp) {
    return this.AddHeader(Define.UserCome, new BinaryBuilder(
        {
            UserID: UserID,
            Gold: Gold,
            Nickname: Nickname,
            Level: Level,
            Exp: Exp,
            StationID: StationID,
            PosX: PosX,
            PosY: PosY
        },
        Struct.UserComeResponse_2D
    ));
}
module.exports = UserCome_2D;
UserCome_2D.prototype = new Packet();