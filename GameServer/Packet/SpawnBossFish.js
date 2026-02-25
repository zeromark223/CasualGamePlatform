/**
 * Created by quinx on 5/22/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function SpawnBossFish(FishID,FishKind,TotalGold,Position,StartTime) {
    return this.AddHeader(Define.SpawnBossFish, new BinaryBuilder(
        {
            FishID: FishID,
            FishKind: FishKind,
            TotalGold: TotalGold,
            Position: Position,
            StartTime: StartTime,
            PathSeed:50
        },
        Struct.SpawnBossFishResponse
    ));
}
module.exports = SpawnBossFish ;
SpawnBossFish.prototype = new Packet();