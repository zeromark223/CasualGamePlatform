/**
 * Created by Ngoc on 01-05-2018.
 */
var GameEvents = require('./GameEvents');
var Utility = require('../../../../SharedModule/Utility');
function SeaHunter() {
    GameEvents.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
}
module.exports = SeaHunter;
SeaHunter.prototype = new GameEvents();

SeaHunter.prototype.OnTurnOnTrigger = function () {
    //Clone Data để trừ khi kết thúc game
    for (var i = 0; i < this.GameServer.UserClient.length; i++) {
        if (Utility.CheckVariable(this.GameServer.UserClient[i], 'UserModel')) {
            var User = this.GameServer.UserClient[i].UserModel;
            User.TotalGoldUserPayForSysSeaHunter = User.TotalGoldUserPayForSys;
        }
    }

};

SeaHunter.prototype.EvtOnUserOutGame = function (User) {
    if(!this.Run)return;
    var totalBulletGold = User.TotalGoldUserPayForSys;
    if (Utility.CheckVariable(User.TotalGoldUserPayForSysSeaHunter)) {
        totalBulletGold -= User.TotalGoldUserPayForSysSeaHunter;
    }
    this.GameServer.RedisAdapter.zIncrby(this.DataKey, totalBulletGold, User.UserID);
};

