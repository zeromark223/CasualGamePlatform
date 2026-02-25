/*{"build":1}*/
var rootFile = __stack[0].getFileName();
var path = require('path');
var cDir = path.dirname(rootFile);
var Utility = require(path.resolve(cDir, '../../SharedModule/Utility'));
// var Packet = require(path.resolve(cDir, '../Packet'));
// var Engine = require(path.resolve(cDir, './Engine'));
var Packet = require('../Packet');
var Encrytion = require(path.resolve(cDir, '../../SharedModule/encrytion'));

function DeskCore() {
    this.DeskID = 0;
    this.GameServer = 0;
    this.StockRatio = 1;
    this.IsReadyForMaintain = true;
    this.SecretKey = Utility.GetUUID(); // SecretKey cũng từ gen, không cho can thiệp.
    this.BetRatioConfig = [];
    this.ResultDices = [];
    this.ResultText = '';
    this.DeskState = '';
    this.ListUser = [];
    this.ListUserBet = [];
    this.MatchBetInfo = [];
    this.DeskState = '';
    this.MaxBetHistory = 40;

    this.BetStateChanged = false;
    this.MatchRoundTime = 40;
    this.StartRoundTime = +new Date();
    this.ResultWithSuit = [];
    this.MatchHistory = [];
    this.MatchNextRoundTime = 15;
    this.MatchHistoryLimit = 100;
    this.TopUserWinListBinary = 0;
    //
    this.Map = {};
}

module.exports = DeskCore;
DeskCore.prototype.Init = function (GameServer, DeskID) {
    this.DeskID = DeskID;
    this.GameServer = GameServer;
    this.BetRatioConfig = GameServer.Config.BetRatioConfig;
    this.StartRound();
};

DeskCore.prototype.StartRound = function () {
    this.GameServer.Logger.Game().info('DeskCore.prototype.StartRound, DeskID : ', this.DeskID, ', MatchID: ', this.MatchID);
    if (this.GameServer.MaintainFlag) {
        this.IsReadyForMaintain = true;
        return;
    }
    // Check Stock của hệ thống, nếu vẫn đảm bảo mới được start ván.
    this.BuildTopWinList();//Tạo top win của ván trước
    this.IsReadyForMaintain = false;
    this.ListUserBet = [];
    this.MatchBetInfo = [];
    this.ResultDices = [];


    this.Map[this.BetRatioConfig.Tai.ID] = [];
    this.Map[this.BetRatioConfig.Xiu.ID] = [];

    this.InitDices();
};

DeskCore.prototype.InitDices = function () {
    // 3 dices -> random 3 times
    for (var i = 0; i < 3; i++) {
        this.ResultDices.push(this.RandomDices());
    }
    //
    this.ResultText = this.GenResultText(this.ResultDices);
    this.ResultTextEncrypted = this.EncryptResultText(this.ResultText);
    this.GameServer.GenMatchInfo(this.DeskID, this.GameServer.BetLimitConfig.Tax, this.ResultTextEncrypted,
        function (e, MatchID) {
            if (!e) {
                this.MatchID = MatchID;
                this.OnStartRoundCompleted();
            } else {
                this.GameServer.Logger.Game().error('GameServer.prototype.InitDices - GenMatchInfo err : ' ,e);
                //handle error
            }
        }.bind(this));
};

/**
 * @return {number}
 */
DeskCore.prototype.GetScore = function (List) {
    var score = 0;
    for (var i = 0; i < List.length; i++) {
        score += +List[i];
    }
    return score;
};

/**
 * @return {number}
 */
DeskCore.prototype.RandomDices = function () {
    // Returns a random integer between min (include) and max (include)
    // Math.floor(Math.random() * (max - min + 1)) + min;
    return Math.floor(Math.random() * 6) + 1;
};

DeskCore.prototype.GetRoomConfig = function (Socket) {
    try {
        var MinBet = this.GameServer.BetLimitConfig.MinBet;
        var MaxBet = this.GameServer.BetLimitConfig.MaxBet;

        var GameConfig = {
            MinBet: MinBet,
            MaxBet: MaxBet,
            RoomID: this.DeskID
        };

        var msg = new Packet.GetRoomConfigResponse(GameConfig);
        this.GameServer.SendSocketBinary(Socket, msg);
    } catch (e) {
        this.GameServer.Logger.Game().error('GameServer.prototype.GetRoomConfig - try err: ' + e.stack);
    }
};

/**
 * @return {number}
 */
DeskCore.prototype.IsAvailable = function () {
    return 1;
};

DeskCore.prototype.UserEnterDesk = function (Socket) {
    this.GameServer.Logger.Game().info('DeskCore.prototype.UserEnterDesk', Socket.UserModel.UserID, Socket.UserModel.GameName);
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
                    this.GameServer.SendSocketBinary(Socket, new Packet.StartMatchResponse(this.ResultTextEncrypted, timeEst, this.MatchID));
                    this.GameServer.SendSocketBinary(Socket, new Packet.UpdateBetInfoResponse(this.MatchBetInfo));
                }

                //Transfer BET
                var disConnectedUser = this.UserBetFind(User);
                if (disConnectedUser != 0) {
                    this.TransferBetForUser(Socket.UserModel, disConnectedUser);
                } else {
                }
                this.GameServer.OnUserEnterGameCompleted(User, disConnectedUser);
            }
        }


    } catch (e) {
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

DeskCore.prototype.GenResultText = function (dices) {
    return Encrytion.sha256(Utility.GetUUID() + this.SecretKey) + '_' + dices.join(',');
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
        var msg = new Packet.EndMatchResultResponse(this.ResultDices, this.ResultText, this.MatchNextRoundTime, WinList);
        this.DeskSendAllUser(msg);
        this.GenMatchHistory();
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.OnShowResult ', e.stack);
    }
};

DeskCore.prototype.UserBet = function (Socket, BetList) {
    try {
        var User = Socket.UserModel;

        if (this.DeskState != this.GameServer.DeskStateConfig.Open) {
            this.UserBetError(User.Socket, "Đã hết giờ đặt cược, vui lòng chờ ván tiếp theo");
            //this.GameServer.ShowPopup(User.Socket, "Đã hết giờ đặt cược, vui lòng chờ ván tiếp theo");
            //this.GameServer.SendSocketBinary(Socket, new Packet.UserBetResponse(1));
            return;// Handle Error
        }

        if (User.BeginWallet < this.GameServer.BetLimitConfig.MinPlayableBeginWallet) {
            this.UserBetError(User.Socket, "Bạn phải có  " + this.GameServer.BetLimitConfig.MinPlayableBeginWallet + " để tham gia cược");
            //this.GameServer.ShowPopup(User.Socket, "Bạn phải có  " + this.GameServer.BetLimitConfig.MinPlayableBeginWallet +" để tham gia cược");
            //this.GameServer.SendSocketBinary(Socket, new Packet.UserBetResponse(1));
            return;// Handle Error
        }

        if (Utility.CheckVariable(BetList)) {
            if (Utility.CheckVariable(BetList)) {
                if (!this.CheckValidBetArr(BetList)) {
                    this.UserBetError(User.Socket, "Không được cược cả 2 cửa");
                    return;
                }

                var totalBet = 0;
                for (var i = 0; i < BetList.length; i++) {
                    if (Utility.CheckVariable(BetList[i], 'ID', 'Money')) {
                        if (BetList[i].Money < this.GameServer.BetLimitConfig.MinBet || BetList[i].Money < 0) {//ko xử lý case tào lao
                            this.UserBetError(User.Socket, "Không được cược bé hơn " + this.GameServer.BetLimitConfig.MinBet);
                            //this.GameServer.ShowPopup(User.Socket, "Không được cược bé hơn " + this.GameServer.BetLimitConfig.MinBet);
                            return;
                        }

                        if (!User.CheckValidBet(BetList[i].ID, this.GameServer.BetRatioConfig)) {
                            this.UserBetError(User.Socket, "Không được cược cả 2 cửa");
                            console.log('Không được cược cả 2 cửa');
                            //this.GameServer.ShowPopup(User.Socket, "Không được cược cả 2 cửa BankerWin và PlayerWin");
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
                                var playerCount = this.MatchBetInfoFindPlayerCount(BetList[i].ID, User.UserID);
                                if (bet == 0) {
                                    this.MatchBetInfo.push({
                                        ID: BetList[i].ID,
                                        Money: BetList[i].Money,
                                        PlayerCount: 1
                                    })
                                } else {
                                    bet.Money += BetList[i].Money;
                                    bet.PlayerCount = playerCount;
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
                } else {
                    if (allBet > this.GameServer.BetLimitConfig.MaxBet) {
                        //handle max bet
                        this.UserBetError(User.Socket, "Tổng cược của bạn đã vượt mức " + this.GameServer.BetLimitConfig.MaxBet);
                        //this.GameServer.ShowPopup(User.Socket, "Tổng cược của bạn đã vượt mức " + this.GameServer.BetLimitConfig.MaxBet);
                    } else {
                        this.UserBetError(User.Socket, "Bạn không đủ tiền cược");
                    }
                }
            }
        } else {
            console.log("BETLIST ERROR ", BetList);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.OnUserBet ', e.stack);
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
/**
 * Tài: tổng 3 mặt xúc xắc từ 11-18
 * Xỉu: tổng 3 mặt xúc xắc từ 3-10.
 * @returns {Array}
 */
DeskCore.prototype.CalcWinResult = function () {
    var rs = [];
    var sum = 0;
    for (var i = 0; i < this.ResultDices.length; i++) {
        sum += +this.ResultDices[i];
    }
    if (sum < 11) {// Xiu
        rs.push(this.BetRatioConfig.Xiu.ID);
    } else {
        rs.push(this.BetRatioConfig.Tai.ID);
    }
    return rs;
};
DeskCore.prototype.CalcWinForUser = function () {
    var WinList = this.CalcWinResult();


    this.CalcTimeForNextMatch();

    this.OnShowResult(WinList);

    var history = {
        MatchID: this.MatchID, // ID Bet
        // Result: this.GetScore(this.ResultDices), // Kết quả tổng
        Result: [],
        BetList: [],
        TotalBet: 0,
        TotalWin: 0,
        BetTime: ''
    };
    for (var i = 0; i < this.ResultDices.length; i++) {
        history.Result.push(this.ResultDices[i]);
    }
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

                }
            }

            User.ListBetHistory = User.ListBet; // Reset ListBet
            User.ListBet = []; // Reset ListBet
            //
            history.TotalBet = totalBet;
            history.TotalWin = totalWin;
            // history.BetTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
            history.BetTime = Utility.FormatDateTime(new Date());

            this.CollectUserWinLose(User.GameName, totalBet, totalWin);
            this.RecordUserBetHistory(User.UserID, JSON.stringify(history));

            if (UserWinList.length > 0) {
                this.GameServer.AddStock(-totalWin);
                this.HandleUserWin(User, UserWinList, totalWin);
            } else {
                if (UpdateMoney) {
                    this.UpdateMoneyForUser(User);
                }
            }

            this.GameServer.OnUserEndMatch(User, history.BetList, UserWinList);
            this.CalcComboWinLose(User, history.BetList, history.TotalBet, history.TotalWin);
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
    this.GameServer.Logger.Game().info('DeskCore.prototype.OnStartRoundCompleted: ' + this.MatchRoundTime);
    try {
        this.DeskState = this.GameServer.DeskStateConfig.Open;
        this.StartRoundTime = +new Date();
        this.BetStateChanged = false;

        this.DeskSendAllUser(new Packet.StartMatchResponse(this.ResultTextEncrypted, this.MatchRoundTime, this.MatchID));
        //Bắt đầu trận , đợi kết thúc.
        setTimeout(function () {
            this.EndRound();
        }.bind(this), this.MatchRoundTime * 1000);
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.OnStartRoundCompleted exception: ', e.stack);
    }

};

DeskCore.prototype.EndRound = function () {
    this.GameServer.Logger.Game().info('DeskCore.prototype.EndRound: did: ' + this.DeskID + ', mid: ' + this.MatchID);
    try {
        this.DeskState = this.GameServer.DeskStateConfig.Close;
        var rs = this.CalcWinForUser();
        if (Utility.CheckVariable(rs, 'Win', 'Lose', 'Tax')) {
            this.GameServer.RecordMatchInfo(this.MatchID, this.DeskID, this.ResultDices.join(','), this.ResultText, this.ResultTextEncrypted, rs.Win, rs.Lose, rs.Tax, this.GameServer.BetLimitConfig.Tax)
        }

        this.GameServer.CheckStockAndMaintain(); // Gọi server check lại stock;
        setTimeout(function () {
            this.StartRound();
        }.bind(this), this.MatchNextRoundTime * 1000);
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.EndRound exception: ', e.stack);
    }
};


/**
 * @return {number}
 */
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

/**
 * @return {number}
 */
DeskCore.prototype.MatchBetInfoFindByID = function (ID) {
    for (var i = 0; i < this.MatchBetInfo.length; i++) {
        if (this.MatchBetInfo[i].ID == ID) {
            return this.MatchBetInfo[i]
        }
    }
    return 0;
};

/**
 * @return {number}
 */
DeskCore.prototype.MatchBetInfoFindPlayerCount = function (BetID, UserID) {
    var ListUserBetID = this.Map[BetID];
    for (var i = 0; i < ListUserBetID.length; i++) {
        if (ListUserBetID[i] == UserID) {
            return ListUserBetID.length;
        }
    }
    //
    ListUserBetID.push(UserID);
    return ListUserBetID.length;
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

DeskCore.prototype.GenMatchHistory = function () {
    try {
        // this.MatchHistory.push(this.GetScore(this.ResultDices));
        for (var i = 0; i < this.ResultDices.length; i++) {
            this.MatchHistory.push(this.ResultDices[i]);
        }
        if (this.MatchHistory.length > this.MatchHistoryLimit) {
            this.MatchHistory.splice(0, this.ResultDices.length);
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
        this.GameServer.RedisAdapter.zAdd(this.GameServer.Config.RedisConfig.Define.TaiXiuMiniBetUserHistory + UserID, +new Date(), HistoryStr);
        this.GameServer.RedisAdapter.zCount(this.GameServer.Config.RedisConfig.Define.TaiXiuMiniBetUserHistory + UserID, function (e, d) {
            if (!e) {
                if (d > this.MaxBetHistory) {
                    var rem = d - this.MaxBetHistory;
                    this.GameServer.RedisAdapter.zRemByRank(this.GameServer.Config.RedisConfig.Define.TaiXiuMiniBetUserHistory + UserID, 0, rem);
                }
            }
        }.bind(this));
    } catch (e) {

    }
};

DeskCore.prototype.UserGetUserHistory = function (User) {
    this.GameServer.RedisAdapter.zRange(this.GameServer.Config.RedisConfig.Define.TaiXiuMiniBetUserHistory + User.UserID, 0, -1,
        function (err, d) {
            if (!err) {
                try {
                    var h = [];
                    for (var i = 0; i < d.length; i++) {
                        var tmp = JSON.parse(d[i]);
                        tmp.BetTime = tmp.BetTime ? tmp.BetTime : "2019-01-01 00:00:00";
                        h.push(tmp);
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
            this.MatchHistory.push(InitHistory[i]);
        }
        this.GameServer.Logger.Game().info('DeskCore.prototype.InitHistory', this.MatchHistory.length);
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.InitHistory Get DataErr', e);
    }
};

/**
 * @return {boolean}
 */
DeskCore.prototype.CheckValidBetArr = function (BetArr) {
    if (BetArr.length <= 1) {
        return true;
    }
    var BetID = BetArr[0];
    for (var i = 1; i < BetArr.length; i++) {
        if (BetID != BetArr[i]) {
            return false;
        }
    }
    return true;
};

DeskCore.prototype.CalcTimeForNextMatch = function () {

    this.MatchNextRoundTime = 15;
};

DeskCore.prototype.OnUserGetTopWin = function (User) {
    if (this.TopUserWinListBinary != 0) {
        this.GameServer.SendSocketBinary(User.Socket, this.TopUserWinListBinary);
    }
};

DeskCore.prototype.CollectUserWinLose = function (GameName, TotalBet, TotalWin) {
    try {
        this.GameServer.RedisAdapter.zAdd(this.GameServer.Config.RedisConfig.Define.TaiXiuMiniTopUserWin, TotalWin - TotalBet, GameName);
        //this.GameServer.EventManager.EvtOnUserWinLoseAll(User, TotalBet, TotalWin);
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.CollectUserWinLose', e.stack);
    }

};

DeskCore.prototype.BuildTopWinList = function () {
    this.GameServer.RedisAdapter.zRevRangeWithScores(this.GameServer.Config.RedisConfig.Define.TaiXiuMiniTopUserWin, 0, 50,
        function (err, d) {
            if (!err) {
                try {
                    var gamename = 0;
                    var score = 0;
                    var topwin = [];
                    for (var i = 0; i < d.length; i++) {
                        if (i % 2 == 0) {
                            gamename = d[i];
                        } else {
                            score = d[i];
                            topwin.push({
                                GameName: gamename,
                                TotalWin: score
                            });
                        }
                    }
                    this.TopUserWinListBinary = new Packet.TopUserWinResponse(topwin);

                } catch (ex) {
                    this.GameServer.Logger.Game().error('DeskCore.prototype.BuildTopWinList Build DataErr', ex.stack);
                }
            } else {
                this.GameServer.Logger.Game().error('DeskCore.prototype.BuildTopWinList Get DataErr', err);
            }
        }.bind(this));
};

DeskCore.prototype.OnUserGetListUser = function (User) {
    this.GameServer.SendSocketBinary(User.Socket, new Packet.GetListUserResponse(this.ListUser));
};

DeskCore.prototype.OnUserGameChat = function (User, Msg) {
    if (User.CheckChatRule(Msg)) {
        // this.GameServer.SendSocketBinary(User.Socket, new Packet.GameChatResponse(User.UserID, User.GameName, Msg));
        this.DeskSendAllUser(new Packet.GameChatResponse(User.UserID, User.GameName, Msg));
    } else {
        console.log("fail rule ", User.ChatTracking);
    }
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
    var isCheat = 0;
    //tai 1, xiu 2
    if (this.FindBetID(1, BetList) != 0 && this.FindBetID(2, BetList) != 0) {
        isCheat = 1;
    }
    return isCheat;
};

DeskCore.prototype.FindBetID = function (ID, BetList) {
    for (var i = 0; i < BetList.length; i++) {
        if (BetList[i].ID == ID) {
            return BetList[i];
        }
    }
    return 0;
};