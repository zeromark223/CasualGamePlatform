//Qui
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function LoginResponse (userID, gold, gameName, level, exp, stationID) {
    userID = userID || 0;
    gold = gold || 0;
    gameName = gameName || '';
    level = level || 0;
    exp = exp || 0;
    stationID = stationID || 0;
    try {
        return this.AddHeader(Define.LoginGame , new BinaryBuilder(
            {
                UserID: userID,
                Gold: gold,
                GameName: gameName,
                Level: level,
                Exp: exp,
                StationID: stationID
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
