/**
 * Created by quinx on 5/9/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');


function RollingResultResponse (rs,isBonus,isFreeSpin,isJackpot,totalWin,currentGold,matchId,winLine) {

    return this.AddHeader(Define.RollingResult, new BinaryBuilder(
        {
            Result: rs,
            IsBonus: isBonus, //Minigame
            IsJackpot: isJackpot,
            IsFreeSpin: isFreeSpin, // > 0 là số lần free spin
            TotalWin: totalWin, // > 0 là số lần free spin
            CurrentGold: currentGold, // > 0 là số lần free spin
            MatchID:matchId,
            WinLine:winLine
        },
        Struct.RollingResultResponse
    ));

}
module.exports = RollingResultResponse ;
RollingResultResponse.prototype = new Packet();