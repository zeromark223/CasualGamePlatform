var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function GiveCardResponse (UserID, Action, EffectID, CardRemain, Cards) {
    return this.AddHeader(Define.GiveCard , new BinaryBuilder(
        {
            UserID: UserID,
            Action: Action,
            EffectID: EffectID,
            CardRemain: CardRemain,
            Cards: Cards
        },
        Struct.GiveCardResponse
    ));
}

module.exports = GiveCardResponse ;
GiveCardResponse.prototype = new Packet();
