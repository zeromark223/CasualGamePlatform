/*{"build":1}*/
//sys lib
var MainCore = require('../MainCore/MainCore');
var Config = require('../Config/XocDia');
var ModuleExtension = require('./Modules');
var UserController = require('./Controller/UserController');
var Packet = require('./Packet');
var SmartRequire = require('../SharedModule/smartRequire');
var Utility = require('../SharedModule/Utility');
var UserModel = require('./Model/UserModel');
var EventManager = require('./Modules/EventManager');
function Main() {
    this.GameID = 6;

    //GameID = 6, KindID: 601

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
    this.EventManager = new EventManager();
}

Main.prototype = new MainCore(Config);
module.exports = Main;

MainCore.prototype.InitAllExtension = function () {
    ModuleExtension.SQLAdapter(this.SQLAdapter);
    ModuleExtension.RedisAdapter(this.RedisAdapter);
    ModuleExtension.LogRecorder(this.LogRecorder);
    this.EventManager.Init(this);
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

        var BetLimitConfig = requireUnCached('../Config/XocDia/BetLimitConfig.js');//Ko gan truc t iep, tranh loi
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

MainCore.prototype.RecordMatchInfo = function (MatchID, DeskID, ResultDices, ResultText, ResultTextEncrypted, Win, Lose, TotalTax, Tax) {
    this.LogRecorder.logEndMatch(MatchID, ResultDices.toString(), ResultText, ResultTextEncrypted, Win, Lose, TotalTax, Tax, this.Stock, this.GameServerID, DeskID, this.GameKindID, function (e, d) {
        if (e) {
            this.Logger.Game().error('GameServer.prototype.RecordMatchInfo Record Error ', "MatchID, DeskID, ResultCards, ResultText, ResultTextEncrypted, Win, Lose, TotalTax,Tax", MatchID, DeskID, ResultDices, ResultText, ResultTextEncrypted, Win, Lose, TotalTax, Tax);
        }
    }.bind(this))
};


MainCore.prototype.LogUserBet_Insert = function (User, ID, Gold, MatchID, Tax) { // Log tam
    try {
        this.LogRecorder.logUserBet(User.UserID, ID, Gold, MatchID, Tax, User.UserChannelID)
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.LogUserBet_Insert - try err:' + e.stack);
    }


};

MainCore.prototype.LogUserBetEndMatch_Insert = function (User, MatchID, Tax) {// Log end game insert DB

    // Insert vao bang tong
    try {
        for (var i = 0; i < User.ListBetHistory.length; i++) {
            if (User.ListBetHistory[i].MatchID == MatchID) {

                this.LogRecorder.logUserBetEndGame(User.UserID, User.ListBetHistory[i].ID, User.ListBetHistory[i].Gold, MatchID, Tax, User.ListBetHistory[i].WinGold, User.ListBetHistory[i].WinGoldNoTax, User.ChannelID)
            }
        }

        User.ListBetHistory = []; //Sau khi Insert thi clear
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.LogUserBetEndMatch_Insert - try err:' + e.stack);
    }

};

MainCore.prototype.UserInfoUpdateAll = function (socket) {
    if (socket.InfoUpdateAll) {// Chan code ngu, goi nhieu lan
        return;
    }

    socket.InfoUpdateAll = true;
    this.LogUserOutGame(socket.UserModel, function (errCode, matchId) { // Neu thanh cong ghi nhan log out game
        if (errCode == 0) {
            this.CalcAndRefundUserMoney(socket, function () {
                this.OnEndGameAndUpdateCompleted(socket.UserModel);
            }.bind(this));
            this.OnUserEndGame(socket.UserModel, matchId);
        } else {
            this.Logger.Game().error('GameServer.prototype.UserInfoUpdateAll CalcAndRefundUserMoney err ', errCode);
            //Handle Error
        }
    }.bind(this));
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


MainCore.prototype.OnEndGameAndUpdateCompleted = function (User) {
    this.GMToolAdapter.SendBroadCastMasterCommand({
        CMD: this.Config.GMToolConfig.CMD.UserOutGameCompleted,
        SID: 0,
        Data: {
            UserID: User.UserID
        }
    });
};

MainCore.prototype.OnUserEndGame = function (User, MatchID) {
    try {
        //Logging
        this.EventManager.EvtOnUserOutGameAll(User);

    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.OnUserEndGame - try err:' + e.stack);
    }

};

MainCore.prototype.LoadHistory = function () {
    try {
        this.LogRecorder.LoadHistory(function (e, r) {
            if (!e) {
                for (var i = 0; i < r.length; i++) {
                    var History = this.ParseResultFromHistory(r[i]);
                    this.InitHistory.push(History);
                }
                for (var i = 0; i < this.DeskList.length; i++) {
                    this.DeskList[i].InitHistory();
                }
            }
        }.bind(this))
    }
    catch (e) {
        this.Logger.Game().error('MainCore.prototype.LoadHistory Get DataErr', e);
    }
};

MainCore.prototype.ParseResultFromHistory = function (data) {
    try {

        var strResult = '';
        if (Utility.CheckVariable(data, 'ResultDices')) {
            strResult = data.ResultDices;
        }
        var arrRs = strResult.split(',');
        var score = 0;
        for (var i = 0; i < arrRs.length; i++) {
            score += +arrRs[i];
        }
        return score;
    }
    catch (e) {
        this.Logger.Game().error('MainCore.prototype.ParseResultFromHistory Get DataErr', e.stack);
        return 0
    }
};

MainCore.prototype.OnUserEndMatch = function (User, BetList, WinList) {
    this.EventManager.EvtOnUserEndMatchAll(User, BetList, WinList)
};