/*{"build":1}*/
var rootFile = __stack[0].getFileName();
var path = require('path');
var cDir = path.dirname(rootFile);
var Utility = require(path.resolve(cDir, '../../SharedModule/Utility'));
// var Packet = require(path.resolve(cDir, '../Packet'));
// var Engine = require(path.resolve(cDir, './Engine'));
var Config = require('../../Config/VQMM');
var Packet = require('../Packet');
var Encrytion = require(path.resolve(cDir, '../../SharedModule/encrytion'));

function DeskCore() {
    this.DeskID = 0;
    this.GameServer = 0;
    this.StockRatio = 1;
    this.IsReadyForMaintain = true;
    this.SecretKey = Utility.GetUUID(); // SecretKey cũng từ gen, không cho can thiệp.
    this.BetRatioConfig = [];
    this.ResultCardsBanker = [];
    this.ResultCardsPlayer = [];
    this.ResultText = '';
    this.DeskState = '';
    this.ListUser = [];
    this.ListUserBet = [];
    this.MatchBetInfo = [];
    this.DeskState = '';
    this.MaxBetHistory = 50;

    this.BetStateChanged = false;
    this.MatchRoundTime = 35;
    this.StartRoundTime = +new Date();
    this.ResultWithSuit = [];
    this.MatchHistory = [];
    this.IsReadyForMaintain = false;

    this.MatchNextRoundTime = 18;

    this.MatchHistoryLimit = 100;

    this.NumberOfCardPack = 8;
    this.CardPool = [];
    this.CurrCardNumber = 0;

    this.RewardConfig = [];
    this.BigWinRequired = 100000;
}

module.exports = DeskCore;
DeskCore.prototype.Init = function (GameServer, DeskID) {
    this.DeskID = DeskID;
    this.GameServer = GameServer;
    this.BetRatioConfig = GameServer.Config.BetRatioConfig;
    this.RewardConfig = GameServer.Config.RewardConfig;
};

DeskCore.prototype.StartRound = function () {
    if (this.GameServer.MaintainFlag) {
        this.IsReadyForMaintain = true;
        return;
    } //Check Stock của hệ thống, nếu vẫn đảm bảo mới được start ván.

    this.ListUserBet = [];
    this.MatchBetInfo = [];
    this.ResultCardsBanker = [];
    this.ResultCardsPlayer = [];
};


DeskCore.prototype.GetScore = function (List) {
    var score = 0;
    for (var i = 0; i < List.length; i++) {
        if (List[i] < 10) score += List[i];
    }
    return score % 10;
};


DeskCore.prototype.IsAvailable = function () {
    return 1;
};

DeskCore.prototype.UserEnterDesk = function (Socket) {
    try {
        var User = Socket.UserModel;
        if (User.MoneyState == this.GameServer.MoneyStateDefine.GettingCompleted) {
            User.MoneyState = this.GameServer.MoneyStateDefine.JoinGameCompleted;
            this.LoadUserInfo(User); // Load data cho User
            User.OnUserEnterDesk(this);
            this.GameServer.UserClient.push(Socket);
            User.DeskID = this.DeskID;
            this.ListUser.push(User);
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

DeskCore.prototype.GenSuitForResult = function () {
    var PlayerCards = [];
    var BankerCards = [];

    for (var i = 0; i < this.ResultCardsBanker.length; i++) {
        var Suit = Math.floor(Math.random() * 4) + 1;
        BankerCards.push({
            Score: this.ResultCardsBanker[i],
            Suit: Suit
        });
    }

    for (var i = 0; i < this.ResultCardsPlayer.length; i++) {
        var Suit = Math.floor(Math.random() * 4) + 1;
        PlayerCards.push({
            Score: this.ResultCardsPlayer[i],
            Suit: Suit
        });
    }

    return {
        PlayerCards: PlayerCards,
        BankerCards: BankerCards
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
        this.BroadcastBetInfo();
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.DeskTimer2Second ', e.stack);
    }
};

DeskCore.prototype.BroadcastBetInfo = function () {
    if (this.IsBeingBroadcastInfo) return;
    if (!this.BetStateChanged) return;//ko cần xử lý broadcast khi ko thay đổi
    this.BetStateChanged = false;
    this.IsBeingBroadcastInfo = true;

    var msg = new Packet.UpdateBetInfoResponse(this.MatchBetInfo);
    this.DeskSendAllUser(msg);
    this.IsBeingBroadcastInfo = false;

};

DeskCore.prototype.CalcWinResult = function () {
    var rs = [];
    //Calc Pair
    if (this.ResultCardsBanker.length >= 2 && this.ResultCardsPlayer.length >= 2) {
        if (this.CheckPair(this.ResultCardsPlayer)) {
            rs.push(this.GameServer.BetRatioConfig.PlayerPair.ID);
        }
        if (this.CheckPair(this.ResultCardsBanker)) {
            rs.push(this.GameServer.BetRatioConfig.BankerPair.ID);
        }
    }
    //Calc Player vs Banker Win-Draw
    if (this.GetScore(this.ResultCardsPlayer) == this.GetScore(this.ResultCardsBanker)) {
        rs.push(this.GameServer.BetRatioConfig.Draw.ID);
    }
    if (this.GetScore(this.ResultCardsPlayer) > this.GetScore(this.ResultCardsBanker)) {
        rs.push(this.GameServer.BetRatioConfig.PlayerWin.ID);
    }
    if (this.GetScore(this.ResultCardsPlayer) < this.GetScore(this.ResultCardsBanker)) {
        rs.push(this.GameServer.BetRatioConfig.BankerWin.ID);
    }
    return rs;
};

DeskCore.prototype.CalcWinForUser = function () {
    var WinList = this.CalcWinResult();

    this.ResultWithSuit = [];
    this.ResultWithSuit = this.GenSuitForResult();
    this.CalcTimeForNextMatch();
    this.CheckAndDrawCard();

    this.OnShowResult(WinList);

    var str_ResultWithSuit = this.GetResultWithSuitByString();

    var history = {
        MatchID: this.MatchID, // ID Bet
        Result: WinList, // Kết quả tổng
        BetList: [],
        TotalBet: 0,
        TotalWin: 0
    };
    var totalBet = 0;
    var totalWin = 0;
    var totalWinNoTax = 0;
    var totalSysWin = 0;
    var totalSysLose = 0;
    var totalSysTax = 0;

    for (var i = 0; i < this.ListUserBet.length; i++) {//Check từng User
        var User = this.ListUserBet[i];

        var UserWinList = [];
        var UpdateMoney = false;
        history.BetList = [];
        totalBet = 0;
        totalWin = 0;

        if (Utility.CheckVariable(User, 'ListBet')) {
            for (var j = 0; j < User.ListBet.length; j++) {// Check từng Bet
                if (User.ListBet[j].MatchID != this.MatchID) continue;// Bỏ qua Bet ko phải của Match này
                //totalBet += User.ListBet[j].Gold;
                history.BetList.push({
                    ID: User.ListBet[j].ID,
                    Money: User.ListBet[j].Gold
                });

                var bet = User.ListBet[j];
                totalBet += bet.Gold;
                var WinIndex = WinList.indexOf(bet.ID);
                if (WinIndex > -1) {
                    //trúng thưởng
                    var WinRatio = this.GetBetRatioByID(bet.ID);
                    var WinGoldNoTax = (1 + WinRatio) * bet.Gold;
                    //var WinGold = WinGoldNoTax * (1 - this.GetTax());
                    var WinGold = WinRatio * bet.Gold * this.GetTax();

                    WinGold += bet.Gold; // Trả tiền cược cho user
                    totalWin += WinGold;
                    totalWinNoTax += WinGoldNoTax;

                    UserWinList.push({
                        ID: bet.ID,
                        Money: WinGold,
                        WinGoldNoTax: WinGoldNoTax
                    });
                } else {
                    //Méo trúng
                    if (bet.ID == this.GameServer.BetRatioConfig.PlayerWin.ID || bet.ID == this.GameServer.BetRatioConfig.BankerWin.ID) {
                        var DrawIndex = WinList.indexOf(this.GameServer.BetRatioConfig.Draw.ID);
                        if (DrawIndex > -1) {
                            //Hoàn tiền cược
                            User.Wallet += bet.Gold;
                            UpdateMoney = true;
                        }
                    }
                }
            }

            User.ListBetHistory = User.ListBet; // Reset ListBet
            User.ListBet = []; // Reset ListBet
            history.TotalBet = totalBet;
            history.TotalWin = totalWin;

            //this.CollectUserWinLose(User.GameName, totalBet, totalWin);
            this.RecordUserBetHistory(User.UserID, JSON.stringify(history));

            if (UserWinList.length > 0) {
                this.GameServer.AddStock(-totalWin);
                this.HandleUserWin(User, UserWinList, totalWin);
            } else {
                if (UpdateMoney) {
                    this.UpdateMoneyForUser(User);
                }
            }

            this.GameServer.OnUserEndMatch(User, history.BetList, UserWinList)
        }

        totalSysLose += totalWinNoTax;
        totalSysWin += totalBet;
        totalSysTax += (totalWinNoTax - totalWin);
        User.OnUserWin(this.MatchID, UserWinList, this.GameServer.BetLimitConfig.Tax); // record end match
    }
    return {
        Win: totalSysWin,
        Lose: totalSysLose,
        Tax: totalSysTax
    }
};

DeskCore.prototype.UpdateMoneyForUser = function (User) {
    this.GameServer.SendSocketBinary(User.Socket, new Packet.UpdateUserGoldResponse(User.Wallet));
};

DeskCore.prototype.GetBetRatioByID = function (BetID) {
    for (var prop in this.BetRatioConfig) {
        if (this.BetRatioConfig[prop].ID == BetID) {
            return this.BetRatioConfig[prop].Ratio;
        }
    }

    return 0;
};

DeskCore.prototype.HandleUserWin = function (User, UserWinList, TotalWin) {
    try {
        if (User.UserState == this.GameServer.UserStateDefine.JoinRoomCompleted) {//User đang ko ở trạng thái khác
            User.Wallet += TotalWin;
            this.GameServer.SendSocketBinary(User.Socket, new Packet.UserResultResponse(UserWinList));
            this.UpdateMoneyForUser(User);
        } else {
            if (User.UserState == this.GameServer.UserStateDefine.LogOut) {
                this.GameServer.MoneyRefundWinGoldForOfflineUser(User, TotalWin);
            } else {
                this.GameServer.Logger.Game().error('DeskCore.prototype.HandleUserWin - Trạng thái refund bất thường', User.UserState, "TotalWin Gold", TotalWin);
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.HandleUserWin ', e.stack);
    }
}

DeskCore.prototype.GetTax = function () {
    var tax = (100 - this.GameServer.BetLimitConfig.Tax) / 100;

    if (tax > 1) {
        tax = 1;
    } else {
        if (tax < 0) {
            tax = 0;
        }
    }

    return tax;
};

DeskCore.prototype.GetResultWithSuitByString = function () {
    var Result = "";

    //Banker
    Result += "B:";
    for (var i = 0; i < this.ResultWithSuit.BankerCards.length; i++) {
        var Card = this.ResultWithSuit.BankerCards[i];
        var Text = "" + Card.Score + "." + Card.Suit + ",";

        if (i == this.ResultWithSuit.BankerCards.length - 1) {
            Text = Text.substring(0, Text.length - 1);
        }

        Result += Text;
    }

    //Player
    Result += "_P:";
    for (var i = 0; i < this.ResultWithSuit.PlayerCards.length; i++) {
        var Card = this.ResultWithSuit.PlayerCards[i];
        var Text = "" + Card.Score + "." + Card.Suit + ",";

        if (i == this.ResultWithSuit.PlayerCards.length - 1) {
            Text = Text.substring(0, Text.length - 1);
        }

        Result += Text;
    }

    return Result;
};

DeskCore.prototype.CheckPair = function (Cards) {
    if (Cards[0] == Cards[1]) {
        return 1;
    }

    //for(var i = 0; i < Cards.length; i++){
    //    for(var j = i + 1; j < Cards.length; j++){
    //        if(Cards[i] == Cards[j]){
    //            return 1;
    //        }
    //    }
    //}

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

DeskCore.prototype.RecordUserBetHistory = function (UserID, HistoryStr) {
    try {
        this.GameServer.RedisAdapter.zAdd(this.GameServer.Config.RedisConfig.Define.BaccaratBetUserHistory + UserID, +new Date(), HistoryStr);
        this.GameServer.RedisAdapter.zCount(this.GameServer.Config.RedisConfig.Define.BaccaratBetUserHistory + UserID, function (e, d) {
            if (!e) {
                if (d > this.MaxBetHistory) {
                    var rem = d - this.MaxBetHistory;
                    this.GameServer.RedisAdapter.zRemByRank(this.GameServer.Config.RedisConfig.Define.BaccaratBetUserHistory + UserID, 0, rem);
                }
            }
        }.bind(this));
    } catch (e) {

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
        this.GameServer.Logger.Game().error('DeskCore.prototype.InitHistory Get DataErr', e);
    }
};

DeskCore.prototype.GenCardPool = function () {
    try {
        this.CardPool = [];
        for (var i = 0; i < this.NumberOfCardPack; i++) {
            for (var j = 1; j < 14; j++) {
                for (var k = 1; k < 5; k++) {
                    this.CardPool.push({
                        Score: j,
                        Suit: k
                    })
                }
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.GenCardPack Get DataErr', e);
    }
};

DeskCore.prototype.CheckCardPool = function () {
    try {
        var CardPool = this.CardPool.slice();
        //BankerCards
        for (var i = 0; i < this.ResultWithSuit.BankerCards.length; i++) {
            var CardIndex = -1;

            for (var j = 0; j < CardPool.length; j++) {
                if (CardPool[j].Score == this.ResultWithSuit.BankerCards[i].Score
                    && CardPool[j].Suit == this.ResultWithSuit.BankerCards[i].Suit) {
                    CardIndex = j;
                    break;
                }
            }

            if (CardIndex > -1) {
                CardPool.splice(CardIndex, 1);
            } else {
                return false;
            }
        }

        //PlayerCards
        for (var i = 0; i < this.ResultWithSuit.PlayerCards.length; i++) {
            var CardIndex = -1;

            for (var j = 0; j < CardPool.length; j++) {
                if (CardPool[j].Score == this.ResultWithSuit.PlayerCards[i].Score
                    && CardPool[j].Suit == this.ResultWithSuit.PlayerCards[i].Suit) {
                    CardIndex = j;
                    break;
                }
            }

            if (CardIndex > -1) {
                CardPool.splice(CardIndex, 1);
            } else {
                return false;
            }
        }

        return true;
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.DrawCardFromCardPool Err', e);
    }
};

DeskCore.prototype.PopSpecificCard = function (Card) {
    try {
        var CardIndex = this.CardPool.indexOf(Card);

        for (var i = 0; i < this.CardPool.length; i++) {
            if (Card.Score == this.CardPool[i].Score
                && Card.Suit == this.CardPool[i].Suit) {
                CardIndex = i;
                break;
            }
        }

        if (CardIndex > -1) {
            this.CardPool.splice(CardIndex, 1);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.PopSpecificCard Err', e);
    }
};

DeskCore.prototype.DrawCardForMatch = function () {
    try {
        //Banker
        for (var i = 0; i < this.ResultWithSuit.BankerCards.length; i++) {
            this.PopSpecificCard(this.ResultWithSuit.BankerCards[i]);
        }

        //Player
        for (var i = 0; i < this.ResultWithSuit.PlayerCards.length; i++) {
            this.PopSpecificCard(this.ResultWithSuit.PlayerCards[i]);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.DrawCardForMatch Err', e);
    }
};

DeskCore.prototype.CheckAndDrawCard = function () {
    try {
        //Check xem co bai ko
        if (this.CheckCardPool()) {
        } else {
            //ko du la, gen bai moi
            this.GenCardPool();
        }

        //tru bot la bai
        this.DrawCardForMatch();
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.CheckAndDrawCard Err', e);
    }
};

DeskCore.prototype.CalcTimeForNextMatch = function () {
    var AdditionalBankerCard = 0;
    var AdditionalPlayerCard = 0;
    var TimePerCard = 2;

    if (this.ResultCardsBanker.length > 2) {
        AdditionalBankerCard = 1;
    }

    if (this.ResultCardsPlayer.length > 2) {
        AdditionalPlayerCard = 1;
    }

    this.MatchNextRoundTime = 18 + (AdditionalBankerCard + AdditionalPlayerCard) * TimePerCard;
};

DeskCore.prototype.OnUserSpin = function (Socket) {
    try {
        var GoldBet = this.GameServer.GetGoldBet() * 2;
        var BeforeMoney = Socket.UserModel.Wallet;
        //kiểm tra tiền

        //trừ tiền
        var SpinKind = Socket.UserModel.OnUserSpin(GoldBet);

        //1: Daily
        //2: Free
        //3: Normal
        //0: not valid

        if (SpinKind == 0) {
            this.GameServer.ShowMsg(Socket, 'Action_NotEnoughGold');
            this.GameServer.Logger.Game().error('DeskCore.prototype.OnUserSpin Not Enough Money', Socket.UserModel.UserID);
            return;
        }

        var RealRewardConfig = this.CalculateRealRewardConfig();

        //lấy MatchID
        var MatchID = this.GameServer.GenMatchID();

        //random trên tỷ lệ đó
        var Result = this.SpinReward(RealRewardConfig, SpinKind);

        var BigWheelID = Result.BigWheel.ID;
        var SmallWheelID = Result.SmallWheel.ID;

        var TotalReward = (Result.BigWheel.RewardRatio + Result.SmallWheel.RewardRatio) * this.GameServer.GetGoldBet() * this.GetTax();
        var FreeSpin = Result.SmallWheel.FreeSpin;

        //cộng tiền cho user
        //var BeforeMoney = Socket.UserModel.Wallet;
        Socket.UserModel.UpdateMoney(TotalReward);
        var AfterMoney = Socket.UserModel.Wallet;

        //cộng lượt free cho user
        var BeforeFreeSpin = Socket.UserModel.GetTotalFreeSpin() || 0;
        var AfterFreeSpin = BeforeFreeSpin + FreeSpin;
        Socket.UserModel.UpdateFreeSpin(FreeSpin);

        var UserSpinObj = {
            MatchID: MatchID,
            BigWheelID: BigWheelID,
            SmallWheelID: SmallWheelID,
            TotalReward: TotalReward,
            FreeSpin: FreeSpin,
            TotalGold: AfterMoney,
            TotalFreeSpin: AfterFreeSpin
        };

        this.GameServer.Logger.Game().debug('OnUserSpin UserID:', Socket.UserModel.UserID, MatchID, BigWheelID, SmallWheelID, TotalReward, FreeSpin, SpinKind, this.GameServer.StockDetail.Stock);

        var msg = new Packet.UserSpinResponse(UserSpinObj);
        this.GameServer.SendSocketBinary(Socket, msg);

        //record history
        /*
         history = {
         MatchID,
         GoldReward,
         FreeSpin,
         Time
         }
         */
        var history = {
            MatchID: MatchID,
            TotalReward: TotalReward,
            FreeSpin: FreeSpin,
            Time: +new Date()
        };

        this.RecordUserSpinHistory(Socket.UserModel.UserID, history);

        //record big win
        if (TotalReward >= this.BigWinRequired) {
            history.GameName = Socket.UserModel.GameName;
            this.RecordBigWin(history);
        }

        //record match info
        //MatchID, Result, Tax, UserID, BeforeMoney, BetGold, TotalReward, AfterMoney, BeforeFreeSpin, AfterFreeSpin, DeskID
        var ResultStr = BigWheelID + ',' + SmallWheelID;
        this.GameServer.RecordMatchInfo(MatchID, ResultStr, this.GameServer.BetLimitConfig.Tax, Socket.UserModel.UserID, BeforeMoney, GoldBet, TotalReward, AfterMoney, BeforeFreeSpin, AfterFreeSpin, this.DeskID, SpinKind, Socket.UserModel.UserChannelID);
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.OnUserSpin Err', e);
    }
};

DeskCore.prototype.GetRoomConfig = function (Socket) {
    try {
        if (Socket.UserModel.UserState == this.GameServer.UserStateDefine.JoinRoomCompleted) {
            var GoldBet = this.GameServer.GetGoldBet() * 2;
            var FreeSpin = Socket.UserModel.GetTotalFreeSpin;
            var BigWheel = [];
            var SmallWheel = [];

            for (var i = 0; i < this.RewardConfig.BigWheel.length; i++) {
                BigWheel.push({
                    ID: this.RewardConfig.BigWheel[i].ID,
                    Reward: this.RewardConfig.BigWheel[i].RewardRatio * GoldBet / 2
                })
            }

            for (var i = 0; i < this.RewardConfig.SmallWheel.length; i++) {
                SmallWheel.push({
                    ID: this.RewardConfig.SmallWheel[i].ID,
                    Reward: this.RewardConfig.SmallWheel[i].RewardRatio * GoldBet / 2,
                    FreeSpin: this.RewardConfig.SmallWheel[i].FreeSpin
                })
            }

            var RoomConfigObj = {
                GoldBet: GoldBet,
                FreeSpin: FreeSpin,
                BigWheel: BigWheel,
                SmallWheel: SmallWheel
            };

            var msg = new Packet.GetRoomConfigResponse(RoomConfigObj);
            this.GameServer.SendSocketBinary(Socket, msg);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.GetRoomConfig Err', e.stack);
    }
};

DeskCore.prototype.RecordUserSpinHistory = function (UserID, history) {
    try {
        var history_str = JSON.stringify(history);

        this.GameServer.RedisAdapter.zAdd(this.GameServer.Config.RedisConfig.Define.VQMMUserHistory + UserID, +new Date(), history_str);
        this.GameServer.RedisAdapter.zCount(this.GameServer.Config.RedisConfig.Define.VQMMUserHistory + UserID, function (e, d) {
            if (!e) {
                if (d > this.MaxBetHistory) {
                    var rem = d - this.MaxBetHistory;
                    this.GameServer.RedisAdapter.zRemByRank(this.GameServer.Config.RedisConfig.Define.VQMMUserHistory + UserID, 0, rem);
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

        this.GameServer.RedisAdapter.zAdd(this.GameServer.Config.RedisConfig.Define.VQMMBigWin, +new Date(), history_str);
        this.GameServer.RedisAdapter.zCount(this.GameServer.Config.RedisConfig.Define.VQMMBigWin, function (e, d) {
            if (!e) {
                if (d > this.MaxBetHistory) {
                    var rem = d - this.MaxBetHistory;
                    this.GameServer.RedisAdapter.zRemByRank(this.GameServer.Config.RedisConfig.Define.VQMMBigWin, 0, rem);
                }
            }
        }.bind(this));
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.RecordBigWin Err', e.stack);
    }
};

DeskCore.prototype.UserGetUserHistory = function (User) {
    try {
        this.GameServer.RedisAdapter.zRange(this.GameServer.Config.RedisConfig.Define.VQMMUserHistory + User.UserID, 0, -1, function (err, d) {
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
        this.GameServer.RedisAdapter.zRange(this.GameServer.Config.RedisConfig.Define.VQMMBigWin, 0, -1, function (err, d) {
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

DeskCore.prototype.CalculateRealRewardConfig = function () {
    try {
        var RealRewardConfig = this.GameServer.RewardConfig;
        //     var ServerStock = +this.GameServer.StockDetail.Stock || 0;
        //     var RealRewardConfig = {};
        //     RealRewardConfig.BigWheel = this.RewardConfig.BigWheel.slice(); //copy
        //     RealRewardConfig.SmallWheel = this.RewardConfig.SmallWheel.slice(); //copy
        //     RealRewardConfig.DailyWheel = this.RewardConfig.DailyWheel.slice();
        //
        //     var SumRatio = 0;
        //     var MissedIndex = -1;
        //
        //     //Vòng lớn
        //     for (var i = 0; i < RealRewardConfig.BigWheel.length; i++) {
        //         var RewardConfig = RealRewardConfig.BigWheel[i];
        //
        //         if (RewardConfig.RewardRatio == 0) {
        //             //Missed
        //             MissedIndex = i;
        //         }
        //         else {
        //             RewardConfig.Ratio = RewardConfig.Ratio * ServerStock;
        //             //SumRatio += RewardConfig.Ratio;
        //         }
        //     }
        //     //tỷ lệ missed thay đổi
        //     if (MissedIndex > -1) {
        //         //RealRewardConfig.BigWheel[MissedIndex].Ratio = 1 - SumRatio;
        //         //RealRewardConfig.BigWheel.splice(MissedIndex, 1);
        //     }
        //     else {
        //         this.GameServer.Logger.Game().error('DeskCore.prototype.CalculateRealRewardConfig BigWheel MissedIndex', MissedIndex);
        //     }
        //
        //     SumRatio = 0;
        //     MissedIndex = -1;
        //     //Vòng nhỏ
        //     for (var i = 0; i < RealRewardConfig.SmallWheel.length; i++) {
        //         var RewardConfig = RealRewardConfig.SmallWheel[i];
        //
        //         if (RewardConfig.RewardRatio == 0
        //             && RewardConfig.FreeSpin == 0) {
        //             //Missed
        //             MissedIndex = i;
        //         }
        //         else {
        //             RewardConfig.Ratio = RewardConfig.Ratio * ServerStock;
        //             //SumRatio += RewardConfig.Ratio;
        //         }
        //     }
        //     //tỷ lệ missed thay đổi
        //     if (MissedIndex > -1) {
        //         //RealRewardConfig.SmallWheel[MissedIndex].Ratio = 1 - SumRatio;
        //         //RealRewardConfig.SmallWheel.splice(MissedIndex, 1);
        //     }
        //     else {
        //         this.GameServer.Logger.Game().error('DeskCore.prototype.CalculateRealRewardConfig SmallWheel MissedIndex', MissedIndex);
        //     }

        return RealRewardConfig;
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.CalculateRealRatio Err', e.stack);
    }
};

DeskCore.prototype.SpinReward = function (RealRewardConfig, SpinKind) {
    this.GameServer.Logger.Game().debug("SpinReward", SpinKind);
    var ServerStock = +this.GameServer.StockDetail.Stock || 0;
    var Result = {
        BigWheel: {
            ID: 0,
            RewardRatio: 0
        },
        SmallWheel: {
            ID: 0,
            RewardRatio: 0,
            FreeSpin: 0
        }
    };

    try {
        if (SpinKind != 1) {
            var Random = 0;

            //BigWheel
            RealRewardConfig.BigWheel = RealRewardConfig.BigWheel.reverse();
            Random = Math.random();//
            this.GameServer.Logger.Game().debug("SpinReward BigWheel", Random, RealRewardConfig.BigWheel);
            for (var i = 0; i < RealRewardConfig.BigWheel.length; i++) {
                Random -= RealRewardConfig.BigWheel[i].Ratio * ServerStock;

                if (Random < 0) {
                    //Bingo
                    Result.BigWheel.ID = RealRewardConfig.BigWheel[i].ID;
                    Result.BigWheel.RewardRatio = RealRewardConfig.BigWheel[i].RewardRatio;
                    break;
                }
            }
            this.GameServer.Logger.Game().debug("Result BigWheel", Random, Result.BigWheel.ID, Result.BigWheel.RewardRatio);

            //SmallWheel
            RealRewardConfig.SmallWheel = RealRewardConfig.SmallWheel.reverse();
            Random = Math.random();
            this.GameServer.Logger.Game().debug("SpinReward SmallWheel", Random, RealRewardConfig.SmallWheel);
            for (var i = 0; i < RealRewardConfig.SmallWheel.length; i++) {
                Random -= RealRewardConfig.SmallWheel[i].Ratio * ServerStock;

                if (Random < 0) {
                    //Bingo
                    Result.SmallWheel.ID = RealRewardConfig.SmallWheel[i].ID;
                    Result.SmallWheel.RewardRatio = RealRewardConfig.SmallWheel[i].RewardRatio;
                    Result.SmallWheel.FreeSpin = RealRewardConfig.SmallWheel[i].FreeSpin;
                    break;
                }
            }
            this.GameServer.Logger.Game().debug("Result SmallWheel", Random, Result.SmallWheel.ID, Result.SmallWheel.RewardRatio, Result.SmallWheel.FreeSpin);
        } else {
            //daily spin
            for (var i = 0; i < RealRewardConfig.SmallWheel.length; i++) {
                if (RealRewardConfig.SmallWheel[i].RewardRatio == 0
                    && RealRewardConfig.SmallWheel[i].FreeSpin == 0) {
                    //Missed
                    Result.SmallWheel.ID = RealRewardConfig.SmallWheel[i].ID;
                    Result.SmallWheel.RewardRatio = 0;
                    Result.SmallWheel.FreeSpin = 0;
                }
            }

            //DailyWheel
            var RandomIndex = Math.floor(Math.random() * RealRewardConfig.DailyWheel.length);
            if (RandomIndex > -1) {
                Result.BigWheel.ID = RealRewardConfig.DailyWheel[RandomIndex].ID;
                Result.BigWheel.RewardRatio = RealRewardConfig.DailyWheel[RandomIndex].RewardRatio;
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.SpinReward Err', e.stack);
    }

    return Result;
};

DeskCore.prototype.GetSpinInfo = function (UserID, callback) {
    var spinInfo = {
        DailySpinTicket: 0,
        FreeSpinTicket: 0,
        DailySpinDay: 0,
        IsChange: true
    };
    try {

        this.GameServer.RedisAdapter.hget(this.GameServer.Config.RedisConfig.Define.VQMMSpinInfo, UserID, function (err, d) {
            if (!err) {
                try {
                    d = JSON.parse(d);
                    if (Utility.CheckVariable(d, "DailySpinTicket", "FreeSpinTicket", "DailySpinDay")) {
                        d.IsChange = false;
                        spinInfo = d;
                    }
                } catch (ex) {
                    this.GameServer.Logger.Game().error('DeskCore.prototype.GetFreeSpin Build DataErr', ex.stack);
                }
            } else {
                this.GameServer.Logger.Game().error('DeskCore.prototype.GetFreeSpin Get DataErr', err);
            }
            callback(spinInfo);
        }.bind(this));
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.GetFreeSpin Err', e.stack);
        callback(spinInfo);
    }
};

DeskCore.prototype.GetSpinInfoBonus = function (UserID, callback) { //Lấy thêm thông tin lượt quay từ các nguồn khác
    try {
        var spinInfo = {
            DailySpinTicket: 0,
            FreeSpinTicket: 0,
            DailySpinDay: 0,
            IsChange: true
        };
        this.GameServer.RedisAdapter.hget(this.GameServer.Config.RedisConfig.Define.VQMMSpinInfo, UserID, function (err, d) {
            if (!err) {
                try {
                    d = JSON.parse(d);
                    if (Utility.CheckVariable(d, "DailySpinTicket", "FreeSpinTicket", "DailySpinDay")) {
                        d.IsChange = false;
                        spinInfo = d;
                    }
                } catch (ex) {
                    this.GameServer.Logger.Game().error('DeskCore.prototype.GetFreeSpin Build DataErr', ex.stack);
                }
            } else {
                this.GameServer.Logger.Game().error('DeskCore.prototype.GetFreeSpin Get DataErr', err);
            }
            callback(spinInfo);
        }.bind(this));
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.GetFreeSpin Err', e.stack);
        callback(0);
    }
};

DeskCore.prototype.LoadUserInfo = function (User) {
    try {
        //Load Daily
        this.GetSpinInfo(User.UserID, function (spinInfo) {
            User.LoadInfo(spinInfo);
            this.GetSpinInfoBonus(User); // Load thêm lượt quay
            this.GameServer.EventManager.EvtOnUserEnterAll(User);
            this.UpdateUserInfo(User);
        }.bind(this));
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.LoadUserInfo Err', e.stack);
    }
};

DeskCore.prototype.UpdateUserLeftDesk = function (Socket) {
    Socket.UserModel.OnUserLeftDesk();
    this.GameServer.SaveUserInfo(Socket.UserModel);
    this.GameServer.UserInfoUpdateAll(Socket);

    for (var i = 0; i < this.ListUser.length; i++) {
        if (this.ListUser[i].UserID == Socket.UserModel.UserID) {
            this.ListUser.splice(i, 1);
            return;
        }
    }
};

DeskCore.prototype.GetSpinInfoBonus = function (User) {
    try {
        var hashDaily = User.UserID + ":" + this.GameServer.Config.RedisConfig.Define.VQMMSpinBonusDaily;
        var hashFree = User.UserID + ":" + this.GameServer.Config.RedisConfig.Define.VQMMSpinBonusFree;

        this.GameServer.RedisAdapter.hget(this.GameServer.Config.RedisConfig.Define.VQMMSpinInfo, hashDaily, function (err, d) {
            if (!err) {
                if (+d > 0) {
                    User.UpdateSpinInfo(+d, 0);
                    this.GameServer.RedisAdapter.hIncrby(this.GameServer.Config.RedisConfig.Define.VQMMSpinInfo, hashDaily, -d);
                }
            }
        }.bind(this));
        this.GameServer.RedisAdapter.hget(this.GameServer.Config.RedisConfig.Define.VQMMSpinInfo, hashFree, function (err, d) {
            if (!err) {
                if (+d > 0) {
                    User.UpdateSpinInfo(0, +d);
                    this.GameServer.RedisAdapter.hIncrby(this.GameServer.Config.RedisConfig.Define.VQMMSpinInfo, hashFree, -d);
                }
            }
        }.bind(this));

    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.GetSpinInfoBonus Err', e.stack);
    }
};

DeskCore.prototype.UpdateUserInfo = function (User) {
    try {
        var msg = new Packet.UpdateUserInfoResponse(User.SpinInfo.DailySpinTicket + User.SpinInfo.FreeSpinTicket, User.Wallet);
        this.GameServer.SendSocketBinary(User.Socket, msg);
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.UpdateUserInfo Err', e.stack);
    }
};