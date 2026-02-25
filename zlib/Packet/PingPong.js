/**
 * Created by quinx on 6/14/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function PingPong() {

    return this.AddHeader(Define.PingPong);

}
module.exports = PingPong ;
PingPong.prototype = new Packet();