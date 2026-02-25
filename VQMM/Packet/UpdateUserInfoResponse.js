var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UpdateUserInfo(FreeSpin, TotalGold) {
    return this.AddHeader(Define.UpdateUserInfo, new BinaryBuilder(
        {
            FreeSpin: FreeSpin,
            TotalGold: TotalGold
        },
        Struct.UpdateUserInfoResponse
    ));
}

module.exports = UpdateUserInfo;
UpdateUserInfo.prototype = new Packet();
