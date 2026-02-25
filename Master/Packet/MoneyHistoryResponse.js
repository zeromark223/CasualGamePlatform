/**
 * Created by ngocnpt on 01/08/2017.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function MoneyHistoryResponse(MaxPage,Detail) {

    return this.AddHeader(Define.MoneyHistory, new BinaryBuilder(
        {
            MaxPage:MaxPage,
            Detail:Detail
        },
        Struct.MoneyHistoryResponse
    ));

}

module.exports = MoneyHistoryResponse;
MoneyHistoryResponse.prototype = new Packet();
