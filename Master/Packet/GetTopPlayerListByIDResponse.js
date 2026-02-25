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

function GetTopPlayerListByIDResponse(UserTopPos,UserScore,StartTime,EndTime,ListUser) {
    try {
        return this.AddHeader(Define.GetTopPlayerListByID, new BinaryBuilder(
            {
                UserTopPos:UserTopPos,
                UserScore:UserScore,
                StartTime:StartTime,
                EndTime:EndTime,
                ListUser: ListUser
            },
            Struct.GetTopPlayerListByIDResponse
        ));
    } catch (e) {
        console.log('Packet -> GetTopPlayerListAllResponse - try err: ', e.stack);
    }
    return 0;
}

module.exports = GetTopPlayerListByIDResponse;
GetTopPlayerListByIDResponse.prototype = new Packet();
