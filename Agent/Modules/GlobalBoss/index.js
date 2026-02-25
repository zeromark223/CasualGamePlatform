/**
 * Created by ngocnpt on 08-May-17.
 */
var Utility = require('../../../SharedModule/Utility');

function GlobalBoss() {
    this.Agent = 0;
    this.AutoID = Math.floor((+new  Date() - new Date(new Date().getFullYear()+'-01-01'))/1000);
    this.GlobalBossTimers = [
        {
            Tick: 0,
            Interval: 1000,
            Wake: this.Timer1seconds.bind(this)
        },
        {
            Tick: 0,
            Interval: 5000,
            Wake: this.Timer5seconds.bind(this)
        }
    ];
    this.GlobalBossList = [];
}
module.exports = GlobalBoss;

GlobalBoss.prototype.Init = function (Agent) {
    this.Agent = Agent;
    this.InitTimer();
};

GlobalBoss.prototype.InitTimer = function () {
    for (var i = 0; i < this.GlobalBossTimers.length; i++) {
        this.Agent.MainTimers.push(this.GlobalBossTimers[i]);
    }
};

GlobalBoss.prototype.Timer1seconds = function () {

};

GlobalBoss.prototype.Timer5seconds = function () {
    this.GetGlobalBossInfo();
    this.GlobalBossCheckAndSpawn();
};

GlobalBoss.prototype.GetGlobalBossInfo = function () {
    this.Agent.SQLAdapter.globalBossGet(function (e, d) {
        if (e == 0) {
            this.HandleNewGlobalBossList(d);
        } else {
            //Handle Error
        }
    }.bind(this));
};

GlobalBoss.prototype.HandleNewGlobalBossList = function (newList) {
    if (Utility.CheckVariable(newList, 'length')) {
        this.GlobalBossListExpiredAll(); // Check các boss ko được renew và xòa
        for (var i = 0; i < newList.length; i++) {
            if (Utility.CheckVariable(newList[i], 'BossID', 'KindID', 'FishKind', 'MaxHp', 'RoundTime', 'RoundCount', 'Delay', 'BossCount', 'TotalGoldHit', 'GoldHitMultiple', 'GoldHitRatio', 'LastHitGold')) {
                var OldBoss = this.GlobalBossFindById(newList[i].BossID);
                if (OldBoss == 0) {
                    this.GlobalBossListAdd(newList[i]);
                } else {
                    if (this.GlobalBossCompare(OldBoss, newList[i])) {
                        this.GlobalBossListRenew(OldBoss);// renew boss củ (sẽ quét các boss ko được làm mới và xóa);
                    } else {
                        this.GlobalBossListUpdate(OldBoss, newList[i]);
                    }
                }

            }
        }
        this.GlobalBossListExpiredRemove(); // Check các boss ko được renew và xòa
    } else {
        //Handle Error List
    }

};

GlobalBoss.prototype.GlobalBossFindById = function (bossID) {
    for (var i = 0; i < this.GlobalBossList.length; i++) {
        if (this.GlobalBossList[i].BossID == bossID) {
            return this.GlobalBossList[i];
        }
    }
    return 0;
};

GlobalBoss.prototype.GlobalBossCompare = function (oldBoss, newBoss) {
    //Check oldBoss variable vs newList
    //'BossID', 'FishKind', 'MaxHp', 'RoundTime', 'RoundCount', 'Delay', 'BossCount', 'TotalGoldHit', 'GoldHitMultiple', 'GoldHitRatio', 'LastHitGold'
    if (oldBoss.FishKind != newBoss.FishKind)return false; // Thay đổi loại cá thả
    if (oldBoss.MaxHp != newBoss.MaxHp)return false; // Thay đổi máu cá thả
    if (oldBoss.KindID != newBoss.KindID)return false; // Thay đổi máu cá thả
    if (oldBoss.RoundTime != newBoss.RoundTime)return false; // Thay đổi thời gian bơi hết 1 vòng
    if (oldBoss.RoundCount != newBoss.RoundCount)return false; // Thay đổi số vòng cá bơi
    if (oldBoss.BossCount != newBoss.BossCount)return false; // Thay đổi số vòng cá bơi
    if (oldBoss.TotalGoldHit != newBoss.TotalGoldHit)return false; // Thay đổi số vòng cá bơi
    if (oldBoss.GoldHitMultiple != newBoss.GoldHitMultiple)return false; // Thay đổi số vòng cá bơi
    if (oldBoss.GoldHitRatio != newBoss.GoldHitRatio)return false; // Thay đổi số vòng cá bơi
    if (oldBoss.LastHitGold != newBoss.LastHitGold)return false; // Thay đổi số vòng cá bơi
    return true;//Check result

};

GlobalBoss.prototype.GlobalBossListAdd = function (newBoss) {
    //Insert some data to newBoss;
    newBoss.SpawnTime = 0;// Chưa thả nên thời gian thả = 0;
    this.GlobalBossListRenew(newBoss);// Renew boss
    this.GlobalBossList.push(newBoss);
};

GlobalBoss.prototype.GlobalBossListUpdate = function (oldBoss, newBoss) {
    //Edit some value = new value
    ////'BossID', 'FishKind', 'MaxHp', 'RoundTime', 'RoundCount', 'Delay', 'BossCount', 'TotalGoldHit', 'GoldHitMultiple', 'GoldHitRatio', 'LastHitGold'
    oldBoss.FishKind = newBoss.FishKind;
    oldBoss.KindID = newBoss.KindID;
    oldBoss.MaxHp = newBoss.MaxHp;
    oldBoss.RoundTime = newBoss.RoundTime;
    oldBoss.RoundCount = newBoss.RoundCount;
    oldBoss.BossCount = newBoss.BossCount;
    oldBoss.TotalGoldHit = newBoss.TotalGoldHit;
    oldBoss.GoldHitMultiple = newBoss.GoldHitMultiple;
    oldBoss.GoldHitRatio = newBoss.GoldHitRatio;
    oldBoss.LastHitGold = newBoss.LastHitGold;
    //Sau khi update xong phải renew
    this.GlobalBossListRenew(oldBoss);
};

GlobalBoss.prototype.GlobalBossListRenew = function (oldBoss) {
    //Refresh some data
    oldBoss.Expired = false;
};

GlobalBoss.prototype.GlobalBossListExpiredAll = function () {
    for (var i = 0; i < this.GlobalBossList.length; i++) {
        this.GlobalBossList[i].Expired = true;
    }
};

GlobalBoss.prototype.GlobalBossListExpiredRemove = function () {
    for (var i = 0; i < this.GlobalBossList.length; i++) {
        if (this.GlobalBossList[i].Expired) {
            this.GlobalBossList.splice(i, 1);//Xóa object
            i--;
        }
    }
};

GlobalBoss.prototype.GlobalBossCheckTime = function (boss) {
    var completeTime = (boss.RoundTime*1000 * boss.RoundCount) + boss.Delay*1000; // Thời gian boss hoàn thành 1 chu kỳ
    return (boss.SpawnTime + completeTime) < +new Date();// Thời gian thả + thời gian hoàn thành đã quá hạn
};

GlobalBoss.prototype.GlobalBossCheckCount = function (boss) {
    return boss.BossCount > 0;
};

GlobalBoss.prototype.GlobalBossCheckAndSpawn = function () {
    for (var i = 0; i < this.GlobalBossList.length; i++) {
        var boss = this.GlobalBossList[i];
        if (this.GlobalBossCheckTime(boss)) { // Boss đã bơi xong chu kỳ
            if (this.GlobalBossCheckCount(boss)) { // Còn boss
                this.GlobalBossSpawn(boss);
            }
        }
    }
};

GlobalBoss.prototype.GlobalBossSpawn = function (boss) {
    boss.SpawnTime = + new Date();
    boss.BossCount--;// Giảm số lượng boss

    this.Agent.SQLAdapter.recordSpawnBoss(boss.BossID,function (e,recordData) {
        if(e == 0){
            try{
                var BossAutoID = this.GenBossAutoID();
                this.Agent.LogRecorder.spawnBossRecord(BossAutoID, recordData.BossID, recordData.KindID, recordData.FishKind,
                    recordData.MaxHp, recordData.RoundTime, recordData.RoundCount, recordData.Delay, recordData.BossCount, recordData.TotalGoldHit,
                    recordData.GoldHitMultiple, recordData.GoldHitRatio, recordData.LastHitGold, recordData.DayStart, recordData.DayEnd,
                    recordData.TimeStart, recordData.TimeEnd, new Date());
                this.Agent.GMToolAdapter.SendGameCommandAll({
                    CMD: this.Agent.AgentConfig.GMToolConfig.CMD.GlobalBossStartBoss,
                    Data: {
                        BossAutoID:BossAutoID,
                        BossID:boss.BossID,
                        GameKindID:boss.KindID,
                        FishKind:boss.FishKind,
                        MaxHp:boss.MaxHp,
                        RoundTime:boss.RoundTime,
                        RoundCount:boss.RoundCount,
                        TotalGoldHit:boss.TotalGoldHit,
                        GoldHitMultiple:boss.GoldHitMultiple,
                        GoldHitRatio:boss.GoldHitRatio,
                        LastHitGold:boss.LastHitGold
                    }
                });
            }catch (e){
                this.Agent.Logger.Game().error('GlobalBoss.prototype.GlobalBossSpawn - try err: ' + e.stack);
            }

        }
    }.bind(this));


};

GlobalBoss.prototype.GenBossAutoID = function () {
    return ++this.AutoID;
};