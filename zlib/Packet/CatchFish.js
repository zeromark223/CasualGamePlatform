/**
 * Created by quinx on 5/10/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function CatchFish(StationID, FishID, GoldReward, TotalGold, Level, Exp) {

    return this.AddHeader(Define.CatchFish, new BinaryBuilder(
        {
            StationID: StationID,
            FishID: FishID,
            GoldReward: GoldReward,
            TotalGold: TotalGold,
            Level: Level,
            Exp: Exp
        },
        Struct.CatchFishResponse
    ));

}
module.exports = CatchFish ;
CatchFish.prototype = new Packet();