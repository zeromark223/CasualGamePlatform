var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function CatchRedFish(StationID, FishID, GoldReward, TotalGold, Level, Exp, FishIDArray) {
    try {
        return this.AddHeader(Define.CatchRedFish, new BinaryBuilder(
            {
                StationID: StationID,
                FishID: FishID,
                GoldReward: GoldReward,
                TotalGold: TotalGold,
                Level: Level,
                Exp: Exp,
                FishIDArray: FishIDArray
            },
            Struct.CatchRedFishResponse
        ));
    }catch (e){
        console.log('Packet -> CatchRedFish - try err: ', e.stack);
    }

    return 0;
};

module.exports = CatchRedFish ;
CatchRedFish.prototype = new Packet();