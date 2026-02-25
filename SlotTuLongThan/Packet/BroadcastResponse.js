/**
 * Created by quinx on 5/9/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function BroadcastResponse (Msg) {

    return this.AddHeader(Define.Broadcast, new BinaryBuilder(
        {
            Msg: Msg
        },
        Struct.BroadcastResponse
    ));

}
module.exports = BroadcastResponse ;
BroadcastResponse.prototype = new Packet();