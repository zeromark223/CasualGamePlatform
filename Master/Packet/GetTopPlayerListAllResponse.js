/**
 * Created by quinx on 9/6/2017.
 */
/**
 * Created by ngocnpt on 03-May-17.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function GetTopPlayerListAllResponse(TopPlayerList) {
    try {
        return this.AddHeader(Define.GetTopPlayerListAll, new BinaryBuilder(
            {
                TopPlayerList: TopPlayerList
            },
            Struct.GetTopPlayerListAllResponse
        ));
    } catch (e) {
        console.log('Packet -> GetTopPlayerListAllResponse - try err: ', e.stack);
    }
    return 0;
}

module.exports = GetTopPlayerListAllResponse;
GetTopPlayerListAllResponse.prototype = new Packet();
