/**
 * Created by quinx on 5/23/2017.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function SpawnCrowdedFish_2D(ListFish) {
    return this.AddHeader(Define.SpawnCrowdedFish, new BinaryBuilder(
        {
            ListFish: ListFish
        },
        Struct.SpawnCrowdedFishResponse_2D
    ));

}
module.exports = SpawnCrowdedFish_2D ;
SpawnCrowdedFish_2D.prototype = new Packet();