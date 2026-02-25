/*{"build":1}*/
//sys lib
var MainCore = require('../MainCore/MainCore');
var Config = require('../Config/MiniPoker');
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
        this.ReloadDeskConfigAll();
        this.JackpotUpdate();
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.Timer2seconds - try err: ' + e.stack);
    }
};

MainCore.prototype.Timer10seconds = function () {
    try {
        this.ReloadBetLimitConfig();
        this.ReloadDebug();
        this.EventManager.ReloadAllEvent();
        this.JackpotGetConfig();
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

        var BetLimitConfig = requireUnCached('../Config/MiniPoker/BetLimitConfig.js');//Ko gan truc tiep, tranh loi
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

MainCore.prototype.LoadHistory = function () {
    try {

    }
    catch (e) {
        this.Logger.Game().error('MainCore.prototype.LoadHistory Get DataErr', e);
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

MainCore.prototype.ReloadDebug = function () {
    try {
        var Debug = requireUnCached('./Modules/Debug.js');//Ko gan truc tiep, tranh loi
        Debug.startDebug(this);
    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.ReloadDebug - try err: ' + e);
    }
};

MainCore.prototype.RecordMatchInfo = function (Result, Tax, UserID, BeforeMoney, BetGold, TotalReward, AfterMoney, DeskID, ChannelID, callback) {
    this.LogRecorder.logEndMatch(Result, this.Stock, Tax, UserID, BeforeMoney, BetGold, TotalReward, AfterMoney, this.GameServerID, DeskID, this.GameKindID, ChannelID, function (e, d) {
        if (e) {
            callback(0);
            this.Logger.Game().error('GameServer.prototype.RecordMatchInfo Record Error ', Result, Tax, UserID, BeforeMoney, BetGold, TotalReward, AfterMoney, DeskID, ChannelID, e);
        } else {
            callback(d.insertId || 0);
        }
    }.bind(this))
};

MainCore.prototype.ReloadDeskConfigAll = function () {
    try {
        var BetRatioConfig = requireUnCached('../Config/MiniPoker/BetRatioConfig');
        var BetLimitConfig = requireUnCached('../Config/MiniPoker/BetLimitConfig');
        for(var i = 0 ; i < this.DeskList.length;i++){
            if(this.DeskList[i].ReloadDeskConfig){
                this.DeskList[i].ReloadDeskConfig(BetRatioConfig,BetLimitConfig);
            }
        }
    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.ReloadDebug - try err: ' + e);
    }
};