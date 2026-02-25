/**
 * Created by quinx on 5/8/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function ListUserInDeskResponse (ListUserInDesk) {
    return this.AddHeader(Define.ListUserInDesk, new BinaryBuilder(
        {
            ListUserInDesk: ListUserInDesk
        },
        Struct.ListUserInDeskResponse
    ));

}
module.exports = ListUserInDeskResponse ;
ListUserInDeskResponse.prototype = new Packet();