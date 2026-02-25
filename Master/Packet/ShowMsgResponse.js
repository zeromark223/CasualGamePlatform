/**
 * Created by ngocnpt on 03-May-17.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function ShowMsgResponse(Msg) {
    return this.AddHeader(Define.ShowMsg, new BinaryBuilder(
        {
            Msg:Msg
        },
        Struct.ShowMsgResponse
    ));

}

module.exports = ShowMsgResponse;
ShowMsgResponse.prototype = new Packet();
