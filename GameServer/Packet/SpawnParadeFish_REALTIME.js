/**
 * Created by quinx on 5/31/2017.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function SpawnParadeFish_REALTIME(ParadeKind, PathSeed, BirthTime, ListFish) {
    var now = +new Date();
    var time = Math.floor((now - BirthTime) / 1000);

    return this.AddHeader(Define.SpawnParadeFish_REALTIME, new BinaryBuilder(
        {
            ParadeKind: ParadeKind,
            PathSeed: PathSeed,
            BirthTime: time,
            ListFish: ListFish
        },
        Struct.SpawnParadeFishResponse_REALTIME
    ));

}
module.exports = SpawnParadeFish_REALTIME ;
SpawnParadeFish_REALTIME.prototype = new Packet();