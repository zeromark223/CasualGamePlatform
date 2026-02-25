/**
 * Created by quinx on 5/9/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function SpawnFish(ListFish) {
    return this.AddHeader(Define.SpawnFish, new BinaryBuilder(
        {
            ListFish: ListFish
        },
        Struct.SpawnFishResponse
    ));

}
module.exports = SpawnFish ;
SpawnFish.prototype = new Packet();