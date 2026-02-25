var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UpdateUserGoldResponse (Money) {
    return this.AddHeader(Define.UpdateUserGold , new BinaryBuilder(
        {
            Money: Money
        },
        Struct.UpdateUserGoldResponse
    ));
}

module.exports = UpdateUserGoldResponse ;
UpdateUserGoldResponse.prototype = new Packet();
