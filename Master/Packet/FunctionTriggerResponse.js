var Packet = require('../Packet/Packet');
var Define = require('../Packet/Define');
var Struct = require('../Packet/Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function FunctionTriggerResponse(FunctionID, Trigger) {
    return this.AddHeader(Define.FunctionTrigger, new BinaryBuilder(
        {
            FunctionID:FunctionID,//Online Award : 1, Daily Award : 2
            Trigger:Trigger
        },
        Struct.FunctionTrigger
    ));
}

module.exports = FunctionTriggerResponse;
FunctionTriggerResponse.prototype = new Packet();