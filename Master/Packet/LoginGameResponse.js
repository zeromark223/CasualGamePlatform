/**
 * Created by ngocnpt on 03-May-17.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function LoginGameResponse(userID, gold, level, gameName) {
    userID = userID || 0;
    gold = gold || 0;
    level = level || 0;
    gameName = gameName || '';
    try {
        return this.AddHeader(Define.LoginGame, new BinaryBuilder(
            {
                UserID: userID,
                Gold: gold,
                Level: level,
                //Exp: exp,
                //NextExp: nextExp,
                //Username: username,
                GameName: gameName
                //WSToken: tokenWS
            },
            Struct.LoginGameResponse
        ));
    } catch (e) {
        console.log('Packet -> LoginGameResponse - try err: ', e.stack);
    }

    return 0;
};

module.exports = LoginGameResponse;
LoginGameResponse.prototype = new Packet();
