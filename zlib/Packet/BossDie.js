/**
 * Created by quinx on 5/30/2017.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function BossDie(BossID, UserID, GoldReward, CardReward, NumberOfCard) {
    return this.AddHeader(Define.BossDie, new BinaryBuilder(
        {
            BossID: BossID,
            UserID: UserID,
            GoldReward: GoldReward,
            CardReward: CardReward,
            NumberOfCard: NumberOfCard
        },
        Struct.BossDieResponse
    ));

}
module.exports = BossDie ;
BossDie.prototype = new Packet();