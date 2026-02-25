/**
 * Created by quinx on 5/9/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function SpawnFish_2D(ListFish) {
    return this.AddHeader(Define.SpawnFish, new BinaryBuilder(
        {
            ListFish: ListFish
        },
        Struct.SpawnFishResponse_2D
    ));

}
module.exports = SpawnFish_2D ;
SpawnFish_2D.prototype = new Packet();