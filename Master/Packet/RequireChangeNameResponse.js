var Packet = require('../Packet/Packet');
var Define = require('../Packet/Define');
var Struct = require('../Packet/Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function RequireChangeNameResponse() {
    try {
        return this.AddHeader(Define.RequireChangeName, new Buffer(0));
    } catch (e) {
        console.log('Packet -> RequireChangeNameResponse - try err: ', e.stack);
    }

    return 0;
};

module.exports = RequireChangeNameResponse;
RequireChangeNameResponse.prototype = new Packet();