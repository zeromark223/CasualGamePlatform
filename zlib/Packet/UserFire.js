/**
 * Created by quinx on 5/8/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

/*
 DeskStation: Define.UInt8,
 Angle: Define.Float,
 BulletKind: Define.UInt8,
 BulletMultiple: Define.UInt32,
 LockedFishID: Define.UInt32,
 Gold: Define.UInt64
 */

function UserFire(StationID, Angle, BulletMultiple, LockedFishID, Gold) {

    return this.AddHeader(Define.UserFire, new BinaryBuilder(
        {
            StationID: StationID,
            Angle: Angle,
            BulletMultiple: BulletMultiple,
            LockedFishID: LockedFishID,
            Gold: Gold
        },
        Struct.UserFireResponse
    ));

}
module.exports = UserFire ;
UserFire.prototype = new Packet();