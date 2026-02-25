/**
 * Created by quinx on 5/9/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function RollHistoryResponse (RollHistoryList) {
    return this.AddHeader(Define.RollHistory, new BinaryBuilder(
        {
            RollHistoryList:RollHistoryList
        },
        Struct.RollHistoryResponse
    ));

}
module.exports = RollHistoryResponse ;
RollHistoryResponse.prototype = new Packet();