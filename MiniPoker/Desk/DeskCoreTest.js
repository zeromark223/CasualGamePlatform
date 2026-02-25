/*{"build":1}*/
var rootFile = __stack[0].getFileName();
var path = require('path');
var cDir = path.dirname(rootFile);
var Utility = require(path.resolve(cDir, '../../SharedModule/Utility'));
// var Packet = require(path.resolve(cDir, '../Packet'));
// var Engine = require(path.resolve(cDir, './Engine'));
//var Packet = require('../Packet');

function DeskCore() {
    this.DeskID = 0;
    this.GameServer = 0;
    this.StockRatio = 1;
    this.IsReadyForMaintain = true;
    this.SecretKey = Utility.GetUUID(); // SecretKey cũng từ gen, không cho can thiệp.
    this.BetRatioConfig = require('../../Config/MiniPoker/BetRatioConfig');
    this.ResultCardsBanker = [];
    this.ResultCardsPlayer = [];
    this.ResultText = '';
    this.ListUser = [];
    this.MatchBetInfo = [];
    this.BetStateChanged = false;
    this.ResultWithSuit = [];
    this.MatchHistory = [];
    this.IsReadyForMaintain = false;
    this.MatchHistoryLimit = 100;
    this.CardPool = [];
    this.RewardConfig = [];
    this.MatchID = 1;
    this.MaxBetHistory = 50;
}

module.exports = DeskCore;

DeskCore.prototype.Init = function (GameServer, DeskID) {
    this.DeskID = DeskID;
    this.GameServer = GameServer;
    this.BetRatioConfig = GameServer.Config.BetRatioConfig;
    this.BetLimitConfig = GameServer.Config.BetLimitConfig;
    this.RewardConfig = GameServer.Config.RewardConfig;
    this.GenCardPool();
};

DeskCore.prototype.GenCardPool = function () {
    this.CardPool = [];
    //A - K
    //Suit Cơ Rô chuồn Bích
    for (var i = 0; i < 13; i++) {
        for (var j = 0; j < 4; j++) {
            this.CardPool.push({
                CardNum: i,
                CardSuit: j
            })
        }

    }
};

DeskCore.prototype.CardsToCardID = function (CardsList) {
    var ids = [];
    var id;
    for (var i = 0; i < CardsList.length; i++) {
        id = CardsList[i].CardNum * 4 + CardsList[i].CardSuit + 1;//ID từ 1
        ids.push(id);
    }
    return ids;
};

DeskCore.prototype.GetCardsFromPool = function (count) {
    var cards = [];
    var pool = [];
    var i;
    for (i = 0; i < count; i++) {
        var id = Math.floor(Math.random() * this.CardPool.length);
        if (pool.indexOf(id) == -1) {// chưa có vị trí này
            pool.push(id);
        } else {
            i--;
        }
    }
    for (i = 0; i < pool.length; i++) {
        cards.push(this.CardPool[pool[i]]);
    }

    return cards;
};

DeskCore.prototype.IsAvailable = function () {
    return 1;
};

DeskCore.prototype.UserEnterDesk = function (Socket) {
    try {
        var User = Socket.UserModel;
        if (User.MoneyState == this.GameServer.MoneyStateDefine.GettingCompleted) {
            User.MoneyState = this.GameServer.MoneyStateDefine.JoinGameCompleted;
            User.OnUserEnterDesk(this);
            User.JackpotCurrentID = this.BetLimitConfig.BetGoldList[0] || 0;
            //#31
            this.GameServer.UserClient.push(Socket);
            User.DeskID = this.DeskID;
            this.ListUser.push(User);
            this.CheckUserPlayable(User);
        }


    } catch (e) {
        this.GameServer.Logger.Game().error('GameServer.prototype.UserEnterDesk - try err: ' + e.stack);
    }
};

DeskCore.prototype.DeskSendAllUser = function (Msg) {
    try {
        for (var i = 0; i < this.ListUser.length; i++) {
            this.GameServer.SendSocketBinary(this.ListUser[i].Socket, Msg);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.DeskSendAllUser ', e.stack);
    }
};

DeskCore.prototype.OnShowResult = function (WinList) {
    try {
        var msg = new Packet.EndMatchResultResponse(this.ResultWithSuit.PlayerCards, this.ResultWithSuit.BankerCards, this.ResultText, this.MatchNextRoundTime, WinList);
        this.DeskSendAllUser(msg);
        this.GenMatchHistory();
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.OnShowResult ', e.stack);
    }
};

DeskCore.prototype.UserBetError = function (Socket, msg) {
    try {
        this.GameServer.ShowPopup(Socket, msg);
        this.GameServer.SendSocketBinary(Socket, new Packet.UserBetResponse(1));
        this.GameServer.Logger.Game().debug('UserBetError', Socket.UserModel.UserID, msg);
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.UserBetError ', e.stack);
    }
};

DeskCore.prototype.DeskTimer2Second = function () {
    try {
        //this.BroadcastBetInfo();
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.DeskTimer2Second ', e.stack);
    }
};

DeskCore.prototype.CheckPair = function (Cards) {
    if (Cards[0] == Cards[1]) {
        return 1;
    }
    return 0;
};

DeskCore.prototype.GenMatchHistory = function () {
    try {
        var BankerScore = this.GetScore(this.ResultCardsBanker);
        var PlayerScore = this.GetScore(this.ResultCardsPlayer);
        var BankerPair = this.CheckPair(this.ResultCardsBanker);
        var PlayerPair = this.CheckPair(this.ResultCardsPlayer);

        this.MatchHistory.push({
            BankerScore: BankerScore,
            PlayerScore: PlayerScore,
            BankerPair: BankerPair,
            PlayerPair: PlayerPair
        });

        if (this.MatchHistory.length > this.MatchHistoryLimit) {
            this.MatchHistory.splice(0, 1);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.GenMatchHistory ', e.stack);
    }
};

DeskCore.prototype.UserGetMatchHistory = function (Socket) {
    try {
        this.GameServer.SendSocketBinary(Socket, new Packet.MatchHistoryResponse(this.MatchHistory));
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.UserGetMatchHistory ', e.stack);
    }
};

DeskCore.prototype.UserGetUserHistory = function (User) {
    this.GameServer.RedisAdapter.zRange(this.GameServer.Config.RedisConfig.Define.BaccaratBetUserHistory + User.UserID, 0, -1, function (err, d) {
        if (!err) {
            try {
                var h = [];
                for (var i = 0; i < d.length; i++) {
                    h.push(JSON.parse(d[i]));
                }
                var msg = new Packet.UserHistoryResponse(h);
                this.GameServer.SendSocketBinary(User.Socket, msg);
            } catch (ex) {
                this.GameServer.Logger.Game().error('DeskCore.prototype.UserGetUserHistory Build DataErr', ex.stack);
            }
        } else {
            this.GameServer.Logger.Game().error('DeskCore.prototype.UserGetUserHistory Get DataErr', err);
        }
    }.bind(this));
};

DeskCore.prototype.InitHistory = function () {
    try {
        var InitHistory = this.GameServer.InitHistory;

        for (var i = 0; i < InitHistory.length; i++) {
            var BankerScore = this.GetScore(InitHistory[i].BankerCards);
            var PlayerScore = this.GetScore(InitHistory[i].PlayerCards);
            var BankerPair = this.CheckPair(InitHistory[i].BankerCards);
            var PlayerPair = this.CheckPair(InitHistory[i].PlayerCards);

            this.MatchHistory.push({
                BankerScore: BankerScore,
                PlayerScore: PlayerScore,
                BankerPair: BankerPair,
                PlayerPair: PlayerPair
            })
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.InitHistory Get DataErr', e.stack);
    }
};

DeskCore.prototype.OnUserSpin = function (User, GoldBet) {
    try {
        if (!this.CheckUserPlayable(User) || !this.CheckBetValue(GoldBet)) {
            return;
        }
        var GoldBefore = User.Wallet;
        if (User.Wallet > GoldBet) {
            User.Wallet = User.Wallet - +GoldBet;
            User.TotalGoldUserPayForSys += +GoldBet;
            this.GameServer.JackpotAdd(GoldBet);
            this.CalcResult(User, GoldBet, GoldBefore);
        } else {
            //Hết tiền
            this.GameServer.ShowPopup(User.Socket, this.GameServer.GetUserMsgByLangCode(this.GameServer.Config.LanguageConfig.Action_NotEnoughGold, User.Socket.LangCode));
        }

    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.OnUserSpin Err', e.stack);
    }
};

DeskCore.prototype.OnUserSpinDebug = function (User, GoldBet, Cards) {
    if (!this.CheckUserPlayable(User) || !this.CheckBetValue(GoldBet)) {
        return;
    }
    if (!this.GameServer.Debug) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.OnUserSpinDebug Unauthorized try to Access Debug');
        return;
    }
    var GoldBefore = User.Wallet;
    if (User.Wallet > GoldBet) {
        User.TotalGoldUserPayForSys += +GoldBet;
        this.GameServer.JackpotAdd(GoldBet);
        User.Wallet = User.Wallet - +GoldBet;
    } else {
        //Hết tiền
        this.GameServer.ShowPopup(User.Socket, this.GameServer.GetUserMsgByLangCode(this.GameServer.Config.LanguageConfig.Action_NotEnoughGold, User.Socket.LangCode));
        return;
    }
    var cards = [];
    for (var i = 0; i < Cards.length; i++) {
        //0-0 / 1
        cards.push({
            CardNum: Math.floor((Cards[i] - 1) / 4),
            CardSuit: (Cards[i] - 1) % 4
        })
    }
    if (cards.length < 5) {
        this.GameServer.ShowPopup(User.Socket, "Ở đây chúng tôi không làm vậy !");
        return;
    }
    this.CalcUserWin(User, cards, GoldBet, GoldBefore);
};

DeskCore.prototype.CalcResult = function () {
    var Cards = this.GetCardsFromPool(5);//Lấy 5 card
    Cards = Cards.sort(function (a, b) {
        return a.CardNum - b.CardNum;
    });
    return this.CalcUserWin(Cards);
};

DeskCore.prototype.CalcUserWin = function (Cards) {
    return this.CheckRule(Cards);

};

DeskCore.prototype.HandleUserWin = function (User, winGold, ResultList, GoldBefore, GoldBet, winId, isJackpot) {
    User.Wallet += +winGold;

    //Record xong lấy MatchID
    this.GameServer.RecordMatchInfo(
        ResultList.toString(),
        this.GameServer.BetLimitConfig.Tax,
        User.UserID,
        GoldBefore,
        GoldBet,
        winGold,
        User.Wallet,
        this.DeskID,
        User.UserChannelID, function (matchId) {
            var usrObj = {
                MatchID: matchId,
                ResultList: ResultList,
                WinGold: winGold,
                CurrentGold: User.Wallet,
                WinResult: winId,
                IsJackpot: isJackpot
            };
            //Record lịch sử cho user
            this.RecordUserSpinHistory(User.UserID, {
                MatchID: usrObj.MatchID,
                BetGold: GoldBet,
                WinGold: usrObj.WinGold,
                Time: +new Date(),
                Result: usrObj.WinResult
            });

            if (winId >= 0 && winId < 3) {
                this.RecordBigWin({
                    GameName: User.GameName,
                    MatchID: usrObj.MatchID,
                    BetGold: GoldBet,
                    WinGold: usrObj.WinGold,
                    Time: +new Date(),
                    Result: usrObj.WinResult
                })
            }

            this.GameServer.SendSocketBinary(User.Socket, new Packet.UserSpinResponse(usrObj));
        }.bind(this)
    );
};

DeskCore.prototype.CheckRule = function (Cards) {
    if (this.CheckTuQui(Cards)) {
        return this.GetBetRatioConfig(2);
    }
    if (this.CheckCuLu(Cards)) {
        return this.GetBetRatioConfig(3);
    }
    if (this.CheckSamCo(Cards)) {
        return this.GetBetRatioConfig(6);
    }
    if (this.CheckHaiDoi(Cards)) {
        return this.GetBetRatioConfig(7);
    }
    if (this.CheckDoiJ(Cards)) {
        return this.GetBetRatioConfig(8);
    }
    if (this.CheckSanh(Cards)) {
        if (this.CheckThung(Cards)) {//Thung Pha Sanh
            for (var i = 0; i < Cards.length; i++) {
                if (Cards[i].CardNum == 10) {//TPS có J
                    return this.GetBetRatioConfig(0);
                }
            }
            return this.GetBetRatioConfig(1);
        } else {
            return this.GetBetRatioConfig(5);
        }
    } else {
        if (this.CheckThung(Cards)) {
            return this.GetBetRatioConfig(4);
        }
    }
    return 0; // Đéo trúng case nào
};

DeskCore.prototype.GetBetRatioConfig = function (ID) {
    for (var i = 0; i < this.BetRatioConfig.length; i++) {
        if (this.BetRatioConfig[i].ID == ID) return this.BetRatioConfig[i];
    }
    return 0;
};

//Bộ tính poker
DeskCore.prototype.CheckSanh = function (Cards) {
    //Sort trước khi xài

    for (var i = 0; i < Cards.length - 1; i++) {
        if (Cards[i].CardNum == 0) {//Case xì

            if (Cards[i + 1].CardNum != 9) {// lá kế ko phải là 10
                return false;
            }
        } else {
            if (Cards[i].CardNum != Cards[i + 1].CardNum - 1) { // sảnh là phải liên tiếp
                return false;
            } else {

            }
        }

    }
    return true;
};

DeskCore.prototype.CheckThung = function (Cards) {
    //Sort trước khi xài
    for (var i = 0; i < Cards.length - 1; i++) {
        if (Cards[i].CardSuit != Cards[i + 1].CardSuit) {
            return false;
        }
    }
    return true;
};

DeskCore.prototype.CheckTuQui = function (Cards) {
    //Sort trước khi xài
    var c = 1;
    var pre = -1;
    for (var i = 0; i < Cards.length; i++) {
        if (Cards[i].CardNum != pre) {
            c = 1;
            pre = Cards[i].CardNum;
        } else {
            if (c >= 3) return true; // 3 số trước đã thỏa, thêm số này là đủ
            c++;
        }
    }
    return c > 3; // Tử quí
};

DeskCore.prototype.CheckSamCo = function (Cards) {
    //Sort trước khi xài
    var c = 1;
    var pre = -1;
    for (var i = 0; i < Cards.length; i++) {
        if (Cards[i].CardNum != pre) {
            c = 1;
            pre = Cards[i].CardNum;
        } else {
            if (c >= 2) return true; // 2 số trước đã thỏa, thêm số này là đủ
            c++;
        }
    }
    return c > 2; // sám cô
};

DeskCore.prototype.CheckDoiJ = function (Cards) {
    var t = [];
    for (var i = 0; i < Cards.length; i++) {
        t[Cards[i].CardNum] = (t[Cards[i].CardNum] + 1) || 1;
    }
    for (var i = 0; i < t.length; i++) {
        if (t[i] > 1 && (i > 9 || i == 0)) {// count > 1 và cardnum > 10
            return true;
        }
    }
    return false;
};

DeskCore.prototype.CheckHaiDoi = function (Cards) {
    var t = [];
    for (var i = 0; i < Cards.length; i++) {
        t[Cards[i].CardNum] = (t[Cards[i].CardNum] + 1) || 1;
    }
    var c = 0;
    for (var i = 0; i < t.length; i++) {
        if (t[i] > 1) {// count > 1
            c++
        }
    }
    return c > 1;// 2 đôi

};

DeskCore.prototype.CheckCuLu = function (Cards) {
    if (Cards[0].CardNum == Cards[1].CardNum && Cards[3].CardNum == Cards[4].CardNum) {//Card 1 = 2 và card 4 = 5  (đôi đầu và đôi đuôi AA X BB
        return Cards[1].CardNum == Cards[2].CardNum || Cards[2].CardNum == Cards[3].CardNum;//Check X = A or X = B để ra AABBB or AAABB
    }
    return false;

};

DeskCore.prototype.GetRoomConfig = function (Socket) {
    try {
        if (Socket.UserModel.UserState == this.GameServer.UserStateDefine.JoinRoomCompleted) {
            this.GameServer.SendSocketBinary(Socket, new Packet.GetRoomConfigResponse({
                BetGoldList: this.BetLimitConfig.BetGoldList,
                JackpotGold: 0,
                WinRatio: this.BetRatioConfig
            }));
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.GetRoomConfig Err', e.stack);
    }
};

DeskCore.prototype.UserGetUserHistory = function (User) {
    try {
        this.GameServer.RedisAdapter.zRange(this.GameServer.Config.RedisConfig.Define.MiniPokerUserHistory + User.UserID, 0, -1, function (err, d) {
            if (!err) {
                try {
                    var h = [];
                    for (var i = 0; i < d.length; i++) {
                        h.push(JSON.parse(d[i]));
                    }
                    var msg = new Packet.UserHistoryResponse(h);
                    this.GameServer.SendSocketBinary(User.Socket, msg);
                } catch (ex) {
                    this.GameServer.Logger.Game().error('DeskCore.prototype.UserGetUserHistory Build DataErr', ex.stack);
                }
            } else {
                this.GameServer.Logger.Game().error('DeskCore.prototype.UserGetUserHistory Get DataErr', err);
            }
        }.bind(this));
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.UserGetUserHistory Err', e.stack);
    }
};

DeskCore.prototype.UserGetTopUserWin = function (User) {
    try {
        this.GameServer.RedisAdapter.zRange(this.GameServer.Config.RedisConfig.Define.MiniPokerBigWin, 0, -1, function (err, d) {
            if (!err) {
                try {
                    var h = [];
                    for (var i = 0; i < d.length; i++) {
                        h.push(JSON.parse(d[i]));
                    }
                    var msg = new Packet.TopUserWinResponse(h);
                    this.GameServer.SendSocketBinary(User.Socket, msg);
                } catch (ex) {
                    this.GameServer.Logger.Game().error('DeskCore.prototype.UserGetTopUserWin Build DataErr', ex.stack);
                }
            } else {
                this.GameServer.Logger.Game().error('DeskCore.prototype.UserGetTopUserWin Get DataErr', err);
            }
        }.bind(this));
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.UserGetTopUserWin Err', e.stack);
    }
};

DeskCore.prototype.UpdateUserLeftDesk = function (Socket) {
    Socket.UserModel.OnUserLeftDesk();
    this.GameServer.UserInfoUpdateAll(Socket);

    for (var i = 0; i < this.ListUser.length; i++) {
        if (this.ListUser[i].UserID == Socket.UserModel.UserID) {
            this.ListUser.splice(i, 1);
            return;
        }
    }
};


DeskCore.prototype.RecordUserSpinHistory = function (UserID, history) {
    try {
        var history_str = JSON.stringify(history);

        this.GameServer.RedisAdapter.zAdd(this.GameServer.Config.RedisConfig.Define.MiniPokerUserHistory + UserID, +new Date(), history_str);
        this.GameServer.RedisAdapter.zCount(this.GameServer.Config.RedisConfig.Define.MiniPokerUserHistory + UserID, function (e, d) {
            if (!e) {
                if (d > this.MaxBetHistory) {
                    var rem = d - this.MaxBetHistory;
                    this.GameServer.RedisAdapter.zRemByRank(this.GameServer.Config.RedisConfig.Define.MiniPokerUserHistory + UserID, 0, rem);
                }
            }
        }.bind(this));
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.RecordUserSpinHistory Err', e.stack);
    }
};

DeskCore.prototype.RecordBigWin = function (history) {
    try {
        var history_str = JSON.stringify(history);

        this.GameServer.RedisAdapter.zAdd(this.GameServer.Config.RedisConfig.Define.MiniPokerBigWin, +new Date(), history_str);
        this.GameServer.RedisAdapter.zCount(this.GameServer.Config.RedisConfig.Define.MiniPokerBigWin, function (e, d) {
            if (!e) {
                if (d > this.MaxBetHistory) {
                    var rem = d - this.MaxBetHistory;
                    this.GameServer.RedisAdapter.zRemByRank(this.GameServer.Config.RedisConfig.Define.MiniPokerBigWin, 0, rem);
                }
            }
        }.bind(this));
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.RecordBigWin Err', e.stack);
    }
};

DeskCore.prototype.CheckUserPlayable = function (User) {
    if (User.BeginWallet < this.BetLimitConfig.MinPlayableBeginWallet) {
        this.GameServer.ShowPopup(User.Socket, this.GameServer.GetUserMsgByLangCode(this.GameServer.Config.LanguageConfig.LimitGoldPlayable_Error, User.Socket.LangCode).toString().replace('%s', this.BetLimitConfig.MinPlayableBeginWallet));
        return false;

    }
    return true;
};

DeskCore.prototype.ReloadDeskConfig = function (BetRatioConfig, BetLimitConfig) {
    this.BetRatioConfig = BetRatioConfig;
    this.BetLimitConfig = BetLimitConfig;
};

DeskCore.prototype.CheckBetValue = function (BetValue) {
    return this.BetLimitConfig.BetGoldList.indexOf(+BetValue) > -1;
};