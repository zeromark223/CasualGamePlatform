var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UpdateMoneyResponse (UpdateMoneyInfo) {
    return this.AddHeader(Define.UpdateMoney , new BinaryBuilder(
        UpdateMoneyInfo,
        Struct.UpdateMoneyResponse
    ));
}

module.exports = UpdateMoneyResponse ;
UpdateMoneyResponse.prototype = new Packet();
