/**
 * Created by quinx on 5/12/2017.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function SpawnParadeFish(ParadeKind, ParadePosition, ListFish) {

    return this.AddHeader(Define.SpawnParadeFish, new BinaryBuilder(
        {
            ParadeKind: ParadeKind,
            ParadePosition: ParadePosition,
            ListFish: ListFish
        },
        Struct.SpawnParadeFishResponse
    ));

}
module.exports = SpawnParadeFish ;
SpawnParadeFish.prototype = new Packet();