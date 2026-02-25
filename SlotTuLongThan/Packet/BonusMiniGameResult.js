/**
 * Created by quinx on 5/9/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function BonusMiniGameResultResponse (Gold) {

    return this.AddHeader(Define.BonusMiniGameResult, new BinaryBuilder(
        {
            Gold: Gold
        },
        Struct.BonusMiniGameResultResponse
    ));

}
module.exports = BonusMiniGameResultResponse ;
BonusMiniGameResultResponse.prototype = new Packet();