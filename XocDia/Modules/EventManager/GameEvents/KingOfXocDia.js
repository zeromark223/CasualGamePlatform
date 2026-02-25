/**
 * Created by Ngoc on 01-05-2018.
 */
var GameEvents = require('./GameEvents');
var Utility = require('../../../../SharedModule/Utility');

function KingOfXocDia() {
    GameEvents.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
}

module.exports = KingOfXocDia;
KingOfXocDia.prototype = new GameEvents();

KingOfXocDia.prototype.EvtOnUserOutGame = function (User) {
    if (!this.Run) return;
    try {
        if (User.KingOfXocDiaScore > 0) {
            this.GameServer.RedisAdapter.zIncrby(this.DataKey, +User.KingOfXocDiaScore, User.UserID);
            User.KingOfXocDiaScore = 0; // Phòng trường hợp ngứa háng, bật tắt event liên tục khi user còn trong bàn
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('KingOfXocDia.prototype.EvtOnUserOutGame - try err: ' + e.stack);
    }

};

KingOfXocDia.prototype.CalcScore = function (TotalBet, TotalWin) {
    var score = 0;

    if (Utility.CheckVariable(this.EventConfig, 'WinRatio', 'LoseRatio')) {
        score += (+TotalWin || 0) * (+this.EventConfig.WinRatio || 0);
        score += (+TotalBet || 0) * (+this.EventConfig.LoseRatio || 0);
    } else {
        console.log("Deo co config man");
    }
    return score;
};

KingOfXocDia.prototype.EvtOnUserWinLose = function (User, TotalBet, TotalWin, BetList) {
    if (!this.Run) return;
    if (this.CheckRuleAntiCheat(BetList)) return;
    User.KingOfXocDiaScore += this.CalcScore(TotalBet, TotalWin);
};

KingOfXocDia.prototype.CheckRuleAntiCheat = function (BetList) {
    var isCheat = 0;
    if (this.FindBetID(1, BetList) != 0 && this.FindBetID(2, BetList) != 0) {
        isCheat = 1;
    }
    return isCheat;
};

KingOfXocDia.prototype.FindBetID = function (ID, BetList) {
    for (var i = 0; i < BetList.length; i++) {
        if (BetList[i].ID == ID) {
            return BetList[i];
        }
    }
    return 0;
};