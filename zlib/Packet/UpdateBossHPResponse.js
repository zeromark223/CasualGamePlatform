/**
 * Created by quinx on 5/24/2017.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UpdateBossHPResponse(BossID, ValueHP, CurrentHP) {

    return this.AddHeader(Define.UpdateBossHPResponse, new BinaryBuilder(
        {
            BossID: BossID,
            ValueHP: ValueHP,
            CurrentHP: CurrentHP
        },
        Struct.UpdateBossHPResponse
    ));

}
module.exports = UpdateBossHPResponse ;
UpdateBossHPResponse.prototype = new Packet();