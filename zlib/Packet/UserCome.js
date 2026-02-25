/**
 * Created by quinx on 5/8/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function UserCome (UserID, Gold, Nickname, Level, StationID, PosX, PosY) {
        return this.AddHeader(Define.UserCome, new BinaryBuilder(
            {
                UserID: UserID,
                Gold: Gold,
                Nickname: Nickname,
                Level: Level,
                StationID: StationID,
                PosX: PosX,
                PosY: PosY
            },
            Struct.UserComeResponse
        ));
}
module.exports = UserCome ;
UserCome.prototype = new Packet();