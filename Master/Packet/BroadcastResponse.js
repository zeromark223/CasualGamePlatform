/**
 * Created by ngocnpt on 03-May-17.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function BroadcastResponse(msg,priority, urlLink) {
    msg = msg || '';
    priority = priority || 0;
    urlLink = urlLink || '';

    try {
        return this.AddHeader(Define.Broadcast, new BinaryBuilder(
            {
                Priority: priority,
                Msg: msg,
                UrlLink: urlLink
            },
            Struct.BroadcastResponse
        ));
    } catch (e) {
        console.log('Packet -> BroadcastResponse - try err: ', e.stack);
    }

    return 0;
};

module.exports = BroadcastResponse;
BroadcastResponse.prototype = new Packet();
