/**
 * Created by quinx on 5/30/2017.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function GetRoomConfigResponse(GameConfig) {
    return this.AddHeader(Define.GetRoomConfig, new BinaryBuilder(
        GameConfig,
        Struct.GetRoomConfigResponse
    ));

}
module.exports = GetRoomConfigResponse ;
GetRoomConfigResponse.prototype = new Packet();