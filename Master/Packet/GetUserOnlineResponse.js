/**
 * Created by ngocnpt on 03-May-17.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function GetUserOnlineResponse(NumberOfUsers) {

    try {
        return this.AddHeader(Define.GetUserOnline, new BinaryBuilder(
            {
                NumberOfUsers: NumberOfUsers
            },
            Struct.GetUserOnlineResponse
        ));
    } catch (e) {
        console.log('Packet -> KickUserResponse - try err: ', e.stack);
    }
}

module.exports = GetUserOnlineResponse;
GetUserOnlineResponse.prototype = new Packet();
