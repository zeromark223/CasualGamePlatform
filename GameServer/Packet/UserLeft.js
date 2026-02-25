/**
 * Created by quinx on 5/11/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UserLeft(StationID) {
    return this.AddHeader(Define.UserLeft, new BinaryBuilder(
        {
            StationID: StationID
        },
        Struct.UserLeftResponse
    ));

}
module.exports = UserLeft ;
UserLeft.prototype = new Packet();