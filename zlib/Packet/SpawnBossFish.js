/**
 * Created by quinx on 5/22/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function SpawnBossFish(BossFish) {
    return this.AddHeader(Define.SpawnBossFish, new BinaryBuilder(
        {
            FishID: BossFish.FishID,
            BossID: BossFish.FishID,
            FishKind: BossFish.FishKind,
            MaxHP: BossFish.MaxHP,
            CurrentHP: BossFish.CurrentHP,
            PathSeed: BossFish.PathSeed,
            BirthTime: BossFish.BirthTime
        },
        Struct.SpawnBossFishResponse
    ));

}
module.exports = SpawnBossFish ;
SpawnBossFish.prototype = new Packet();