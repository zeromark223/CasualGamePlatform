/*{"build":1}*/
//sys lib
var MainCore = require('../MainCore/MainCore');
var Config = require('../Config/Bingo');
var GameListConfig = require('../Config/Common/GameListConfig');
var ModuleExtension = require('./Modules');
var UserController = require('./Controller/UserController');
var Packet = require('./Packet');
var SmartRequire = require('../SharedModule/smartRequire');
var Utility = require('../SharedModule/Utility');
var UserModel = require('./Model/UserModel');
var path = require('path');

function Main() {
    this.GameID = GameListConfig.Bingo.GameID;

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
    //
    this.DeskBingoStateConfig = {
        Prepare: 1, // chuan bi de user vo choi
        Play: 2, // dang choi, user khong duoc lam gi het
        ShowResult: 3 // tinh toan de cong tru tien cho user
    };
}

Main.prototype = new MainCore(Config);
module.exports = Main;

MainCore.prototype.InitAllExtension = function () {
    ModuleExtension.SQLAdapter(this.SQLAdapter);
    ModuleExtension.RedisAdapter(this.RedisAdapter);
    ModuleExtension.LogRecorder(this.LogRecorder);
    UserController(this.UserController);
    UserModel(this.UserModel);

    // this.LoadHistory();

};

/**
 * call this function after user login successfully. only call once
 * @param Socket
 * @constructor
 */
MainCore.prototype.GetDeskForUser = function (Socket) {
    try {
        this.AutoFindAndJoinDeskLobby(Socket);
        //
        this.SendSocketBinary(Socket, new this.BasicPacket.LoginResponse(Socket.UserModel.UserID, Socket.UserModel.Wallet, Socket.UserModel.GameName));
    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.GetDeskForUser - try err: ' + e.stack);
    }
};

MainCore.prototype.AutoFindAndJoinDeskLobby = function (Socket) {
    try {
        if (Socket.UserModel.MoneyState == this.MoneyStateDefine.GettingCompleted) {
            this.UserClient.push(Socket);
            for (var i = 0; i < this.DeskList.length; i++) {
                // kiem tra no co trong room nay truoc do chua
                // neu co roi thi cho no join vo room
                var oUserPlaying = this.DeskList[i].UserPlayingFind(Socket.UserModel);
                if (oUserPlaying != 0) {
                    this.Logger.Game().info('MainCore.prototype.AutoFindAndJoinDeskLobby - reconnect last playing desk');
                    // cho no vo room nay luon
                    this.DeskList[i].OnReconnectUserPlay(Socket);
                    return;
                }
            }
            // cho no join vo desk lobby
            this.DeskLobby.UserEnterDesk(Socket);
        } else {
            this.Logger.Game().error('MainCore.prototype.AutoFindAndJoinDeskLobby: wrong User.MoneyState: ', Socket.UserModel.MoneyState);
        }
    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.AutoFindAndJoinDeskLobby - try err: ' + e.stack);
    }
};

MainCore.prototype.Timer2seconds = function () {
    try {
        this.UpdateDeskTimer2Second();
    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.Timer2seconds - try err: ' + e.stack);
    }
};

MainCore.prototype.Timer10seconds = function () {
    try {
        this.ReloadBetLimitConfig();
    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.Timer10seconds - try err: ' + e.stack);
    }
    try {
        this.BuildTopWinListAllMode();
    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.Timer10seconds: BuildTopWinListAllMode - try err: ' + e.stack);
    }
    try {
        this.UpdateDeskTreasureData();
    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.Timer10seconds: BuildTopWinListAllMode - try err: ' + e.stack);
    }
};

MainCore.prototype.UpdateDeskTimer2Second = function () {
    for (var i = 0; i < this.DeskList.length; i++) {
        this.DeskList[i].DeskTimer2Second();
    }
    this.DeskLobby.DeskTimer2Second();
};

MainCore.prototype.ReloadBetLimitConfig = function () {
    try {

        var BetLimitConfig = requireUnCached('../Config/Bingo/BetLimitConfig.js');//Ko gan truc tiep, tranh loi
        this.BetLimitConfig = BetLimitConfig;

    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.ReloadBetLimitConfig - try err: ' + e);
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
                this.LogRecorder.logUserBetEndGame(User.UserID, User.ListBetHistory[i].ID, User.ListBetHistory[i].Gold, MatchID, Tax, User.ListBetHistory[i].WinGold, User.ListBetHistory[i].WinGoldNoTax, User.UserChannelID)
            }
        }

        User.ListBetHistory = []; //Sau khi Insert thi clear
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.LogUserBetEndMatch_Insert - try err:' + e.stack);
    }

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
    return;
    try {
        this.LogRecorder.LoadHistory(function (e, r) {
            if (!e) {
                for (var i = 0; i < r.length; i++) {
                    var History = this.ParseResultFromHistory(r[i]);
                    var arrRs = History.split(',');
                    for (var j = 0; j < arrRs.length; j++) {
                        this.InitHistory.push(+arrRs[j]);
                    }
                }
                this.Logger.Game().info('MainCore.prototype.LoadHistory', this.InitHistory.length);
                for (var i = 0; i < this.DeskList.length; i++) {
                    this.DeskList[i].InitHistory();
                }
            }
        }.bind(this))
    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.LoadHistory Get DataErr', e);
    }
};

/**
 * @return {string}
 */
MainCore.prototype.ParseResultFromHistory = function (data) {
    try {
        var strResult = '';
        if (Utility.CheckVariable(data, 'ResultDices')) {
            strResult = data.ResultDices;
        }
        return strResult;
    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.ParseResultFromHistory Get DataErr', e.stack);
        return '';
    }
};

MainCore.prototype.InitDesk = function () {
    var Desk = SmartRequire(path.resolve('./Desk/index.js'), this.SecretKey, this.SecretIV);
    var autoIncrementDeskID = 1;
    // 1. create room lobby
    this.DeskLobby = Desk.GetDeskByKind(Config.RoomKindConfig.BingoLobby, this.SecretKey, this.SecretIV, SmartRequire);
    this.DeskLobby.Init(this, autoIncrementDeskID++, Config.RoomKindConfig.BingoLobby, 0);
    // this.DeskList.push(this.DeskLobby);
    //2. create desk for mode classical and node easy
    let arrTreasureInit = this.BetLimitConfig.TreasureInits;
    let arrCardPrices = this.BetLimitConfig.Cards;
    let arrCardPricesLength = this.BetLimitConfig.Cards.length;
    for (let i = 0; i < arrCardPricesLength; i++) {
        // 2.1 classical desk
        let newDeskClassical = Desk.GetDeskByKind(Config.RoomKindConfig.BingoClassical, this.SecretKey, this.SecretIV, SmartRequire);
        newDeskClassical.Init(this, autoIncrementDeskID++, Config.RoomKindConfig.BingoClassical, arrCardPrices[i], arrTreasureInit[i]);
        this.DeskList.push(newDeskClassical);
        // 2.2 easy desk
        let newDeskEasy = Desk.GetDeskByKind(Config.RoomKindConfig.BingoEasy, this.SecretKey, this.SecretIV, SmartRequire);
        newDeskEasy.Init(this, autoIncrementDeskID++, Config.RoomKindConfig.BingoEasy, arrCardPrices[i], arrTreasureInit[i]);
        this.DeskList.push(newDeskEasy);
    }
    this.Logger.Game().info('MainCore.prototype.InitDesk end. Num desk: ', this.DeskList.length);
    // init && build top win list
    this.TopUserWinListBinary = {};
    this.TopUserWinListBinary[Config.RoomKindConfig.BingoClassical] = 0;
    this.TopUserWinListBinary[Config.RoomKindConfig.BingoEasy] = 0;
    //
    this.BuildTopWinList(Config.RoomKindConfig.BingoClassical);
    this.BuildTopWinList(Config.RoomKindConfig.BingoEasy);
    //
    this.TopUserWinListAllModeBinary = [];
    this.BuildTopWinListAllMode();
    //
    this.DeskTreasureData = {
        MaxTreasure: 0,
        ListTreasureClassical: [],
        ListTreasureEasy: []
    };
    this.UpdateDeskTreasureData();
};
MainCore.prototype.FindDesk = function (DeskKind, CardPrice) {
    for (let i = 0; i < this.DeskList.length; i++) {
        let oDesk = this.DeskList[i];
        if (oDesk.GetDeskKind() == DeskKind && oDesk.GetCardPrice() == CardPrice) {
            return oDesk;
        }
    }
    return 0;
};

MainCore.prototype.GetDeskTreasureData = function () {
    return this.DeskTreasureData;
};

MainCore.prototype.UpdateDeskTreasureData = function () {
    // let tmp = 0;
    // for (var i = 0; i < this.DeskList.length; i++) {
    //     var oDesk = this.DeskList[i];
    //     // if (oDesk.IsLobby()) continue;
    //     if (oDesk.GetTreasureValue() > tmp) {
    //         tmp = oDesk.GetTreasureValue();
    //     }
    // }
    // this.MaxTreasureValue = tmp;
    let iMaxTreasureValue = 0;
    let arrTreasureClassical = [];
    let arrTreasureEasy = [];
    //
    let arrCardPrices = this.BetLimitConfig.Cards;
    let arrCardPricesLength = this.BetLimitConfig.Cards.length;
    for (let i = 0; i < arrCardPricesLength; i++) {
        // for mode classical
        let oDeskClassical = this.FindDesk(Config.RoomKindConfig.BingoClassical, arrCardPrices[i]);
        let iDeskClassicalTreasureValue = oDeskClassical.GetTreasureValue();
        arrTreasureClassical.push(iDeskClassicalTreasureValue);
        if (iDeskClassicalTreasureValue > iMaxTreasureValue) {
            iMaxTreasureValue = iDeskClassicalTreasureValue;
        }
        // for mode easy
        let oDeskEasy = this.FindDesk(Config.RoomKindConfig.BingoEasy, arrCardPrices[i]);
        let iDeskEasyTreasureValue = oDeskEasy.GetTreasureValue();
        arrTreasureEasy.push(iDeskEasyTreasureValue);
        if (iDeskEasyTreasureValue > iMaxTreasureValue) {
            iMaxTreasureValue = iDeskEasyTreasureValue;
        }
    }
    this.DeskTreasureData.MaxTreasure = iMaxTreasureValue;
    this.DeskTreasureData.ListTreasureClassical = arrTreasureClassical;
    this.DeskTreasureData.ListTreasureEasy = arrTreasureEasy;
    //
    // this.DeskTreasureData = {
    //     MaxTreasure: iMaxTreasureValue,
    //     ListTreasureClassical: arrTreasureClassical,
    //     ListTreasureEasy: arrTreasureEasy
    // };
};
MainCore.prototype.FindSuitableDesk = function (Socket, DeskKind, CardPrice) {
    for (let i = 0; i < this.DeskList.length; i++) {
        var oDesk = this.DeskList[i];
        // if (oDesk.IsLobby()) continue;
        if (oDesk.GetDeskKind() == DeskKind && oDesk.GetCardPrice() == CardPrice) {
            //oDesk.OnUserPlay(Socket, NumCard);
            return oDesk;
        }
    }
    return 0;
};

MainCore.prototype.GetRoomConfig = function (Socket) {
    try {
        let CardPrices = this.BetLimitConfig.Cards;
        let GoldRequired = this.BetLimitConfig.MinPlayableBeginWallet;
        let ClassicalMaxCall = this.BetLimitConfig.ClassicalMaxCall;

        let msg = new Packet.GetRoomConfigResponse({
            ClassicalCardPrices: CardPrices,
            EasyCardPrices: CardPrices,
            GoldRequired: GoldRequired,
            ClassicalMaxCall: ClassicalMaxCall,
        });
        this.SendSocketBinary(Socket, msg);
    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.GetRoomConfig - try err: ' + e.stack);
    }
};

MainCore.prototype.BuildTopWinList = function (DeskKind) {
    let redisKey = this.Config.RedisConfig.Define.BingoTopUserWin + ':' + DeskKind;
    this.RedisAdapter.zRevRangeWithScores(redisKey, 0, 50,
        function (err, d) {
            if (!err) {
                try {
                    let arrTopWinner = [];
                    for (let i = 0; i < d.length; i += 2) {
                        arrTopWinner.push({
                            GameName: d[i],
                            TotalWin: d[i + 1]
                        });
                    }
                    // this.TopUserWinListBinary[DeskKind] = new Packet.TopUserWinResponse(arrTopWinner);
                    this.TopUserWinListBinary[DeskKind] = arrTopWinner;
                    this.Logger.Game().info('MainCore.prototype.BuildTopWinList ', DeskKind, arrTopWinner);
                } catch (ex) {
                    this.Logger.Game().error('MainCore.prototype.BuildTopWinList Build DataErr', ex.stack);
                }
            } else {
                this.Logger.Game().error('MainCore.prototype.BuildTopWinList Get DataErr', err);
            }
        }.bind(this));
};

MainCore.prototype.BuildTopWinListAllMode = function () {
    let redisKey = this.Config.RedisConfig.Define.BingoTopUserWinAllMode;
    this.RedisAdapter.zRevRangeWithScores(redisKey, 0, 50,
        function (err, d) {
            if (!err) {
                try {
                    let arrTopWinner = [];
                    for (let i = 0; i < d.length; i += 2) {
                        arrTopWinner.push({
                            GameName: d[i],
                            TotalWin: d[i + 1]
                        });
                    }
                    this.TopUserWinListAllModeBinary = arrTopWinner;
                } catch (ex) {
                    this.Logger.Game().error('MainCore.prototype.BuildTopWinListAllMode Build DataErr', ex.stack);
                }
            } else {
                this.Logger.Game().error('MainCore.prototype.BuildTopWinListAllMode Get DataErr', err);
            }
        }.bind(this));
};

MainCore.prototype.CollectUserWinLose = function (DeskKind, GameName, TotalWin) {
    let redisKey = this.Config.RedisConfig.Define.BingoTopUserWin + ':' + DeskKind;
    try {
        // this.RedisAdapter.zAdd(redisKey, TotalWin, GameName);
        this.RedisAdapter.zIncrby(redisKey, TotalWin, GameName);
        //this.GameServer.EventManager.EvtOnUserWinLoseAll(User, TotalBet, TotalWin);
    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.CollectUserWinLose', e.stack);
    }
    // for top all mode
    let redisKeyTopAllMode = this.Config.RedisConfig.Define.BingoTopUserWinAllMode;
    try {
        this.RedisAdapter.zIncrby(redisKeyTopAllMode, TotalWin, GameName);
        //this.GameServer.EventManager.EvtOnUserWinLoseAll(User, TotalBet, TotalWin);
    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.CollectUserWinLose', e.stack);
    }
};

MainCore.prototype.OnUserGetTopWin = function (User, DeskKind) {
    // this.Logger.Game().info('MainCore.prototype.OnUserGetTopWin ', DeskKind, this.TopUserWinListBinary[DeskKind]);
    // this.SendSocketBinary(User.Socket, this.TopUserWinListBinary[DeskKind]);
    this.SendSocketBinary(User.Socket, new Packet.TopUserWinResponse(this.TopUserWinListBinary[DeskKind]));
};

MainCore.prototype.OnUserGetTopWinAllMode = function (User) {
    // this.Logger.Game().info('MainCore.prototype.OnUserGetTopWinAllMode ', this.TopUserWinListAllModeBinary);
    // this.SendSocketBinary(User.Socket, this.TopUserWinListBinary[DeskKind]);
    this.SendSocketBinary(User.Socket, new Packet.TopUserWinAllModeResponse(this.TopUserWinListAllModeBinary));
};

MainCore.prototype.OnUserPlayNow = function (Socket) {
    try {
        if (Socket.UserModel.MoneyState == this.MoneyStateDefine.JoinGameCompleted) {
            // 1. check whether user is playing or not, neu co thi reconnect
            let oSuitableDesk = this.DeskList[0];
            for (let i = 0; i < this.DeskList.length; i++) {
                // check whether user enter this room or not
                // if yes let user join this room
                let oDesk = this.DeskList[i];
                let oUserPlaying = oDesk.UserPlayingFind(Socket.UserModel);
                if (oUserPlaying != 0) {
                    // remove user khoi desk lobby
                    this.DeskLobby.RemoveUser(Socket.UserModel, false);
                    this.Logger.Game().info('MainCore.prototype.AutoFindAndJoinDeskLobby - reconnect last playing desk');
                    // cho no vo room nay luon
                    oDesk.OnReconnectUserPlay(Socket);
                    return;
                }
                // kiem tra xem phong do no vo duoc khong
                if (oDesk.IsModeClassical()) {
                    if (oDesk.GetCardPrice() <= Socket.UserModel.Wallet) {
                        oSuitableDesk = oDesk;
                    }
                }
            }
            // 2. lay thong tin phong cho no join vo
            this.SendSocketBinary(Socket, new Packet.PlayNowResponse(oSuitableDesk.GetDeskKind(), oSuitableDesk.GetCardPrice()));
            this.Logger.Game().info('MainCore.prototype.OnUserPlayNow: ', oSuitableDesk.GetDeskKind(), oSuitableDesk.GetCardPrice());
        } else {
            this.Logger.Game().error('MainCore.prototype.OnUserPlayNow: wrong User.MoneyState: ', Socket.UserModel.MoneyState);
        }
    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.OnUserPlayNow - try err: ' + e.stack);
    }
};