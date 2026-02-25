var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UpdateMaxTreasureResponse(TreasureData) {
    return this.AddHeader(Define.UpdateMaxTreasureResponse, new BinaryBuilder(
        {
            MaxTreasure: TreasureData.MaxTreasure,
            ListTreasureClassical: TreasureData.ListTreasureClassical,
            ListTreasureEasy: TreasureData.ListTreasureEasy
        },
        Struct.UpdateMaxTreasureResponse
    ));
}

module.exports = UpdateMaxTreasureResponse;
UpdateMaxTreasureResponse.prototype = new Packet();
