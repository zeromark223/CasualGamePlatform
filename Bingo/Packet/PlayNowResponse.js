var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function PlayNowResponse(GameMode, CardPrice) {

    return this.AddHeader(Define.PlayNow, new BinaryBuilder(
        {
            GameMode: GameMode,
            CardPrice: CardPrice
        },
        Struct.PlayNowResponse
    ));

}

module.exports = PlayNowResponse;
PlayNowResponse.prototype = new Packet();