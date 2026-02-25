/**
 * Created by Ngoc on 01-05-2018.
 */
var GameEvents = require('./GameEvents');
var Utility = require('../../../../SharedModule/Utility');

function SlotCollectItem() {
    GameEvents.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
}

module.exports = SlotCollectItem;
SlotCollectItem.prototype = new GameEvents();

SlotCollectItem.prototype.EvtOnUserOutGame = function (User) {
    if (!this.Run) return;
    try {
        var score = this.CalcScore(User);
        score = score - (User.PreSlotCollectData || 0);
        if (score > 0) {
            this.GameServer.RedisAdapter.zIncrby(this.DataKey, score, User.UserID);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('SlotCollectItem.prototype.EvtOnUserOutGame - try err: ' + e.stack);
    }

};

SlotCollectItem.prototype.CalcScore = function (User) {
    var score = 0;
    var config = this.EventConfig;
    if (!Utility.CheckVariable(config)) return score;
    for (var key in User.DataRsID) {
        var data = User.DataRsID[key];
        score += this.CalcScoreByID(key, data, config);
    }
    score = Math.floor(score);
    return score;
};

SlotCollectItem.prototype.CalcScoreByID = function (ID, BetData, config) {
    var score = 0;
    config = config || {};
    var ratio = config[ID] || 0;
    score += (ratio * BetData) || 0;

    return score;
};


SlotCollectItem.prototype.OnTurnOnTrigger = function () {
    try {
        for (var i = 0; i < this.GameServer.UserClient.length; i++) {
            if (Utility.CheckVariable(this.GameServer.UserClient[i], 'UserModel')) {
                var user = this.GameServer.UserClient[i].UserModel;
                user.PreSlotCollectData = this.CalcScore(user);
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('SlotCollectItem.prototype.OnTurnOnTrigger - try err: ' + e.stack);
    }

};