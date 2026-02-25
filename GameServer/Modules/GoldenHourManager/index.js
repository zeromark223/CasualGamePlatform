/**
 * Created by quinx on 10/25/2017.
 */
var Utility = require('../../../SharedModule/Utility');


function GoldenHourManager() {
    this.GameServer = 0;
    this.Run = false;

    this.Width = 1280;
    this.Height = 720;
    this.DeviationX = 200;

    this.EventID = 0;
    this.ItemCount = 0;
    this.TotalCount = 0;
    this.FishKind = 0;
    this.ItemID = 0;

    this.TimerTick = 0;
    this.DestroyThreshold = 300000;
    this.LastReload = +new Date();
    this.MainTime = +new Date();

    this.ListUserHit = [];
    this.IsDestroy = false;
}

module.exports = GoldenHourManager;

GoldenHourManager.prototype.Init = function (GameServer, Count, EventID, FishKind, ItemID, RedisConnection) {
    this.Run = true;
    this.MainTime = +new Date();
    this.GameServer = GameServer;

    this.EventID = EventID;
    this.ItemCount = Count;
    this.FishKind = FishKind;
    this.ItemID = ItemID;
    this.RedisConnection = RedisConnection;
    this.LastReload = +new Date();

    this.TimerConfig = [{
        Tick: 0,
        Interval: 4000,// Convert Second to Milisecond
        Wake: this.CheckExpired.bind(this)
    }];

    this.ListUserHit = []; //set lai danh sach user ban ca

    setTimeout(this.Timer.bind(this), 1000);
};

GoldenHourManager.prototype.Destroy = function () {
    this.Run = false;
};

GoldenHourManager.prototype.SpawnEventFish = function (FishKind, ItemID, FishMultiple, MaxMultiple, NumberOfFish) {
    var FishInfo = [];
    if (this.Run != 0) {
        try {
            var now = new Date();
            var Config = this.FindEventFishConfigByFishKind(FishKind);
            if (Config != 0) {
                for (var i = 0; i < NumberOfFish; i++) {
                    var build_tick = now.getTime();

                    var PathSeed = Config.PathSeed[Math.floor(Math.random() * Config.PathSeed.length)];
                    var PosX = 0;
                    var PosY = 0;
                    var PosZ = 0;
                    var IsLeft = Math.floor(Math.random() * 2);

                    if (IsLeft == 1) {
                        PosX = -this.DeviationX;
                    }
                    else {
                        PosX = this.Width + this.DeviationX;
                    }

                    PosY = Math.floor(Math.random() * (Config.MaxY - Config.MinY + 1)) + Config.MinY;
                    PosZ = -(Math.floor(Math.random() * (Config.MaxZ - Config.MinZ + 1)) + Config.MinZ);

                    var FishID = 0; //set lai sau

                    FishInfo.push({
                        FishID: FishID,
                        FishKind: FishKind,
                        SpecialKind: 0,
                        PosX: PosX,
                        PosY: PosY,
                        PosZ: PosZ,
                        PathSeed: PathSeed,
                        ItemID: ItemID,
                        FishMultiple:FishMultiple,
                        MaxMultiple:MaxMultiple

                    });
                }
            }
        }
        catch (e) {
            this.GameServer.Logger.Game().error('GoldenHourManager.prototype.SpawnEventFish - try err: ' + e.stack);
        }
    }
    return FishInfo;
};

GoldenHourManager.prototype.FindEventFishConfigByFishKind = function (FishKind) {
    try {
        for (var i = 0; i < this.GameServer.EventFishConfig.length; i++) {
            var index = this.GameServer.EventFishConfig[i].FishKind.indexOf(FishKind);

            if (index > -1) {
                var Config = {
                    PathSeed: this.GameServer.EventFishConfig[i].PathSeed,
                    MinY: this.GameServer.EventFishConfig[i].MinY,
                    MaxY: this.GameServer.EventFishConfig[i].MaxY,
                    MinZ: this.GameServer.EventFishConfig[i].MinZ,
                    MaxZ: this.GameServer.EventFishConfig[i].MaxZ
                }

                return Config;
            }
        }
        return 0;
    }
    catch (e) {
        this.GameServer.Logger.Game().error('FindEventFishConfigByFishKind - try err: ' + e.stack);
    }
};

GoldenHourManager.prototype.CheckDropLimitAll = function(callback){
    try{
        if (this.RedisConnection == 0) {
            callback(false);
            return;
        }

        var Hash = this.GameServer.Config.RedisConfig.Define.GoldenHourLimitAll + ':' + this.FishKind;

        this.RedisConnection.hincrby(Hash, this.ItemID, 1, function (e, d) {//Tăng số lượng item của user này lên 1
            if (!e && d <= this.TotalCount) {//Check Vượt quá giới hạn
                callback(true);//Thỏa điều kiện giới hạn.
            } else {
                if (e) {
                    callback(false);
                } else {
                    this.RedisConnection.hincrby(this.GameServer.Config.RedisConfig.Define.GoldenHourLimitAll, this.ItemID, -1);// Trả lại giá trị củ
                    callback(false);
                }
            }
        }.bind(this));
    }
    catch(e){
        this.GameServer.Logger.Game().error('GoldenHourManager.prototype.CheckDropLimitAll - try err: ' + e.stack);
        callback(false);
    }
};

GoldenHourManager.prototype.DropCalc = function(callback){
    this.CheckDropLimitAll(function(IsDrop){
        callback(IsDrop);
    }.bind(this));
};

GoldenHourManager.prototype.AddGoldForListUserHit = function(UserID, Gold){
    //tim user trong list
    for(var i = 0; i < this.ListUserHit.length; i++){
        if(UserID == this.ListUserHit[i].UserID){
            this.ListUserHit[i].Gold += Gold;
            return;
        }
    }

    //chua co user, add vao
    this.ListUserHit.push({UserID: UserID, Gold: Gold});
};

GoldenHourManager.prototype.Timer = function(){
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

//UserID, ItemID, EventID, ItemCount,ChannelID, RoomID, RoomKindConfig

GoldenHourManager.prototype.LogUserHitEventFish = function(){
    //ca da boi ra khoi ban
    this.Run = false;


    for(var i = 0; i < this.ListUserHit.length; i++){
        var User = this.ListUserHit[i];
        this.GameServer.SQLAdapter.GoldenHour_InsertLogUser(User.UserID, this.EventID, User.Gold, this.GameServer.ChannelID, this.GameServer.GameServerID, this.GameServer.GameKindID, function(e, d){

        }.bind(this));
    }
};

GoldenHourManager.prototype.CheckExpired = function(){
    var checkTime = this.LastReload + 60000; //delay 30s boi trong ban

    if(+new Date() > checkTime){
        //ca da boi ra khoi ban, record log va destroy event
        this.Run = false;
        this.LogUserHitEventFish();
        this.Destroy();
    }
};

GoldenHourManager.prototype.Destroy = function(){
    this.IsDestroy = true;

    try{
        var index = -1;

        for(var i = 0; i < this.GameServer.GoldenHourManager.length; i++){
            if(this.GameServer.GoldenHourManager[i].EventID == this.EventID){
                index = i;
                break;
            }
        }

        if(index > -1){
            this.GameServer.GoldenHourManager.splice(index, 1);
        }
    }
    catch(e){
        this.GameServer.Logger.Game().error('GoldenHourManager.prototype.Destroy - try err: ' + e.stack);
    }
};