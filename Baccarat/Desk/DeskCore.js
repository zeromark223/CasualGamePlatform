/*{"build":1}*/
var rootFile = __stack[0].getFileName();
var path = require('path');
var cDir = path.dirname(rootFile);
var Utility = require(path.resolve(cDir, '../../SharedModule/Utility'));
// var Packet = require(path.resolve(cDir, '../Packet'));
// var Engine = require(path.resolve(cDir, './Engine'));
var Config = require('../../Config/Baccarat');
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
}

module.exports = DeskCore;
DeskCore.prototype.Init = function (GameServer, DeskID) {
    this.DeskID = DeskID;
    this.GameServer = GameServer;
    this.BetRatioConfig = GameServer.Config.BetRatioConfig;

    this.GenCardPool();
    this.StartRound();
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

    this.InitCards();
};

DeskCore.prototype.InitCards = function () {
    var i;

    for (i = 0; i < 2; i++) {// Gen Dices
        this.ResultCardsBanker.push(this.RandomCardsNum());
    }

    for (i = 0; i < 2; i++) {// Gen Dices
        this.ResultCardsPlayer.push(this.RandomCardsNum());
    }


    var playerScore = this.GetScore(this.ResultCardsPlayer);
    var bankerScore = this.GetScore(this.ResultCardsBanker);
    if (playerScore < 6) {
        this.ResultCardsPlayer.push(this.RandomCardsNum());
    }

    if (playerScore > 7) {
    }
    else{
        var checkArray = [];
        var lastPlayerCard = this.ResultCardsPlayer[this.ResultCardsPlayer.length - 1];
        if (this.ResultCardsPlayer.length < 3 && bankerScore < 7) {
            this.ResultCardsBanker.push(this.RandomCardsNum());

        } else {
            switch (bankerScore) {
                case 0:
                case 1:
                case 2:
                    this.ResultCardsBanker.push(this.RandomCardsNum());
                    break;
                case 3:

                    if (this.ResultCardsPlayer[this.ResultCardsPlayer.length - 1] == 8) {
                        //Ko rut
                    } else {
                        //Rut
                        this.ResultCardsBanker.push(this.RandomCardsNum());
                    }
                    break;
                case 4:
                    checkArray = [0, 1, 8, 9];
                    if (checkArray.indexOf(lastPlayerCard) > -1) {
                        //Ko rut
                    } else {
                        //Rut
                        this.ResultCardsBanker.push(this.RandomCardsNum());
                    }
                    break;
                case 5:
                    checkArray = [4, 5, 6, 7];
                    if (checkArray.indexOf(lastPlayerCard) == -1) {
                        //Ko rut
                    } else {
                        //Rut
                        this.ResultCardsBanker.push(this.RandomCardsNum());
                    }
                    break;
                case 6:
                    checkArray = [6, 7];
                    if (checkArray.indexOf(lastPlayerCard) == -1) {
                        //Ko rut
                    } else {
                        //Rut
                        this.ResultCardsBanker.push(this.RandomCardsNum());
                    }
                    break;
                case 8:
                case 9:
                    if (this.ResultCardsPlayer.length >= 3) {
                        this.ResultCardsPlayer = this.ResultCardsPlayer.slice(0, 2);
                    }

            }
        }
    }

    var BankerScore = this.GetScore(this.ResultCardsBanker);
    var PlayerScore = this.GetScore(this.ResultCardsPlayer);

    this.ResultText = this.GenResultText(BankerScore, PlayerScore);
    this.ResultTextEncrypted = this.EncryptResultText(this.ResultText);

    this.GameServer.GenMatchInfo(this.DeskID, this.GameServer.BetLimitConfig.Tax, this.ResultTextEncrypted, function (e, MatchID) {
        if (!e) {
            this.MatchID = MatchID;
            this.GameServer.Logger.Game().debug('DeskCore.prototype.InitCards MatchID : ', MatchID);
            this.OnStartRoundCompleted();
        } else {
            //handle error
        }
    }.bind(this));
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

DeskCore.prototype.UserEnterDesk = function (Socket) {
    try {
        var User = Socket.UserModel;
        if (User.MoneyState == this.GameServer.MoneyStateDefine.GettingCompleted) {
            User.MoneyState = this.GameServer.MoneyStateDefine.JoinGameCompleted;
            User.OnUserEnterDesk(this);
            this.GameServer.UserClient.push(Socket);
            User.DeskID = this.DeskID;
            this.ListUser.push(User);

            if (this.DeskState == this.GameServer.DeskStateConfig.Open) {
                var difTime = +new Date() - this.StartRoundTime;
                var timeEst = this.MatchRoundTime * 1000 - difTime;
                timeEst = Math.floor(timeEst / 1000);

                if (timeEst > 0 && timeEst < this.MatchRoundTime) {
                    var oldCardNumber = this.CardPool.length;
                    this.GameServer.SendSocketBinary(Socket, new Packet.StartMatchResponse(this.ResultTextEncrypted, timeEst, this.MatchID, oldCardNumber));
                    this.GameServer.SendSocketBinary(Socket, new Packet.UpdateBetInfoResponse(this.MatchBetInfo));
                }

                //Transfer BET
                var disConnectedUser = this.UserBetFind(User);
                if (disConnectedUser != 0) {
                    this.TransferBetForUser(Socket.UserModel, disConnectedUser);
                } else {
                }
                this.GameServer.OnUserEnterGameCompleted(User,disConnectedUser);
            }
        }


    }
    catch (e) {
        this.GameServer.Logger.Game().error('GameServer.prototype.UserEnterDesk - try err: ' + e.stack);
    }
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
    Socket.UserModel.OnUserLeftDesk();
    this.GameServer.UserInfoUpdateAll(Socket);

    for (var i = 0; i < this.ListUser.length; i++) {
        if (this.ListUser[i].UserID == Socket.UserModel.UserID) {
            this.ListUser.splice(i, 1);
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
DeskCore.prototype.GenSuitForResult = function(){
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
    try {
        var User = Socket.UserModel;

        if (this.DeskState != this.GameServer.DeskStateConfig.Open) {
            var msg = this.GameServer.GetUserMsgByLangCode(this.GameServer.Config.LanguageConfig.Baccarat_TimeUp, Socket.LangCode);
            this.UserBetError(User.Socket, msg, this.GameServer.Config.LanguageConfig.Baccarat_TimeUp.logMsg);
            //this.GameServer.ShowPopup(User.Socket, "Đã hết giờ đặt cược, vui lòng chờ ván tiếp theo");
            //this.GameServer.SendSocketBinary(Socket, new Packet.UserBetResponse(1));
            return;// Handle Error
        }

        if(User.BeginWallet < this.GameServer.BetLimitConfig.MinPlayableBeginWallet){
            var msg = this.GameServer.GetUserMsgByLangCode(this.GameServer.Config.LanguageConfig.Baccarat_RequiredMoney, Socket.LangCode);
            msg = msg.replace("%s", this.GameServer.BetLimitConfig.MinPlayableBeginWallet);

            this.UserBetError(User.Socket, msg, this.GameServer.Config.LanguageConfig.Baccarat_RequiredMoney.logMsg);
            //this.GameServer.ShowPopup(User.Socket, "Bạn phải có  " + this.GameServer.BetLimitConfig.MinPlayableBeginWallet +" để tham gia cược");
            //this.GameServer.SendSocketBinary(Socket, new Packet.UserBetResponse(1));
            return;// Handle Error
        }

        if (Utility.CheckVariable(BetList)) {
            if (Utility.CheckVariable(BetList)) {
                if(!this.CheckValidBetArr(BetList)){
                    var msg = this.GameServer.GetUserMsgByLangCode(this.GameServer.Config.LanguageConfig.Baccarat_BetBankerAndPlayer, Socket.LangCode);
                    this.UserBetError(User.Socket, msg, this.GameServer.Config.LanguageConfig.Baccarat_BetBankerAndPlayer.logMsg);
                    return;
                }

                var totalBet = 0;
                for (var i = 0; i < BetList.length; i++) {
                    if (Utility.CheckVariable(BetList[i], 'ID', 'Money')) {
                        if (BetList[i].Money < this.GameServer.BetLimitConfig.MinBet || BetList[i].Money < 0) {//ko xử lý case tào lao
                            var msg = this.GameServer.GetUserMsgByLangCode(this.GameServer.Config.LanguageConfig.Baccarat_BetTooSmall, Socket.LangCode);
                            msg = msg.replace("%s", this.GameServer.BetLimitConfig.MinBet);
                            this.UserBetError(User.Socket, msg, this.GameServer.Config.LanguageConfig.Baccarat_BetTooSmall.logMsg);
                            //this.GameServer.ShowPopup(User.Socket, "Không được cược bé hơn " + this.GameServer.BetLimitConfig.MinBet);
                            return;
                        }

                        if(!User.CheckValidBet(BetList[i].ID, this.GameServer.BetRatioConfig)){
                            var msg = this.GameServer.GetUserMsgByLangCode(this.GameServer.Config.LanguageConfig.Baccarat_BetBankerAndPlayer, Socket.LangCode);
                            this.UserBetError(User.Socket, msg, this.GameServer.Config.LanguageConfig.Baccarat_BetBankerAndPlayer.logMsg);
                            return;
                        }
                        totalBet += BetList[i].Money;
                    }
                }

                var allBet = User.GetUserTotalBet(this.MatchID) + totalBet;

                if (User.Wallet >= totalBet && allBet <= this.GameServer.BetLimitConfig.MaxBet) {
                    var isBetSuccess = false;

                    for (var i = 0; i < BetList.length; i++) {
                        if (Utility.CheckVariable(BetList[i], 'ID', 'Money')) {
                            if (User.Wallet >= BetList[i].Money) {
                                User.Wallet -= BetList[i].Money;
                                User.TotalGoldUserPayForSys += BetList[i].Money;
                                this.GameServer.AddStock(BetList[i].Money);
                                isBetSuccess = true;
                                User.OnUserBetSuccess(this.MatchID, BetList[i].ID, BetList[i].Money, this.GameServer.BetLimitConfig.Tax);

                                var bet = this.MatchBetInfoFindByID(BetList[i].ID);
                                if (bet == 0) {
                                    this.MatchBetInfo.push({
                                        ID: BetList[i].ID,
                                        Money: BetList[i].Money
                                    })
                                } else {
                                    bet.Money += BetList[i].Money;
                                }
                            }
                        }
                    }

                    if (isBetSuccess) {
                        this.BetStateChanged = true;
                        var ErrorCode = 0;
                        this.GameServer.SendSocketBinary(Socket, new Packet.UserBetResponse(ErrorCode));
                        this.UpdateMoneyForUser(Socket.UserModel);
                        this.UserBetInsertUpdate(User);
                        return;
                    }
                }
                else {
                    if (allBet > this.GameServer.BetLimitConfig.MaxBet) {
                        //handle max bet
                        var msg = this.GameServer.GetUserMsgByLangCode(this.GameServer.Config.LanguageConfig.Baccarat_BetTooBig, Socket.LangCode);
                        msg = msg.replace("%s", this.GameServer.BetLimitConfig.MaxBet);
                        this.UserBetError(User.Socket, msg, this.GameServer.Config.LanguageConfig.Baccarat_BetTooBig.logMsg);
                        //this.GameServer.ShowPopup(User.Socket, "Tổng cược của bạn đã vượt mức " + this.GameServer.BetLimitConfig.MaxBet);
                    }else{
                        var msg = this.GameServer.GetUserMsgByLangCode(this.GameServer.Config.LanguageConfig.Baccarat_NotEnoughMoney, Socket.LangCode);
                        this.UserBetError(User.Socket, msg, this.GameServer.Config.LanguageConfig.Baccarat_NotEnoughMoney.logMsg);
                    }
                }
            }
        }
        else{
            console.log("BETLIST ERROR ", BetList);
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.OnUserBet ', e.stack);
    }
};

DeskCore.prototype.UserBetError = function(Socket, msg, logMsg){
    try{
        this.GameServer.ShowPopup(Socket, msg);
        this.GameServer.SendSocketBinary(Socket, new Packet.UserBetResponse(1));
        this.GameServer.Logger.Game().debug('UserBetError', logMsg);
        this.GameServer.Logger.Game().debug('UserBetError', Socket.UserModel.UserID, msg);
    }
    catch(e){
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
        User.MatchPlayed++;
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
                if(WinIndex > -1){
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
                }else {
                    //Méo trúng
                    if(bet.ID == this.GameServer.BetRatioConfig.PlayerWin.ID || bet.ID == this.GameServer.BetRatioConfig.BankerWin.ID){
                        var DrawIndex = WinList.indexOf(this.GameServer.BetRatioConfig.Draw.ID);
                        if(DrawIndex > - 1){
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
            }
            else{
                if(UpdateMoney){
                    this.UpdateMoneyForUser(User);
                }
            }
            this.CalcComboWinLose(User, history.BetList, history.TotalBet, history.TotalWin);
            this.GameServer.OnUserEndMatch(User,history.BetList,UserWinList)
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
DeskCore.prototype.UpdateMoneyForUser = function(User){
    this.GameServer.SendSocketBinary(User.Socket, new Packet.UpdateUserGoldResponse(User.Wallet));
};
DeskCore.prototype.GetBetRatioByID = function (BetID) {
    for(var prop in this.BetRatioConfig){
        if(this.BetRatioConfig[prop].ID == BetID){
            return this.BetRatioConfig[prop].Ratio;
        }
    }

    return 0;
};
DeskCore.prototype.HandleUserWin = function(User, UserWinList, TotalWin){
    try{
        if (User.UserState == this.GameServer.UserStateDefine.JoinRoomCompleted) {//User đang ko ở trạng thái khác
            User.Wallet += TotalWin;
            this.GameServer.SendSocketBinary(User.Socket, new Packet.UserResultResponse(UserWinList));
            this.UpdateMoneyForUser(User);
        }
        else{
            if (User.UserState == this.GameServer.UserStateDefine.LogOut) {
                this.GameServer.MoneyRefundWinGoldForOfflineUser(User, TotalWin);
            } else {
                this.GameServer.Logger.Game().error('DeskCore.prototype.HandleUserWin - Trạng thái refund bất thường', User.UserState, "TotalWin Gold", TotalWin);
            }
        }
    }
    catch(e){
        this.GameServer.Logger.Game().error('DeskCore.prototype.HandleUserWin ', e.stack);
    }
}

DeskCore.prototype.UserBetFind = function (User) {
    for (var i = 0; i < this.ListUserBet.length; i++) {
        if (this.ListUserBet[i].UserID == User.UserID) {
            return this.ListUserBet[i];
        }
    }
    return 0;
};

DeskCore.prototype.UserBetInsertUpdate = function (User) {
    if (this.UserBetFind(User) == 0) {
        this.ListUserBet.push(User);
    }
};

DeskCore.prototype.OnStartRoundCompleted = function () {
    try {
        this.DeskState = this.GameServer.DeskStateConfig.Open;
        this.StartRoundTime = +new Date();
        this.BetStateChanged = false;

        this.DeskSendAllUser(new Packet.StartMatchResponse(this.ResultTextEncrypted, this.MatchRoundTime, this.MatchID, this.CardPool.length));
        //Bắt đầu trận , đợi kết thúc.
        setTimeout(function () {
            this.EndRound();
        }.bind(this), this.MatchRoundTime * 1000);
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.OnStartRoundCompleted ', e.stack);
    }

};

DeskCore.prototype.EndRound = function(){
    try{
        this.DeskState = this.GameServer.DeskStateConfig.Close;

        //this.InsertHistory(this.ResultDices);

        var rs = this.CalcWinForUser();
        if (Utility.CheckVariable(rs, 'Win', 'Lose', 'Tax')) {
            var str_ResultWithSuit = this.GetResultWithSuitByString();
            this.GameServer.RecordMatchInfo(this.MatchID, this.DeskID, str_ResultWithSuit, this.ResultText, this.ResultTextEncrypted, rs.Win, rs.Lose, rs.Tax, this.GameServer.BetLimitConfig.Tax)
        }

        this.GameServer.CheckStockAndMaintain(); // Gọi server check lại stock;
        setTimeout(function () {
            this.StartRound();
        }.bind(this), this.MatchNextRoundTime * 1000);
    }
    catch(e){
        this.GameServer.Logger.Game().error('DeskCore.prototype.EndRound ', e.stack);
    }
};


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

DeskCore.prototype.MatchBetInfoFindByID = function (ID) {
    for (var i = 0; i < this.MatchBetInfo.length; i++) {
        if (this.MatchBetInfo[i].ID == ID) {
            return this.MatchBetInfo[i]
        }
    }
    return 0;
};

DeskCore.prototype.GetResultWithSuitByString = function(){
    var Result = "";

    //Banker
    Result += "B:";
    for(var i = 0; i < this.ResultWithSuit.BankerCards.length; i++){
        var Card = this.ResultWithSuit.BankerCards[i];
        var Text = "" + Card.Score + "." + Card.Suit + ",";

        if(i == this.ResultWithSuit.BankerCards.length - 1){
            Text = Text.substring(0, Text.length - 1);
        }

        Result += Text;
    }

    //Player
    Result += "_P:";
    for(var i = 0; i < this.ResultWithSuit.PlayerCards.length; i++){
        var Card = this.ResultWithSuit.PlayerCards[i];
        var Text = "" + Card.Score + "." + Card.Suit + ",";

        if(i == this.ResultWithSuit.PlayerCards.length - 1){
            Text = Text.substring(0, Text.length - 1);
        }

        Result += Text;
    }

    return Result;
};

DeskCore.prototype.InsertHistory = function (Dices) {
    var i;
    if (this.History.length < 240) {
        for (i = 0; i < Dices.length; i++) {
            this.History.push(Dices[i]);
        }

    } else {
        for (i = 0; i < Dices.length; i++) {
            this.History.splice(0, 1);
            this.History.push(Dices[i]);
        }

    }
};

DeskCore.prototype.CheckPair = function(Cards){
    if(Cards[0] == Cards[1]){
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

DeskCore.prototype.GenMatchHistory = function(){
    try{
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

        if(this.MatchHistory.length > this.MatchHistoryLimit){
            this.MatchHistory.splice(0, 1);
        }
    }
    catch(e){
        this.GameServer.Logger.Game().error('DeskCore.prototype.GenMatchHistory ', e.stack);
    }
};

DeskCore.prototype.UserGetMatchHistory = function(Socket){
    try{
        this.GameServer.SendSocketBinary(Socket, new Packet.MatchHistoryResponse(this.MatchHistory));
    }
    catch(e){
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

DeskCore.prototype.InitHistory = function(){
    try{
        var InitHistory = this.GameServer.InitHistory;

        for(var i = 0; i  < InitHistory.length; i++){
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
    }
    catch(e){
        this.GameServer.Logger.Game().error('DeskCore.prototype.InitHistory Get DataErr', e);
    }
};

DeskCore.prototype.GenCardPool = function(){
    try{
        this.CardPool = [];
        for(var i = 0 ; i < this.NumberOfCardPack; i++){
            for(var j = 1; j < 14; j++){
                for(var k = 1; k < 5; k++){
                    this.CardPool.push({
                        Score: j,
                        Suit: k
                    })
                }
            }
        }
    }
    catch(e){
        this.GameServer.Logger.Game().error('DeskCore.prototype.GenCardPack Get DataErr', e);
    }
};

DeskCore.prototype.CheckCardPool = function(){
    try{
        var CardPool = this.CardPool.slice();
        //BankerCards
        for(var i = 0; i < this.ResultWithSuit.BankerCards.length; i++){
            var CardIndex = -1;

            for(var j = 0; j < CardPool.length; j++){
                if(CardPool[j].Score == this.ResultWithSuit.BankerCards[i].Score
                && CardPool[j].Suit == this.ResultWithSuit.BankerCards[i].Suit){
                    CardIndex = j;
                    break;
                }
            }

            if(CardIndex > -1){
                CardPool.splice(CardIndex, 1);
            }
            else{
                return false;
            }
        }

        //PlayerCards
        for(var i = 0; i < this.ResultWithSuit.PlayerCards.length; i++){
            var CardIndex = -1;

            for(var j = 0; j < CardPool.length; j++){
                if(CardPool[j].Score == this.ResultWithSuit.PlayerCards[i].Score
                    && CardPool[j].Suit == this.ResultWithSuit.PlayerCards[i].Suit){
                    CardIndex = j;
                    break;
                }
            }

            if(CardIndex > -1){
                CardPool.splice(CardIndex, 1);
            }
            else{
                return false;
            }
        }

        return true;
    }
    catch(e){
        this.GameServer.Logger.Game().error('DeskCore.prototype.DrawCardFromCardPool Err', e);
    }
};

DeskCore.prototype.PopSpecificCard = function(Card){
    try{
        var CardIndex = this.CardPool.indexOf(Card);

        for(var i = 0; i < this.CardPool.length; i++){
            if(Card.Score == this.CardPool[i].Score
            && Card.Suit == this.CardPool[i].Suit){
                CardIndex = i;
                break;
            }
        }

        if(CardIndex > -1){
            this.CardPool.splice(CardIndex, 1);
        }
    }
    catch(e){
        this.GameServer.Logger.Game().error('DeskCore.prototype.PopSpecificCard Err', e);
    }
};

DeskCore.prototype.DrawCardForMatch = function(){
    try{
        //Banker
        for(var i = 0; i < this.ResultWithSuit.BankerCards.length; i++){
            this.PopSpecificCard(this.ResultWithSuit.BankerCards[i]);
        }

        //Player
        for(var i = 0; i < this.ResultWithSuit.PlayerCards.length; i++){
            this.PopSpecificCard(this.ResultWithSuit.PlayerCards[i]);
        }
    }
    catch(e){
        this.GameServer.Logger.Game().error('DeskCore.prototype.DrawCardForMatch Err', e);
    }
};

DeskCore.prototype.CheckAndDrawCard = function(){
    try{
        //Check xem co bai ko
        if(this.CheckCardPool()){
        }
        else{
            //ko du la, gen bai moi
            this.GenCardPool();
        }

        //tru bot la bai
        this.DrawCardForMatch();
    }
    catch(e){
        this.GameServer.Logger.Game().error('DeskCore.prototype.CheckAndDrawCard Err', e);
    }
};

DeskCore.prototype.CheckValidBetArr = function(BetArr){
    try{
        //khong the bet ca Player va Banker
        var BetPlayer = 0;
        var BetBanker = 0;
        for(var i = 0 ; i < BetArr.length; i++){
            if(BetArr[i].ID == this.GameServer.BetRatioConfig.PlayerWin.ID){
                BetPlayer = 1;
            }

            if(BetArr[i].ID == this.GameServer.BetRatioConfig.BankerWin.ID){
                BetBanker = 1;
            }
        }

        if(BetBanker && BetPlayer){
            return false;
        }

        return true;
    }
    catch(e){
        this.GameServer.Logger.Game().error('DeskCore.prototype.CheckValidBetArr Err', e);
    }
};

DeskCore.prototype.CalcTimeForNextMatch = function(){
    var AdditionalBankerCard = 0;
    var AdditionalPlayerCard = 0;
    var TimePerCard = 2;

    if(this.ResultCardsBanker.length > 2){
        AdditionalBankerCard = 1;
    }

    if(this.ResultCardsPlayer.length > 2){
        AdditionalPlayerCard = 1;
    }

    this.MatchNextRoundTime = 18 + (AdditionalBankerCard + AdditionalPlayerCard) * TimePerCard;
};

DeskCore.prototype.CalcComboWinLose = function (User, BetList, TotalBet, TotalWin) {
    if (this.CheckRuleAntiCheat(BetList)) return;
    var score = 0;
    if (TotalWin > TotalBet) { // Win
        score = 1; // Win
    } else {
        score = -1; // Lose
    }
    if (!Utility.CheckVariable(User, 'MaxComboWin', 'MaxComboLose', 'ComboWinLose')) {
        User.MaxComboWin = 0;
        User.MaxComboLose = 0;
        User.ComboWinLose = 0;
    }
    if (score > 0 && User.ComboWinLose < 0) { // đang chuỗi Win nhưng lose
        User.ComboWinLose = 0;
    }
    if (score < 0 && User.ComboWinLose > 0) { // đang chuỗi lsoe nhưng win
        User.ComboWinLose = 0;
    }
    User.ComboWinLose += score;
    if (User.ComboWinLose > 0 && User.MaxComboWin < User.ComboWinLose) {
        //Chuỗi Win và MaxComboWin < chuỗi hiện tại
        User.MaxComboWin = User.ComboWinLose;
    }
    if (User.ComboWinLose < 0 && User.MaxComboLose < Math.abs(User.ComboWinLose)) {
        //Chuỗi Lose và MaxComboLose < chuỗi hiện tại (vì chuỗi âm nên phải abs)
        User.MaxComboLose = Math.abs(User.ComboWinLose);
    }
};

DeskCore.prototype.CheckRuleAntiCheat = function (BetList) {
    return 0;
};