/*{"build":1}*/
//sys lib
var MainCore = require('../MainCore/MainCore');
var Config = require('../Config/VQMM');
var ModuleExtension = require('./Modules');
var UserController = require('./Controller/UserController');
var Utility = require('../SharedModule/Utility');
var UserModel = require('./Model/UserModel');
var EventManager = require('./Modules/EventManager');
function Main() {
    //this.GameID = 8;
    //GameID = 5, KindID: 501

    this.MainTimer.push({
        Tick: 0,
        Interval: 2000,
        Wake: this.Timer2seconds.bind(this)
    });

    this.MainTimer.push({
        Tick: 0,
        Interval: 10000,
        Wake: this.Timer10seconds.bind(this)
    });

    this.InitHistory = [];
    this.BetRatioConfig = Config.BetRatioConfig;
    this.BetLimitConfig = Config.BetLimitConfig;
    this.Stock = 1;
    this.StockDetail = {
        Stock: 1
    };
    this.MatchID = 0;
    this.RewardConfig = Config.RewardConfig;
    this.EventManager = new EventManager();
}

Main.prototype = new MainCore(Config);

module.exports = Main;

MainCore.prototype.InitAllExtension = function () {
    ModuleExtension.SQLAdapter(this.SQLAdapter);
    ModuleExtension.RedisAdapter(this.RedisAdapter);
    ModuleExtension.LogRecorder(this.LogRecorder);
    this.EventManager.Init(this);
    this.EventManager.ReloadAllEvent();
    UserController(this.UserController);
    UserModel(this.UserModel);
    this.LoadHistory();
};

MainCore.prototype.GetDeskForUser = function (Socket) {
    try {
        this.FindDeskForUser(Socket);
        this.SendSocketBinary(Socket, new this.BasicPacket.LoginResponse(Socket.UserModel.UserID, Socket.UserModel.Wallet, Socket.UserModel.GameName));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetDeskForUser - try err: ' + e.stack);
    }
};

MainCore.prototype.FindDeskForUser = function (Socket) {
    try {
        for (var i = 0; i < this.DeskList.length; i++) {
            if (this.DeskList[i].IsAvailable()) {
                this.DeskList[i].UserEnterDesk(Socket)
            }
        }
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.FindAvailableDesk - try err: ' + e.stack);
    }
};

MainCore.prototype.Timer2seconds = function () {
    try {
        this.UpdateDeskTimer2Second();
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.Timer2seconds - try err: ' + e.stack);
    }
};

MainCore.prototype.Timer10seconds = function () {
    try {
        this.ReloadBetLimitConfig();
        this.ReloadRewardConfig();
        this.ReloadDebug();
        this.EventManager.ReloadAllEvent();
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.Timer2seconds - try err: ' + e.stack);
    }
};

MainCore.prototype.UpdateDeskTimer2Second = function () {
    for (var i = 0; i < this.DeskList.length; i++) {
        this.DeskList[i].DeskTimer2Second();
    }
};

MainCore.prototype.ReloadBetLimitConfig = function () {
    try {

        var BetLimitConfig = requireUnCached('../Config/VQMM/BetLimitConfig.js');//Ko gan truc tiep, tranh loi
        this.BetLimitConfig = BetLimitConfig;

    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.ForceReloadConfigStock - try err: ' + e);
    }
};

MainCore.prototype.CheckStockAndMaintain = function () {

    //them co maintain, check startround.
    if (this.Stock < this.BetLimitConfig.MaintainStock) {
        this.MaintainServer();
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
    return require(NameLink);
}

MainCore.prototype.GenMatchInfo = function (DeskID, Tax, ResultTextEncrypted, callback) {
    this.LogRecorder.logStartMatch(DeskID, this.GameServerID, this.GameKindID, Tax, this.Stock, ResultTextEncrypted, function (e, d) {
        if (!e) {
            if (Utility.CheckVariable(d, 'insertId')) {
                callback(e, d.insertId);
            } else {
                callback(e, d);
            }
        }
    }.bind(this));
};

MainCore.prototype.LogUserBet_Insert = function (User, ID, Gold, MatchID, Tax) { // Log tam
    try {
        this.LogRecorder.logUserBet(User.UserID, ID, Gold, MatchID, Tax)
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.LogUserBet_Insert - try err:' + e.stack);
    }


};

MainCore.prototype.LogUserBetEndMatch_Insert = function (User, MatchID, Tax) {// Log end game insert DB

    // Insert vao bang tong
    try {
        for (var i = 0; i < User.ListBetHistory.length; i++) {
            if (User.ListBetHistory[i].MatchID == MatchID) {

                this.LogRecorder.logUserBetEndGame(User.UserID, User.ListBetHistory[i].ID, User.ListBetHistory[i].Gold, MatchID, Tax, User.ListBetHistory[i].WinGold, User.ListBetHistory[i].WinGoldNoTax)
            }
        }

        User.ListBetHistory = []; //Sau khi Insert thi clear
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.LogUserBetEndMatch_Insert - try err:' + e.stack);
    }

};

MainCore.prototype.CalcAndRefundUserMoney = function (Socket, callback) {
    try {
        if (Socket.UserModel.MoneyState == this.MoneyStateDefine.JoinGameCompleted) {//User đã lấy tiền thành công và vào chơi game
            var moneyRefund = Socket.UserModel.Wallet; // tien hien tai cua user
            this.MoneyRefundWithChanged(Socket.UserModel, moneyRefund, callback);

        } else {
            this.Logger.Game().debug('GameServer.prototype.CalcAndRefundUserMoney MoneyState  ', Socket.UserModel.MoneyState);
        }
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.CalcAndRefundUserMoney try  ', e.stack);
    }

};

MainCore.prototype.MoneyRefundWithChanged = function (User, MoneyRefund, callback) {

    this.SQLAdapter.moneyRefundAll(User.UserID,
        this.Config.MoneyReasonConfig.GameOutMoneyRefundAll,
        'Hoàn tiền user ra game',
        MoneyRefund,
        User.UserChannelID,
        User.UserProviderID,
        User.UserPlatformID,
        this.GameServerID,
        User.UserTrackingID,
        this.GameKindID,
        this.GameID,
        function (e, d) {
            if (typeof callback == 'function') {
                callback();
            }
            if (e != 0) {
                this.Logger.Game().error('GameServer.prototype.MoneyRefundWithChanged ', e,
                    this.Config.MoneyReasonConfig.GameOutMoneyRefundAll,

                    'Hoàn tiền user ra game',
                    MoneyRefund,
                    User.UserChannelID,
                    User.UserProviderID,
                    User.UserPlatformID,
                    this.GameServerID,
                    User.UserTrackingID,
                    this.GameKindID
                );
            }
        }.bind(this));

};

MainCore.prototype.OnUserEndGame = function (User, MatchID) {
    try {
        //Logging
        //this.EventManager.EvtOnUserOutGameAll(User);

    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.OnUserEndGame - try err:' + e.stack);
    }

};

MainCore.prototype.LoadHistory = function () {
    try {

    }
    catch (e) {
        this.Logger.Game().error('MainCore.prototype.LoadHistory Get DataErr', e);
    }
};

MainCore.prototype.ParseResultFromHistory = function (strResult) {
    try {
        if (typeof strResult[strResult.length - 1] != 'number') {
            strResult = strResult.substring(0, strResult.length - 1);
        }

        var str = strResult.split('_');

        var Banker_str = str[0];
        var Player_str = str[1];

        //Banker
        Banker_str = Banker_str.substr(Banker_str.indexOf(':') + 1, Banker_str.length);
        var Banker_arr = Banker_str.split(',');
        for (var i = 0; i < Banker_arr.length; i++) {
            Banker_arr[i] = parseInt(Banker_arr[i]);
        }

        //Player
        Player_str = Player_str.substr(Player_str.indexOf(':') + 1, Player_str.length);
        var Player_arr = Player_str.split(',');
        for (var i = 0; i < Player_arr.length; i++) {
            Player_arr[i] = parseInt(Player_arr[i]);
        }

        return {
            BankerCards: Banker_arr,
            PlayerCards: Player_arr
        }
    }
    catch (e) {
        this.Logger.Game().error('MainCore.prototype.ParseResultFromHistory Get DataErr', e);
    }
};

MainCore.prototype.GetGoldBet = function () {
    return this.BetLimitConfig.GoldBet / 2;
};

MainCore.prototype.GenMatchID = function () {
    return ++this.MatchID;
};

MainCore.prototype.RecordMatchInfo = function (MatchID, Result, Tax, UserID, BeforeMoney, BetGold, TotalReward, AfterMoney, BeforeFreeSpin, AfterFreeSpin, DeskID, SpinKind, ChannelID) {
    this.LogRecorder.logEndMatch(MatchID, Result, this.Stock, Tax, UserID, BeforeMoney, BetGold, TotalReward, AfterMoney, BeforeFreeSpin, AfterFreeSpin, this.GameServerID, DeskID, this.GameKindID, SpinKind, ChannelID, function (e, d) {
        if (e) {
            this.Logger.Game().error('GameServer.prototype.RecordMatchInfo Record Error ', "MatchID, DeskID, ResultCards, ResultText, ResultTextEncrypted, Win, Lose, TotalTax,Tax", MatchID, Result, Tax, UserID, BeforeMoney, BetGold, TotalReward, AfterMoney, BeforeFreeSpin, AfterFreeSpin, DeskID, ChannelID);
        }
    }.bind(this))
};

MainCore.prototype.CheckDailySpin = function (UserID, callback) {
    try {
        this.LogRecorder.CheckDailySpin(UserID, function (e, r) {
            var DailySpin = 0;
            if (r[0].SpinNumber == 0) {
                DailySpin = 1;
            }
            callback(DailySpin);
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('MainCore.prototype.CheckDailySpin Get DataErr', e);
    }
};

MainCore.prototype.SaveUserInfo = function (User) {
    try {
        if(User.SpinInfo.IsChange){
            var key = this.Config.RedisConfig.Define.VQMMSpinInfo;
            var name = User.UserID;
            var data = JSON.stringify(User.SpinInfo);
            this.RedisAdapter.hset(key, name, data, function () {
            });
        }

    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.UpdateUserInfo Err', e);
    }
};

MainCore.prototype.ShowMsg = function (Socket, MsgCode) {
    try {
        this.ShowPopup(Socket, this.Config.LanguageConfig[MsgCode].logMsg + Socket.UserModel.AccountID, this.GetUserMsgByLangCode(this.Config.LanguageConfig[MsgCode], Socket.LangCode));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.ShowMsg - try err: ' + e);
    }
};

MainCore.prototype.ReloadRewardConfig = function () {
    try {
        var RewardConfig = requireUnCached('../Config/VQMM/RewardConfig.js');//Ko gan truc tiep, tranh loi
        this.RewardConfig = RewardConfig;

    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.ReloadRewardConfig - try err: ' + e);
    }
};

MainCore.prototype.ReloadDebug = function () {
    try {
        var Debug = requireUnCached('./Modules/Debug.js');//Ko gan truc tiep, tranh loi
        Debug.startDebug(this);
    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.ReloadDebug - try err: ' + e);
    }
};

MainCore.prototype.GetUserSpinTicket = function () {

};