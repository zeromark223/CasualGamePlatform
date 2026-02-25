/**
 * Created by Ngoc on 19-12-2018.
 */
var GameEvents = require('./GameEvents');
var Utility = require('../../../../SharedModule/Utility');

function SlotWinLose() {
    GameEvents.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
}

module.exports = SlotWinLose;
SlotWinLose.prototype = new GameEvents();

SlotWinLose.prototype.EvtOnUserOutGame = function (User) {
    if (!this.Run) return;
    try {
        var score = this.CalcScore(User);
        if (score > 0) {
            this.GameServer.RedisAdapter.zIncrby(this.DataKey, score, User.UserID);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('SlotWinLose.prototype.EvtOnUserOutGame - try err: ' + e.stack);
    }

};

SlotWinLose.prototype.CalcScore = function (User) {

    var totalWin = User.SlotTotalWin - (User.PreSlotTotalWin || 0);
    var totalLose = User.SlotTotalLose - (User.PreSlotTotalLose || 0);
    var config = this.EventConfig;
    var score = (totalWin * config.WinRatio) || 0;
    score += (totalLose * config.LoseRatio) || 0;
    return score;
};


SlotWinLose.prototype.OnTurnOnTrigger = function () {
    try {
        for (var i = 0; i < this.GameServer.UserClient.length; i++) {
            if (Utility.CheckVariable(this.GameServer.UserClient[i], 'UserModel')) {
                var user = this.GameServer.UserClient[i].UserModel;
                user.PreSlotTotalWin = user.SlotTotalWin;
                user.PreSlotTotalLose = user.SlotTotalLose;
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('SlotWinLose.prototype.OnTurnOnTrigger - try err: ' + e.stack);
    }

};