/**
 * Created by quinx on 5/9/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function ShowMsg (msg) {

    return this.AddHeader(Define.ShowMsg, new BinaryBuilder(
        {
            Message: msg
        },
        Struct.ShowMsgResponse
    ));

}
module.exports = ShowMsg ;
ShowMsg.prototype = new Packet();