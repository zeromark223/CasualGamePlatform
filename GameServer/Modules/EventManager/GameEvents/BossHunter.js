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

SeaHunter.prototype.EvtOnBossDie = function (ListUserHitBoss) {
    if(!this.Run)return;
    for(var i = 0 ;i<ListUserHitBoss.length;i++){
        var uid = ListUserHitBoss[i].UserID || 0 ;
        var dmg = ListUserHitBoss[i].TotalHit*-1 || 0 ;
       if(uid >0 && dmg > 0){
           this.GameServer.RedisAdapter.zIncrby(this.DataKey, dmg, uid);
       }

    }
};

