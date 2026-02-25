/**
 * Created by quinx on 5/30/2017.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function GetRoomListResponse(RoomList) {
    return this.AddHeader(Define.GetRoomList, new BinaryBuilder(
        {
            RoomList: RoomList
        },
        Struct.GetRoomListResponse
    ));

}
module.exports = GetRoomListResponse ;
GetRoomListResponse.prototype = new Packet();