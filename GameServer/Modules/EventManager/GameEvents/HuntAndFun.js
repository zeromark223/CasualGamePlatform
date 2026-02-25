/**
 * Created by Ngoc on 01-05-2018.
 */
var GameEvents = require('./GameEvents');
var Utility = require('../../../../SharedModule/Utility');
function HuntAndFun() {// Săn cá dựa trên config điểm
    GameEvents.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
}
module.exports = HuntAndFun;
HuntAndFun.prototype = new GameEvents();

HuntAndFun.prototype.EvtOnUserOutGame = function (User) {
    if (!this.Run)return;
    var totalScore = 0;
    for (var i = 0; i < User.FishHistory.length; i++) {
        try {
            totalScore += User.FishHistory[i].E * this.GetRatioByFishKind(User.FishHistory[i].K);
        } catch (e) {
            this.Logger.Game().error('GameServer.prototype.UpdateListFishDie - try err: ' + e.stack);
        }

    }

    if (Utility.CheckVariable(User.FishHistoryHuntAndFun)) {//Trừ lại số liệu trước khi Event Diễn Ra, nếu có
        for (var i = 0; i < User.FishHistoryHuntAndFun.length; i++) {
            try {
                totalScore -= User.FishHistoryHuntAndFun[i].E * this.GetRatioByFishKind(User.FishHistory[i].K);
            } catch (e) {
                this.Logger.Game().error('HuntAndFun.prototype.EvtOnUserOutGame - try err: ' + e.stack);
            }

        }
    }
    this.GameServer.RedisAdapter.zIncrby(this.DataKey, totalScore, User.UserID);
};

HuntAndFun.prototype.OnTurnOnTrigger = function () {
    //Clone Data để trừ khi kết thúc game
    for (var i = 0; i < this.GameServer.UserClient.length; i++) {
        if (Utility.CheckVariable(this.GameServer.UserClient[i], 'UserModel')) {
            var User = this.GameServer.UserClient[i].UserModel;
            User.FishHistoryHuntAndFun = [];
            for (var j = 0; j < User.FishHistory.length; j++) {
                User.FishHistoryHuntAndFun.push({
                    E: User.FishHistory[j].E,
                    K: User.FishHistory[j].K

                });
            }
        }
    }

};

HuntAndFun.prototype.GetRatioByFishKind = function (FishKind) {
    if (!Utility.CheckVariable(this.EventConfig, 'FishList')){
        console.log(this.EventConfig);
        return 0;// Sai Config
    }
    for (var i = 0; i < this.EventConfig.FishList.length; i++) {
        if (this.EventConfig.FishList[i].FishKind == FishKind) {
            return this.EventConfig.FishList[i].Ratio || 0;
        }
    }
    return 0;
};