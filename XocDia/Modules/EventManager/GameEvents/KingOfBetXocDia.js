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

KingOfXocDia.prototype.EvtOnUserEndMatch = function (User, BetList, WinList) {
    if (!this.Run) return; // Event Kết thúc
    if (BetList.length <= 0) return;//Thằng này offline và đã transfer, next nó đi.
    User.KingOfBetXocDia += this.CalcScore(WinList);
};

KingOfXocDia.prototype.EvtOnUserOutGame = function (User) {
    if (!this.Run) return;
    try {
        if (User.KingOfBetXocDia > 0) {
            this.GameServer.RedisAdapter.zIncrby(this.DataKey, +User.KingOfBetXocDia, User.UserID);
            User.KingOfBetXocDia = 0; // Phòng trường hợp ngứa háng, bật tắt event liên tục khi user còn trong bàn
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('KingOfXocDia.prototype.EvtOnUserOutGame - try err: ' + e.stack);
    }

};

KingOfXocDia.prototype.CalcScore = function (WinList) {
    var score = 0;
    if (Utility.CheckVariable(this.EventConfig, 'ListCheck')) {
        for (var i = 0; i < WinList.length; i++) {
            if (this.EventConfig.ListCheck.indexOf(WinList[i].ID) > -1) {
                //score += WinList[i].WinGoldNoTax; //ko phế
                score += WinList[i].Money;
            }
        }
    } else {
        console.log("Deo co config man");
    }
    return score;
};

KingOfXocDia.prototype.CheckRuleAntiCheat = function (BetList) {
    var isCheat = 0;
    if (this.FindBetID(1, BetList) != 0 && this.FindBetID(2, BetList) != 0) {
        isCheat = 1;
    }
    return isCheat;
};

