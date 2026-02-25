/**
 * Created by quinx on 5/9/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function JackpotUpdateResponse (Gold) {

    return this.AddHeader(Define.JackpotUpdate, new BinaryBuilder(
        {
            Gold:Gold
        },
        Struct.JackpotUpdateResponse
    ));

}
module.exports = JackpotUpdateResponse ;
JackpotUpdateResponse.prototype = new Packet();