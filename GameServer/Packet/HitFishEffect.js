/**
 * Created by quinx on 6/9/2017.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function HitFishEffect(StationID, FishID, EffectID, GoldReward, TotalGold) {
    return this.AddHeader(Define.HitFishEffect, new BinaryBuilder(
        {
            StationID: StationID,
            FishID: FishID,
            EffectID: EffectID,
            GoldReward: GoldReward,
            TotalGold: TotalGold
        },
        Struct.HitFishEffectResponse
    ));

}
module.exports = HitFishEffect ;
HitFishEffect.prototype = new Packet();