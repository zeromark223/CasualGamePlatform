/*{"build":1}*/
var rootFile = __stack[0].getFileName();
var path = require('path');
var cDir = path.dirname(rootFile);
var Utility = require(path.resolve(cDir, '../../SharedModule/Utility'));
var Packet = require('../Packet');
var ConfigBingo = require('../../Config/Bingo');

function DeskClassical() {
    this.DeskID = 0;
    this.GameServer = 0;
    this.IsReadyForMaintain = true;
    this.SecretKey = Utility.GetUUID(); // SecretKey cũng từ gen, không cho can thiệp.
    this.BetRatioConfig = [];
    this.DeskState = '';
    this.ListUser = [];
    this.DeskState = '';
    this.MaxBetHistory = 40;

    //
    this.CardPrice = 10000; // 10.000
    this.MaxCall = 28;
    this.DeskKind = 0;
    this.MatchID = 0;
    // for treasure
    this.TreasureValue = 0;
    this.TreasureInit = 1000000; // 1.000.000
    //
    this.ListUserPlaying = [];
    this.ListCalledNumber = [];
    //
    this.SecondPrepare = 6; // giai doan chuan bi la 5s
    this.SecondCallNumber = 4; // khoang cach giua 2 lan goi so la 4s
    this.SecondShowResult = 20; //
    this.ListNumber = [];
}

module.exports = DeskClassical;

DeskClassical.prototype.LoadTreasureValue = function () {
    this.GameServer.RedisAdapter.get(this.RedisKeyTreasureValue, function (e, d) {
        if (!e) { // call command get success
            if (!d) {
                // chua co data
                this.TreasureValue = this.TreasureInit;
                this.GameServer.RedisAdapter.set(this.RedisKeyTreasureValue, this.TreasureValue);
                this.GameServer.Logger.Game().info('DeskClassical.prototype.LoadTreasureValue data null, init treasure: ', this.RedisKeyTreasureValue, this.TreasureValue, ', Card Price: ', this.CardPrice);
            } else {
                this.TreasureValue = +d;
                this.GameServer.Logger.Game().info('DeskClassical.prototype.LoadTreasureValue. data available: ', this.RedisKeyTreasureValue, d, this.TreasureValue, ', Card Price: ', this.CardPrice);
            }
        } else { // execute command [get] fail
            this.TreasureValue = this.TreasureInit; // 1.000.000
            this.GameServer.Logger.Game().error('DeskClassical.prototype.LoadTreasureValue execute command [get] fail, init treasure: ', this.RedisKeyTreasureValue, this.TreasureValue, ', Card Price: ', this.CardPrice);
        }
    }.bind(this));
};
DeskClassical.prototype.AddTreasureValue = function (value) {
    this.TreasureValue += value;
    this.GameServer.Logger.Game().info('DeskClassical.prototype.AddTreasureValue', this.RedisKeyTreasureValue, this.TreasureValue);
    // this.DeskSendAllUser(new Packet.UpdateTreasureResponse(this.TreasureValue));
    this.GameServer.RedisAdapter.set(this.RedisKeyTreasureValue, this.TreasureValue);
};

DeskClassical.prototype.ResetTreasureValue = function () {
    let iOldValue = this.TreasureValue;
    this.TreasureValue = this.TreasureInit;
    this.GameServer.Logger.Game().info('DeskClassical.prototype.ResetTreasureValue', this.RedisKeyTreasureValue, iOldValue, this.TreasureValue);
    // this.DeskSendAllUser(new Packet.UpdateTreasureResponse(this.TreasureValue));
    this.GameServer.RedisAdapter.set(this.RedisKeyTreasureValue, this.TreasureValue);
};
DeskClassical.prototype.GetTreasureValue = function () {
    return this.TreasureValue;
};

DeskClassical.prototype.GetDeskKind = function () {
    return this.DeskKind;
};

DeskClassical.prototype.GetCardPrice = function () {
    return this.CardPrice;
};

/**
 * @return {boolean}
 */
DeskClassical.prototype.IsLobby = function () {
    return false;
};
DeskClassical.prototype.Init = function (GameServer, DeskID, DeskKind, CardPrice, TreasureInit) {
    this.GameServer = GameServer;
    this.DeskID = DeskID;
    this.DeskKind = DeskKind;
    this.CardPrice = CardPrice;
    this.TreasureInit = TreasureInit;
    //
    this.DeskState = this.GameServer.DeskBingoStateConfig.Prepare;
    //
    this.BetRatioConfig = GameServer.Config.BetRatioConfig;
    //
    this.RedisKeyTreasureValue = this.GameServer.Config.RedisConfig.Define.BingoTreasure + ':' + this.DeskKind + ':' + this.CardPrice;
    //
    this.MaxCall = this.GameServer.BetLimitConfig.ClassicalMaxCall;
    // load treasure
    this.LoadTreasureValue();
};

/**
 * @return {number}
 */
DeskClassical.prototype.IsAvailable = function () {
    return 1;
};

DeskClassical.prototype.ReplaceUserDisconnectByUserOnline = function (User, DisconnectedUser) {
    for (var i = 0; i < this.ListUserPlaying.length; i++) {
        if (this.ListUserPlaying[i].UserID == DisconnectedUser.UserID) {
            if (this.ListUserPlaying[i].UserTrackingID != DisconnectedUser.UserTrackingID) {
                this.GameServer.Logger.Game().error('DeskClassical.prototype.ReplaceUserDisconnectByUserOnline transfer bất thường', this.ListUserPlaying[i].UserTrackingID, DisconnectedUser.UserID);
            }
            this.ListUserPlaying[i] = User;
        }
    }

};

DeskClassical.prototype.DeskSendAllUser = function (Msg) {
    try {
        for (var i = 0; i < this.ListUser.length; i++) {
            this.GameServer.SendSocketBinary(this.ListUser[i].Socket, Msg);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskClassical.prototype.DeskSendAllUser ', e.stack);
    }
};
/**
 * called when destroy socket
 * @param Socket
 */
DeskClassical.prototype.UpdateUserLeftDesk = function (Socket) {
    Socket.UserModel.OnUserLeftDesk(); // set MyDesk = 0;
    this.GameServer.UserInfoUpdateAll(Socket);

    for (var i = 0; i < this.ListUser.length; i++) {
        if (this.ListUser[i].UserID == Socket.UserModel.UserID) {
            this.ListUser.splice(i, 1);
            return;
        }
    }
};

DeskClassical.prototype.DeskTimer2Second = function () {
    // neu trong desk khong co user thi DeskState luon luon = open
    // neu trong desk co user(ke ca offline user) thi chuyen sang trang thai countdown de change to state close for playing bingo
    // try {
    //     this.BroadcastBetInfo();
    // } catch (e) {
    //     this.GameServer.Logger.Game().error('DeskClassical.prototype.DeskTimer2Second ', e.stack);
    // }
};

DeskClassical.prototype.UpdateMoneyForUser = function (User) {
    this.GameServer.SendSocketBinary(User.Socket, new Packet.UpdateUserGoldResponse(User.Wallet));
};

/**
 * @return {number}
 */
DeskClassical.prototype.HandleUserWin = function (User, UserWinData, TotalWinGold) {
    this.GameServer.Logger.Game().info('DeskClassical.prototype.HandleUserWin ', User.UserID, User.GameName, UserWinData, TotalWinGold);
    try {
        if (User.UserState == this.GameServer.UserStateDefine.JoinRoomCompleted) {//User đang ko ở trạng thái khác
            let iAddedMoney = this.AddUserMoney(User, TotalWinGold, this.GetTax());
            UserWinData.WinGold = iAddedMoney;
            this.GameServer.SendSocketBinary(User.Socket, new Packet.GameResultResponse(UserWinData));
            return iAddedMoney;
        } else {
            if (User.UserState == this.GameServer.UserStateDefine.LogOut) {
                this.GameServer.MoneyRefundWinGoldForOfflineUser(User, TotalWinGold);
            } else {
                this.GameServer.Logger.Game().error('DeskClassical.prototype.HandleUserWin - Trạng thái refund bất thường', User.UserState, "TotalWin Gold", TotalWin);
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskClassical.prototype.HandleUserWin ', e.stack);
    }
    return 0;
};

DeskClassical.prototype.UserPlayingFind = function (User) {
    for (let i = 0; i < this.ListUserPlaying.length; i++) {
        if (this.ListUserPlaying[i].UserID == User.UserID) {
            return this.ListUserPlaying[i];
        }
    }
    return 0;
};

DeskClassical.prototype.UserPlayingInsertUpdate = function (User) {
    if (this.UserPlayingFind(User) == 0) {
        this.ListUserPlaying.push(User);
    }
};

/**
 * @return {number}
 */
DeskClassical.prototype.GetTax = function () {
    // let tax = (100 - this.GameServer.BetLimitConfig.Tax) / 100;
    //
    // if (tax > 1) {
    //     tax = 1;
    // } else {
    //     if (tax < 0) {
    //         tax = 0;
    //     }
    // }
    //
    // return tax;
    if (this.IsModeClassical()) {
        return this.GameServer.BetLimitConfig.TaxClassical;
    } else {
        return this.GameServer.BetLimitConfig.TaxEasy;
    }
};

DeskClassical.prototype.OnUserGetListUser = function (User) {
    this.GameServer.SendSocketBinary(User.Socket, new Packet.GetListUserResponse(this.ListUser));
};

DeskClassical.prototype.OnUserGameChat = function (User, Msg) {
    if (User.CheckChatRule(Msg)) {
        this.DeskSendAllUser(new Packet.GameChatResponse(User.UserID, User.GameName, Msg));
    } else {
        console.log("fail rule ", User.ChatTracking);
    }
};

DeskClassical.prototype.UserBetError = function (Socket, msg) {
    try {
        this.GameServer.ShowPopup(Socket, msg);
        let UserEnterGameResponse = { // 3003
            ErrorCode: 1,
            DeskState: this.GameServer.DeskBingoStateConfig.Prepare,
            TimeLeft: this.SecondPrepare,
            UserCards: [],
            CalledValues: [],
            CalledLeft: 0,
            DeskMode: this.GetDeskKind(),
            CardPrice: this.GetCardPrice()
        };
        this.GameServer.SendSocketBinary(Socket, new Packet.UserEnterGameResponse(UserEnterGameResponse));
        this.GameServer.Logger.Game().info('DeskClassical.prototype.UserBetError', Socket.UserModel.UserID, msg);
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskClassical.prototype.UserBetError ', e.stack);
    }
};

/**
 * @return {boolean}
 */
DeskClassical.prototype.OnUserPlay = function (Socket, NumCard) {
    this.GameServer.Logger.Game().info('DeskClassical.prototype.OnUserPlay', Socket.UserModel.UserID, Socket.UserModel.GameName, NumCard);

    try {
        let User = Socket.UserModel;
        //
        if (User.BeginWallet < this.GameServer.BetLimitConfig.MinPlayableBeginWallet) {
            this.UserBetError(Socket, "Bạn phải có:  " + this.GameServer.BetLimitConfig.MinPlayableBeginWallet + " để tham gia cược");
            return false;// Handle Error
        }
        // kiem tra tien
        // tru tien cua thang user neu no join vo room trong game state == play
        let iMoney = NumCard * this.GetCardPrice();
        let Cards = [];
        let Card4Calc = [];
        let modePlaying = false;
        if (this.GetGameState() == this.GameServer.DeskBingoStateConfig.Prepare) {
            if (this.SubUserMoney(User, iMoney) == false) {
                this.GameServer.Logger.Game().info('DeskClassical.prototype.OnUserPlay. Not enough money', User.Wallet, iMoney);
                let UserEnterGameResponse = { // 3003
                    ErrorCode: 1,
                    DeskState: this.GameServer.DeskBingoStateConfig.Prepare,
                    TimeLeft: this.SecondPrepare,
                    UserCards: [],
                    CalledValues: [],
                    CalledLeft: 0,
                    DeskMode: this.GetDeskKind(),
                    CardPrice: this.GetCardPrice()
                };
                this.GameServer.SendSocketBinary(User.Socket, new Packet.UserEnterGameResponse(UserEnterGameResponse));
                return false;
            }
            // generate card for user
            for (let k = 0; k < NumCard; k++) {
                let oResultGenerateBingoCard = this.GenerateBingoCard();
                Cards.push({Card: oResultGenerateBingoCard.Card});
                Card4Calc.push({Card: oResultGenerateBingoCard.Card4Calc});
            }
            modePlaying = true;
        }
        User.MoneyState = this.GameServer.MoneyStateDefine.JoinGameCompleted;
        User.OnUserEnterDesk(this);
        User.DeskID = this.DeskID;
        this.ListUser.push(User);
        // add data for playing user
        this.SetBingoDataForUser(User, NumCard, Cards, Card4Calc, this.GetCardPrice());
        // insert vo list playing user
        if (modePlaying) {
            let iOldLength = this.ListUserPlaying.length;
            this.UserPlayingInsertUpdate(User);
            if (iOldLength == 0 && this.ListUserPlaying.length > 0) {
                this.onDeskStatePrepare();
            }
        }
        let UserEnterGameResponse = { // 3003
            ErrorCode: 0,
            DeskState: this.GetGameState(),
            TimeLeft: this.GetTimeLeft(),
            UserCards: User.BingoData.Cards,
            CalledValues: this.ListCalledNumber,
            CalledLeft: this.GetCallLeft(),
            DeskMode: this.GetDeskKind(),
            CardPrice: this.GetCardPrice()
        };
        this.GameServer.SendSocketBinary(Socket, new Packet.UserEnterGameResponse(UserEnterGameResponse));
        // this.GameServer.OnUserEnterGameCompleted(User, disConnectedUser);
        // update treasure value
        this.DeskSendAllUser(new Packet.UpdateTreasureResponse(this.TreasureValue));
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskClassical.prototype.OnUserPlay - try err: ' + e.stack);
    }
    return true;
};

DeskClassical.prototype.GenerateBingoCard = function () {
    var arrB = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    var arrI = [16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30];
    var arrN = [31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
    var arrG = [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60];
    var arrO = [61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75];
    //
    this.ShuffleArray(arrB);
    this.ShuffleArray(arrI);
    this.ShuffleArray(arrN);
    this.ShuffleArray(arrG);
    this.ShuffleArray(arrO);
    //
    var Card = [];
    for (let i = 0; i < 5; i++) {
        Card.push(arrB[i]);
        Card.push(arrI[i]);
        Card.push(arrN[i]);
        Card.push(arrG[i]);
        Card.push(arrO[i]);
    }
    Card[12] = 0;
    // // TODO: remove me
    // this.GameServer.Logger.Game().info('DeskClassical.prototype.GenerateBingoCard: REMOVE ME');
    // Card = [4, 17, 39, 55, 66, 1, 16, 37, 53, 73, 11, 22, 0, 51, 74, 2, 26, 33, 47, 71, 3, 20, 38, 57, 64];
    //
    var Card4Calc = [];
    for (let k = 0; k < 25; k++) {
        Card4Calc.push(0);
    }
    Card4Calc[12] = 1;
    //
    // this.GameServer.Logger.Game().info('DeskClassical.prototype.GenerateBingoCard: ', Card, Card4Calc);
    return {Card: Card, Card4Calc: Card4Calc};
};
DeskClassical.prototype.ShuffleArray = function (array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
};
DeskClassical.prototype.OnReconnectUserPlay = function (Socket) {
    this.GameServer.Logger.Game().info('DeskClassical.prototype.OnReconnectUserPlay', Socket.UserModel.UserID, Socket.UserModel.GameName);
    try {
        let User = Socket.UserModel;
        User.MoneyState = this.GameServer.MoneyStateDefine.JoinGameCompleted;
        User.OnUserEnterDesk(this);
        User.DeskID = this.DeskID;
        this.ListUser.push(User);
        //
        let DisconnectedUser = this.UserPlayingFind(User);
        let oTransferBingoData = DisconnectedUser.BingoData;
        DisconnectedUser.BingoData = {};
        User.BingoData = oTransferBingoData;
        //
        this.ReplaceUserDisconnectByUserOnline(User, DisconnectedUser);
        //
        // let calledLeft = this.MaxCall - this.ListCalledNumber.length;
        let calledLeft = this.GetCallLeft();
        let UserEnterGameResponse = { // 3003
            ErrorCode: 0,
            DeskState: this.GetGameState(),
            TimeLeft: this.GetTimeLeft(),
            UserCards: User.BingoData.Cards,
            CalledValues: this.ListCalledNumber,
            CalledLeft: calledLeft,
            DeskMode: this.GetDeskKind(),
            CardPrice: this.GetCardPrice()
        };
        this.GameServer.SendSocketBinary(Socket, new Packet.UserEnterGameResponse(UserEnterGameResponse));
        // update treasure value
        this.DeskSendAllUser(new Packet.UpdateTreasureResponse(this.TreasureValue));
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskClassical.prototype.OnReconnectUserPlay - try err: ' + e.stack);
    }
};
DeskClassical.prototype.onDeskStatePrepare = function () {
    this.GameServer.Logger.Game().info('DeskClassical.prototype.onDeskStatePrepare', this.ListUserPlaying.length);
    this.UpdateGameState(this.GameServer.DeskBingoStateConfig.Prepare, this.SecondPrepare);
    //
    this.ListCalledNumber = [];
    this.CalculateMaxCall();
    //
    this.ListNumber = [];
    for (let i = 0; i < 75; i++) {
        this.ListNumber.push(i + 1);
    }
    this.ShuffleArray(this.ListNumber);
    // //TODO: remove me
    // this.ListNumber = [4, 17, 39, 55, 66, 1, 16, 37, 53, 73, 11, 22, 51, 74, 2, 26, 33, 47, 71, 3, 20, 38, 57, 64, 10, 21, 30, 40, 50];
    // this.GameServer.Logger.Game().error('DeskClassical.prototype.onDeskStatePrepare. REMOVE ME: ListNumber');
    //
    setTimeout(function () {
        this.onDeskStatePrepareEnd();
    }.bind(this), this.SecondPrepare * 1000);
};
DeskClassical.prototype.CalculateMaxCall = function () {
    if (this.IsModeClassical()) {
        this.MaxCall = this.GameServer.BetLimitConfig.ClassicalMaxCall;
    } else {
        this.MaxCall = 0;
        let iTotalCard = 0;
        for (let i = 0; i < this.ListUserPlaying.length; i++) {
            iTotalCard += this.ListUserPlaying[i].BingoData.Cards.length;
        }
        this.MaxCall = Math.floor(iTotalCard * 0.9);
        if (this.MaxCall <= 0) {
            this.MaxCall = 1;
        }
        this.GameServer.Logger.Game().info('DeskClassical.prototype.CalculateMaxCall: total card: ', iTotalCard, ', max call: ', this.MaxCall);
    }
};
DeskClassical.prototype.onDeskStatePrepareEnd = function () {
    // send message update game state for all user in desk
    this.UpdateGameState(this.GameServer.DeskBingoStateConfig.Play, this.SecondCallNumber);

    this.LogStartMatch(function (e, MatchID) {
        if (!e) {
            this.MatchID = MatchID;
            this.doPlay();
        } else {
            //handle error
            this.GameServer.Logger.Game().info('DeskClassical.prototype.onDeskStatePrepareEnd', e);
        }
    }.bind(this));
};

DeskClassical.prototype.doPlay = function () {

    this.CalculateMaxCall();
    //
    setTimeout(function () {
        this.onPlaying();
    }.bind(this), this.SecondCallNumber * 1000);
};

DeskClassical.prototype.onPlaying = function () {
    let numCalled = this.ListCalledNumber.length;
    let calledNumber = this.ListNumber[numCalled];
    this.ListCalledNumber.push(calledNumber);
    // auto check card for user
    this.CheckCardForPlayingUser(calledNumber);
    // send this number to all user in desk
    let callLeft = this.GetCallLeft();
    //
    this.DeskSendAllUser(new Packet.CallNumberResponse(calledNumber, callLeft));
    // update list user have bingo
    this.UpdatePlayingUserHasBingo();
    //
    if (this.CanEndGame()) {
        this.onEndGame();
    } else {
        setTimeout(function () {
            this.onPlaying();
        }.bind(this), this.SecondCallNumber * 1000);
        this.UpdateGameState(this.GameServer.DeskBingoStateConfig.Play, this.SecondCallNumber);
    }
};

DeskClassical.prototype.UpdatePlayingUserHasBingo = function () {
    let arrUserHasBingo = [];
    for (let i = 0; i < this.ListUserPlaying.length; i++) {
        let oUser = this.ListUserPlaying[i];
        let oBingoResult = this.CalculateFinalResultForPlayingUser(oUser);
        if (oBingoResult.MaxBingo > 0) {
            arrUserHasBingo.push({GameName: oUser.GameName, NumBingo: oBingoResult.MaxBingo});
        }
    }
    if (arrUserHasBingo.length > 0) {
        // sort DESC
        arrUserHasBingo.sort((a, b) => (a.NumBingo > b.NumBingo) ? -1 : ((b.NumBingo > a.NumBingo) ? 1 : 0));
        //
        if (arrUserHasBingo.length > 50) {
            arrUserHasBingo = arrUserHasBingo.slice(0, 50);
        }
        //
        this.GameServer.Logger.Game().info('DeskClassical.prototype.UpdatePlayingUserHasBingo', arrUserHasBingo);
        this.DeskSendAllUser(new Packet.UpdatePlayingUserHasBingoResponse(arrUserHasBingo));
    }
};

DeskClassical.prototype.CheckCardForPlayingUser = function (CalledNumber) {
    for (let ui = 0; ui < this.ListUserPlaying.length; ui++) {
        let arrCards = this.ListUserPlaying[ui].BingoData.Cards;
        let arrListCard4Calc = this.ListUserPlaying[ui].BingoData.Card4Calc;
        for (let ci = 0; ci < arrCards.length; ci++) {
            let idx = arrCards[ci].Card.indexOf(CalledNumber);
            if (idx >= 0) {
                arrListCard4Calc[ci].Card[idx] = 1;
            }
        }
    }
};

DeskClassical.prototype.CalculateFinalResultForPlayingUser = function (PlayingUser) {
    let arrCard4Calc = PlayingUser.BingoData.Card4Calc;
    let oResult = {MaxBingo: 0, TotalChecked: 0, CardResult: []};
    for (let j = 0; j < arrCard4Calc.length; j++) {
        let arrCardCheck = arrCard4Calc[j].Card;
        let oCardResult = this.CountBingo(arrCardCheck);
        oResult.TotalChecked += oCardResult.Checked;
        if (oCardResult.Bingo > oResult.MaxBingo) {
            oResult.MaxBingo = oCardResult.Bingo;
        }
        // push detail result
        oResult.CardResult.push(oCardResult);
    }
    // this.GameServer.Logger.Game().info('DeskClassical.prototype.CalculateFinalResultForPlayingUser',
    //     PlayingUser.UserID, PlayingUser.GameName, PlayingUser.BingoData, oResult);
    return oResult;
};

DeskClassical.prototype.CountBingo = function (arrCard4Calc) {
    let iNumBingo = 0;
    let iNumChecked = 0;
    for (let i = 0; i < arrCard4Calc.length; i++) {
        iNumChecked += arrCard4Calc[i];
    }
    for (let k = 0; k < 5; k++) {
        let sumNgang = arrCard4Calc[k * 5] + arrCard4Calc[k * 5 + 1] + arrCard4Calc[k * 5 + 2] + arrCard4Calc[k * 5 + 3] + arrCard4Calc[k * 5 + 4];
        iNumBingo += (sumNgang == 5) ? 1 : 0;
        //
        let sumDoc = arrCard4Calc[k] + arrCard4Calc[k + 5] + arrCard4Calc[k + 10] + arrCard4Calc[k + 15] + arrCard4Calc[k + 20];
        iNumBingo += (sumDoc == 5) ? 1 : 0;
    }
    // hang cheo
    let sumCheo1 = arrCard4Calc[0] + arrCard4Calc[6] + arrCard4Calc[12] + arrCard4Calc[18] + arrCard4Calc[24];
    iNumBingo += (sumCheo1 == 5) ? 1 : 0;
    //
    let sumCheo2 = arrCard4Calc[4] + arrCard4Calc[8] + arrCard4Calc[12] + arrCard4Calc[16] + arrCard4Calc[20];
    iNumBingo += (sumCheo2 == 5) ? 1 : 0;

    return {
        Bingo: iNumBingo,
        Checked: iNumChecked
    }
};
/**
 * @return {number}
 */
DeskClassical.prototype.GetCallLeft = function () {
    if (this.IsModeClassical()) {
        return this.MaxCall - this.ListCalledNumber.length;
    } else {
        let iCountBingo = 0;
        for (let n = 0; n < this.ListUserPlaying.length; n++) {
            let oPlayingUser = this.ListUserPlaying[n];
            let oUserBingoResult = this.CalculateFinalResultForPlayingUser(oPlayingUser);
            iCountBingo += oUserBingoResult.MaxBingo;
        }
        let result = this.MaxCall - iCountBingo;
        if (result < 0) {
            result = 0;
        }
        return result;
    }
};
/**
 * @return {boolean}
 */
DeskClassical.prototype.CanEndGame = function () {
    return this.GetCallLeft() <= 0;
};

DeskClassical.prototype.onEndGame = function () {
    this.UpdateGameState(this.GameServer.DeskBingoStateConfig.ShowResult, this.SecondShowResult);
    this.GameServer.Logger.Game().info('DeskClassical.prototype.onEndGame', this.DeskKind, this.CardPrice, this.SecondShowResult);
    // tinh toan tien cho user/system
    let arrListUserPlayingWinTreasure = [];
    let bNeedBuildTopWinList = false;
    let oLogEndMatchData = {TotalSysWin: 0, TotalSysLose: 0, TotalTax: 0};
    //
    for (let n = 0; n < this.ListUserPlaying.length; n++) {
        let oPlayingUser = this.ListUserPlaying[n];
        let oUserBingoResult = this.CalculateFinalResultForPlayingUser(oPlayingUser);
        //
        oLogEndMatchData.TotalSysWin += oPlayingUser.BingoData.NumCard * this.GetCardPrice();
        //
        oPlayingUser.BingoData.BingoResult = oUserBingoResult;
        // tinh toan tien win cho user
        let iTotalWinGold = 0;
        let bWinTreasure = false;
        for (let j = 0; j < oUserBingoResult.CardResult.length; j++) {
            let iNumBingo = oUserBingoResult.CardResult[j].Bingo;
            if (iNumBingo >= 5) {
                arrListUserPlayingWinTreasure.push(oPlayingUser);
                bWinTreasure = true;
            } else {
                if (this.IsModeClassical()) {
                    switch (iNumBingo) {
                        case 1:
                            iTotalWinGold += this.GetCardPrice();
                            break;
                        case 2:
                            iTotalWinGold += 2 * this.GetCardPrice();
                            break;
                        case 3:
                            iTotalWinGold += 3 * this.GetCardPrice();
                            break;
                        case 4:
                            iTotalWinGold += 5 * this.GetCardPrice();
                            break;
                    }
                } else {
                    switch (iNumBingo) {
                        case 1:
                            iTotalWinGold += this.GetCardPrice();
                            break;
                        case 2:
                            iTotalWinGold += 2 * this.GetCardPrice();
                            break;
                        case 3:
                            iTotalWinGold += 3 * this.GetCardPrice();
                            break;
                        case 4:
                            iTotalWinGold += 4 * this.GetCardPrice();
                            break;
                    }
                }
            }
        }
        oPlayingUser.BingoData.TotalWinGold = iTotalWinGold;
        //
        if (!bWinTreasure) {
            let iAddedGold = this.HandleUserWin(oPlayingUser, {
                WinGold: iTotalWinGold,
                MaxBingo: oUserBingoResult.MaxBingo,
                TotalChecked: oUserBingoResult.TotalChecked
            }, iTotalWinGold);
            // for log end match
            oLogEndMatchData.TotalSysLose += iAddedGold;
            oLogEndMatchData.TotalTax += (iTotalWinGold - iAddedGold);
            // record history
            let arrNumBingoPerCard = [];
            for (let k = 0; k < oPlayingUser.BingoData.BingoResult.CardResult.length; k++) {
                arrNumBingoPerCard.push(oPlayingUser.BingoData.BingoResult.CardResult[k].Bingo);
            }
            let history = {
                MatchID: this.MatchID,
                NumCard: oPlayingUser.BingoData.NumCard,
                CardPrice: this.GetCardPrice(),
                NumBingoPerCard: arrNumBingoPerCard,
                WinGold: iAddedGold,
                Time: Utility.FormatDateTime(new Date())
            };
            this.RecordUserBetHistory(oPlayingUser.UserID, JSON.stringify(history));
            //
            if (iAddedGold > 0) {
                this.CollectUserWinLose(oPlayingUser.GameName, iAddedGold);
                bNeedBuildTopWinList = true;
            }
            // log bet for user
            // let oLogUserBetData = {
            //     BetUserID: oPlayingUser.UserID,
            //     BetCardData: JSON.stringify(oPlayingUser.BingoData.BingoResult.CardResult),
            //     WinGold: iAddedGold,
            //     WinGoldWithTax: iTotalWinGold,
            //     BetUserChannelID: oPlayingUser.UserChannelID
            // };
            //
            this.LogUserBetEndGame({
                BetUserID: oPlayingUser.UserID,
                BetCardData: JSON.stringify(oPlayingUser.BingoData.BingoResult.CardResult),
                WinGold: iAddedGold,
                WinGoldWithTax: iTotalWinGold,
                BetUserChannelID: oPlayingUser.UserChannelID,
                BetGold: this.GetCardPrice() * oPlayingUser.BingoData.NumCard,
                IsWinTreasure: 0
            });
        }
    }
    //
    if (arrListUserPlayingWinTreasure.length > 0) {
        bNeedBuildTopWinList = true;
        //
        let lenUserWinTreasure = arrListUserPlayingWinTreasure.length;
        let iTotalWinTreasure = this.GetTreasureValue() / lenUserWinTreasure;
        for (let m = 0; m < lenUserWinTreasure; m++) {
            let oPlayingUser = arrListUserPlayingWinTreasure[m];
            // let oUserBingoResult = this.CalculateFinalResultForPlayingUser(oPlayingUser);
            let oUserBingoResult = oPlayingUser.BingoResult;
            let iTotalWinGold = iTotalWinTreasure + oPlayingUser.BingoData.TotalWinGold;
            let iAddedGold = this.HandleUserWin(oPlayingUser, {
                WinGold: iTotalWinGold,
                MaxBingo: oUserBingoResult.MaxBingo,
                TotalChecked: oUserBingoResult.TotalChecked
            }, iTotalWinGold);
            // for log end match
            oLogEndMatchData.TotalSysLose += iAddedGold;
            oLogEndMatchData.TotalTax += (iTotalWinGold - iAddedGold);
            //
            this.GameServer.Logger.Game().info('DeskClassical.prototype.onEndGame. onWinTreasure',
                oPlayingUser.UserID, oPlayingUser.GameName,
                oUserBingoResult, this.TreasureValue, 'lenUserWinTreasure: ', lenUserWinTreasure, iTotalWinGold, iAddedGold);
            // record history
            let arrNumBingoPerCard = [];
            for (let k = 0; k < oPlayingUser.BingoData.BingoResult.CardResult; k++) {
                arrNumBingoPerCard.push(oPlayingUser.BingoData.BingoResult.CardResult[k].Bingo);
            }
            // let history = {
            //     MatchID: this.MatchID,
            //     NumCard: oPlayingUser.BingoData.NumCard,
            //     CardPrice: this.GetCardPrice(),
            //     NumBingoPerCard: arrNumBingoPerCard,
            //     WinGold: iAddedGold,
            //     Time: Utility.FormatDateTime(new Date())
            // };
            this.RecordUserBetHistory(oPlayingUser.UserID, JSON.stringify({
                MatchID: this.MatchID,
                NumCard: oPlayingUser.BingoData.NumCard,
                CardPrice: this.GetCardPrice(),
                NumBingoPerCard: arrNumBingoPerCard,
                WinGold: iAddedGold,
                Time: Utility.FormatDateTime(new Date())
            }));
            // build top win
            this.CollectUserWinLose(oPlayingUser.GameName, iAddedGold);
            // log bet for user
            this.LogUserBet({
                BetUserID: oPlayingUser.UserID,
                BetCardData: JSON.stringify(oPlayingUser.BingoData.BingoResult.CardResult),
                BetGold: this.GetCardPrice() * oPlayingUser.BingoData.NumCard,
                WinGold: iAddedGold,
                WinGoldWithTax: iTotalWinGold,
                BetUserChannelID: oPlayingUser.UserChannelID,
                IsWinTreasure: 1
            });
        }
        // then reset treasure value
        this.ResetTreasureValue();
        // send new treasure value for all user in desk
        this.GameServer.Logger.Game().info('DeskClassical.prototype.onEndGame. Reset treasure value. new value: ', this.TreasureValue);
        this.DeskSendAllUser(new Packet.UpdateTreasureResponse(this.TreasureValue));
    }
    // rebuild top winner list
    if (bNeedBuildTopWinList) {
        this.BuildTopWinList();
    }
    // log end match
    this.LogEndMatch(oLogEndMatchData);
    // clear old data
    this.ListUserPlaying = [];
    this.ListNumber = [];
    this.ListCalledNumber = [];
    // update treasure value
    this.GameServer.Logger.Game().info('DeskClassical.prototype.onEndGame. treasure value', this.TreasureValue);
    this.DeskSendAllUser(new Packet.UpdateTreasureResponse(this.TreasureValue));
    // start game again
    setTimeout(function () {
        this.GenerateNewUserPlayingData();
        //
        if (this.ListUserPlaying.length > 0) {
            this.onDeskStatePrepare();
        } else {
            this.DeskState = this.GameServer.DeskBingoStateConfig.Prepare;
            this.GameServer.Logger.Game().info('DeskClassical.prototype.onEndGame. no more playing user', this.ListUserPlaying.length, 'game state', this.DeskState);
            this.GameServer.Logger.Game().info('----------------------------------------');
            this.GameServer.Logger.Game().info('----------------STOP BINGO--------------');
            this.GameServer.Logger.Game().info('----------------------------------------');
        }
    }.bind(this), this.SecondShowResult * 1000);
};
DeskClassical.prototype.GenerateNewUserPlayingData = function () {
    // generate new data for user
    for (let i = 0; i < this.ListUser.length; i++) {
        let oUser = this.ListUser[i];
        // neu user ney dang ky thoat thi kick no ra ngoai lobby
        if (oUser.BingoData.RequestQuit == 1) {
            this.GameServer.Logger.Game().info('DeskClassical.prototype.onEndGame. Remove user request quit', oUser.UserID, oUser.GameName);
            // kick user ra
            this.RemoveUser(oUser.Socket);
            // re-join room lobby
            this.GameServer.DeskLobby.UserEnterDesk(oUser.Socket);
            // gui message success
            this.GameServer.SendSocketBinary(oUser.Socket, new Packet.UserLeaveGameResponse(0));
            continue;
        }
        let iNumCard = oUser.BingoData.NumCard;
        // tinh toan neu thang user nay co du tien thi generate new data cho no, khong thi kick no out of desk
        let iMoney = iNumCard * this.GetCardPrice();
        if (this.SubUserMoney(oUser, iMoney) == false) {
            this.GameServer.Logger.Game().info('DeskClassical.prototype.onEndGame. Not enough money', oUser.UserID, oUser.GameName, oUser.Wallet, iMoney);
            // kick user ra
            this.RemoveUser(oUser.Socket);
            // re-join room lobby
            this.GameServer.DeskLobby.UserEnterDesk(oUser.Socket);
            // gui message success
            this.GameServer.SendSocketBinary(oUser.Socket, new Packet.UserLeaveGameResponse(0));
            //
            let UserEnterGameResponse = { // 3003
                ErrorCode: 1,
                DeskState: this.GameServer.DeskBingoStateConfig.Prepare,
                TimeLeft: this.SecondPrepare,
                UserCards: [],
                CalledValues: [],
                CalledLeft: 0,
                DeskMode: this.GetDeskKind(),
                CardPrice: this.GetCardPrice()
            };
            this.GameServer.SendSocketBinary(oUser.Socket, new Packet.UserEnterGameResponse(UserEnterGameResponse));

            continue;
        }
        let arrCard = [];
        let arrCard4Calc = [];
        for (let k = 0; k < iNumCard; k++) {
            let oResultGenerateBingoCard = this.GenerateBingoCard();
            arrCard.push({Card: oResultGenerateBingoCard.Card});
            arrCard4Calc.push({Card: oResultGenerateBingoCard.Card4Calc});
        }
        // add data for playing user
        this.SetBingoDataForUser(oUser, iNumCard, arrCard, arrCard4Calc, this.GetCardPrice());
        // let calledLeft = this.MaxCall - this.ListCalledNumber.length;
        let calledLeft = this.GetCallLeft();
        let UserEnterGameResponse = { // 3003
            ErrorCode: 0,
            DeskState: this.GameServer.DeskBingoStateConfig.Prepare,
            TimeLeft: this.SecondPrepare,
            UserCards: oUser.BingoData.Cards,
            CalledValues: this.ListCalledNumber,
            CalledLeft: calledLeft,
            DeskMode: this.GetDeskKind(),
            CardPrice: this.GetCardPrice()
        };
        this.GameServer.Logger.Game().info('DeskClassical.prototype.onEndGame. UserEnterGameResponse', UserEnterGameResponse);
        this.GameServer.SendSocketBinary(oUser.Socket, new Packet.UserEnterGameResponse(UserEnterGameResponse));
        // insert no vo list user dang choi
        this.UserPlayingInsertUpdate(oUser);
    }
};
DeskClassical.prototype.UpdateGameState = function (GameSate, Cooldown) {
    this.StateTime = +new Date();
    this.StateCooldown = Cooldown;
    //
    this.DeskState = GameSate;
    // this.GameServer.Logger.Game().info('DeskClassical.prototype.UpdateGameState', GameSate, Cooldown);
    this.DeskSendAllUser(new Packet.UpdateGameStateResponse(GameSate, Cooldown));
};

DeskClassical.prototype.GetGameState = function () {
    return this.DeskState;
};

/**
 * @return {number}
 */
DeskClassical.prototype.GetTimeLeft = function () {
    let current = +new Date();
    return Math.floor((this.StateTime / 1000) + this.StateCooldown - (current / 1000));
};

/**
 * @return {boolean}
 */
DeskClassical.prototype.SubUserMoney = function (User, Money) {
    this.GameServer.Logger.Game().info('DeskClassical.prototype.SubUserMoney', User.UserID, User.GameName, User.Wallet, Money);
    if (User.Wallet < Money) {
        // this.GameServer.ShowPopup(User.Socket, 'Bạn không đủ tiền');
        return false;
    }
    User.Wallet -= Money;
    this.UpdateMoneyForUser(User);
    // update treasure
    let iAddTreasure = Math.floor(Money / 100);
    this.AddTreasureValue(iAddTreasure);
    // update stock
    this.GameServer.AddStock(Money);
    return true;
};

/**
 * @return {number}
 */
DeskClassical.prototype.AddUserMoney = function (User, TotalWinGold, Tax) {

    let itax = (100 - Tax) / 100;

    if (itax > 1) {
        itax = 1;
    } else {
        if (itax < 0) {
            itax = 0;
        }
    }

    this.GameServer.Logger.Game().info('DeskClassical.prototype.AddUserMoney', User.UserID, User.GameName, User.Wallet, TotalWinGold, Tax, itax);
    let AddedGold = Math.floor(TotalWinGold * itax);
    User.Wallet += AddedGold;
    this.UpdateMoneyForUser(User);
    // update stock
    this.GameServer.AddStock(-AddedGold);
    return AddedGold;
};
DeskClassical.prototype.OnUserLeaveGame = function (Socket) {
    // kiem tra xem game state dang giai doan nao
    // neu la giai doan playing
    // thi kiem tra xem no co choi hay khong, neu la nguoi choi thi danh dau ket thuc van se kick user ra
    // neu no dang coi thi kick no ra ngoai luon
    // if (this.GetGameState == this.GameServer.DeskBingoStateConfig.Play) {
    // xem no co choi hay khong
    let oUser = this.UserPlayingFind(Socket.UserModel);
    if (oUser == 0) {
        // user khong choi, kick no ra
        this.RemoveUser(Socket);
        // re-join room lobby
        this.GameServer.DeskLobby.UserEnterDesk(Socket);
        // gui message success
        this.GameServer.SendSocketBinary(Socket, new Packet.UserLeaveGameResponse(0));
    } else {
        oUser.BingoData.RequestQuit = 1;
        // gui message success
        this.GameServer.SendSocketBinary(Socket, new Packet.UserLeaveGameResponse(1));
    }
};
DeskClassical.prototype.RemoveUser = function (Socket) {
    this.GameServer.Logger.Game().info('DeskClassical.prototype.RemoveUser ', Socket.UserModel.UserID, Socket.UserModel.GameName);
    Socket.UserModel.OnUserLeftDesk();
    //
    for (var i = 0; i < this.ListUser.length; i++) {
        if (this.ListUser[i].UserID == Socket.UserModel.UserID) {
            this.ListUser.splice(i, 1);
            break;
        }
    }
};
DeskClassical.prototype.SetBingoDataForUser = function (User, NumCard, Cards, Card4Calc, CardPrice) {

    // add data for playing user
    User.BingoData = {
        RequestQuit: 0,
        NumCard: NumCard,
        Cards: Cards,
        Card4Calc: Card4Calc,
        CardPrice: CardPrice,
        BingoResult: {},
        TotalWinGold: 0
    };
    // log bet
    if (User.BingoData.Cards.length > 0) {
        let arrCard = [];
        for (let i = 0; i < User.BingoData.Cards.length; i++) {
            arrCard.push(User.BingoData.Cards[i].Card);
        }
        let strCardData = JSON.stringify(arrCard);
        this.LogUserBet({
            BetUserID: User.UserID,
            BetCardData: strCardData,
            BetUserChannelID: User.UserChannelID,
            BetGold: NumCard * this.GetCardPrice()
        });
    }
};

DeskClassical.prototype.IsModeClassical = function () {
    return this.DeskKind == ConfigBingo.RoomKindConfig.BingoClassical;
};

DeskClassical.prototype.RecordUserBetHistory = function (UserID, HistoryStr) {
    try {
        let redisKey = this.GameServer.Config.RedisConfig.Define.BingoUserPlayHistory + this.DeskKind + ':' + UserID;
        this.GameServer.RedisAdapter.zAdd(redisKey, +new Date(), HistoryStr);
        this.GameServer.RedisAdapter.zCount(redisKey, function (e, d) {
            if (!e) {
                if (d > this.MaxBetHistory) {
                    let rem = d - this.MaxBetHistory;
                    this.GameServer.RedisAdapter.zRemByRank(redisKey, 0, rem);
                }
            }
        }.bind(this));
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskClassical.prototype.RecordUserBetHistory ', e);
    }
};

DeskClassical.prototype.UserGetUserHistory = function (User, UserHistoryInfo) {
    let redisKey = this.GameServer.Config.RedisConfig.Define.BingoUserPlayHistory + this.DeskKind + ':' + User.UserID;
    this.GameServer.RedisAdapter.zRange(redisKey, 0, -1,
        function (err, d) {
            if (!err) {
                try {
                    let h = [];
                    for (let i = 0; i < d.length; i++) {
                        let tmp = JSON.parse(d[i]);
                        // tmp.BetTime = tmp.BetTime ? tmp.BetTime : "2019-01-01 00:00:00";
                        h.push(tmp);
                    }
                    var msg = new Packet.UserHistoryResponse(h);
                    this.GameServer.SendSocketBinary(User.Socket, msg);
                } catch (ex) {
                    this.GameServer.Logger.Game().error('DeskClassical.prototype.UserGetUserHistory Build DataErr', ex.stack);
                }
            } else {
                this.GameServer.Logger.Game().error('DeskClassical.prototype.UserGetUserHistory Get DataErr', err);
            }
        }.bind(this));
};

DeskClassical.prototype.LogStartMatch = function (callback) {

    this.GameServer.LogRecorder.logStartMatch(this.DeskID, this.GameServer.GameServerID, this.DeskKind, this.CardPrice,
        this.GetTax(), this.GameServer.Stock, JSON.stringify(this.ListNumber),
        function (e, d) {
            if (!e) {
                if (Utility.CheckVariable(d, 'insertId')) {
                    callback(e, d.insertId);
                } else {
                    callback(e, d);
                }
            }
        }.bind(this));
};

DeskClassical.prototype.LogEndMatch = function (LogEndMatchData) {
    let strLineNumber = JSON.stringify(this.ListCalledNumber);
    let iTax = this.GetTax();
    let iRoomID = this.GameServer.GameServerID;
    let iStock = this.GameServer.Stock;
    //
    this.GameServer.LogRecorder.logEndMatch(this.MatchID, strLineNumber, LogEndMatchData.TotalSysWin, LogEndMatchData.TotalSysLose,
        LogEndMatchData.TotalTax, iTax, iStock, iRoomID, this.DeskID, this.DeskKind, this.CardPrice,
        function (e, d) {
            if (e) {
                this.GameServer.Logger.Game().error('DeskClassical.prototype.LogEndMatch Record Error ', this.MatchID, LogEndMatchData, e);
            }
        }.bind(this));
};

DeskClassical.prototype.CollectUserWinLose = function (GameName, TotalWin) {
    this.GameServer.CollectUserWinLose(this.DeskKind, GameName, TotalWin);
};

DeskClassical.prototype.BuildTopWinList = function () {
    this.GameServer.BuildTopWinList(this.DeskKind);
};

DeskClassical.prototype.LogUserBet = function (LogUserBetData) {
    this.GameServer.Logger.Game().info('DeskClassical.prototype.LogUserBet ', LogUserBetData);
    let iTax = this.GetTax();
    let iStock = this.GameServer.Stock;
    //
    this.GameServer.LogRecorder.logUserBet(LogUserBetData.BetUserID, LogUserBetData.BetCardData, LogUserBetData.BetGold, this.MatchID,
        iTax, iStock, LogUserBetData.WinTreasure, LogUserBetData.BetUserChannelID);
};

DeskClassical.prototype.LogUserBetEndGame = function (LogData) {
    this.GameServer.Logger.Game().info('DeskClassical.prototype.LogUserBetEndGame ', LogData);
    let iTax = this.GetTax();
    let iStock = this.GameServer.Stock;
    //
    // LogRecorder.logUserBetEndGame = function (MatchID, UserID, CardData, BetGold, Tax, CurrentStock, WinGold, WinGoldWithTax, WinTreasure, UserChannelID) {
    this.GameServer.LogRecorder.logUserBetEndGame(this.MatchID, LogData.BetUserID, LogData.BetCardData, LogData.BetGold,
        iTax, iStock, LogData.WinGold, LogData.WinGoldWithTax, LogData.IsWinTreasure, LogData.BetUserChannelID);
};
