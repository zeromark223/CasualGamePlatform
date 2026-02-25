/**
 * Created by quinx on 5/31/2017.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function SpawnParadeFish_2D(ParadeKind, SceneKind, ListFish) {
    var now = +new Date();

    return this.AddHeader(Define.SpawnParadeFish_REALTIME, new BinaryBuilder(
        {
            ParadeKind: ParadeKind,
            SceneKind: SceneKind,
            ListFish: ListFish
        },
        Struct.SpawnParadeFishResponse_2D
    ));

}
module.exports = SpawnParadeFish_2D ;
SpawnParadeFish_2D.prototype = new Packet();