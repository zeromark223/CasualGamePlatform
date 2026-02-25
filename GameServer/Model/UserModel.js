function UserModel(gameserver, socket) {
    this.UserID = 0;
    this.GameServer = gameserver;
    this.Socket = socket;
    this.PingMiss = 0;
    this.ListFishDie = [];

    //biến tĩnh khi lấy danh sách về
    //chứa object {iItemId, iQuantity, iItemsType, iTimeEffect, iMoneyItems, iStatus, IsUse, UseAmount}
    this.ListItems = [];
    this.MyDesk = 0;
    this.DeskID = 0;
    this.StationID = 0;
    this.LeftDesk = false;


    this.GameName = '';
    this.Wallet = 0; // Ví tạm của user khi vào phòng, không cộng trừ trực tiếp tiền này.
    this.Exp = 0;
    this.Level = 0;
    this.IsUseSkill = false;

    //biến thay đổi trong game
    this.FishScore = 0; // Tiền của user, giá trị khởi tạo là = wallet. +- trực tiếp biến này.
    this.FishExp = 0;
    this.FishLevel = 0;

    this.BulletMultiple = 0;

    this.TimeIn = new Date();
    this.PositionX = 0;
    this.PositionY = 0;

    for (var i = 0; i < 32; i++) {
        this.ListFishDie.push({FishKindID: i, Amount: 0, Score: 0});
    }
    this.LastActivedTime = +new Date();
    this.NumTicketMiniGame = 0;
    this.NumTicketMiniGameInGame = 0;
    this.SendIconBoss = -1;//-1: moi khoi tao 0: chua send lan nao: 1: chet : 2 song
    this.LoginTime = +new Date();
    this.SessionID = 0;
    this.MasterID = 0;
    this.PubUserID = 0;

    ///////// Anti Framer
    this.TotalGoldUserPayForSys = 0;
    //Record Fish Hit - Earn
    this.FishHistory = [];
    this.TimeCheck = +new Date();
    this.FishHistory = [];
    this.PingPongLost = 0;
    //Record Fish Hit - Earn
    this.FishHistory = [];
    this.ItemList = [];
    this.RechargeGold = 0;
    this.MaxMoneyHistoryRows = 100;
    this.MoneyHistory = [];
    this.SkillModel = 0;
    this.PlatformID = 0;
    this.ProviderID = 0;

    this.MyBulletList = [];
    this.MoneyState = 0;

    this.PlayGameTime = 0;// mili Second please
    this.UserFired = false;

    this.UserTrackingID = -1; // ma dung de tracking
    this.UserChannelID = -1; // ma kenh user den
    this.UserProviderID = -1; // ma loai hinh account
    this.UserPlatformID = -1; // ma loai hinh account

    this.UserWinLose = 0;
    this.StockHandicap = 1;
    this.Handicap = 1;
    this.FishMulLimit = 9999;
    this.CurrentBulletMul = 0;
    ///////// Anti Framer AND
    //Mission
    this.TotalGoldUserPayForSys = 0;
    this.MatchPlayed = 0;
    this.UserMissionList = [];
}

module.exports = UserModel;

UserModel.prototype.OnPong = function () {
    this.pingMiss = 0;
};

UserModel.prototype.CheckSocket = function () {
    try {
        this.Socket.ping();
        this.PingMiss++;
    }
    catch (e) {
        this.PingMiss++;
    }
    if (this.PingMiss > 3) {
        this.Socket.close();
    }
};

UserModel.prototype.SetFishDie = function (fishKind, fisScore) {
    try {
        if (!this.IsNullOrUndefined(this.ListFishDie)) {
            for (var i = 0; i < this.ListFishDie.length; i++) {
                if (this.ListFishDie[i].FishKindID == fishKind) {
                    this.ListFishDie[i].Amount += 1;
                    this.ListFishDie[i].Score += +fisScore;

                    break;
                }
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('UserModel.prototype.SetFishDie - try err: ' + e);
    }
};

UserModel.prototype.IsNullOrUndefined = function (obj) {
    return obj == null || obj == 'undefined';
};

UserModel.prototype.RecordFish = function (_fishkind, _spend, _earn, _numhit, _numfish) {
    if (this.UserMissionList.length > 0) {
        this.RecordFishMission(_fishkind, _spend, _earn, _numhit, _numfish);
        //this.RecordMoneyHistory(_earn, "Giết cá x " + _earn / _spend);
    }
    for (var i = 0; i < this.FishHistory.length; i++) {
        if (_fishkind == this.FishHistory[i].K) { //FishKind
            this.FishHistory[i].S += _spend; //Spend
            this.FishHistory[i].E += _earn; //Earn
            this.FishHistory[i].F += _numfish; //NumFish
            this.FishHistory[i].H += _numhit; //NumHit
            return;
        }
    }
    this.FishHistory.push({K: _fishkind, S: _spend, E: _earn, H: _numhit, F: _numfish});
};

UserModel.prototype.RecordFishMission = function (_fishkind, _spend, _earn, _numhit, _numfish) {
    this.GameServer.MissionManager.RecordMissionOnKillFish(this,_fishkind, _spend, _earn, _numhit, _numfish);
};

UserModel.prototype.RecordMoneyHistory = function (MoneyChange, Description) {
    //Type = 0 : Record đạn, Type 1 Record cá

    var h = {
        Time: +new Date(),//Time
        MoneyChange: MoneyChange,//Value
        RoomID: this.GameServer.GameServerID,
        Description: Description

    };
    if (this.MoneyHistory.length > this.MaxMoneyHistoryRows) {
        this.MoneyHistory.shift();
    }
    this.MoneyHistory.push(h);
};

UserModel.prototype.OnUserFireBullet = function (BulletValue) {
    this.UserFired = true;
    this.CurrentBulletMul = BulletValue;
    if (this.GameServer.IsCheck2D()) {
        this.MyBulletList.push(BulletValue);
    }
    this.TotalGoldUserPayForSys += +BulletValue;
    //this.RecordMoneyHistory(-BulletValue, "Bắn súng x " + BulletValue);
};

UserModel.prototype.PopBulletWithValue = function (BulletValue) {
    for (var i = 0; i < this.MyBulletList.length; i++) {
        if (this.MyBulletList[i] == BulletValue) {
            this.MyBulletList.splice(i, 1);
            return BulletValue;
        }
    }
    return 0;
};

UserModel.prototype.OnUserFireSkill = function (skillID) {
    var SkillName = "Laze";
    if (skillID == 2) {
        SkillName = "Điện";
    }
    if (skillID == 3) {
        SkillName = "Bomb"
    }
    this.RecordMoneyHistory(0, "Skill " + SkillName);
};

UserModel.prototype.UserAutoCalcPlayTime = function () {
    if (this.UserFired) {
        this.UserFired = false;
        this.PlayGameTime += this.GameServer.PlayGameTimeBlock;
    }
};

UserModel.prototype.GetHandicapStock = function () {
    return (this.StockHandicap * this.Handicap) || 1;
};

UserModel.prototype.CheckGunReady = function () {
    return this.MyBulletList.length < 31; // Tối đa 30 viên
};