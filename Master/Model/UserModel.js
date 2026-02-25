function UserModel(master, socket) {
    this.UserID = 0;
    this.Master = master;
    this.Socket = socket;
    this.PingMiss = 0;

    this.Wallet = 0;

    this.LevelUser = '';

    //register
    this.UserPassword = ''; //char[64]
    this.GameName = ''; //char[64]

    this.PlatformID = 0; //1 - Android, 2 - iOS, 3 - Windows Phone (byte)
    this.Version = ''; //char[10]

    this.LoginTime = +new Date();
    this.SessionID = 0;
    this.PubUserID = 0;
    this.PingPongLost = 0;
    this.PlatformID = 0;
    this.ProviderID = 0;
    this.AccountID = '';
    this.VerifyToken = '';

    this.IsAddUserLogin = false;
    this.LoginDayCount = 1;
    this.RechargeGold = 0;
    this.Diamond = 0;
    this.GameMoney = 0;
    this.UserTrackingID = -1; // ma dung de tracking
    this.UserChannelID = -1; // ma kenh user den
    this.UserProviderID = -1; // ma loai hinh account
    this.UserPlatformID = -1; // ma loai hinh account
    this.UserVersionClient = -1; // ma loai hinh account
    this.UserPackageID = -1; // ma loai hinh account
    this.UserLoginTime = +new Date();

    this.CurrentGameID = -1;
    this.ResetOnlineAwardData();
    this.EventFlag; // check all true
    this.CheckEventFlagCount = 0;
    this.AccountCreateDate = 0;
    this.UserIPLoginCount = 9999;
    //UserTrackingFlag
    this.IsChanged = 0;
    this.UserTrackingFlagLoaded = 0;
    this.IsPassingRule = 0;
    this.OnlineGetCount = 0;
    this.OnlineGetDayCount = 0;
    this.DailyGet = 0
    this.UserMissionList = [];
    this.FBID = '';
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

UserModel.prototype.ResetOnlineAwardData = function () {
    this.OnlineAwardData = {
        IsInitCompleted: false,
        IsChecking: false,
        IsGet: 0,
        TimeLeft: 0,
        AwardMoneyCfg: 0,
        IsOver: 0,
        AwardID: 0,
        LimitedGold: 0,
        IsSendNotify: false


    };
};

UserModel.prototype.OnUserGetAward = function (User, MoneyReasonConfig, ReasonID) {
    // DailyAward: 104,
    //     OnlineAward: 105
    if (ReasonID == MoneyReasonConfig.OnlineAward) {
        //handle Onl
        this.OnlineGetCount++;
        this.OnlineGetDayCount++;
        this.IsChanged = 1;
    } else {
        if (ReasonID == MoneyReasonConfig.DailyAward) {
            this.DailyGet++;
            this.IsChanged = 1;
        }
    }
    this.Master.AnalyseUserOnAction(User);
};