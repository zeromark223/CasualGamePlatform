/**
 * Created by quinx on 5/9/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function TopUserWinResponse (TopUserWinList) {

    return this.AddHeader(Define.TopUserWin, new BinaryBuilder(
        {
            TopUserWinList:TopUserWinList
        },
        Struct.TopUserWinResponse
    ));

}
module.exports = TopUserWinResponse ;
TopUserWinResponse.prototype = new Packet();