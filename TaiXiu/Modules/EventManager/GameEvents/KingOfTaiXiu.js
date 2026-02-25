/**
 * Created by Ngoc on 01-05-2018.
 */
var GameEvents = require('./GameEvents');
var Utility = require('../../../../SharedModule/Utility');

function KingOfTaiXiu() {
    GameEvents.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
}

module.exports = KingOfTaiXiu;
KingOfTaiXiu.prototype = new GameEvents();

KingOfTaiXiu.prototype.EvtOnUserOutGame = function (User) {
    if (!this.Run) return;
    try {
        if (User.KingOfTaiXiuScore > 0) {
            this.GameServer.RedisAdapter.zIncrby(this.DataKey, +User.KingOfTaiXiuScore, User.UserID);
            User.KingOfTaiXiuScore = 0; // Phòng trường hợp ngứa háng, bật tắt event liên tục khi user còn trong bàn
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('KingOfTaiXiu.prototype.EvtOnUserOutGame - try err: ' + e.stack);
    }

};

KingOfTaiXiu.prototype.CalcScore = function (TotalBet, TotalWin) {
    var score = 0;

    if(Utility.CheckVariable(this.EventConfig,'WinRatio','LoseRatio')){
        score += (+TotalWin || 0 )*(+this.EventConfig.WinRatio ||0);
        score += (+TotalBet || 0 )*(+this.EventConfig.LoseRatio ||0);
    }else{
        console.log("Deo co config man");
    }
    return score;
};

KingOfTaiXiu.prototype.EvtOnUserWinLose = function (User, TotalBet, TotalWin) {
    if (!this.Run) return;
    User.KingOfTaiXiuScore += this.CalcScore(TotalBet, TotalWin);
};