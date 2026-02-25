/**
 * Created by quinx on 5/9/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function BonusMiniGameEndResultResponse (Gold,CurrentGold) {

    return this.AddHeader(Define.BonusMiniGameEndResult, new BinaryBuilder(
        {
            Gold: Gold,
            CurrentGold:CurrentGold
        },
        Struct.BonusMiniGameEndResultResponse
    ));

}
module.exports = BonusMiniGameEndResultResponse ;
BonusMiniGameEndResultResponse.prototype = new Packet();