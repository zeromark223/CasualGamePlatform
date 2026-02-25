/*{"build":1}*/
var rootFile = __stack[0].getFileName();
var path = require('path');
var cDir = path.dirname(rootFile);
var Config = require(path.resolve(cDir, '../../Config/GameConfig'));
var Packet = require(path.resolve(cDir, '../Packet'));
var FishSpawner = require(path.resolve(cDir, '../Engine/FishSpawner'));
var ModuleConfig = require(path.resolve(cDir, '../../Config/GameConfig/ModuleConfig'));
var Utility = require(path.resolve(cDir, '../../SharedModule/Utility'));
var SkillInfo = require(path.resolve(cDir, '../Engine/SkillInfo'));
var FishClass = require(path.resolve(cDir, '../Fishes'));

function RoomCore() {
    this.GameServer = 0;
    this.DeskID = 0;
    this.Run = true;
    this.ListUserInDesk = []; //arary object {User: object, DeskStaion: int}
    this.MainTime = +new Date;

    //Timer
    this.FishSpawnerTimers = [];
    this.ParadeFishSpawnerTimers = [//cá trận
        {
            Tick: 0,
            Interval: 600000,
            Wake: this.SpawnParadeFish_REALTIME.bind(this)
        }
    ];

    this.NonStopTimers = [
        {
            Tick: 0,
            Interval: 6000,
            Wake: this.LogRedisUserInRoomDetail.bind(this)
        },
        {
            Tick: 0,
            Interval: 120000,
            Wake: this.ClearExpiredFish.bind(this)
        }
    ];

    this.SecondTimer = {Tick: 0, Interval: 1000};
    this.ArrayStationNo = [0, 1, 2, 3];
    this.RoomID = 0;
    this.RoomName = '';
    this.ListFish = [];
    this.FishConfig = [];

    //FishSpawner
    this.FishSpawner = 0;
    this.IsSpecialScreen = 0;
    this.Config = Config;

    //BossFish
    this.BossFish = 0;

    this.SkillInfo;

    //Current Parade Fish
    this.CurrentParadeFish = 0;

    //DEBUG flag
    this.DEBUG = 0;

    /// Anti Farmer
    this.LimitFarmerMultiple = 0;//300; // Chỉ check cá có Multiple lớn hơn số này, để chặn framer hit and run.

    //Room Effect
    this.RoomEffect = {BrainFreeze: 1, Stunned: 2};
    this.CurrentRoomEffect = [];
    this.Freezed = 0;
    this.BrainFreezeTimeOut = 10000;

    this.FISH_LIFE_CYCLE = 120;
    this.FishParadeTimeOut = 0;
}

module.exports = RoomCore;

RoomCore.prototype.initRoomCore = function (gameServer, deskId) {

    this.GameServer = gameServer;
    this.FishConfig = gameServer.FishConfig;
    this.DeskID = deskId;
    this.Run = false;
    this.FishSpawner = new FishSpawner(this);
};

RoomCore.prototype.initRoom = function () {
    this.initRoomCore(this.GameServer, this.DeskID);
    this.SkillInfo = new SkillInfo(this.GameServer, this);
};

RoomCore.prototype.Start = function (gameServer, id) {
    this.GameServer = gameServer;
    this.DeskID = id;


    this.initRoom();
    setInterval(this.TimerLoop.bind(this), 100);
};

RoomCore.prototype.StartDeskWhenUserJoin = function () {
    if (!this.Run && this.ListUserInDesk.length > 0) {
        this.Run = true;

        this.ResetAllTimerTick();
    }
};

RoomCore.prototype.StopDeskWhenUserLeft = function () {
    if (this.Run && this.ListUserInDesk.length <= 0) {
        this.Run = false;
        this.ResetAllTimerTick();
    }
};

RoomCore.prototype.TimerLoop = function () {
    try {
        if (this.Run) {
            var local = new Date();
            var difTime = (local - this.MainTime);
            if (this.ListUserInDesk.length > 0) {
                if (this.IsSpecialScreen == 0 && this.Freezed == 0) {
                    for (var i = 0; i < this.FishSpawnerTimers.length; i++) {
                        this.FishSpawnerTimers[i].Tick += difTime;
                        if (this.FishSpawnerTimers[i].Tick > this.FishSpawnerTimers[i].Interval) {
                            this.FishSpawnerTimers[i].Tick = 0;
                            this.FishSpawnerTimers[i].Wake();
                        }
                    }

                    for (var i = 0; i < this.ParadeFishSpawnerTimers.length; i++) {
                        this.ParadeFishSpawnerTimers[i].Tick += difTime;
                        if (this.ParadeFishSpawnerTimers[i].Tick > this.ParadeFishSpawnerTimers[i].Interval) {
                            this.ParadeFishSpawnerTimers[i].Tick = 0;
                            this.ParadeFishSpawnerTimers[i].Wake();
                        }
                    }
                }

                for (var i = 0; i < this.CurrentRoomEffect.length; i++) {
                    this.CurrentRoomEffect[i].Tick += difTime;
                    if (this.CurrentRoomEffect[i].Tick > this.CurrentRoomEffect[i].Interval) {
                        this.CurrentRoomEffect[i].Tick = 0;
                        this.CurrentRoomEffect[i].Wake();
                    }
                }

                for (var i = 0; i < this.NonStopTimers.length; i++) {
                    this.NonStopTimers[i].Tick += difTime;
                    if (this.NonStopTimers[i].Tick > this.NonStopTimers[i].Interval) {
                        this.NonStopTimers[i].Tick = 0;
                        this.NonStopTimers[i].Wake();
                    }
                }
            }

            this.MainTime = local;
        }
    }
    catch (err) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.TimerLoop - try err: ' + err.stack);
    }
};

RoomCore.prototype.ResetAllTimerTick = function () {
    this.MainTime = +new Date;
    for (var i = 0; i < this.FishSpawnerTimers.length; i++) {
        this.FishSpawnerTimers[i].Tick = 0;
    }
};

RoomCore.prototype.ClearExpiredFish = function () {
    var now = new Date();
    var build_tick = now.getTime();
    for (var i = 0; i < this.ListFish.length; i++) {
        var difT = build_tick - this.ListFish[i].BuildTick;
        if (difT > this.FISH_LIFE_CYCLE * 1000) //120s
        {
            if (i > -1) {
                this.ListFish.splice(i, 1);
                i--;
            }
        }
    }
};

RoomCore.prototype.UpdateUserLeftDesk = function (socket) {
    try {
        if (!socket.UserModel.LeftDesk) {
            socket.UserModel.LeftDesk = true;

            this.GameServer.UserInfoUpdateAll(socket);

            var msg = new Packet.UserLeft(socket.UserModel.StationID);
            this.SendAllPlayer(msg);

            var userID = socket.UserModel.UserID;
            var infoUser = '' + this.GameServer.GameServerID + ',' + socket.UserModel.StationID + ',' + socket.UserModel.FishScore + ',' + socket.UserModel.FishLevel + ',' + socket.UserModel.FishExp;
            this.GameServer.RedisAdapter.LogRedisUserInRoomDetail(infoUser, userID);

            this.RemoveUser(userID);
            this.GameServer.RemoveUser(userID);

            //clear table
            this.StopDeskWhenUserLeft();

            //remove database
            setTimeout(function () {
                this.GameServer.DestroySocket(socket);
            }.bind(this), 1000);
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.UpdateUserLeftDesk - try err: ' + e.stack);
    }
};

//thêm user vào bàn chơi
RoomCore.prototype.AddUser = function (user) {
    try {
        var deskStation = this.FindDeskStationForUser();
        if (deskStation != -1) {
            user.MyDesk = this;
            this.SpawnParadeFishForNewComingUser(user);
            this.ListUserInDesk.push({User: user, DeskStation: deskStation});
            this.OnUserEnterDesk(user);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.AddUser - try err: ' + e.stack);
    }
};

//xóa user khỏi bàn chơi
RoomCore.prototype.RemoveUser = function (userId) {
    try {
        var index = this.FindIndexOfUserInDesk(userId);
        if (index > -1)
            this.ListUserInDesk.splice(index, 1);
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.RemoveUser - try err: ' + e);
    }
};

//Tìm vị trí của user trong list user bàn chơi
RoomCore.prototype.FindIndexOfUserInDesk = function (userId) {
    var index = -1;
    try {
        for (var i = 0; i < this.ListUserInDesk.length; i++) {
            var userInDesk = this.ListUserInDesk[i];
            if (userInDesk.User.UserID == userId) {
                index = i;
                break;
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.FindIndexOfUserInDesk - try err: ' + e);
    }

    return index;
};

RoomCore.prototype.FindDeskStationByUser = function (userId) {
    var deskStation = -1;
    try {
        for (var i = 0; i < this.ListUserInDesk.length; i++) {
            var userInDesk = this.ListUserInDesk[i];
            if (userInDesk.User.UserID == userId) {
                deskStation = userInDesk.DeskStation;
                break;
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.FindDeskStationByUser - try err: ' + e);
    }

    return deskStation;
};

RoomCore.prototype.FindUserInDesk = function (socket) {
    try {
        for (var i = 0; i < this.ListUserInDesk.length; i++) {
            if (this.ListUserInDesk[i].User.Socket == socket) {
                return this.ListUserInDesk[i];
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.FindUserInDesk - try err: ' + e);
    }

    return null;
};

//Tìm vị trí trống
RoomCore.prototype.FindDeskStationForUser = function () {
    var deskStation = -1;
    try {
        var stationLength = this.ArrayStationNo.length, userLength = this.ListUserInDesk.length;
        if (userLength < stationLength) {
            var isEmpty = true;
            for (var i = 0; i < stationLength; i++) {
                isEmpty = true;
                for (var j = 0; j < userLength; j++) {
                    if (this.ListUserInDesk[j].DeskStation == this.ArrayStationNo[i]) {
                        isEmpty = false;
                        break;
                    }
                }

                if (isEmpty) {
                    deskStation = this.ArrayStationNo[i];
                    break;
                }
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.FindDeskStationForUser - try err: ' + e);
    }

    return deskStation;
};

RoomCore.prototype.SendAllPlayer = function (msg) {
    try {
        for (var i = 0; i < this.ListUserInDesk.length; i++) {
            this.GameServer.SendSocketBinary(this.ListUserInDesk[i].User.Socket, msg);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.SendAllPlayer - try err: ' + e);
    }
};

RoomCore.prototype.SendAllPlayerExceptUserID = function (msg, UserID) {
    try {
        for (var i = 0; i < this.ListUserInDesk.length; i++) {
            if (this.ListUserInDesk[i].User.UserID != UserID) {
                this.GameServer.SendSocketBinary(this.ListUserInDesk[i].User.Socket, msg);
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.SendAllPlayer - try err: ' + e);
    }
};

RoomCore.prototype.CheckBulletMultiple = function (multiple) {
    try {
        if (this.GameServer.GunConfig.Gun.GunMultiple.Min <= multiple && multiple <= this.GameServer.GunConfig.Gun.GunMultiple.Max)
            return true;
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.CheckBulletMultiple - try err: ' + e);
    }

    return false;
};

RoomCore.prototype.GetFishDetailInDesk = function (fishId) {
    try {
        if (!this.IsNullOrUndefined(this.ListFish)) {
            for (var i = 0; i < this.ListFish.length; i++) {
                if (this.ListFish[i].FishID == fishId) {
                    return this.ListFish[i];
                }
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.GetFishDetailInDesk - try err: ' + e);
    }

    return 0;
};

RoomCore.prototype.IndexOfFishInDesk = function (fishId) {
    var index = -1;

    try {
        if (!this.IsNullOrUndefined(this.ListFish)) {
            for (var i = 0; i < this.ListFish.length; i++) {
                if (this.ListFish[i].FishID == fishId) {
                    index = i;
                    break;
                }
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.IndexOfFishInDesk - try err: ' + e);
    }

    return index;
};

RoomCore.prototype.RemoveFishInDesk = function (fishId) {
    try {
        var index = this.IndexOfFishInDesk(fishId);
        if (index > -1) {
            this.ListFish.splice(index, 1);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.RemoveFishInDesk - try err: ' + e);
    }
};

RoomCore.prototype.IsNullOrUndefined = function (obj) {
    return !Utility.CheckVariable(obj);
};

RoomCore.prototype.LogRedisUserInRoomDetail = function () {
    try {
        for (var i = 0; i < this.ListUserInDesk.length; i++) {
            var infoUser = '' + this.GameServer.GameServerID + ','
                + this.ListUserInDesk[i].User.StationID + ','
                + this.ListUserInDesk[i].User.FishScore + ','
                + this.ListUserInDesk[i].User.CurrentBulletMul + ','
                + this.ListUserInDesk[i].User.TotalGoldUserPayForSys;
            this.GameServer.RedisAdapter.LogRedisUserInRoomDetail(infoUser, this.ListUserInDesk[i].User.UserID);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.LogRedisUserInRoomDetail - try err: ' + e);
    }
};

function requireUnCached(NameLink) {//Use to re require
    var l = module.children.length;
    for (var i = 0; i < l; i++) {
        if (module.children[i].id === require.resolve(NameLink)) {
            module.children.splice(i, 1);
            break;
        }
    }
    delete require.cache[require.resolve(NameLink)];
    return require(path.resolve(cDir, NameLink));
}

/**
 * Bắt cá đỏ
 * client gửi lên fishID, số lượng cá trên bàn, bulletID
 * */
RoomCore.prototype.OnCatchRedFish = function (user, fishID, FishIDArray, BulletMultiple) {
    try {
        var FishDetail = this.GetFishDetailInDesk(fishID);
        var RedFishKind = 30; //kind của cá đỏ
        if (FishDetail != 0) {
            if (FishDetail.IsRedFish == 1
                && BulletMultiple > 0) {
                if (user.FishScore >= BulletMultiple) {
                    //user.FishScore -= (BulletMultiple > 0 ? +BulletMultiple : 0);
                    var bulMul = user.PopBulletWithValue(BulletMultiple);
                    if (bulMul <= 0) return;
                    this.GameServer.AddStock((BulletMultiple > 0 ? +BulletMultiple : 0));// Make sure fishScore > 0. And stock - FishScore
                    var SumMultiple = FishDetail.Multiple;
                    for (var i = 0; i < FishIDArray.length; i++) {
                        var TempFishDetail = this.GetFishDetailInDesk(FishIDArray[i]);
                        if (TempFishDetail.FishKind == FishDetail.FishKind) {
                            SumMultiple += TempFishDetail.Multiple;
                        }
                    }
                    var FishMultiple = FishDetail.GetHit(user.GetHandicapStock(), this.GameServer.GetStockRatio(), user.UserID, BulletMultiple, 0, SumMultiple);
                    var GoldReward = FishMultiple * BulletMultiple;
                    if (FishMultiple > 0) {
                        this.GameServer.AddStock(-(GoldReward > 0 ? +GoldReward : 0));// Make sure fishScore > 0. And stock - FishScore
                        user.FishScore += (GoldReward > 0 ? +GoldReward : 0);
                        this.CalcExp(GoldReward, user);
                        var msg = new Packet.CatchRedFish(user.StationID, fishID, GoldReward, user.FishScore, user.FishLevel, user.FishExp, FishIDArray);
                        this.SendAllPlayer(msg);
                        var ListFishDie = FishIDArray;
                        var fishCount = ListFishDie.length;
                        ListFishDie.push(fishID);
                        for (var i = 0; i < ListFishDie.length; i++) {
                            this.RemoveFishInDesk(ListFishDie[i]);
                            //Check ca trong ca tran
                            if (this.IsSpecialScreen) {
                                for (var i = 0; i < ListFishDie.length; i++) {
                                    var index = this.FindIndexOfFishInFishParade(ListFishDie[i]);
                                    if (index != -1) {
                                        this.CurrentParadeFish.ListFish[index].FishID = 0;
                                        this.CurrentParadeFish.ListFish[index].FishKind = -1;
                                    }
                                    if (this.CheckParadeIsEnd()) {
                                        setTimeout(function () {
                                            this.EndParadeFish()
                                        }.bind(this), 1000);
                                    }
                                }
                            }
                        }
                        user.RecordFish(RedFishKind, BulletMultiple, SumMultiple, 1, fishCount);//record ăn cá
                    }
                    else {
                        user.RecordFish(RedFishKind, BulletMultiple, 0, 1, 0);//record bắn cá
                        var msg = new Packet.CatchFish(user.StationID, 0, 0, user.FishScore, user.FishLevel, user.Exp);
                        this.SendAllPlayer(msg);
                    }
                }
                else {
                    this.OnUserRanOutMoney(user.Socket);
                }
            }
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.OnCatchRedFish - try err: ' + e.stack);
    }
};

RoomCore.prototype.OnCatchFish = function (User, FishID, BulletMultiple) {
    this.OnCatchFishWithoutRemove(User, FishID, BulletMultiple, 0);
};

RoomCore.prototype.SpawnNormalFish = function () {
    if (this.IsSpecialScreen == 0) {
        var NumberOfFish = Math.floor(Math.random() * 5) + 1;
        var ListFish = this.FishSpawner.SpawnNormalFish(NumberOfFish, 0, 0);
        var msg = new Packet.SpawnFish(ListFish);
        this.SendAllPlayer(msg);
    }
};

RoomCore.prototype.SpawnParadeFish = function () {
    if (this.IsSpecialScreen == 0) {
        this.IsSpecialScreen = 1;
        var msg = new Packet.ClearFish();
        this.SendAllPlayer(msg);

        setTimeout(function () {
            this.FishSpawner.SpawnParadeFish();
        }.bind(this), 2000);

        setTimeout(function () {
            this.IsSpecialScreen = 0;
            var msg = new Packet.ClearFish();
            this.SendAllPlayer(msg);

        }.bind(this), 60000)
    }
};

RoomCore.prototype.SpawnSmallFish = function () {
    if (this.IsSpecialScreen == 0) {
        var ListFish = this.FishSpawner.SpawnSmallFish();
        var msg = new Packet.SpawnFish(ListFish);
        this.SendAllPlayer(msg);
    }
};

RoomCore.prototype.SpawnMediumFish = function () {
    if (this.IsSpecialScreen == 0) {
        var ListFish = this.FishSpawner.SpawnMediumFish();
        var msg = new Packet.SpawnFish(ListFish);
        this.SendAllPlayer(msg);
    }
};

RoomCore.prototype.SpawnCrowdedFish = function () {
    if (this.IsSpecialScreen == 0) {
        var ListFish = this.FishSpawner.SpawnCrowdedFish();
        var msg = new Packet.SpawnCrowdedFish(ListFish);
        this.SendAllPlayer(msg);
    }
};

/**
 * Tìm danh sách cá theo loại cá
 * Nếu numOfFish > 0 thì lấy theo số lượng numOfFish, ngược lại lấy hết loại cá
 * */
RoomCore.prototype.FindListFishByKindID = function (kindID, numOfFish) {
    var lst = [];
    if (this.ListFish) {
        for (var i = 0, length = this.ListFish; i < length; i++) {
            if (this.ListFish[i].FishKind == kindID) {
                lst.push(this.ListFish[i]);
            }
        }

        if (numOfFish > 0) {
            lst = lst.slice(0, numOfFish);
        }
    }

    return lst;
};


RoomCore.prototype.OnUserRanOutMoney = function (socket) {
    var msg = new Packet.KickUserResponse(1, 'Tài khoản đã hết tiền, vui lòng nạp thêm');
    this.GameServer.SendSocketBinary(socket, msg);

    setTimeout(function () {
        this.GameServer.DestroySocket(socket);
    }.bind(this), 1000);
};

RoomCore.prototype.SpawnParadeFish_REALTIME = function () {
    if (this.IsSpecialScreen == 0) {
        this.IsSpecialScreen = 1;
        var msg = new Packet.ClearFish();
        var DelayTime = this.GameServer.ParadeFishConfig.Duration_3D * 1000;
        this.SendAllPlayer(msg);

        if (this.GameServer.IsCheck2D()) {
            msg = this.FishSpawner.ManageSpawnParade();
            DelayTime = this.GameServer.ParadeFishConfig.Duration_2D * 1000;
        }
        else {
            msg = this.FishSpawner.SpawnParadeFish_REALTIME(1);
        }

        this.SendAllPlayer(msg);


        this.FishParadeTimeOut = setTimeout(function () {
            this.EndParadeFish();
        }.bind(this), DelayTime);
    }
};

RoomCore.prototype.SpawnParadeFishForNewComingUser = function (user) {
    if (this.GameServer.IsCheck2D()) {
        return;
    }

    if (this.IsSpecialScreen == 1) {
        var msg = this.FishSpawner.SpawnParadeFish_REALTIME(0);
        this.GameServer.SendSocketBinary(user.Socket, msg);
    }
};

RoomCore.prototype.FindIndexOfFishInFishParade = function (FishID) {
    if (this.CurrentParadeFish != 0) {

        for (var i = 0; i < this.CurrentParadeFish.ListFish.length; i++) {
            if (this.CurrentParadeFish.ListFish[i].FishID == FishID) {
                return i;
            }
        }
    }
    return -1;
};

RoomCore.prototype.GetExpToNextLevel = function (Level) {
    var NextExp = 3 * (2 * (Level * Level * Level * Level) + 6 * (Level * Level * Level)
        + 4 * (Level * Level) + 25 * Level);

    return NextExp;
};

RoomCore.prototype.CalcExp = function (BonusExp, user) { //BonusExp = FishScore / 10
    BonusExp = BonusExp / 10; //cÔng thức gamedesign
    user.FishLevel = +user.FishLevel;
    user.FishExp = +user.FishExp;

    var ExpToNextLevel = this.GetExpToNextLevel(user.FishLevel);
    user.FishExp += +BonusExp;

    if (user.FishExp >= ExpToNextLevel) //Level up
    {
        user.FishLevel += +1;
        user.FishExp = 0;
    }
};

RoomCore.prototype.ResetFishTimer = function (NewTimerData) {
    if (this.DEBUG == 1) {
        this.FishSpawnerTimers = [];
        for (var i = 0; i < NewTimerData.length; i++) {
            this.FishSpawnerTimers.push({
                Tick: 0,
                Interval: NewTimerData[i].Interval,
                Wake: this.GetTimerWakeFunction(NewTimerData[i].Kind)
            });
        }
    }

};

RoomCore.prototype.GetTimerWakeFunction = function (Kind) {
    var func = 0;
    switch (Kind) {
        case 1: //ca nho
            func = this.SpawnSmallFish.bind(this);
            break;
        case 2: //ca vua
            func = this.SpawnMediumFish.bind(this);
            break;
        case 3: //ca to
            func = this.SpawnBigFish.bind(this);
            break;
        case 4: //ca hoang kim
            func = this.SpawnGoldenFish.bind(this);
            break;
        case 5: //ca dan
            func = this.SpawnCrowdedFish.bind(this);
            break;
        case 6: //ca tran
            func = this.SpawnParadeFish_REALTIME.bind(this);
            break;
    }
    return func;
};

RoomCore.prototype.FindUserInDeskByUserID = function (UserID) {
    var User = 0;
    for (var i = 0; i < this.ListUserInDesk.length; i++) {
        var userInDesk = this.ListUserInDesk[i];
        if (userInDesk.User.UserID == UserID) {
            User = userInDesk.User;
        }
    }

    return User;
};

RoomCore.prototype.SpawnBigFish = function () {
    if (this.IsSpecialScreen == 0) {
        var ListFish = this.FishSpawner.SpawnBigFish();
        var msg = new Packet.SpawnFish(ListFish);
        this.SendAllPlayer(msg);
    }
};

RoomCore.prototype.SpawnGoldenFish = function () {
    if (this.IsSpecialScreen == 0) {
        var ListFish = this.FishSpawner.SpawnGoldenFish();
        var msg = new Packet.SpawnFish(ListFish);
        this.SendAllPlayer(msg);
    }
};

RoomCore.prototype.FindPathInfo = function (PathID) {
    var result = 0;
    var PathConfig = this.Config.PathConfig.PathInfo;
    for (var i = 0; i < PathConfig.length; i++) {
        var PathInfo = PathConfig[i];
        if (PathInfo.PathID == PathID) {
            result = PathInfo;
        }
    }
    return result;
};


//TODO: DEBUG
RoomCore.prototype.SpawnCrowdedFish1 = function (FishInfo) {

    if (this.IsSpecialScreen == 0 && this.Freezed == 0) {
        if (this.GameServer.IsCheck2D()) {
            var ListFish = this.FishSpawner.SpawnCrowdedFish1_2D(FishInfo);
            var msg = new Packet.SpawnCrowdedFish_2D(ListFish);
        }
        else {
            var ListFish = this.FishSpawner.SpawnCrowdedFish1(FishInfo);
            var msg = new Packet.SpawnCrowdedFish(ListFish);
        }

        this.SendAllPlayer(msg);
    }
};

RoomCore.prototype.ResetFishTimer_Group = function (NewTimerData) {
    //if(this.DEBUG == 1)
    {
        this.FishSpawnerTimers = [];
        for (var i = 0; i < NewTimerData.length; i++) {

            var IsCrowded = 0;
            var NumberOfFish = 0;
            var func = this.SpawnFish_Group.bind(this, NewTimerData[i]);
            NumberOfFish = NewTimerData[i].NumberOfFish;
            if (NewTimerData[i].IsCrowded == 1) {
                IsCrowded = 1;
                func = this.SpawnCrowdedFish1.bind(this, NewTimerData[i]);
            }

            this.FishSpawnerTimers.push({
                FishKind: NewTimerData[i].FishKind,
                Path: NewTimerData[i].Path,
                Tick: 0,
                Interval: NewTimerData[i].Time,
                MinY: NewTimerData[i].MinY,
                MaxY: NewTimerData[i].MaxY,
                MinZ: NewTimerData[i].MinZ,
                MaxZ: NewTimerData[i].MaxZ,
                Wake: func
            });
        }
    }
};

RoomCore.prototype.SpawnFish_Group = function (FishInfo) {
    if (this.IsSpecialScreen == 0 && this.Freezed == 0) {
        var msg = 0;
        if (this.GameServer.IsCheck2D()) {
            var ListFish = this.FishSpawner.SpawnNormalFish_Group_2D(FishInfo);
            msg = new Packet.SpawnFish_2D(ListFish);
        }
        else {
            var ListFish = this.FishSpawner.SpawnNormalFish_Group(FishInfo);
            msg = new Packet.SpawnFish(ListFish);
        }

        this.SendAllPlayer(msg);
    }
};

RoomCore.prototype.BrainFreeze = function () {
    this.Freezed = 1;
};

RoomCore.prototype.AddRoomEffect = function (EffectID) {
    for (var i = 0; i < this.CurrentRoomEffect.length; i++) {
        var CurrentEffect = this.CurrentRoomEffect[i];
        if (EffectID == CurrentEffect.EffectID) {
            this.CurrentRoomEffect.splice(i, 1);
        }

        //Special case
        if ((EffectID == 1 && CurrentEffect.EffectID == 2)
            || (EffectID == 2 && CurrentEffect.EffectID == 1)) {
            //this.EndEffect(CurrentEffect.EffectID);
            this.CurrentRoomEffect.splice(i, 1);
        }
    }

    this.CurrentRoomEffect.push({
        EffectID: EffectID,
        Tick: 0,
        Interval: this.BrainFreezeTimeOut,
        Wake: this.EndEffect.bind(this, EffectID)
    });
};

RoomCore.prototype.PlayEffect = function (EffectID) {
    var msg = new Packet.PlayRoomEffect(EffectID);
    this.SendAllPlayer(msg);

    if (EffectID == 1 || EffectID == 2) { //TODO: HARDCODED
        this.Freezed = 1;
    }
};


RoomCore.prototype.EndEffect = function (EffectID) {
    var msg = new Packet.StopRoomEffect(EffectID);
    this.SendAllPlayer(msg);
    this.RemoveEffect(EffectID);

    if (EffectID == 1 || EffectID == 2) { //TODO: HARDCODED
        this.Freezed = 0;
    }
};


RoomCore.prototype.PlayRoomEffect = function (EffectID) {
    this.AddRoomEffect(EffectID);
    this.PlayEffect(EffectID);
};

RoomCore.prototype.RemoveEffect = function (EffectID) {
    for (var i = 0; i < this.CurrentRoomEffect.length; i++) {
        var Effect = this.CurrentRoomEffect[i];
        if (Effect.EffectID == EffectID) {
            this.CurrentRoomEffect.splice(i, 1);
            break;
        }
    }
};

RoomCore.prototype.OnSendSkillInfo = function (user) {
    try {
        this.SkillInfo.SendSkillInfo(user);
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomFree.prototype.OnSendSkillInfo - try err: ' + e);
    }
};

RoomCore.prototype.OnUserFireSkill = function (socket, angle, x, y) {
    try {
        var userInDesk = this.FindUserInDesk(socket);
        if (!this.IsNullOrUndefined(userInDesk)) {
            this.SkillInfo.FireBySkill(socket.UserModel, angle, x, y);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomFree.prototype.UserFireBySkill - try err: ' + e);
    }
};

RoomCore.prototype.OnUseSkillCatchFish = function (socket, bulletID, skillID, lstFishId) {
    try {
        var userInDesk = this.FindUserInDesk(socket);
        if (!this.IsNullOrUndefined(userInDesk)) {
            if (!this.IsNullOrUndefined(this.GameServer.ListSkill) && this.GameServer.ListSkill.length > 0) {
                this.SkillInfo.UseSkillCatchFish(socket.UserModel, bulletID, skillID, lstFishId);
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomFree.prototype.OnUseSkillCatchFish - try err: ' + e);
    }
};

RoomCore.prototype.CalcSkillAppear = function (user, fishScore) {
    try {
        this.SkillInfo.CalcSkillAppear(user, fishScore);
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.CalcSkillAppear - try err: ' + e);
    }
};

RoomCore.prototype.ReloadFishScript = function () {
    try {
        if (this.GameServer.IsCheck2D()) {
            var NewFishScript = requireUnCached('../../Config/GameConfig/FishScript_2D.js');//Không gán trực tiếp, gán giáng tiếp để tránh bị lổi
        }
        else {
            var NewFishScript = requireUnCached('../../Config/GameConfig/FishScript.js');//Không gán trực tiếp, gán giáng tiếp để tránh bị lổi
        }

        if (JSON.stringify(NewFishScript) != JSON.stringify(this.Config.FishScriptConfig)) {
            this.ResetFishTimer_Group(NewFishScript);
            this.Config.FishScriptConfig = NewFishScript;
            this.GameServer.Logger.Game().debug('RoomCore.prototype.ReloadFishScript changed');
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.ReloadFishScript - try err: ' + e);
    }
};

//EventFish
RoomCore.prototype.SpawnEventFish = function (ListFishInfo, CatchRate, EventID) {
    try {
        var ListFishToSpawn = [];
        for (var i = 0; i < ListFishInfo.length; i++) {
            var FishInfo = ListFishInfo[i];
            var FishID = this.FishSpawner.GetNewFishID();
            FishInfo.FishID = FishID;
            var tempFish = new FishClass.EventFish(FishID, FishInfo.FishKind, +new Date(), 0, FishInfo.FishMultiple, FishInfo.ItemID, FishInfo.MaxMultiple, 0);

            //Set lai FishID, Desk, CatchRate cho tung ban

            tempFish.Init(this, CatchRate, FishID, EventID);

            //Them vao list fish cua ban
            this.ListFish.push(tempFish);

            if (this.GameServer.IsCheck2D()) {
                FishInfo.IsRedFish = 0;
                FishInfo.InitCount = 3;
                FishInfo.Position = this.FishSpawner.GeneratePosition(tempFish.InitCount, FishInfo.FishKind);
            }
            else {
                FishInfo.SpecialKind = 0;
            }

            ListFishToSpawn.push(FishInfo);
        }
        var msg;
        if (this.GameServer.IsCheck2D()) {
            msg = new Packet.SpawnFish_2D(ListFishToSpawn);
        } else {
            msg = new Packet.SpawnFish(ListFishToSpawn);
        }
        this.SendAllPlayer(msg);

    }
    catch (e) {
        this.GameServer.Logger.Game().error("RoomCore.prototype.SpawnEventFish", e.stack);
    }
};

RoomCore.prototype.SpawnRandomHourFish = function (FishConfig) {
    try {
        var ListFishToSpawn = [];
        var fishCount = Math.floor(Math.random() * (FishConfig.FishMaxCount - FishConfig.FishCount) + FishConfig.FishCount);
        for (var i = 0; i < fishCount; i++) {
            var FishID = this.FishSpawner.GetNewFishID();
            var fishInfo = {};
            var tempFish = new FishClass.RandomHourFish(FishID, FishConfig.FishKind, +new Date(), this, FishConfig.FishMultiple, 0, FishConfig.MaxFishMultiple, 0);
            //FishID, FishKind, TimeCreate, Desk, Multiple, ItemID, MaxMultiple, IsRedFish, Ratio
            tempFish.Init(this);
            //Them vao list fish cua ban
            this.ListFish.push(tempFish);
            if (this.GameServer.IsCheck2D()) {
                fishInfo.FishID = FishID;
                fishInfo.FishKind = FishConfig.FishKind;
                fishInfo.IsRedFish = 0;
                fishInfo.InitCount = 3;
                fishInfo.ItemID = 0;
                fishInfo.Position = this.FishSpawner.GeneratePosition(tempFish.InitCount, FishConfig.FishKind);
            }
            else {
                fishInfo.SpecialKind = 0;
            }
            ListFishToSpawn.push(fishInfo);
        }
        var msg;
        if (this.GameServer.IsCheck2D()) {
            msg = new Packet.SpawnFish_2D(ListFishToSpawn);
        } else {
            msg = new Packet.SpawnFish(ListFishToSpawn);
        }
        this.SendAllPlayer(msg);
    }
    catch (e) {
        this.GameServer.Logger.Game().error("RoomCore.prototype.SpawnRandomHourFish", e.stack);
    }
};

RoomCore.prototype.OnUserChat = function (User, Info) {
    try {
        var msg = new Packet.UserChat(User.StationID, Info.ChatID);
        this.SendAllPlayer(msg);
    }
    catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.OnUserChat - try err: ' + e);
    }
};

RoomCore.prototype.CheckParadeIsEnd = function () {
    if (this.CurrentParadeFish != 0) {
        var NumberFishDie = 0;

        for (var i = 0; i < this.CurrentParadeFish.ListFish.length; i++) {
            if (this.CurrentParadeFish.ListFish[i].FishID == 0) {
                NumberFishDie++;
            }
        }

        if (NumberFishDie + this.GameServer.ParadeFishConfig.EndingThreshold >= this.CurrentParadeFish.ListFish.length) {
            return 1;
        }
    }

    return 0;
};


RoomCore.prototype.OnUserFire = function (Socket, PosX, PosY, BulletMultiple, BulletID, LockedFishID) {
    if (this.GameServer.IsCheck2D()) {//2D
        this.OnUserFire2D(Socket, PosX, PosY, BulletMultiple, BulletID, LockedFishID);
    } else {
        this.OnUserFire3D(Socket, PosX, PosY, BulletMultiple, BulletID, LockedFishID);
    }
};

RoomCore.prototype.OnUserFire2D = function (Socket, PosX, PosY, BulletMultiple, BulletID, LockedFishID) {
    try {
        var User = Socket.UserModel;
        if (BulletMultiple > 0 && User.FishScore >= BulletMultiple) {
            if (this.CheckBulletMultiple(BulletMultiple) && User.CheckGunReady()) {
                User.OnUserFireBullet(BulletMultiple);
                User.FishScore -= (BulletMultiple > 0 ? +BulletMultiple : 0);
                this.GameServer.AddStock((BulletMultiple > 0 ? +BulletMultiple : 0));// Make sure bulletMultiple > 0. And stock + bulletMultiple
                var msg = new Packet.UserFire(User.StationID, PosX, PosY, BulletMultiple, LockedFishID, User.FishScore);
                this.SendAllPlayer(msg);
            }
        }
        else {//User ko đủ tiền
            this.OnUserRanOutMoney(User.Socket);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.OnUserFire2D - try err: ' + e.stack);
    }
};

RoomCore.prototype.OnUserFire3D = function (Socket, PosX, PosY, BulletMultiple, BulletID, LockedFishID) {
    try {
        var User = Socket.UserModel;
        var msg = new Packet.UserFire(User.StationID, PosX, PosY, BulletMultiple, LockedFishID, User.FishScore);
        this.SendAllPlayer(msg);
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.OnUserFire3D - try err: ' + e);
        this.GameServer.Logger.Game().error('RoomCore.prototype.OnUserFire3D - try err: ' + e.stack);
    }
};

RoomCore.prototype.OnCatchFishWithoutRemove = function (user, fishID, bulletMultiple, IsSkill, skillID) {
    if (this.GameServer.IsCheck2D()) {//2D
        this.OnCatchFishWithoutRemove2D(user, fishID, bulletMultiple, IsSkill, skillID);
    } else {
        this.OnCatchFishWithoutRemove3D(user, fishID, bulletMultiple, IsSkill, skillID);
    }
};

RoomCore.prototype.OnCatchFishWithoutRemove2D = function (user, fishID, bulletMultiple, IsSkill, skillID) {
    try {
        var FishDetail = this.GetFishDetailInDesk(fishID);

        if (FishDetail != 0) {
            //PopBulletWithValue
            if ((bulletMultiple > 0 && this.CheckBulletMultiple(bulletMultiple))
                || IsSkill) {
                if (!IsSkill) {
                    //2D Check Bullet Please
                    var bulMul = user.PopBulletWithValue(bulletMultiple);
                    if (bulMul <= 0) {
                        //Không tồn tại viên đạn này
                        return;
                    }
                }
                else {
                    if (FishDetail.IsRedFish == 1) {
                        //TODO: skill khong giet duoc ca do
                        return;
                    }
                    user.OnUserFireSkill(skillID);
                }

                this.ProcessCatchFishWithoutRemove(user, fishID, bulletMultiple, IsSkill, FishDetail);
            }
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.OnCatchFishWithoutRemove - try err: ' + e.stack);
    }
};

RoomCore.prototype.OnCatchFishWithoutRemove3D = function (user, fishID, bulletMultiple, IsSkill, skillID) {
    try {
        var FishDetail = this.GetFishDetailInDesk(fishID);

        if (FishDetail != 0) {
            if ((bulletMultiple > 0 && this.CheckBulletMultiple(bulletMultiple))
                || IsSkill) {
                if (user.FishScore >= bulletMultiple
                    || IsSkill) {

                    if (!IsSkill) {
                        user.OnUserFireBullet(bulletMultiple);
                        user.FishScore -= (bulletMultiple > 0 ? +bulletMultiple : 0);
                        this.GameServer.AddStock((bulletMultiple > 0 ? +bulletMultiple : 0));// Make sure bulletMultiple > 0. And stock + bulletMultiple
                    }
                    else {
                        if (FishDetail.IsRedFish == 1) {
                            //TODO: skill khong giet duoc ca do
                            return;
                        }
                        user.OnUserFireSkill(skillID);
                    }
                    this.ProcessCatchFishWithoutRemove(user, fishID, bulletMultiple, IsSkill, FishDetail);

                } else {
                    this.OnUserRanOutMoney(user.Socket);
                }
            }

        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.OnCatchFishWithoutRemove - try err: ' + e.stack);
    }
};

RoomCore.prototype.ProcessCatchFishWithoutRemove = function (user, fishID, bulletMultiple, IsSkill, FishDetail) {

    var IsSkill3D = IsSkill;//(!this.GameServer.IsCheck2D()&&IsSkill); //thay doi yeu cau
    var FishMultiple = FishDetail.GetHit(user.GetHandicapStock(), this.GameServer.GetStockRatio(), user.UserID, bulletMultiple, IsSkill3D);
    var GoldReward = FishMultiple * bulletMultiple;
    if (FishDetail.EventID > 0) {
        GoldReward = 0;
    }
    var msg;
    if (FishMultiple > 0 && FishMultiple < user.FishMulLimit)//Random chết cá và tỉ lệ nhân cá nhỏ hơn tỉ lệ set mặc định của user;
    {
        //TODO: ADD STOCK
        this.GameServer.AddStock(-(GoldReward > 0 ? +GoldReward : 0));// Make sure fishScore > 0. And stock - FishScore

        user.FishScore += (GoldReward > 0 ? +GoldReward : 0);
        this.CalcExp(GoldReward, user);

        if (!IsSkill) {
            this.CalcSkillAppear(user, GoldReward);
        }

        // if (FishDetail.ItemID == 0) {
        //     this.GameServer.OnUserKillFish(user, bulletMultiple, FishDetail.FishKind, GoldReward, fishID, this);
        // }
        // else {
        //     this.GameServer.OnUserKillEventFish(user, FishDetail.EventID, fishID);
        // }

        msg = new Packet.CatchFish(user.StationID, fishID, GoldReward, user.FishScore, user.FishLevel, user.FishExp);

        if (FishDetail.EffectID > 0) {
            this.PlayRoomEffect(FishDetail.EffectID);
        }

        if (this.IsSpecialScreen) {
            var index = this.FindIndexOfFishInFishParade(fishID);
            if (index != -1) {
                this.CurrentParadeFish.ListFish[index].FishID = 0;
                this.CurrentParadeFish.ListFish[index].FishKind = -1;
            }

            if (this.CheckParadeIsEnd()) {
                setTimeout(function () {
                    this.EndParadeFish();
                }.bind(this), 1000);
            }
        }

        this.RemoveFishInDesk(fishID);

        user.RecordFish(FishDetail.FishKind, 0, GoldReward, 0, 1);//record ăn cá
    }
    user.RecordFish(FishDetail.FishKind, bulletMultiple, 0, 1, 0);//record bắn cá
    if (Utility.CheckVariable(msg)) {
        this.SendAllPlayer(msg);
    }

};

RoomCore.prototype.EndParadeFish = function () {
    if (this.IsSpecialScreen) {
        this.ResetAllTimerTick();
        this.IsSpecialScreen = 0;
        // var msg = new Packet.ClearFish();
        // this.SendAllPlayer(msg);
        this.CurrentParadeFish = 0;
        clearTimeout(this.FishParadeTimeOut);
    }
};

RoomCore.prototype.OnUserEnterDesk = function (User) {
    if (User.MoneyState == this.GameServer.MoneyStateDefine.GettingCompleted) {
        User.MoneyState = this.GameServer.MoneyStateDefine.JoinGameCompleted;
    } else {
        if (!this.GameServer.IsRoomTrial()) {
            this.GameServer.DestroySocket(User.Socket);
            this.GameServer.Logger.Game().error('RoomCore.prototype.OnUserEnterDesk - User co trang thai tien bat thuong', User.MoneyState);
            return;
        }
    }

    this.GameServer.GlobalBossUserEnter(User);
};

RoomCore.prototype.GetBossDetailInDesk = function (bossAutoID) {
    try {
        if (!this.IsNullOrUndefined(this.ListFish)) {
            for (var i = 0; i < this.ListFish.length; i++) {
                if (this.ListFish[i].BossAutoID == bossAutoID) {
                    return this.ListFish[i];
                }
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.GetBossDetailInDesk - try err: ' + e);
    }

    return 0;
};

RoomCore.prototype.SpawnBossFishInDesk = function (BossAutoID, BossID, FishKind, MaxHP, RoundCount, BirthTime, StartTime, TotalGold) {
    var boss = this.FishSpawner.SpawnBossFish(BossAutoID, BossID, FishKind, MaxHP, RoundCount, BirthTime);
    var msg = new Packet.SpawnBossFish(boss.FishID, boss.FishKind, TotalGold, boss.Position, StartTime);
    this.SendAllPlayer(msg);
};

RoomCore.prototype.SpawnBossFishRealTime = function (User, FishID, FishKind, Position, StartTime, TotalGold) {
//User, bossInDesk.FishID, this.FishKind, bossInDesk.Position, startTime, this.TotalGold
    var msg = new Packet.SpawnBossFish(FishID, FishKind, TotalGold, Position, StartTime);
    if (Utility.CheckVariable(msg)) {
        this.GameServer.SendSocketBinary(User.Socket, msg);
    }

    // var boss = this.FishSpawner.SpawnBossFish(BossID, FishKind, MaxHP, RoundCount, BirthTime);
    // var msg = new Packet.SpawnBossFish(boss.FishID,boss.FishKind,boss.Position);
    // this.SendAllPlayer(msg);
};

RoomCore.prototype.OnUserCatchBoss = function (user, fishId, bulletMultiple) {
    try {
        var FishDetail = this.GetFishDetailInDesk(fishId);
        if (FishDetail != 0) {
            if ((bulletMultiple > 0 && this.CheckBulletMultiple(bulletMultiple))) {
                if(this.GameServer.IsCheck2D()){
                    var bulMul = user.PopBulletWithValue(bulletMultiple);
                    if (bulMul <= 0) {
                        return;
                    }
                }else{
                     if (user.FishScore >= bulletMultiple){
                         user.FishScore -=  bulletMultiple;
                     }else{
                         return;
                     }

                }

                this.GameServer.OnUserHitBoss(user, bulletMultiple, FishDetail.BossAutoID, fishId, this)
            }

        }

    }
    catch
        (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.OnUserCatchBoss - try err: ' + e.stack);
    }
};

RoomCore.prototype.BossDieEffect = function (BossAutoID, UserID, GoldReward, GameName) {
    try {
        var FishDetail = this.GetBossDetailInDesk(BossAutoID);
        this.SendAllPlayer(new Packet.BossDie(FishDetail.FishID, UserID, GoldReward, GameName));
    }
    catch
        (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.OnUserCatchBoss - try err: ' + e.stack);
    }
};

RoomCore.prototype.RemoveBoss = function (BossAutoID) {

};