/**
 * Created by quinx on 5/30/2017.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function BossDie(FishID, UserID, GoldReward, GameName) {
    return this.AddHeader(Define.BossDie, new BinaryBuilder(
        {
            FishID: FishID,
            UserID: UserID,
            GoldReward: GoldReward,
            GameName: GameName
        },
        Struct.BossDieResponse
    ));
}
module.exports = BossDie ;
BossDie.prototype = new Packet();