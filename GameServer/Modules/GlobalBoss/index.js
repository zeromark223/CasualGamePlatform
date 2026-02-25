/**
 * Created by ngocnpt on 08-May-17.
 */
var Packet = require('../../Packet');
var Utility = require('../../../SharedModule/Utility');

function GlobalBoss() {
    this.BossAutoID = 0;
    this.BossID = 0;
    this.FishKind = 1; //FishKind
    this.BossHP = 0;
    this.MaxHP = 0;
    this.TotalHit = 0;
    this.GameServer = 0;
    this.ListUserHitBoss = [];
    this.Run = false;
    this.MainTime = +new Date();
    this.TimerConfig = [];
    this.BirthTime = 0;
    this.TotalAwardMoney = 0;
    this.AwardValue = 0;
    this.IsDestroy = false;
    this.DelayTime = 0;
    this.LastHitUser = [];
    this.BossHashKey = '';
    this.BossHashHPKey = '';
    this.BossHashHitMoneyKey = '';
    this.BossHashWinKey = '';
}

module.exports = GlobalBoss;

GlobalBoss.prototype.InitGlobalBoss = function (gameServer, BossInfo) {
    this.GameServer = gameServer;
    this.BossAutoID = BossInfo.BossAutoID; // need get auto
    this.BossID = BossInfo.BossID;
    this.FishKind = BossInfo.FishKind;
    this.MaxHP = BossInfo.MaxHp;
    this.BossHP = BossInfo.MaxHp; // set máu boss = max
    this.RoundTime = BossInfo.RoundTime * 1000;//convert second to milisecond
    this.RoundCount = 1;
    this.TotalRoundCount = BossInfo.RoundCount;
    this.TotalGoldHit = BossInfo.TotalGoldHit;
    this.GoldHitRatio = BossInfo.GoldHitRatio;
    this.GoldHitMultiple = BossInfo.GoldHitMultiple;
    this.LastHitGold = BossInfo.LastHitGold;
    this.TotalGold = BossInfo.LastHitGold + BossInfo.TotalGoldHit;
    this.BossSkill = 0;
    this.BossHashKey = this.GameServer.RedisConfig.Define.BossGlobal + Utility.GenSuffixDateRedis()+":"+this.BossAutoID;
    this.BossHashHPKey = 'HP';
    this.BossHashHitMoneyKey = 'HitMoney';
    this.BossHashWinKey = 'WinUserID';
    this.BirthTime = +new Date();
    this.RecordLogFlag = false;
    setTimeout(this.CheckBossExpired.bind(this),3000); // Check và xóa boss

    this.TimerConfig.push(
        {
            Tick: 0,
            Interval: this.RoundTime,
            Wake: this.SpawnBoss.bind(this)
        });
    this.Run = true;
    this.SpawnBoss();
    setTimeout(this.Timer.bind(this), 1000);
};


GlobalBoss.prototype.Timer = function () {
    if (this.Run) {
        var now = +new Date();
        var difTime = (now - this.MainTime);
        this.MainTime = now;
        for (var i = 0; i < this.TimerConfig.length; i++) {
            this.TimerConfig[i].Tick += difTime;
            if (this.TimerConfig[i].Tick > this.TimerConfig[i].Interval) {

                this.TimerConfig[i].Tick = 0;
                this.TimerConfig[i].Wake();
            }
        }
    }
    if (!this.IsDestroy) {
        setTimeout(this.Timer.bind(this), 1000);
    }

};

GlobalBoss.prototype.SpawnBoss = function () {
    if (this.IsDestroy) return;// Không xử lý boss đã hủy
    if (this.BossHP > 0 && this.RoundCount <= this.TotalRoundCount) {
        for (var i = 0; i < this.GameServer.DeskList.length; i++) {
            if (this.GameServer.DeskList[i].ListUserInDesk.length > 0) {
                this.GameServer.DeskList[i].SpawnBossFishInDesk(this.BossAutoID, this.BossID, this.FishKind, this.MaxHP, this.RoundCount, this.BirthTime, 0, this.TotalGold);
            }
        }
        this.RoundCount++;
        //tăng số vòng bơi

    }

};

GlobalBoss.prototype.UserHitBoss = function (User, HPValue, callback) {
    try {
        if (this.Run) {
            var now = +new Date();
            //Trừ máu Boss
            this.UpdateBossHP(User,HPValue);

            this.OnUserHitBoss(User.UserID, HPValue, now);
            var rand = Math.random();
            if (rand < this.GoldHitRatio) {
                var MoneyReward = this.GoldHitMultiple * HPValue;
                this.GameServer.RedisAdapter.CalcAwardMoney(this.BossHashKey, this.BossHashHitMoneyKey, MoneyReward, this.TotalGoldHit, function (e, d) {
                    if (!e && Utility.CheckVariable(d)) {// ko có lổi
                        if (d[0] == 1) {//Result , 0 : hết tiền, 1 : còn tiền
                            callback(User.UserID, MoneyReward, 0, 0);// chưa có item nên 0,0
                        }
                    }

                }.bind(this));
            }
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('Boss Index UserHitBoss - try err: ' + e.stack);
    }
};

GlobalBoss.prototype.UpdateBossHP = function (User,HPValue) {
    this.GameServer.RedisAdapter.CalcHitBoss(this.BossHashKey, this.BossHashHPKey, this.BossHashWinKey, User.UserID, HPValue, this.MaxHP, function (e, d) {
        if (!e && Utility.CheckVariable(d)) {// Ko lổi
            if (d[0] == 1) {//Định nghĩa result , 0 = boss còn máu, 1 = user này giết được boss, 2 = boss đã hết máu và user khác đã giết
                //User giết được boss
                this.OnUserKillBoss(User);
            }
        }
    }.bind(this));
};

GlobalBoss.prototype.OnUserHitBoss = function (UserID, HPValue, Time) {
    var f = 0;
    for (var i = 0; i < this.ListUserHitBoss.length; i++) {
        if (this.ListUserHitBoss[i].UserID == UserID) {
            f = 1;
            this.ListUserHitBoss[i].TotalHit += -HPValue;//Giúp sort nhanh
            this.ListUserHitBoss[i].LastHitTime = -Time;//Giúp sort nhanh lúc boss chết
            break;
        }
    }
    if (f == 0) {
        this.ListUserHitBoss.push({
            UserID: UserID,
            TotalHit: -HPValue,
            LastHitTime: -Time,
            AwardMoney: 0,
            ItemID: 0,
            ItemCount: 0,
            LastHitAward:0
        });
    }

};

GlobalBoss.prototype.RecordLog = function () {
    if(this.RecordLogFlag)return;
    this.RecordLogFlag = true;
    this.GameServer.GlobalBossUpdateListUserHitBoss(this.BossAutoID, this.ListUserHitBoss);
};

GlobalBoss.prototype.CheckBossExpired = function () {
    var checkTime = this.BirthTime + this.TotalRoundCount * this.RoundTime +3000; //delay 3s
    if (+new Date() > checkTime) {
        this.Run = false;
        this.RecordLog();
        this.Destroy();
    }else{
        setTimeout(this.CheckBossExpired.bind(this),3000);
    }
};

GlobalBoss.prototype.Destroy = function () {
    this.IsDestroy = true;
    try {
        for (var i = 0; i < this.GameServer.DeskList.length; i++) {
            this.GameServer.DeskList[i].RemoveBoss(this.BossAutoID);
        }
        this.GameServer.GlobalBossRemoveByID(this.BossAutoID);
    } catch (e) {
        this.GameServer.Logger.Game().error('GlobalBoss.prototype.Destroy - try err:' + e.stack);
    }

};

GlobalBoss.prototype.OnUserGetAward = function (UserID, AwardMoney, ItemID, ItemCount,LastHitAward) {
    for (var i = 0; i < this.ListUserHitBoss.length; i++) {

        if (this.ListUserHitBoss[i].UserID == UserID) {
            this.ListUserHitBoss[i].AwardMoney += AwardMoney;
            this.ListUserHitBoss[i].ItemID = ItemID;
            this.ListUserHitBoss[i].ItemCount += ItemCount;
            this.ListUserHitBoss[i].LastHitAward += (LastHitAward || 0);
            break;
        }
    }

};

//2D

GlobalBoss.prototype.OnUserEnter = function (User) {
    try {
        if (this.IsDestroy) return;// Không xử lý boss đã hủy
        var startTime = +new Date() - this.BirthTime;
        var bossInDesk = User.MyDesk.GetBossDetailInDesk(this.BossAutoID);
        if (bossInDesk == 0) {//Phòng chưa có boss
            //start
            User.MyDesk.SpawnBossFishInDesk(this.BossAutoID, this.BossID, this.FishKind, this.MaxHP, this.RoundCount, this.BirthTime, startTime, this.TotalGold);
        } else {
            User.MyDesk.SpawnBossFishRealTime(User, bossInDesk.FishID, this.FishKind, bossInDesk.Position, startTime, this.TotalGold);
        }

    } catch (e) {
        this.GameServer.Logger.Game().error('GlobalBoss.prototype.SpawnBossForUserLate - try err:' + e.stack, User.MyDesk);
    }

};

GlobalBoss.prototype.OnBossDieOutside = function (UserID,GameName) {
    if(!this.Run)return;// Chỉ xử lý 1 lần

    this.Run = false;
    for (var i = 0; i < this.GameServer.DeskList.length; i++) {
        try {
            if (this.GameServer.DeskList[i].ListUserInDesk.length > 0) {
                this.GameServer.DeskList[i].BossDieEffect(this.BossAutoID,UserID,+this.LastHitGold,GameName);
            }
        } catch (e) {
            this.GameServer.Logger.Game().error('GameServer.prototype.GlobalBossCalcAward - try err:' + e.stack);
        }
    }
    this.RecordLog();
    this.Destroy();
};

GlobalBoss.prototype.OnUserKillBoss = function (User) {
    //BossAutoID, UserID, GoldReward, GameName
    try {
        //Record
        User.FishScore += (+this.LastHitGold);
        this.OnUserGetAward(User.UserID, 0, 0, 0,this.LastHitGold);
        this.GameServer.GMToolAdapter.SendGameCommandAll({
            CMD: this.GameServer.GMToolConfig.CMD.GlobalBossUserKill,
            Data: {
                BossAutoID: this.BossAutoID,
                UserID: User.UserID,
                GameName: User.GameName
            }
        });
    } catch (e) {
        this.GameServer.Logger.Game().error('GlobalBoss.prototype.OnUserKillBoss - try err:' + e.stack);
    }

};