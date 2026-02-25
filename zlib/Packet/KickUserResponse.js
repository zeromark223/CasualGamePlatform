/**
 * Created by ngocnpt on 03-May-17.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function KickUserResponse(state, msg) {
    try {
        return this.AddHeader(Define.KickUser, new BinaryBuilder(
            {
                State: state,
                Msg: msg
            },
            Struct.KickUserResponse
        ));
    } catch (e) {
        console.log('Packet -> KickUserResponse - try err: ', e.stack);
    }

    return 0;
};

module.exports = KickUserResponse;
KickUserResponse.prototype = new Packet();
