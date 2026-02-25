/**
 * Created by Ngoc on 01-05-2018.
 */
var GameEvents = require('./GameEvents');
var Utility = require('../../../../SharedModule/Utility');
function KingOfTheSea() {
    GameEvents.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
}
module.exports = KingOfTheSea;
KingOfTheSea.prototype = new GameEvents();

KingOfTheSea.prototype.OnTurnOnTrigger = function () {
    //Clone Data để trừ khi kết thúc game
    if(!this.Anti)this.Anti=0;
    for (var i = 0; i < this.GameServer.UserClient.length; i++) {
        if (Utility.CheckVariable(this.GameServer.UserClient[i], 'UserModel')) {
            var User = this.GameServer.UserClient[i].UserModel;
            User.FishHistoryKingOfTheSea = 0;
            for (var j = 0; j < User.FishHistory.length; j++) {
                if(Utility.CheckVariable(User.FishHistory[j],'E')){
                    User.FishHistoryKingOfTheSea += User.FishHistory[j].E;
                }
            }
        }
    }

};

KingOfTheSea.prototype.EvtOnUserOutGame = function (User) {
    if (!this.Run)return;
    var totalFishGold = 0;
    for (var i = 0; i < User.FishHistory.length; i++) {
        totalFishGold += User.FishHistory[i].E;//Tiền thắng cá
    }
    if (Utility.CheckVariable(User.FishHistoryKingOfTheSea)) {//Trừ lại số liệu trước khi Event Diễn Ra, nếu có
        totalFishGold -= User.FishHistoryKingOfTheSea;//Tiền thắng cá
    }
    //Record SQL
    //Record Redis
    this.GameServer.RedisAdapter.zIncrby(this.DataKey, totalFishGold, User.UserID);
};

