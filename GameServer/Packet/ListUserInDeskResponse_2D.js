/**
 * Created by quinx on 5/8/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function ListUserInDeskResponse_2D (ListUserInDesk) {
    return this.AddHeader(Define.ListUserInDesk, new BinaryBuilder(
        {
            ListUserInDesk: ListUserInDesk
        },
        Struct.ListUserInDeskResponse_2D
    ));

}
module.exports = ListUserInDeskResponse_2D ;
ListUserInDeskResponse_2D.prototype = new Packet();