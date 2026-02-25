/**
 * Created by ngocnpt on 03-May-17.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UpdateGoldForUserResponse(Diamond,GameMoney) {

    return this.AddHeader(Define.UpdateGoldForUser, new BinaryBuilder(
        {
            Diamond:Diamond,
            GameMoney:GameMoney
        },
        Struct.UpdateGoldForUserResponse
    ));

}

module.exports = UpdateGoldForUserResponse;
UpdateGoldForUserResponse.prototype = new Packet();
