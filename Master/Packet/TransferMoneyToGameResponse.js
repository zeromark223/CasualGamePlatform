/**
 * Created by ngocnpt on 03-May-17.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function TransferMoneyToGameResponse(ErrorCode) {
    return this.AddHeader(Define.TransferMoneyToGame, new BinaryBuilder(
        {
            ErrorCode: ErrorCode
        },
        Struct.TransferMoneyToGameResponse
    ));
}

module.exports = TransferMoneyToGameResponse;
TransferMoneyToGameResponse.prototype = new Packet();
