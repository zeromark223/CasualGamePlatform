/**
 * Created by quinx on 5/17/2017.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function ClearFish() {

    return this.AddHeader(Define.ClearFish);

}
module.exports = ClearFish ;
ClearFish.prototype = new Packet();