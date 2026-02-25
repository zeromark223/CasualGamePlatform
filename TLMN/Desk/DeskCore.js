/*{"build":1}*/
var rootFile = __stack[0].getFileName();
var path = require('path');
var cDir = path.dirname(rootFile);
var Utility = require(path.resolve(cDir, '../../SharedModule/Utility'));
// var Packet = require(path.resolve(cDir, '../Packet'));
// var Engine = require(path.resolve(cDir, './Engine'));
var Config = require('../../Config/TLMN');
var Packet = require('../Packet');
var Encrytion = require(path.resolve(cDir, '../../SharedModule/encrytion'));
var CardUtility = require('../Engine/CardUtility');

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
    this.MaxBetHistory = 50;

    this.BetStateChanged = false;
    this.MatchRoundTime = 35;
    this.StartRoundTime = +new Date();
    this.ResultWithSuit = [];
    this.MatchHistory = [];

    this.MatchNextRoundTime = 18;

    this.MatchHistoryLimit = 100;

    this.NumberOfCardPack = 1;
    this.CardDeck = [];
    this.MatchID = 0;

    //TLMN
    this.PositionArray = [0, 1, 2, 3];
    this.CardNumberPerPlayer = 13;

    this.MatchMember = []; //những người chơi

    //Turn
    this.PrevWinner = -1;
    this.TurnOwner = -1; //người đầu vòng, đc đánh
    this.CurrentTurn = 0; //lượt hiện tại
    this.TurnMember = []; //những người trong vòng
    this.TableCards = {
        Set: 0,
        Power: 0,
        Len: 0,
        EffectID: 0,
        Detail: []
    };
    this.FirstTurn = -1;

    this.TurnTimer = null;
    this.TurnDelay = 30000;
    this.MatchDelay = 15;
    this.FirstGive = true; //phải đáh, không đc bỏ qua

    this.Winners = []; //theo thứ tự: nhất, nhì, ba, tư
    this.LimitWinner = 1;

    this.GoldBet = Config.BetLimitConfig.GoldBet;
    this.PenaltyConfig = [];
    this.Guilty = -1;
    this.GameState = 0; //0: ko chơi, 1: đang chơi, 2: đang đếm ngược
    this.TimerStamp = 0;
    this.PrevTableCards = [];

    this.DisconnectedUser = [];
    this.PlayingUser = [];
    this.NonStopTimers = [
        {
            Tick: 0,
            Interval: 1000,
            Wake: this.Timer1Second.bind(this)
        }
    ];

    this.StartMatchTimer = {
        Status: false,
        Tick: 0,
        Interval: this.MatchDelay * 1000,
        Wake: this.OnStartMatch.bind(this)
    };

    this.MainTime = +new Date;
    this.Run = false;
    this.Heir = 0;
    this.RoundPenalty = {
        Victim: 0,
        Winner: 0,
        Multiple: 0,
        PreMultiple: 0,
        Detail: {
            CONG: 0,
            HEO_DEN: 0,
            HEO_DO: 0,
            BA_DOI_THONG: 0,
            TU_QUY: 0,
            BON_DOI_THONG: 0
        }
    };
    this.MoneyRequiredPlay = Config.BetLimitConfig.MinMultiplePlay * this.GoldBet;
    this.IsAdditionalTurn = 0;
}

module.exports = DeskCore;
DeskCore.prototype.Init = function (GameServer, DeskID) {
    this.DeskID = DeskID;
    this.GameServer = GameServer;
    this.BetRatioConfig = GameServer.Config.BetRatioConfig;
    this.PenaltyConfig = GameServer.Config.PenaltyConfig;

    this.Run = true;
    setInterval(this.TimerLoop.bind(this), 1000);
};

DeskCore.prototype.GetScore = function (List) {
    var score = 0;
    for (var i = 0; i < List.length; i++) {
        if (List[i] < 10) score += List[i];
    }
    return score % 10;
};

DeskCore.prototype.RandomCardsNum = function () {
    return Math.floor(Math.random() * 13) + 1;
};

DeskCore.prototype.GetRoomConfig = function (Socket) {
    try {
        var MinBet = Config.BetLimitConfig.MinBet;
        var MaxBet = Config.BetLimitConfig.MaxBet;

        var GameConfig = {
            MinBet: MinBet,
            MaxBet: MaxBet,
            RoomID: this.DeskID
        };

        var msg = new Packet.GetRoomConfigResponse(GameConfig);
        this.GameServer.SendSocketBinary(Socket, msg);
    }
    catch (e) {
        this.GameServer.Logger.Game().error('GameServer.prototype.GetRoomConfig - try err: ' + e.stack);
    }
};

DeskCore.prototype.IsAvailable = function () {
    return 1;
};

DeskCore.prototype.TransferBetForUser = function (User, DisconnectedUser) {
    if (DisconnectedUser.ListBet.length > 0) {

        var ListBet = DisconnectedUser.ListBet;
        DisconnectedUser.ListBet = [];
        User.ListBet = ListBet;
        this.ReplaceUserDisconnectByUserOnline(User, DisconnectedUser);
        this.GameServer.SendSocketBinary(User.Socket, new Packet.UpdateUserBetListResponse(User.ListBet));

    } else {
        this.GameServer.Logger.Game().error('DeskCore.prototype.TransferBetForUser Ko transfer duoc ');
    }
};

DeskCore.prototype.ReplaceUserDisconnectByUserOnline = function (User, DisconnectedUser) {
    for (var i = 0; i < this.ListUserBet.length; i++) {
        if (this.ListUserBet[i].UserID == DisconnectedUser.UserID) {
            if (this.ListUserBet[i].UserTrackingID != DisconnectedUser.UserTrackingID) {
                this.GameServer.Logger.Game().error('DeskCore.prototype.ReplaceUserDisconnectByUserOnline transfer bất thường', this.ListUserBet[i].UserTrackingID, DisconnectedUser.UserID);
            }
            this.ListUserBet[i] = User;
        }
    }

};

DeskCore.prototype.EncryptResultText = function (text) {
    return Encrytion.sha256(text);
};

DeskCore.prototype.GenResultText = function (banker, player) {
    var rawText = Encrytion.sha256(Utility.GetUUID() + this.SecretKey) + '_banker:' + banker + '_player:' + player;
    return rawText;
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

DeskCore.prototype.UpdateUserLeftDesk = function (Socket) {
    for (var i = 0; i < this.ListUser.length; i++) {
        if (this.ListUser[i].UserID == Socket.UserModel.UserID) {
            if (this.FindUserPlaying(Socket.UserModel.UserID)
                && !this.GameServer.MaintainFlag) {
                this.GameServer.Logger.Game().debug("User", Socket.UserModel.GameName, "waiting for reconnect");

                this.DisconnectedUser.push(Socket.UserModel);
                //this.GameServer.DestroySocket(Socket);
            }
            else {
                this.GameServer.Logger.Game().debug("call UserInfoUpdateAll", Socket.UserModel.UserID);
                this.KickUser(Socket);
                this.GameServer.UserInfoUpdateAll(Socket);
                if (Socket.UserModel.UserID == this.PrevWinner) {
                    this.PrevWinner = -1;
                }
                //this.ListUser[i].OnUserLeftDesk();
                //this.GameServer.UserInfoUpdateAll(Socket);
                //this.ListUser.splice(i, 1);
            }

            return;
        }
    }
};

DeskCore.prototype.OnShowResult = function (WinList) {
    try {
        var msg = new Packet.EndMatchResultResponse(this.ResultWithSuit.PlayerCards, this.ResultWithSuit.BankerCards, this.ResultText, this.MatchNextRoundTime, WinList);
        this.DeskSendAllUser(msg);
        this.GenMatchHistory();
    }
    catch (e) {
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

DeskCore.prototype.UserBet = function (Socket, BetList) {

};

DeskCore.prototype.UserBetError = function (Socket, msg) {
    try {
        this.GameServer.ShowPopup(Socket, msg);
        this.GameServer.SendSocketBinary(Socket, new Packet.UserBetResponse(1));
        this.GameServer.Logger.Game().debug('UserBetError', Socket.UserModel.UserID, msg);
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.UserBetError ', e.stack);
    }
}

DeskCore.prototype.DeskTimer2Second = function () {
    try {
        this.BroadcastBetInfo();
    }
    catch (e) {
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

};
DeskCore.prototype.CalcWinForUser = function () {

};
//DeskCore.prototype.UpdateMoneyForUser = function (User) {
//    this.GameServer.SendSocketBinary(User.Socket, new Packet.UpdateUserGoldResponse(User.Wallet));
//};
DeskCore.prototype.GetBetRatioByID = function (BetID) {

};
//DeskCore.prototype.HandleUserWin = function (User, UserWinList, TotalWin) {
//    try {
//        if (User.UserState == this.GameServer.UserStateDefine.JoinRoomCompleted) {//User đang ko ở trạng thái khác
//            User.Wallet += TotalWin;
//            this.GameServer.SendSocketBinary(User.Socket, new Packet.UserResultResponse(UserWinList));
//            this.UpdateMoneyForUser(User);
//        }
//        else {
//            if (User.UserState == this.GameServer.UserStateDefine.LogOut) {
//                this.GameServer.MoneyRefundWinGoldForOfflineUser(User, TotalWin);
//            } else {
//                this.GameServer.Logger.Game().error('DeskCore.prototype.HandleUserWin - Trạng thái refund bất thường', User.UserState, "TotalWin Gold", TotalWin);
//            }
//        }
//    }
//    catch (e) {
//        this.GameServer.Logger.Game().error('DeskCore.prototype.HandleUserWin ', e.stack);
//    }
//}

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

DeskCore.prototype.GenCardDeck = function () {
    try {
        this.CardDeck = [];
        for (var i = 0; i < this.NumberOfCardPack; i++) {
            for (var j = 3; j < 16; j++) {
                for (var k = 1; k < 5; k++) {
                    this.CardDeck.push({
                        Score: j,
                        Suit: k
                    })
                }
            }
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.GenCardPack Get DataErr', e);
    }
};

DeskCore.prototype.FindPositionForUser = function () {
    var Position = -1;
    try {
        var UserLen = this.ListUser.length;
        var PosLen = this.PositionArray.length;

        if (UserLen < PosLen) {
            var isEmpty = true;

            for (var i = 0; i < PosLen; i++) {
                isEmpty = true;
                for (var j = 0; j < UserLen; j++) {
                    if (this.ListUser[j].Position == this.PositionArray[i]) {
                        isEmpty = false;
                        break;
                    }
                }

                if (isEmpty == true) {
                    Position = this.PositionArray[i];
                    break;
                }
            }
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.FindDeskStationForUser Error', e);
    }
    return Position;
};

DeskCore.prototype.FindUserByUserID = function (UserID) {
    var User = 0;
    try {
        for (var i = 0; i < this.ListUser.length; i++) {
            var _User = this.ListUser[i];

            if (UserID == _User.UserID) {
                User = _User;
                break;
            }
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.FindUserByUserID Error', e);
    }

    return User;
};

DeskCore.prototype.AddUser = function (User) {

    //Thông báo ng mới vào
    var NewUserObject = {
        UserID: User.UserID,
        Position: User.Position,
        Gold: User.Wallet,
        DisplayName: User.GameName
    };

    var msg = new Packet.NewUserComeResponse(NewUserObject);
    this.DeskSendAllUser(msg);

    var Position = this.FindPositionForUser();
    if (Position > -1) {
        User.MyDesk = this;
        this.ListUser.push(User);
        this.OnUserEnterDesk(User);
    }
};

DeskCore.prototype.OnUserEnterDesk = function (User) {

    this.GameServer.Logger.Game().debug("User", User.GameName, "get inside with", User.Wallet, "Gold");
    User.OnUserEnterDesk(this);

    var DeskInfo = this.GetDeskInfo();

    var msg = new Packet.JoinRoomResponse(DeskInfo.UserArray, this.DeskID, this.GoldBet);
    this.GameServer.SendSocketBinary(User.Socket, msg);
    User.DeskID = this.DeskID;

    if (this.ListUser.length > 1
        && this.GameState != 1) {
        this.TimerStamp = +new Date();
        this.StartMatchTimer.Status = true;
        this.GameState = 2;
        this.UpdateTimeCountDown(this.MatchDelay);
    }

};

DeskCore.prototype.GetDeskInfo = function () {
    var Result = {
        UserArray: []
    };
    try {
        for (var i = 0; i < this.ListUser.length; i++) {
            var UserInDesk = this.ListUser[i];
            var UserObject = {
                UserID: UserInDesk.UserID,
                Position: UserInDesk.Position,
                Gold: UserInDesk.Wallet,
                DisplayName: UserInDesk.GameName,
                NumberOfCard: UserInDesk.Cards.length
            };
            Result.UserArray.push(UserObject);
        }

    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.GetDeskInfo Error', e);
    }

    return Result;
};

DeskCore.prototype.Shuffle = function () {
    var CardDeckLen = this.CardDeck.length;

    for (var i = 0; i < CardDeckLen; i++) {
        var j = Math.floor(Math.random() * (CardDeckLen - i));
        var temp = this.CardDeck[i];
        this.CardDeck[i] = this.CardDeck[j];
        this.CardDeck[j] = temp;
    }
};
DeskCore.prototype.OnStartMatch = function () {
    try {
        if (this.GameServer.MaintainFlag) {
            return;
        }

        if (this.ListUser.length > 1) {
            //khui bài mới
            this.GenCardDeck();

            //xào bài
            this.Shuffle();

            var CardDeckStr = this.CardDeckToStr(this.CardDeck);

            this.GameServer.GenMatchInfo(this.DeskID, this.GameServer.BetLimitConfig.Tax, this.GoldBet, CardDeckStr, function (e, MatchID) {
                if (!e) {
                    this.MatchID = MatchID;
                    this.GameServer.Logger.Game().debug('DeskCore.prototype.GenMatchInfo MatchID : ', MatchID);
                    this.OnStartRoundCompleted();
                } else {
                    //handle error
                }
            }.bind(this));
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.OnStartMatch Error', e);
    }
};

DeskCore.prototype.OnStartRoundCompleted = function () {
    try {
        this.CurrentTurn = 0;
        this.GameState = 1;
        this.StartMatchTimer.Status = false;
        this.StartMatchTimer.Tick = 0;

        //chia bài
        for (var i = 0; i < this.CardNumberPerPlayer; i++) {
            for (var j = 0; j < this.ListUser.length; j++) {
                var Card = this.CardDeck.pop();

                if (typeof Card != 'undefined') {
                    this.ListUser[j].Cards.push(Card);
                }
            }
        }

        this.MatchMember = [];
        this.PlayingUser = [];

        for (var j = 0; j < this.ListUser.length; j++) {
            var CurrUser = this.ListUser[j];
            if (CurrUser.Cards.length > 0) {
                this.MatchMember.push(CurrUser.UserID);
                this.PlayingUser.push(CurrUser.UserID);
                this.Winners.push(0);
            }
        }

        //CHEAT CARD
        //this.ListUser[0].Cards[0] = {Score: 15, Suit: 1};
        //this.ListUser[0].Cards[1] = {Score: 3, Suit: 2};
        //this.ListUser[0].Cards[2] = {Score: 6, Suit: 3};
        //this.ListUser[0].Cards[3] = {Score: 6, Suit: 4};
        //
        //this.ListUser[0].Cards[4] = {Score: 15, Suit: 4};
        //this.ListUser[0].Cards[5] = {Score: 15, Suit: 3};
        //this.ListUser[0].Cards[6] = {Score: 15, Suit: 2};
        //this.ListUser[0].Cards[7] = {Score: 15, Suit: 1};

        //this.ListUser[1].Cards[0] = {Score: 7, Suit: 1};
        //this.ListUser[1].Cards[1] = {Score: 7, Suit: 2};
        //this.ListUser[1].Cards[2] = {Score: 8, Suit: 1};
        //this.ListUser[1].Cards[3] = {Score: 8, Suit: 2};
        //this.ListUser[1].Cards[4] = {Score: 9, Suit: 1};
        //this.ListUser[1].Cards[5] = {Score: 9, Suit: 2};
        //this.ListUser[1].Cards[6] = {Score: 10, Suit: 1};
        //this.ListUser[1].Cards[7] = {Score: 10, Suit: 2};
        //CHEAT CARD

        var PerfectWin = 0;
        var PerfectWinUser = 0;

        for (var i = 0; i < this.ListUser.length; i++) {
            var StartMatchInfo = {
                MatchID: this.MatchID,
                CardList: this.ListUser[i].Cards,
                MatchMember: this.MatchMember
            };

            var msg = new Packet.DealCardsResponse(StartMatchInfo);
            this.GameServer.SendSocketBinary(this.ListUser[i].Socket, msg);

            var currPerfectWin = this.CheckPerfectWin(this.ListUser[i]);
            //this.GameServer.Logger.Game().debug("this.ListUser[i]", this.ListUser[i].UserID);
            //this.GameServer.Logger.Game().debug("currPerfectWin", currPerfectWin);
            //this.GameServer.Logger.Game().debug("PerfectWin", PerfectWin);
            if (currPerfectWin != 0 &&
                (currPerfectWin < PerfectWin || PerfectWin == 0)) {
                PerfectWin = currPerfectWin;
                PerfectWinUser = this.ListUser[i].UserID;
            }
        }

        //this.GameServer.Logger.Game().debug("PerfectWin", PerfectWin);
        //this.GameServer.Logger.Game().debug("PerfectWinUser", PerfectWinUser);

        if (PerfectWin && PerfectWinUser) {
            this.PerfectWin(PerfectWinUser);
        }
        else {
            setTimeout(function () {
                this.StartNewTurn();
            }.bind(this), 3000);
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.OnStartRoundCompleted Error', e);
    }
};

DeskCore.prototype.GiveCard = function (Socket, Action, Cards) {
    try {
        var UserID = Socket.UserModel.UserID;
        var User = Socket.UserModel;
        this.GameServer.Logger.Game().debug("GiveCard======================");
        this.GameServer.Logger.Game().debug("User", Socket.UserModel.UserID);
        this.GameServer.Logger.Game().debug("Action", Action);
        this.GameServer.Logger.Game().debug(Cards);
        this.GameServer.Logger.Game().debug("tableCards", this.TableCards);
        this.GameServer.Logger.Game().debug("GiveCard======================");

        if (UserID == this.CurrentTurn || this.IsAdditionalTurn) { //đúng lượt
            if (Action == 1) {
                var Result = this.CheckCardSet(Cards);
                if (Result.Set != 0) {

                    if (!this.FirstTurnMustIncludedSmallestCard(User, Cards)) {
                        //this.GameServer.Logger.Game().debug("First Turn Must Include Smallest Card")
                        return
                    }

                    this.FirstTurn = -1;
                    //Check Hand Cards
                    var HandCardChecked = User.CheckHandCards(Cards);
                    var CompareCardSet = this.CompareCardSet(Result, 1);

                    this.GameServer.Logger.Game().debug("CompareCardSet", CompareCardSet);
                    this.GameServer.Logger.Game().debug("HandCardChecked", HandCardChecked);

                    if (CompareCardSet && HandCardChecked) {

                        //Drop card here
                        User.DropCards(Cards);

                        var CardRemain = User.Cards.length;

                        var msg = new Packet.GiveCardResponse(UserID, Action, Result.EffectID, CardRemain, Cards);
                        this.DeskSendAllUser(msg);

                        this.SetRoundPenalty(UserID, Result);
                    }
                    else {
                        this.GameServer.Logger.Game().debug("Invalid Card");
                        //sai bài, không xử lý
                        return;
                    }

                    clearTimeout(this.TurnTimer);

                    this.CheckWinGame(User);
                    if (this.CheckEndGame()) {
                        this.EndGame();
                    }
                    else {
                        if(this.IsAdditionalTurn){
                            if(Action == 1) {
                                this.CurrentTurn = UserID;
                            }
                        }
                        else{
                            this.EndTurn(UserID, Action, Cards);
                        }
                    }
                }
                else {
                    this.GameServer.Logger.Game().debug("Invalid Card Set");
                    return;
                }
            }
            else {
                if (!this.FirstGive) {
                    //Check Guilty
                    if (this.Guilty == -1) {
                        var UserCard = Socket.UserModel.Cards;
                        var CanEat = this.CheckCanEat(UserCard);
                        if (CanEat) {
                            this.Guilty = Socket.UserModel.UserID;
                        }
                    }

                    var CardRemain = User.Cards.length;
                    var msg = new Packet.GiveCardResponse(UserID, Action, 0, CardRemain, []);
                    this.DeskSendAllUser(msg);

                    clearTimeout(this.TurnTimer);
                    this.EndTurn(UserID, Action, Cards);
                    return;
                }
                else {
                    return;
                }
            }

            this.FirstGive = false;
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.GiveCard Error', e);
    }
};

DeskCore.prototype.CheckCardSet = function (Cards) {
    try {
        var Result = {
            Set: 0,
            Power: 0,
            Len: 0,
            EffectID: 0,
            Detail: []
        };

        if (!this.CheckValidCards(Cards)
            || Cards.length == 0
            || typeof Cards == "undefined") {
            return Result;
        }

        //xếp bài từ nhỏ đến lớn
        CardUtility.SortCards(Cards);
        var Power = CardUtility.FindHighestCard(Cards);

        //rác
        if (Cards.length == 1) {
            Result.Set = 1;
            Result.Power = Power;
            Result.Len = 1;
            Result.Detail = Cards;
        }

        //đôi
        if (CardUtility.CheckPair(Cards)) {
            Result.Set = 2;
            Result.Power = Power;
            Result.Len = 2;
            Result.Detail = Cards;
        }

        //sám cô
        if (CardUtility.CheckThreeOfAKind(Cards)) {
            Result.Set = 3;
            Result.Power = Power;
            Result.Len = 3;
            Result.Detail = Cards;
        }

        //sảnh
        if (CardUtility.CheckStraight(Cards)) {
            Result.Set = 4;
            Result.Power = Power;
            Result.Len = Cards.length;
            Result.Detail = Cards;
        }

        //Ba đôi thông
        if (CardUtility.CheckThreePairSequence(Cards)) {
            Result.Set = 5;
            Result.Power = Power;
            Result.Len = Cards.length;
            Result.EffectID = 1;
            Result.Detail = Cards;
        }

        //Tứ quý
        if (CardUtility.CheckFourOfAKind(Cards)) {
            Result.Set = 6;
            Result.Power = Power;
            Result.Len = Cards.length;
            Result.EffectID = 2;
            Result.Detail = Cards;
        }

        //Bốn đôi thông
        if (CardUtility.CheckFourPairSequence(Cards)) {
            Result.Set = 7;
            Result.Power = Power;
            Result.Len = Cards.length;
            Result.EffectID = 3;
            Result.Detail = Cards;
        }

        return Result;
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.CheckCardSet Error', e);
    }
};

DeskCore.prototype.CheckValidCards = function (Cards) {
    for (var i = 0; i < Cards.length; i++) {
        if (Cards[i].Score < 3 || Cards[i].Score > 15) {
            return 0;
        }

        if (Cards[i].Suit < 1 || Cards[i].Suit > 4) {
            return 0;
        }

        for (var j = i + 1; j < Cards.length; j++) {
            if (Cards[i].Score == Cards[j].Score
                && Cards[i].Suit == Cards[j].Suit) {
                return 0;
            }
        }
    }

    return 1;
};

DeskCore.prototype.StartNewTurn = function () {
    try {
        if (this.CurrentTurn == 0) { //ván mới
            if (this.PrevWinner == -1) { //ván đầu tiên
                this.FirstTurn = this.SmallestCardFirst();
            }
            else {
                this.FirstTurn = this.PrevWinner;
            }
            this.CurrentTurn = this.FirstTurn;

            this.TurnOwner = this.FirstTurn;
            this.TurnMember = this.PlayingUser.slice();
        }
        else { //vòng mới
            this.TurnOwner = this.CurrentTurn;
            this.TurnMember = this.PlayingUser.slice();
        }

        this.GameServer.Logger.Game().debug("StartNewTurn", this.TurnMember, this.CurrentTurn);

        this.FirstGive = true;
        this.PrevTableCards = this.TableCards.Detail.slice();
        this.TableCards = {
            Set: 0,
            Power: 0,
            Len: 0,
            EffectID: 0,
            Detail: []
        };

        this.CalculateRoundPenalty();

        this.RoundPenalty = {
            Victim: 0,
            Winner: 0,
            Multiple: 0,
            PreMultiple: 0,
            Detail: {
                CONG: 0,
                HEO_DEN: 0,
                HEO_DO: 0,
                BA_DOI_THONG: 0,
                TU_QUY: 0,
                BON_DOI_THONG: 0
            }
        };

        this.UpdateTurnInfo();
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.StartNewTurn Error', e);
    }
};

DeskCore.prototype.SmallestCardFirst = function () {
    var FirstTurn = -1;
    var FirstUser = 0;
    var SmallestCard = 0;
    try {
        if (this.MatchMember.length > 0) {
            FirstTurn = this.MatchMember[0];
            FirstUser = this.FindUserByUserID(FirstTurn);
            SmallestCard = FirstUser.GetSmallestCard();

            for (var i = 1; i < this.MatchMember.length; i++) {
                var CheckUser = this.FindUserByUserID(this.MatchMember[i]);
                var CheckCard = CheckUser.GetSmallestCard();

                if ((SmallestCard.Score * 10 + SmallestCard.Suit) > (CheckCard.Score * 10 + CheckCard.Suit)) {
                    FirstTurn = this.MatchMember[i];
                    SmallestCard = CheckCard;
                }
            }
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.SmallestCardFirst Error', e);
    }

    return FirstTurn;
};

DeskCore.prototype.UpdateTurnInfo = function () {
    try {
        if (this.GameServer.MaintainFlag) {
            return;
        }

        var CountDown = Math.floor(this.TurnDelay / 1000);
        var msg = new Packet.UpdateTurnResponse(this.CurrentTurn, CountDown);
        this.DeskSendAllUser(msg);

        this.TurnTimer = setTimeout(function () {
            this.TimerStamp = +new Date();
            this.TurnTimeOut();
        }.bind(this), this.TurnDelay);
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.UpdateTurnInfo Error', e);
    }
};

DeskCore.prototype.TurnTimeOut = function () {
    try {
        var User = this.FindUserByUserID(this.CurrentTurn);
        var Action = 0;

        this.GameServer.Logger.Game().debug("TurnTimeOut", this.CurrentTurn, this.FirstGive);
        if (!this.FirstGive) {
            if (this.Guilty == -1) {
                var UserCard = User.Cards;
                var CanEat = this.CheckCanEat(UserCard);
                if (CanEat) {
                    this.Guilty = User.UserID;
                }
            }

            var CardRemain = User.Cards.length;
            var msg = new Packet.GiveCardResponse(User.UserID, Action, 0, CardRemain, []);
            this.DeskSendAllUser(msg);

            clearTimeout(this.TurnTimer);
            this.EndTurn(User.UserID, Action, []);
        }
        else {
            this.AutoPlay(User);
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.TurnTimeOut Error', e);
    }
}

DeskCore.prototype.EndTurn = function (UserID, Action, Cards) {
    try {
        this.GameServer.Logger.Game().debug("call EndTurn", UserID, Action);

        if (this.CurrentTurn == UserID && !this.IsAdditionalTurn) {
            //Action: 0 = Passed
            //Action: 1 = Give Card
            var Index = this.TurnMember.indexOf(UserID);

            if (Index > -1) {
                var nextIndex = Index + 1;
                if (nextIndex >= this.TurnMember.length) {
                    nextIndex = 0;
                }
                this.CurrentTurn = this.TurnMember[nextIndex];
                this.GameServer.Logger.Game().debug("Set CurrentTurn", this.CurrentTurn, nextIndex, this.TurnMember);

                if (Action == 0) {
                    this.TurnMember.splice(Index, 1);
                    this.GameServer.Logger.Game().debug("User bo qua, turnmember", this.TurnMember);
                }

                if (this.Winners.indexOf(UserID) == -1) {
                    if (this.Heir != 0
                        && Action == 1) {
                        //nếu có thằng ăn cây cuối của thằng tới rồi thì nó sẽ thành người hưởng sái
                        this.Heir = UserID;

                        //giờ éo tính thằng tới nữa, remove nó ra TurnMember
                        this.TurnMember = this.PlayingUser.slice();
                        this.GameServer.Logger.Game().debug("Giut vong", this.Heir);
                    }
                }

                var winnerIndex = this.Winners.indexOf(this.CurrentTurn);
                if (winnerIndex > -1) {
                    if (this.TurnMember.length == 1) {
                        //nếu còn 1 thằng tới thôi thì sẽ tới lượt thằng hưởng sái
                        this.CurrentTurn = this.Heir;
                        this.Heir = 0;
                        this.TurnMember = [this.CurrentTurn];
                        this.GameServer.Logger.Game().debug("huong sai", this.CurrentTurn);
                    }
                }
                else {
                }


                this.GameServer.Logger.Game().debug("Check StartNewTurn", this.TurnMember.length, this.CurrentTurn);
                if (this.TurnMember.length == 1 && this.CurrentTurn == this.TurnMember[0]) {

                    //nếu có hàng trong lượt, thêm 1 round tạm
                    if (this.RoundPenalty.PreMultiple > 0
                        && this.RoundPenalty.Victim != 0) {
                        this.AdditionalTurn();
                    }
                    else {
                        this.StartNewTurn();
                    }
                }
                else {
                    this.UpdateTurnInfo();
                }
            }
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.SmallestCardFirst Error', e);
    }
};

DeskCore.prototype.CompareCardSet = function (CardSet, SetTableCard) {
    try {
        if (CardSet.Set == 0) {
            return 0;
        }

        if (this.TableCards.Set == 0) { //lượt mới
            //this.TableCards.Set = 0;
            //this.TableCards.Power = 0;
            //this.TableCards.Len = 0;
            //this.TableCards.EffectID = 0;

            this.TableCards = CardSet;
            this.GameServer.Logger.Game().debug("Set TableCards cho luot moi:", this.TableCards.Detail);
            return 1;
        }
        else {
            //normal case
            if (CardSet.Set == this.TableCards.Set
                && CardSet.Len == this.TableCards.Len
                && (CardSet.Power.Score * 10 + CardSet.Power.Suit) > (this.TableCards.Power.Score * 10 + this.TableCards.Power.Suit)) {
                if (SetTableCard == 1) {
                    this.TableCards = CardSet;
                    this.GameServer.Logger.Game().debug("Set TableCards normal case:", this.TableCards.Detail);
                }
                return 1;
            }

            //special case
            if (this.CheckSpecialCase()) {
                if (CardSet.Set > this.TableCards.Set
                    && CardSet.Set >= 5) {
                    if (SetTableCard == 1) {
                        this.TableCards = CardSet;
                        this.GameServer.Logger.Game().debug("Set TableCards special case:", this.TableCards.Detail);
                    }
                    return 1;
                }
            }
        }

        return 0;
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.CompareCardSet Error', e);
    }
};

DeskCore.prototype.AutoPlay = function (User) {
    try {
        if (this.GameServer.MaintainFlag) {
            return;
        }
        this.FirstTurn = -1;
        this.FirstGive = false;
        var SmallestCard = User.GetSmallestCard();
        var Action = 1; //đánh
        var EffectID = 0;
        var Cards = [SmallestCard];
        var UserID = User.UserID;

        User.DropCards(Cards);

        var CardRemain = User.Cards.length;
        var msg = new Packet.GiveCardResponse(UserID, Action, EffectID, CardRemain, Cards);
        this.DeskSendAllUser(msg);

        this.GameServer.Logger.Game().debug("User", UserID, "AutoPlay", Cards);

        clearTimeout(this.TurnTimer);
        this.CheckWinGame(User);
        if (this.CheckEndGame()) {
            this.EndGame();
        }
        else {
            this.EndTurn(UserID, Action, Cards);
        }
        //this.EndTurn(UserID, Action, Cards);
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.AutoPlay Error', e);
    }
};

DeskCore.prototype.FirstTurnMustIncludedSmallestCard = function (User, _Cards) {
    try {

        //không phải lượt đầu tiên
        // có thím tới trước rồi
        if (this.FirstTurn == -1
            || this.PrevWinner != -1) {
            return 1;
        }

        //check _Cards must include Smallest Card
        var SmallestCard = User.GetSmallestCard();

        for (var i = 0; i < _Cards.length; i++) {
            if (_Cards[i].Score == SmallestCard.Score
                && _Cards[i].Suit == SmallestCard.Suit) {
                return 1;
            }
        }

        return 0;
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.FirstTurnMustIncludedSmallestCard Error', e);
    }
};

DeskCore.prototype.CheckWinGame = function (User) {
    try {
        if (this.Winners.indexOf(User.UserID) > -1) {
            return;
        }

        var NumberOfCard = User.Cards.length;

        if (NumberOfCard == 0) {
            var WinnerIndex = this.Winners.indexOf(0);
            if (WinnerIndex > -1) {
                this.Winners[WinnerIndex] = User.UserID;
                var playingIndex = this.PlayingUser.indexOf(User.UserID);
                if (playingIndex > -1) {
                    var HeirIndex = (playingIndex + 1) >= this.PlayingUser.length ? 0 : playingIndex + 1;
                    this.Heir = this.PlayingUser[HeirIndex];
                    this.GameServer.Logger.Game().debug("User ", User.UserID, "Win, Heir", this.Heir);
                    this.RemovePlayingUser(User.UserID);
                }
                //this.RemoveTurnMember(User.UserID);
                //check xem có giết thằng nào không
                //for(var i = 0; i < this.MatchMember.length; i++){
                var CongPlayer = this.GetNumberOfUserCong();

                if (CongPlayer == 3
                    && this.MatchMember.length == 4
                    && this.Guilty != -1) {
                    //cả 3 đều chết, có 1 ng đền
                    this.GuiltyUserPayThePrice(User.UserID);
                }
                else {
                    for (var i = 0; i < this.PlayingUser.length; i++) {
                        var DieUser = this.FindUserByUserID(this.PlayingUser[i]);
                        if (DieUser != 0) {
                            //check chet
                            if (DieUser.Cards.length == this.CardNumberPerPlayer) {
                                for (var j = this.Winners.length - 1; j > -1; j--) {
                                    if (this.Winners[j] == 0) {
                                        this.Winners[j] = DieUser.UserID;
                                        this.OnUserCong(DieUser.UserID, User.UserID);
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }

                if (this.PlayingUser.length == 1) {
                    //con minh no
                    var WinnerIndex = this.Winners.indexOf(0);
                    if (WinnerIndex > -1) {
                        this.Winners[WinnerIndex] = this.PlayingUser[0];
                        this.PlayingUser = [];
                    }
                }
            }
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.CheckWinGame Error', e);
    }
};

DeskCore.prototype.CheckEndGame = function () {
    var Result = 0;
    try {
        //if (this.GetNumberOfWinner() == this.LimitWinner) {
        //    Result = 1;
        //}

        var index = this.Winners.indexOf(0);
        if (index == -1) {
            Result = 1;
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.CheckEndGame Error', e);
    }

    return Result;
};

DeskCore.prototype.GetNumberOfPlaying = function () {
    var PlayingCount = 0;

    for (var i = 0; i < this.Winners.length; i++) {
        if (this.Winners[i] == 0) {
            PlayingCount++;
        }
    }

    return PlayingCount;
}

//DeskCore.prototype.EndGame = function () {
//    try {
//        var WinnerID = this.Winners[0];
//        this.PrevWinner = WinnerID;
//        var RatioConfig = this.GetRatioConfig();
//
//        var WinRatio = 0;
//        var PlayerList = [];
//        var EffectTime = 12;
//
//        var TotalPenaltyMoney = 0;
//        var TotalCong = 0;
//        var GoldResultArray = [];
//
//        this.AddRemainPlayer();
//
//        for (var i = 0; i < this.MatchMember.length; i++) {
//            var User = this.FindUserByUserID(this.MatchMember[i]);
//
//            if (User != 0) {
//                var index = this.Winners.indexOf(User.UserID);
//                var WinType = 2;
//                var EndMatchInfo = this.CheckPenalty(User, index);
//
//                if (index > -1) {
//                    //WinType = 1;
//                    WinRatio = RatioConfig[index];
//                }
//                else {
//                    WinRatio = RatioConfig[RatioConfig.length - 1];
//                }
//
//                if (WinRatio > 0) {
//                    WinType = 1;
//                    WinRatio = WinRatio * this.GetTax();
//                }
//
//                var GoldWin = this.GoldBet * WinRatio;
//
//                if (EndMatchInfo.PenaltyMoney > 0) {
//                    WinType = EndMatchInfo.WinType;
//                    if (WinType == 4) {
//                        GoldWin = 0;
//                        TotalCong++;
//                    }
//                }
//
//                GoldWin -= EndMatchInfo.PenaltyMoney;
//                TotalPenaltyMoney -= EndMatchInfo.PenaltyMoney;
//
//                //User.Wallet += GoldWin;
//                GoldResultArray.push({
//                    UserID: User.UserID,
//                    GoldChange: GoldWin
//                });
//
//                var Player = {
//                    UserID: User.UserID,
//                    Cards: User.Cards,
//                    GoldWin: GoldWin,
//                    TotalGold: User.Wallet + GoldWin,
//                    WinType: WinType
//                };
//
//                PlayerList.push(Player);
//            }
//        }
//
//        if (TotalCong > 0) {
//            if ((TotalCong == 3
//                )
//                && this.Guilty != -1) {
//                //tất cả chết cháy, có 1 thằng đền
//                for (var i = 0; i < PlayerList.length; i++) {
//                    var User = this.FindUserByUserID(PlayerList[i].UserID);
//                    if (User != 0) {
//                        if (PlayerList[i].UserID == this.Guilty) {
//                            PlayerList[i].WinType = 6; //đền trắng
//                            PlayerList[i].GoldWin = TotalPenaltyMoney;
//                            PlayerList[i].TotalGold = User.Wallet + TotalPenaltyMoney;
//                        }
//                        else {
//                            if (PlayerList[i].GoldWin < 0) {
//                                PlayerList[i].GoldWin = 0;
//                                PlayerList[i].WinType = 2;
//                                PlayerList[i].TotalGold = User.Wallet;
//                            }
//
//                            if (PlayerList[i].WinType == 1) {
//                                var GoldWin = -TotalPenaltyMoney * this.GetTax();
//                                PlayerList[i].GoldWin = GoldWin;
//                                PlayerList[i].TotalGold = User.Wallet + GoldWin;
//                            }
//                        }
//                    }
//                }
//            } else {
//                //chết cháy lẻ
//                var Winner = this.FindUserByUserID(WinnerID);
//                if (Winner != 0) {
//                    //Winner.Wallet += TotalPenaltyMoney;
//
//                    for (var i = 0; i < PlayerList.length; i++) {
//                        if (PlayerList[i].UserID == WinnerID) {
//                            PlayerList[i].GoldWin += TotalPenaltyMoney;
//                            PlayerList[i].TotalGold += TotalPenaltyMoney;
//
//                            break;
//                        }
//                    }
//                }
//            }
//        }
//        else {
//            if (TotalPenaltyMoney > 0) {
//                //có thằng úng, tiền cho thằng tới gần cuối nhất
//                var KillerID = this.Winners[this.Winners.length - 2];
//                var Killer = this.FindUserByUserID(KillerID);
//                if (Killer != 0) {
//                    for (var i = 0; i < PlayerList.length; i++) {
//                        if (PlayerList[i].UserID == KillerID) {
//                            PlayerList[i].GoldWin += TotalPenaltyMoney;
//                            PlayerList[i].TotalGold += TotalPenaltyMoney;
//
//                            break;
//                        }
//                    }
//                }
//            }
//        }
//
//        this.CalculateMoneyAfterMatch(PlayerList);
//        //this.GameServer.Logger.Game().debug("EndMatch PlayerList", PlayerList);
//        var msg = new Packet.EndMatchResponse(PlayerList, EffectTime);
//        this.DeskSendAllUser(msg);
//
//        this.ResetDataForNewMatch();
//
//        //HARDCODED
//        //setTimeout(function () {
//        //    this.TimerStamp = +new Date();
//        //    this.OnStartMatch();
//        //}.bind(this), this.MatchDelay * 1000);
//        //HARDCODED
//    }
//    catch (e) {
//        this.GameServer.Logger.Game().error('DeskCore.prototype.EndGame Error', e);
//    }
//};

DeskCore.prototype.ResetDataForNewMatch = function () {
    //Reset data for new match
    this.GameState = 0;
    this.CurrentTurn = 0;
    this.TurnOwner = -1;
    this.TurnMember = [];
    this.PrevTableCards = [];
    this.TableCards = {
        Set: 0,
        Power: 0,
        Len: 0,
        EffectID: 0,
        Detail: []
    };
    this.FirstTurn = -1;

    this.TurnTimer = null;
    this.TurnDelay = 10000;
    this.FirstGive = true; //phải đáh, không đc bỏ qua
    this.Winners = [];

    for (var i = 0; i < this.ListUser.length; i++) {
        this.ListUser[i].Cards = [];

        this.ListUser[i].MatchResult = {
            GoldWin: 0,
            IsDone: 0,
            WinType: 0,
            PenaltyDetail: {
                //CONG: 0,
                //HEO_DEN: 0,
                //HEO_DO: 0,
                //BA_DOI_THONG: 0,
                //TU_QUY: 0,
                //BON_DOI_THONG: 0
            }
        };
    }

    setTimeout(function () {
        this.KickUserSignToQuit();
        this.KickUserOutOfMoney();
        this.CheckUserDisconnected();
        this.DisconnectedUser = [];
        this.PlayingUser = [];

        if (this.ListUser.length > 1
            && this.GameState != 1) {
            this.TimerStamp = +new Date();
            this.StartMatchTimer.Status = true;
            this.GameState = 2;
            this.UpdateTimeCountDown(this.MatchDelay);
        }
    }.bind(this), 5000);
};

DeskCore.prototype.CheckSpecialCase = function () {
    try {
        //rác, đôi 2
        if ((this.TableCards.Set == 1
            || this.TableCards.Set == 2)
            && this.TableCards.Power.Score == 15) {
            return 1;
        }

        //ba đôi thông, tứ quý, bốn đôi thông
        if (this.TableCards.Set == 5
            || this.TableCards.Set == 6
            || this.TableCards.Set == 7) {
            return 1;
        }

        return 0;
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.CheckSpecialCase Error', e);
    }
};

DeskCore.prototype.CheckCong = function (User) {
    if (User.Cards.length == this.CardNumberPerPlayer) {
        return 1;
    }
    return 0;
};

DeskCore.prototype.CheckPenalty = function (User) {
    try {
        var PenaltyMoney = 0;
        var WinType = 0;
        var CongMoney = 0;
        var Cards = User.Cards.slice();

        //Check cóng
        CongMoney += this.CheckCong(User) * this.PenaltyConfig.CONG * this.GoldBet;

        //Check heo
        var Heo = 15;
        var SpecificCards = CardUtility.GetSpecificCard(User.Cards, Heo);
        for (var i = 0; i < SpecificCards.length; i++) {
            var Ratio = this.PenaltyConfig.HEO_DEN;

            if (SpecificCards[i].Suit == 3 || SpecificCards[i].Suit == 4) {
                //heo do
                Ratio = this.PenaltyConfig.HEO_DO;
                User.AddPenaltyDetail("HEO_DO", 1);
            }
            else {
                User.AddPenaltyDetail("HEO_DEN", 1);
            }

            PenaltyMoney += Ratio * this.GoldBet;
        }

        //Check bốn đôi thông
        var FourPairSequences = CardUtility.CheckIncluded_FourPairSequence(Cards);
        for (var i = 0; i < FourPairSequences.length; i++) {
            User.AddPenaltyDetail("BON_DOI_THONG", 1);
            CardUtility.RemoveCards(Cards, FourPairSequences[i]);
        }

        //Check tứ quý
        var FourOfAKinds = CardUtility.CheckIncluded_FourOfAKind(Cards);
        for (var i = 0; i < FourOfAKinds.length; i++) {
            User.AddPenaltyDetail("TU_QUY", 1);
            CardUtility.RemoveCards(Cards, FourOfAKinds[i]);
        }

        //Check ba đôi thông
        var ThreePairSequences = CardUtility.CheckIncluded_ThreePairSequence(Cards);
        for (var i = 0; i < ThreePairSequences.length; i++) {
            User.AddPenaltyDetail("BA_DOI_THONG", 1);
            CardUtility.RemoveCards(Cards, ThreePairSequences[i]);
        }

        PenaltyMoney += this.GoldBet * this.PenaltyConfig.BON_DOI_THONG * FourPairSequences.length;
        PenaltyMoney += this.GoldBet * this.PenaltyConfig.TU_QUY * FourOfAKinds.length;
        PenaltyMoney += this.GoldBet * this.PenaltyConfig.BA_DOI_THONG * ThreePairSequences.length;

        this.GameServer.Logger.Game().debug("Check Penalty", User.UserID);
        this.GameServer.Logger.Game().debug("Bon doi thong", FourPairSequences.length);
        this.GameServer.Logger.Game().debug("Tu quy", FourOfAKinds.length);
        this.GameServer.Logger.Game().debug("Ba doi thong", ThreePairSequences.length);

        if (PenaltyMoney > 0) {
            WinType = 3;
        }

        if (CongMoney > 0) {
            WinType = 4;
        }

        return {
            PenaltyMoney: (PenaltyMoney + CongMoney),
            WinType: WinType
        };
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.CheckPenalty Error', e);
    }
};

DeskCore.prototype.GetRatioConfig = function () {
    var NumberOfPlayer = this.MatchMember.length;

    var RatioConfig = this.BetRatioConfig["PLAYERS_" + NumberOfPlayer];

    return RatioConfig;
};

DeskCore.prototype.CheckPerfectWin = function (User) {
    try {
        //sảnh rồng
        if (CardUtility.CheckRoyalStraight(User.Cards)) {
            return 1;
        }

        //tứ quý heo
        var SpecificCards = CardUtility.GetSpecificCard(User.Cards, 15);

        if (SpecificCards.length == 4) {
            return 2;
        }

        //năm đôi thông
        var FivePairSequences = CardUtility.CheckIncluded_FivePairSequence(User.Cards);
        if (FivePairSequences.length > 0) {
            return 3;
        }

        //sáu đôi
        var Pairs = CardUtility.CheckIncluded_Pair(User.Cards);
        if (Pairs.length == 6) {
            return 4;
        }

        //có 3 bích trong hàng: ba đôi thông, tứ quý, bốn đôi thông
        var ToiTrang3Bich = this.ToiTrangCoHang3B(User.Cards);
        if (ToiTrang3Bich) {
            return 5;
        }


        return 0;
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.CheckPerfectWin Error', e);
    }
};

DeskCore.prototype.PerfectWin = function (PerfectWinID) {
    try {
        var Ratio = 2;
        var User = this.FindUserByUserID(PerfectWinID);
        var EffectTime = 12;

        if (User != 0) {
            var PlayerList = [];
            var GoldWin = 0;

            for (var i = 0; i < this.MatchMember.length; i++) {
                if (this.MatchMember[i] != PerfectWinID) {
                    GoldWin += this.GoldBet * Ratio;

                    var currUser = this.FindUserByUserID(this.MatchMember[i]);
                    if (currUser != 0) {
                        currUser.Wallet -= (this.GoldBet * Ratio);
                    }

                    var Player = {
                        UserID: currUser.UserID,
                        Cards: currUser.Cards,
                        GoldWin: -(this.GoldBet * Ratio),
                        TotalGold: currUser.Wallet,
                        WinType: 2,
                        Order: 4
                    };

                    PlayerList.push(Player);
                }
            }

            User.Wallet += GoldWin;

            var Winner = {
                UserID: User.UserID,
                Cards: User.Cards,
                GoldWin: GoldWin,
                TotalGold: User.Wallet,
                WinType: 5,
                Order: 1
            };

            PlayerList.push(Winner);

            //this.GameServer.Logger.Game().debug("PerfectWin", PlayerList);

            var msg = new Packet.EndMatchResponse(PlayerList, EffectTime);
            this.DeskSendAllUser(msg);

            this.ResetDataForNewMatch();

            //HARDCODED
            //if (this.ListUser.length > 1) {
            //    setTimeout(function () {
            //        this.OnStartMatch();
            //    }.bind(this), this.MatchDelay * 1000);
            //}
            //HARDCODED
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.PerfectWin Error', e);
    }
};

DeskCore.prototype.OnUserChat = function (Socket, Message) {
    try {
        var now = +new Date();

        if(now - Socket.UserModel.LastChatTime > 3000){
            var msg = new Packet.UserChatResponse(Socket.UserModel.UserID, Message);
            this.DeskSendAllUser(msg);
            Socket.UserModel.LastChatTime = now;
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.OnUserChat Error', e);
    }
};

DeskCore.prototype.ToiTrangCoHang3B = function (Cards) {
    if (this.MatchMember.length != 4) {
        return 0;
    }

    if (this.PrevWinner != -1) {
        return 0;
    }

    return CardUtility.CheckHangCo3Bich(Cards);
};

DeskCore.prototype.CheckCanEat = function (Cards) {
    try {
        /*
         this.TableCards = {
         Set: 0,
         Power: 0,
         Len: 0,
         EffectID: 0
         };
         */
        var Result = this.GetBiggestCardSet(Cards, this.TableCards.Set, this.TableCards.Len);
        return this.CompareCardSet(Result, 0)
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.CheckCanEat Error', e);
    }
};

DeskCore.prototype.GetBiggestCardSet = function (Cards, Set, Len) {
    try {
        var Result = {
            Set: 0,
            Power: 0,
            Len: 0,
            EffectID: 0,
            Detail: []
        };

        var FoundCards = [];

        switch (Set) {
            case 1: //rac
                FoundCards = CardUtility.GetBiggestSingle(Cards);
                break;

            case 2: //doi
                FoundCards = CardUtility.GetBiggestPair(Cards);
                break;

            case 3: //sam co
                FoundCards = CardUtility.GetBiggestThreeOfAKind(Cards);
                break;

            case 4: //sanh
                FoundCards = CardUtility.GetBiggestStraight(Cards, Len);
                break;

            case 5: //ba doi thong
                FoundCards = CardUtility.GetBiggestThreePairSequence(Cards);
                break;

            case 6: //tu quy
                FoundCards = CardUtility.GetBiggestFourOfAKind(Cards);
                break;

            case 7: //bon doi thong
                FoundCards = CardUtility.GetBiggestFourPairSequence(Cards);
                break;
        }

        Result = this.CheckCardSet(FoundCards);
        return Result;
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.GetBiggestCardSet Error', e);
    }
};

DeskCore.prototype.SignToQuit = function (Socket) {
    try {
        this.GameServer.Logger.Game().debug("SignToQuit", Socket.UserModel.UserID);
        if (this.GameState != 1) {
            this.GameServer.Logger.Game().debug("Kick User", Socket.UserModel.UserID);
            this.KickUser(Socket);
        }
        else {
            var Playing = this.FindUserPlaying(Socket.UserModel.UserID);

            if (!Playing) {
                this.GameServer.Logger.Game().debug("user quit game", Socket.UserModel.GameName);
                this.KickUser(Socket);

                for (var i = 0; i < this.ListUser.length; i++) {
                    if (this.ListUser[i].UserID === Socket.UserModel.UserID) {
                        this.ListUser.splice(i, 1);
                        break;
                    }
                }

                return;
            }

            Socket.UserModel.SignToQuit = Socket.UserModel.SignToQuit ? 0 : 1;
            var msg = new Packet.SignToQuitResponse(Socket.UserModel.SignToQuit);
            this.GameServer.SendSocketBinary(Socket, msg);
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.SignToQuit Error', e);
    }
};

DeskCore.prototype.KickUser = function (Socket) {
    try {
        //this.GameServer.UserInfoUpdateAll(Socket);
        //this.GameServer.DestroySocketOnly(Socket);
        var msg = new Packet.UserOutResponse(Socket.UserModel.UserID);
        this.DeskSendAllUser(msg);
        Socket.UserModel.OnUserLeftDesk();
        Socket.IsJoinRoom = false;
        //Socket.UserModel.MoneyState = this.GameServer.UserStateDefine.LoginCompleted;
        this.RemoveListUser(Socket.UserModel.UserID);

        if (this.StartMatchTimer.Status == true
            && this.ListUser.length < 2) {
            this.StartMatchTimer.Status = false;
            this.StartMatchTimer.Tick = 0;
            this.UpdateTimeCountDown(0);
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.KickUser Error', e);
    }
};

DeskCore.prototype.CheckUserDisconnected = function () {
    try {
        //for (var i = 0; i < this.ListUser.length; i++) {
        //    if (this.ListUser[i].Disconnected == 1) {
        //        var socket = this.ListUser[i].Socket;
        //        this.KickUser(socket);
        //        this.ListUser.splice(i, 1);
        //        i--;
        //    }
        //}

        this.GameServer.Logger.Game().debug("CheckUserDisconnected", this.DisconnectedUser.length);
        for (var i = 0; i < this.DisconnectedUser.length; i++) {
            var UserModel = this.DisconnectedUser[i];
            var UserID = UserModel.UserID;
            UserModel.OnUserLeftDesk();
            this.GameServer.UpdateForDisconnectUser(UserModel);

            var msg = new Packet.UserOutResponse(UserModel.UserID);
            this.DeskSendAllUser(msg);

            this.RemoveListUser(UserModel.UserID);

            if (this.PrevWinner == UserID) {
                this.PrevWinner = -1;
            }
        }

        this.GameServer.Logger.Game().debug("end check user this.ListUser", this.ListUser.length);
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.CheckUserDisconnected Error', e);
    }
};

DeskCore.prototype.KickUserSignToQuit = function () {
    try {
        for (var i = 0; i < this.ListUser.length; i++) {
            var User = this.ListUser[i];
            if (User.SignToQuit == 1) {
                //this.KickUser(User.Socket);
                this.GameServer.DestroySocket(User.Socket);
            }
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.KickUserSignToQuit Error', e);
    }
}

DeskCore.prototype.FindUserPlaying = function (UserID) {
    for (var i = 0; i < this.PlayingUser.length; i++) {
        if (this.PlayingUser[i] == UserID) {
            return 1;
        }
    }

    return 0;
};

DeskCore.prototype.OnUserReconnect = function (Socket) {
    try {
        var newUserModel = Socket.UserModel;
        var User = this.FindDisconnectedUser(newUserModel.UserID);

        if (User != 0) {
            User.Socket = Socket;
            Socket.UserModel = User;

            var DeskInfo = this.GetDeskInfo();
            var msg = new Packet.JoinRoomResponse(DeskInfo.UserArray, this.DeskID, this.GoldBet);
            this.GameServer.SendSocketBinary(Socket, msg);
            this.RemoveDisconnectedUser(newUserModel.UserID);
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.OnUserReconnect Error', e);
    }
};

DeskCore.prototype.GetGameState = function (Socket) {
    try {
        var User = Socket.UserModel;
        var CardList = User.Cards;
        var DeskInfo = this.GetDeskInfo();
        var Delay = this.TurnDelay;
        if (this.GameState != 1) {
            Delay = this.MatchDelay * 1000;
        }

        var TimeRemain = ((Delay - ((+new Date() - this.TimerStamp))));
        var TableCards = this.TableCards.Detail;
        if (TableCards.length == 0) {
            TableCards = this.PrevTableCards;
        }

        if (TimeRemain < 0) {
            TimeRemain = 0;
        }
        TimeRemain = Math.floor(TimeRemain / 1000);

        var GameStateObject = {
            MatchID: this.MatchID,
            CardList: CardList,
            UserArray: DeskInfo.UserArray,
            TableCards: TableCards,
            GameState: this.GameState,
            CurrentTurn: this.CurrentTurn,
            TimeRemain: TimeRemain
        };

        //this.GameServer.Logger.Game().debug("GetGameState UserArray", DeskInfo.UserArray.length);

        var msg = new Packet.GetGameStateResponse(GameStateObject);
        this.GameServer.SendSocketBinary(Socket, msg);
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.GetGameState Error', e);
    }
};

DeskCore.prototype.AddRemainPlayer = function () {
    var index = this.Winners.indexOf(0);

    while (index > -1) {
        for (var i = 0; i < this.MatchMember.length; i++) {
            var WinnerIndex = this.Winners.indexOf(this.MatchMember[i]);
            if (WinnerIndex == -1) {
                this.Winners[index] = this.MatchMember[i];
            }
        }

        index = this.Winners.indexOf(0);
    }
};

DeskCore.prototype.CheckUserInDesk = function (UserID) {
    for (var i = 0; i < this.ListUser.length; i++) {
        if (UserID == this.ListUser[i].UserID
            && this.ListUser[i].Disconnected != 1) {
            return 1;
        }
    }
    return 0;
};

DeskCore.prototype.FindDisconnectedUser = function (UserID) {
    for (var i = 0; i < this.DisconnectedUser.length; i++) {
        if (this.DisconnectedUser[i].UserID == UserID) {
            return this.DisconnectedUser[i];
        }
    }

    return 0;
};

DeskCore.prototype.RemoveDisconnectedUser = function (UserID) {
    for (var i = 0; i < this.DisconnectedUser.length; i++) {
        if (this.DisconnectedUser[i].UserID == UserID) {
            this.DisconnectedUser.splice(i, 1);
            break;
        }
    }
};

DeskCore.prototype.RemoveListUser = function (UserID) {
    for (var i = 0; i < this.ListUser.length; i++) {
        if (this.ListUser[i].UserID == UserID) {
            this.ListUser.splice(i, 1);
            //this.GameServer.Logger.Game().debug("PlayingUSer", this.PlayingUser, "after remove", UserID);
            break;
        }
    }
};

DeskCore.prototype.RemovePlayingUser = function (UserID) {
    for (var i = 0; i < this.PlayingUser.length; i++) {
        if (this.PlayingUser[i] == UserID) {
            this.PlayingUser.splice(i, 1);
            break;
        }
    }
};

DeskCore.prototype.RemoveTurnMember = function (UserID) {
    for (var i = 0; i < this.TurnMember.length; i++) {
        if (this.TurnMember[i] == UserID) {
            this.TurnMember.splice(i, 1);
            break;
        }
    }
};

DeskCore.prototype.Timer1Second = function () {
    try {

    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.Timer1Second Error', e);
    }
};

DeskCore.prototype.TimerLoop = function () {
    try {
        if (this.Run) {
            var local = new Date();
            var difTime = (local - this.MainTime);

            //Timer Here
            for (var i = 0; i < this.NonStopTimers.length; i++) {
                this.NonStopTimers[i].Tick += difTime;
                if (this.NonStopTimers[i].Tick > this.NonStopTimers[i].Interval) {
                    this.NonStopTimers[i].Tick = 0;
                    this.NonStopTimers[i].Wake();
                }
            }

            //StartMatch
            if (this.StartMatchTimer.Status == true) {
                this.StartMatchTimer.Tick += difTime;
                if (this.StartMatchTimer.Tick > this.StartMatchTimer.Interval) {
                    this.StartMatchTimer.Tick = 0;
                    this.StartMatchTimer.Wake();
                }
            }

            this.MainTime = local;
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.TimerLoop Error', e);
    }
};

DeskCore.prototype.SetRoundPenalty = function (UserID, CardSet) {
    try {
        var Multiple = 0;
        var Detail = {
            CONG: 0,
            HEO_DEN: 0,
            HEO_DO: 0,
            BA_DOI_THONG: 0,
            TU_QUY: 0,
            BON_DOI_THONG: 0
        };

        /*
         var Result = {
         Set: 0,
         Power: 0,
         Len: 0,
         EffectID: 0,
         Detail: []
         };
         */
        this.GameServer.Logger.Game().debug("SetRoundPenalty", CardSet);

        if (CardSet.Set == 1
            || CardSet.Set == 2) {
            for (var i = 0; i < CardSet.Detail.length; i++) {
                if (CardSet.Detail[i].Score == 15) {
                    //Heo
                    var currMultiple = this.PenaltyConfig.HEO_DEN;

                    if (CardSet.Detail[i].Suit >= 3) {
                        //Heo đỏ
                        currMultiple = this.PenaltyConfig.HEO_DO;
                        Detail.HEO_DO++;
                    }
                    else {
                        //Heo đen
                        Detail.HEO_DEN++;
                    }

                    Multiple += currMultiple;
                }
            }
        }

        //Ba đôi thông
        if (CardSet.Set == 5) {
            Multiple += this.PenaltyConfig.BA_DOI_THONG;
            Detail.BA_DOI_THONG++;
        }

        //Tứ quý
        if (CardSet.Set == 6) {
            Multiple += this.PenaltyConfig.TU_QUY;
            Detail.TU_QUY++;
        }

        //Bốn đôi thông
        if (CardSet.Set == 7) {
            Multiple += this.PenaltyConfig.BON_DOI_THONG;
            Detail.BON_DOI_THONG++;
        }

        /*
         this.RoundPenalty = {
         Loser: 0,
         Winner: 0,
         Multiple: 0
         }
         */

        if (CardSet.Set == 1 || CardSet.Set == 2) {
            //heo, đôi heo: chỉ set loser
            this.RoundPenalty.Victim = UserID;
            //this.RoundPenalty.Multiple = Multiple;
        }
        else {
            if (this.RoundPenalty.Victim == 0) {
                //chưa có ai đánh, quăng khống
                this.RoundPenalty.Victim = UserID;
            }
            else {
                //chặt
                if (this.RoundPenalty.Winner == 0) {
                    this.RoundPenalty.Winner = UserID;
                }
                else {
                    //chặt chồng
                    this.RoundPenalty.Victim = this.RoundPenalty.Winner;
                    this.RoundPenalty.Winner = UserID;
                }

                this.RoundPenalty.Multiple = this.RoundPenalty.PreMultiple;
                this.GameServer.Logger.Game().debug("Chat", this.RoundPenalty.Multiple);
            }
        }
        this.RoundPenalty.PreMultiple += Multiple;

        for (var prop in Detail) {
            for (var prop1 in this.RoundPenalty.Detail) {
                if (prop == prop1) {
                    this.RoundPenalty.Detail[prop1] += Detail[prop];
                    break;
                }
            }
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.SetRoundPenalty Error', e);
    }
};

DeskCore.prototype.KickUserOutOfMoney = function () {
    var MoneyRequired = this.MoneyRequiredPlay;
    for (var i = 0; i < this.ListUser.length; i++) {
        var User = this.ListUser[i];

        if (User.Wallet < MoneyRequired) {
            //k đụ tiền, kick
            this.GameServer.DestroySocket(User.Socket);
        }

    }
};

DeskCore.prototype.UpdateGoldForUser = function (UserID, Money) {
    var User = this.FindUserByUserID(UserID);
    if (User != 0) {
        User.Wallet += Money;

        var UpdateMoneyObj = {
            UserID: UserID,
            MoneyChange: Money,
            TotalMoney: User.Wallet
        };

        var msg = new Packet.UpdateMoneyResponse(UpdateMoneyObj);
        this.DeskSendAllUser(msg);
    }
};

DeskCore.prototype.CalculateRoundPenalty = function () {
    try {
        this.GameServer.Logger.Game().debug("this.RoundPenalty.Multiple", this.RoundPenalty.Multiple);
        this.GameServer.Logger.Game().debug("this.RoundPenalty.Victim", this.RoundPenalty.Victim);
        this.GameServer.Logger.Game().debug("this.RoundPenalty.Winner", this.RoundPenalty.Winner);
        this.GameServer.Logger.Game().debug("this.RoundPenalty.Detail", this.RoundPenalty.Detail);

        if (this.RoundPenalty.Multiple > 0
            && this.RoundPenalty.Victim != 0
            && this.RoundPenalty.Winner != 0) {

            if (this.Winners.indexOf(this.RoundPenalty.Victim) == -1) {
                this.GameServer.Logger.Game().debug("Victim End Game, no more penalty");
                return;
            }

            //có án
            var PenaltyGold = this.RoundPenalty.Multiple * this.GoldBet;

            var Loser = this.FindUserByUserID(this.RoundPenalty.Victim);
            var Winner = this.FindUserByUserID(this.RoundPenalty.Winner);
            var Notice = 1;

            if (Loser != 0 && Winner != 0) {
                var RealPenaltyGold = this.BalanceGold(this.RoundPenalty.Winner, this.RoundPenalty.Victim, PenaltyGold);
                this.UpdateGoldForPairOfUser(this.RoundPenalty.Victim, this.RoundPenalty.Winner, RealPenaltyGold, Notice);

                for (var prop in this.RoundPenalty.Detail) {
                    //for(var prop1 in Loser.MatchResult.PenaltyDetail){
                    //if(prop == prop1){
                    //    Loser.MatchResult.PenaltyDetail[prop1] += this.RoundPenalty.Detail[prop];
                    //    break;
                    //}
                    //}
                    Loser.AddPenaltyDetail(prop, this.RoundPenalty.Detail[prop]);
                }
            }
            else {
                this.GameServer.Logger.Game().error('DeskCore.prototype.BalanceGold Error: Cant find winner or loser', Winner != 0, Loser != 0);
            }
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.CalculateRoundPenalty Error', e);
    }
};

DeskCore.prototype.UpdateTimeCountDown = function (Time) {
    try {
        this.GameServer.Logger.Game().debug("UpdateTimeCountDown", Time);
        var msg = new Packet.PreGameResponse({TimeRemain: Time});
        this.DeskSendAllUser(msg);
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.UpdateTimeCountDown Error', e);
    }
};

DeskCore.prototype.BalanceGold = function (UserIDWin, UserIDLose, GoldTransfer) {
    try {
        var RealGoldTransfer = 0;
        if (GoldTransfer > 0) {
            var UserWin = this.FindUserByUserID(UserIDWin);
            var UserLose = this.FindUserByUserID(UserIDLose);
            if (
                UserLose != 0
            //&& UserWin != 0
            ) {
                RealGoldTransfer = GoldTransfer;

                //check thằng ăn xem đủ tiền ăn không
                if (UserWin.Wallet < RealGoldTransfer) {
                    //RealGoldTransfer = UserWin.Wallet;
                }

                //check thằng thua xem đủ tiền chung không
                if (UserLose.Wallet < RealGoldTransfer) {
                    RealGoldTransfer = UserLose.Wallet;
                }
            }
            else {
                this.GameServer.Logger.Game().error('DeskCore.prototype.BalanceGold Error: Cant find winner or loser', UserWin != 0, UserLose != 0);
            }
        }

        return RealGoldTransfer;
    }
    catch (e) {
        return 0;
        this.GameServer.Logger.Game().error('DeskCore.prototype.CheckMoneyForLoser Error', e);
    }
};

DeskCore.prototype.OnUserCong = function (LoserID, WinnerID) {
    try {
        var Loser = this.FindUserByUserID(LoserID);
        var Winner = this.FindUserByUserID(WinnerID);
        var Notice = 1;

        if (Loser != 0 && Winner != 0) {
            var EndMatchInfo = this.CheckPenalty(Loser);
            var RealPenaltyGold = this.BalanceGold(WinnerID, LoserID, EndMatchInfo.PenaltyMoney);

            //Set MatchResult cho 2 users
            Loser.MatchResult.GoldWin = -RealPenaltyGold;
            Loser.MatchResult.IsDone = 1;
            Loser.MatchResult.WinType = EndMatchInfo.WinType;

            Winner.MatchResult.GoldWin = RealPenaltyGold;
            Winner.MatchResult.IsDone = 1;
            Winner.MatchResult.WinType = 1;

            //Update Wallet + thông báo Update Gold
            this.UpdateGoldForPairOfUser(LoserID, WinnerID, RealPenaltyGold, Notice);
            this.RemovePlayingUser(LoserID);
        }
        else {
            this.GameServer.Logger.Game().error('DeskCore.prototype.OnUserCong Error: Cant find winner or loser', Winner != 0, Loser != 0);
        }

    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.OnUserCong Error', e);
    }
};

DeskCore.prototype.UpdateGoldForPairOfUser = function (LoserID, WinnerID, GoldTransfer, Notice) {
    try {
        var Loser = this.FindUserByUserID(LoserID);
        var Winner = this.FindUserByUserID(WinnerID);

        if (Loser != 0 && Winner != 0) {
            var RealGoldTransfer = GoldTransfer;

            //trừ tiền user thua
            Loser.Wallet -= RealGoldTransfer;

            //cộng tiền user thắng
            Winner.Wallet += RealGoldTransfer * this.GetTax();

            this.GameServer.Logger.Game().debug("UpdateGoldForPairOfUser", LoserID, "and", WinnerID, "Money", RealGoldTransfer, "With Tax", this.GetTax());
            if (Notice) {
                //Gửi gói update tiền
                var WinnerUpdateMoneyObj = {
                    UserID: Winner.UserID,
                    MoneyChange: RealGoldTransfer,
                    TotalMoney: Winner.Wallet
                };

                var msg_winner = new Packet.UpdateMoneyResponse(WinnerUpdateMoneyObj);
                this.DeskSendAllUser(msg_winner);

                var LoserUpdateMoneyObj = {
                    UserID: Loser.UserID,
                    MoneyChange: -RealGoldTransfer,
                    TotalMoney: Loser.Wallet
                };
                var msg_loser = new Packet.UpdateMoneyResponse(LoserUpdateMoneyObj);
                this.DeskSendAllUser(msg_loser);
            }
        }
        else {
            this.GameServer.Logger.Game().error('DeskCore.prototype.UpdateMoneyForPairOfUser Error: Cant find winner or loser', Winner != 0, Loser != 0);
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.UpdateMoneyForPairOfUser Error', e);
    }
};

// WIN_TYPE: {
//     NONE: 0,
//     WIN: 1,
//     LOSE: 2,
//     UNG: 3,
//     CONG: 4,
//     TOI_TRANG: 5,
//     DEN_TRANG: 6,
// },

DeskCore.prototype.EndGame = function () {
    try {
        var WinnerID = this.Winners[0];
        this.PrevWinner = WinnerID;
        var RatioConfig = this.GetRatioConfig();
        var Notice = 0;
        var EffectTime = 12;

        this.GameServer.Logger.Game().debug("EndGame", this.MatchMember.length, "RatioConfig", RatioConfig);

        for (var i = 0; i < this.Winners.length; i++) {
            var User = this.FindUserByUserID(this.Winners[i]);
            if (User != 0) {
                User.MatchResult.Order = i + 1;
                //chưa chốt sổ
                if (!User.MatchResult.IsDone) {
                    var Ratio = RatioConfig.Ratio[i];
                    var Ordered = RatioConfig.Ordered[i];

                    this.GameServer.Logger.Game().debug("User", this.Winners[i], "Ratio", Ratio, "Ordered", Ordered);
                    if (Ordered > -1) {
                        //có chung cho người khác
                        var Winner = this.FindUserByUserID(this.Winners[Ordered]);
                        if (Winner != 0) {
                            var WinnerID = Winner.UserID;
                            var LoserID = User.UserID;
                            var PenaltyGold = Ratio * this.GoldBet;
                            var RealPenaltyGold = this.BalanceGold(WinnerID, LoserID, -PenaltyGold);

                            //Set MatchResult cho 2 users
                            User.MatchResult.GoldWin -= RealPenaltyGold;
                            User.MatchResult.IsDone = 1;
                            User.MatchResult.WinType = 2;

                            Winner.MatchResult.GoldWin += RealPenaltyGold;
                            Winner.MatchResult.IsDone = 1;
                            Winner.MatchResult.WinType = 1;
                            Winner.MatchResult.Order = 1;

                            //Update Wallet + thông báo Update Gold
                            this.UpdateGoldForPairOfUser(LoserID, WinnerID, RealPenaltyGold, Notice);
                        }

                        //Check cháy
                        //Check tới chót
                        if (User.UserID == this.Winners[this.Winners.length - 1]) {
                            var EndMatchInfo = this.CheckPenalty(User);

                            if (EndMatchInfo.PenaltyMoney > 0) {
                                //bị thúi hàng
                                var Killer = this.FindUserByUserID(this.Winners[this.Winners.length - 2]);
                                if (Killer != 0) {
                                    var WinnerID = Killer.UserID;
                                    var LoserID = User.UserID;
                                    var RealPenaltyGold = this.BalanceGold(WinnerID, LoserID, EndMatchInfo.PenaltyMoney);

                                    //Set MatchResult cho 2 users
                                    User.MatchResult.GoldWin -= RealPenaltyGold;
                                    User.MatchResult.WinType = EndMatchInfo.WinType;

                                    Killer.MatchResult.GoldWin += RealPenaltyGold;

                                    //Update Wallet + thông báo Update Gold
                                    this.UpdateGoldForPairOfUser(LoserID, WinnerID, RealPenaltyGold, Notice);
                                }
                            }
                        }
                    }
                    else {

                    }
                }
            }
        }

        var EndMatchDetail = [];

        var PlayerList = [];
        for (var i = 0; i < this.Winners.length; i++) {
            var User = this.FindUserByUserID(this.Winners[i]);
            if (User != 0) {
                var Player = {
                    UserID: User.UserID,
                    Cards: User.Cards,
                    GoldWin: User.MatchResult.GoldWin,
                    TotalGold: User.Wallet,
                    WinType: User.MatchResult.WinType,
                    Order: User.MatchResult.Order
                };

                this.GameServer.Logger.Game().debug('User', User.UserID, 'PenaltyDetail', User.MatchResult.PenaltyDetail);

                PlayerList.push(Player);
                //if(User.MatchResult.GetPenalty)
                {
                    EndMatchDetail.push({
                        UserID: User.UserID,
                        Order: User.MatchResult.Order,
                        GoldWin: User.MatchResult.GoldWin,
                        TotalGold: User.Wallet,
                        WinType: User.MatchResult.WinType,
                        PenaltyDetail: User.MatchResult.PenaltyDetail
                    });
                }
            }
        }

        //this.CalculateMoneyAfterMatch(PlayerList);
        var msg = new Packet.EndMatchResponse(PlayerList, EffectTime);
        this.DeskSendAllUser(msg);

        this.ResetDataForNewMatch();
        this.GameServer.Logger.Game().debug("EndMatchDetail", EndMatchDetail);

        this.GameServer.LogEndMatch(this.MatchID, this.GameServer.BetLimitConfig.Tax, this.GoldBet, this.DeskID, JSON.stringify(EndMatchDetail));

    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.EndGame Error', e);
    }
};

DeskCore.prototype.GetNumberOfUserCong = function () {
    var Result = 0;
    try {
        for (var i = 0; i < this.PlayingUser.length; i++) {
            var User = this.FindUserByUserID(this.PlayingUser[i]);

            if (User != 0) {
                if (User.Cards.length == this.CardNumberPerPlayer) {
                    Result++;
                }
            }
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.GetNumberOfUserCong Error', e);
    }
    return Result;
};

DeskCore.prototype.GuiltyUserPayThePrice = function (WinnerID) {
    try {
        var Loser = this.FindUserByUserID(this.Guilty);
        var Winner = this.FindUserByUserID(WinnerID);

        if (Loser != 0 && Winner != 0) {
            var TotalPenalty = 0;

            for (var i = 0; i < this.PlayingUser.length; i++) {
                var User = this.FindUserByUserID(this.PlayingUser[i]);
                if (User != 0) {
                    if (User.Cards == this.CardNumberPerPlayer) {
                        //cóng nà
                        var EndMatchInfo = this.CheckPenalty(Loser);

                        //Set MatchResult cho player, kết thúc
                        Loser.MatchResult.GoldWin = 0;
                        Loser.MatchResult.IsDone = 1;
                        Loser.MatchResult.WinType = EndMatchInfo.WinType;

                        TotalPenalty += EndMatchInfo.PenaltyMoney;

                        for (var j = this.Winners.length - 1; j > -1; j--) {
                            if (this.Winners[j] == 0) {
                                this.Winners[j] = User.UserID;
                                break;
                            }
                        }
                    }
                }
            }
            //tính xem ng đền có đủ tiền chung không
            var RealPenaltyGold = this.BalanceGold(WinnerID, Loser.UserID, TotalPenalty);

            //Cộng/trừ tiền cho thắng/thua
            this.UpdateGoldForPairOfUser(Loser.UserID, WinnerID, RealPenaltyGold, 0);

            //Set MatchResult cho 2 users
            Loser.MatchResult.GoldWin = -RealPenaltyGold;
            Loser.MatchResult.IsDone = 1;
            Loser.MatchResult.WinType = 6; //đền trắng

            Winner.MatchResult.GoldWin = RealPenaltyGold;
            Winner.MatchResult.IsDone = 1;
            Winner.MatchResult.WinType = 1;

            this.Winners[0] = WinnerID;
        }
        else {
            this.GameServer.Logger.Game().error('DeskCore.prototype.GuiltyUserPayThePrice Error: Cant find winner or loser', Winner != 0, Loser != 0);
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.GuiltyUserPayThePrice Error', e);
    }
};

DeskCore.prototype.CardDeckToStr = function (_cardDeck) {
    var result = "";

    for (var i = 0; i < _cardDeck.length; i++) {
        var Score = _cardDeck[i].Score;
        var Suit = _cardDeck[i].Suit;

        var StrCard = this.ScoreToStr(Score) + this.SuitToStr(Suit);
        result += StrCard;
    }

    return result;
};

DeskCore.prototype.SuitToStr = function (Suit) {
    var Result = "";

    switch (Suit) {
        case 1:
            Result = "b";
            break;
        case 2:
            Result = "t";
            break;
        case 3:
            Result = "r";
            break;
        case 4:
            Result = "c";
            break;
        default:
            Result = "E";
            break;
    }

    return Result;
};

DeskCore.prototype.ScoreToStr = function (Score) {
    var Result = "";

    switch (Score) {
        case 10:
            Result = "A";
            break;
        case 11:
            Result = "B";
            break;
        case 12:
            Result = "C";
            break;
        case 13:
            Result = "D";
            break;
        case 14:
            Result = "1";
            break;
        case 15:
            Result = "2";
            break;

        default:
            Result = Result + Score;
            break;
    }

    return Result;
};

DeskCore.prototype.AdditionalTurn = function () {
    try {
        var Time = 7;
        var msg = new Packet.AdditionalTurnResponse(Time);
        this.DeskSendAllUser(msg);
        this.IsAdditionalTurn = 1;

        setTimeout(function () {
            this.EndAdditionalTurn();
        }.bind(this), Time * 1000);
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.AdditionalTurn Error', e);
    }
};

DeskCore.prototype.EndAdditionalTurn = function () {
    try {
        this.IsAdditionalTurn = 0;
        this.StartNewTurn();
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.EndAdditionalTurn Error', e);
    }
}
