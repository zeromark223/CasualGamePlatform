//Qui
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function LoginResponse (userID, gold, gameName) {
    userID = userID || 0;
    gold = gold || 0;
    gameName = gameName || '';
    try {
        return this.AddHeader(Define.LoginGame , new BinaryBuilder(
            {
                UserID: userID,
                Gold: gold,
                GameName: gameName
            },
            Struct.LoginResponse
        ));
    }catch (e){
        console.log('Packet -> LoginResponse - try err: ', e.stack);
    }

    return 0;
};

module.exports = LoginResponse ;
LoginResponse.prototype = new Packet();
