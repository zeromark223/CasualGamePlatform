var Utility = require('../../SharedModule/Utility');
var Encrytion = require('../../SharedModule/encrytion');
var Packet = require('../Packet');

function DeskCore() {
    this.DeskID = 0;
    this.GameServer = 0;
    this.DiceCount = 3;
    this.SecretKey = Utility.GetUUID(); // SecretKey cũng từ gen, không cho can thiệp.
    this.BetListConfig = [];
    this.ResultDices = [];
    this.ResultText = '';
    this.DeskState = '';
    this.MatchID = 0;
    this.ListUserBet = [];
    this.ListUser = [];
    this.MatchRoundTime = 40;
    this.StartRoundTime = +new Date();
    this.MatchNextRoundTime = 15;
    this.History = [];
    this.MaxBetHistory = 50;
    this.BetStateChanged = false;
    this.IsBeingBroadcastInfo = false;
    this.MatchBetInfo = [];
    this.TopUserWinListBinary = 0;
    this.IsReadyForMaintain = false;
    this.Tax = 1;
}

module.exports = DeskCore;
DeskCore.prototype.Init = function (GameServer, DeskID) {
    this.DeskID = DeskID;
    this.GameServer = GameServer;
    this.BetListConfig = GameServer.Config.BetListConfig;
    this.StartRound();
    for (var i = 0; i < 240; i++) {
        this.History.push(Math.floor(Math.random() * 6) + 1);
    }
};
DeskCore.prototype.StartRound = function () {
    if (this.GameServer.MaintainFlag) {
        this.IsReadyForMaintain = true;
        return;
    } //Check Stock của hệ thống, nếu vẫn đảm bảo mới được start ván.
    this.BuildTopWinList();//Tạo top win của ván trước
    //clear
    this.ListUserBet = [];
    this.ResultDices = []; // Reset Dices
    this.MatchBetInfo = [];
    this.InitDices();


};
DeskCore.prototype.InitDices = function () {
    try {
        for (var i = 0; i < this.DiceCount; i++) {// Gen Dices
            this.ResultDices.push(this.RandomDice());
        }
        this.ResultText = this.GenResultText(this.ResultDices);
        this.ResultTextEncrypted = this.EncryptResultText(this.ResultText);
        this.GameServer.GenMatchInfo(this.DeskID, this.Tax, this.ResultTextEncrypted, function (e, MatchID) {
            if (!e) {
                this.MatchID = MatchID;
                this.GameServer.Logger.Game().debug('DeskCore.prototype.InitDices MatchID : ', MatchID);
                this.OnStartRoundCompleted();
            } else {
                //handle error
            }
        }.bind(this));
        //Send Match Start
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.InitDices ', e.stack);

    }


};
DeskCore.prototype.OnStartRoundCompleted = function () {
    try {
        this.DeskState = this.GameServer.DeskStateConfig.Open;
        this.StartRoundTime = +new Date();
        this.BetStateChanged = false;
        //this.DeskSendAllUser(new Packet.StartMatchResponse(this.ResultTextEncrypted, this.MatchRoundTime, this.MatchID));
        //Bắt đầu trận , đợi kết thúc.
        setTimeout(function () {
            this.EndRound();
        }.bind(this), this.MatchRoundTime * 1000);
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.OnStartRoundCompleted ', e.stack);
    }

};

DeskCore.prototype.DeskTimer2Second = function () {
    this.BroadcastBetInfo();
};

DeskCore.prototype.BroadcastBetInfo = function () {
    if (this.IsBeingBroadcastInfo) return;
    if (!this.BetStateChanged) return;//ko cần xử lý broadcast khi ko thay đổi
    this.BetStateChanged = false;
    this.IsBeingBroadcastInfo = true;
    // var msg = new Packet.UpdateBetInfoResponse(this.MatchBetInfo);
    // this.DeskSendAllUser(msg);
    this.IsBeingBroadcastInfo = false;

};

DeskCore.prototype.GenResultText = function (dices) {
    var rawText = Encrytion.sha256(Utility.GetUUID() + this.SecretKey) + '_';
    for (var i = 0; i < dices.length; i++) {
        rawText += dices[i];
    }
    return rawText;
};
DeskCore.prototype.EncryptResultText = function (text) {
    return Encrytion.sha256(text);
};
DeskCore.prototype.EndRound = function () {
    try {
        this.DeskState = this.GameServer.DeskStateConfig.Close;
        var winList = this.CalcWinList(this.ResultDices);
        this.InsertHistory(this.ResultDices);
        var rs = this.CalcWinForUser(winList);
        if (Utility.CheckVariable(rs, 'Win', 'Lose', 'Tax')) {
            this.GameServer.RecordMatchInfo(this.MatchID, this.DeskID, this.ResultDices, this.ResultText, this.ResultTextEncrypted, rs.Win, rs.Lose, rs.Tax, this.Tax)
        }
        //this.DeskSendAllUser(new Packet.EndMatchResultResponse(this.ResultDices, this.ResultText, this.MatchNextRoundTime, winList));
        //Bắt đầu trận mới.
        this.GameServer.CheckStockAndMaintain(); // Gọi server check lại stock;
        setTimeout(function () {
            this.StartRound();
        }.bind(this), this.MatchNextRoundTime * 1000);
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.EndRound ', e.stack);
    }


};

DeskCore.prototype.CalcWinList = function (resultDices) {
    var winList = [];
    if (!this.CalcBao(resultDices, winList)) {
        this.CalcTaiXiu(resultDices, winList);
        this.CalcChanle(resultDices, winList);
    }
    this.CalcTongSo(resultDices, winList);
    this.CalcDoi(resultDices, winList);
    this.CalcDon(resultDices, winList);
    return winList;

};
DeskCore.prototype.IsBao = function (dices) {
    for (var i = 1; i < dices.length; i++) {
        if (dices[i - 1] != dices[i]) {
            return false;
        }
    }
    return true;
};
DeskCore.prototype.CalcBao = function (dices, winList) {
    if (this.IsBao(dices)) {
        winList.push('baoany');
        winList.push('bao' + dices[0]);
        return true;
    }
    return false;

};
DeskCore.prototype.CalcTaiXiu = function (dices, winList) {
    var sum = 0;
    for (var i = 0; i < dices.length; i++) {
        sum += dices[i];
    }
    if (sum <= 10) {
        winList.push('xiu');
    } else {
        winList.push('tai');
    }
};
DeskCore.prototype.CalcChanle = function (dices, winList) {
    var sum = 0;
    for (var i = 0; i < dices.length; i++) {
        sum += dices[i];
    }
    if (sum % 2 != 0) {
        winList.push('le');
    } else {
        winList.push('chan');
    }

};
DeskCore.prototype.CalcTongSo = function (dices, winList) {
    var sum = 0;
    for (var i = 0; i < dices.length; i++) {
        sum += dices[i];
    }
    if (sum >= 4 && sum <= 17) {
        winList.push('tong' + sum);
    }

};
DeskCore.prototype.CalcDoi = function (dicesRaw, winList) {
    //clone dices (sort giúp đơn giãn hóa thuật toán)
    var dices = [];
    for (var i = 0; i < dicesRaw.length; i++) {
        dices.push(dicesRaw[i]);
    }
    dices.sort();//sort
    if (winList.indexOf('doi' + dices[0] + '' + dices[1]) < 0) {
        winList.push('doi' + dices[0] + '' + dices[1]);
    }
    if (winList.indexOf('doi' + dices[0] + '' + dices[2]) < 0) {
        winList.push('doi' + dices[0] + '' + dices[2]);
    }
    if (winList.indexOf('doi' + dices[1] + '' + dices[2]) < 0) {
        winList.push('doi' + dices[1] + '' + dices[2]);
    }

};
DeskCore.prototype.CalcDon = function (dices, winList) {
    winList.push('don' + dices[0]);
    winList.push('don' + dices[1]);
    winList.push('don' + dices[2]);
};
DeskCore.prototype.RandomDice = function () {
    return Math.floor(Math.random() * 6) + 1;
};
DeskCore.prototype.CalcWinForUser = function (WinList) {

    // {
    //     ID: Define.StringDynamic, // ID Bet
    //         Money: Define.UInt64 // Tiền tổng thắng của cược này
    // },
    var history = {
        MatchID: this.MatchID, // ID Bet
        Result: this.ResultDices, // Kết quả tổng
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
        //Reset History
        history.BetList = [];
        totalBet = 0;
        totalWin = 0;
        //
        var UserWinList = [];
        if (Utility.CheckVariable(User, 'ListBet')) {
            for (var j = 0; j < User.ListBet.length; j++) {// Check từng Bet
                if (User.ListBet[j].MatchID != this.MatchID) continue;// Bỏ qua Bet ko phải của Match này
                totalBet += User.ListBet[j].Gold;
                history.BetList.push({
                    ID: User.ListBet[j].ID,
                    Money: User.ListBet[j].Gold
                });
                if (this.CheckBetIDWin(WinList, User.ListBet[j].ID)) {
                    var winRatio = this.GetBetRatioByID(User.ListBet[j].ID);
                    var winGoldNoTax = winRatio * User.ListBet[j].Gold + User.ListBet[j].Gold;
                    var winGold = winRatio * User.ListBet[j].Gold * this.GetTax();

                    winGold += User.ListBet[j].Gold; // Trả tiền cược cho user
                    totalWin += winGold;
                    totalWinNoTax += winGoldNoTax;
                    UserWinList.push({
                        ID: User.ListBet[j].ID,
                        Money: winGold,
                        WinGoldNoTax: winGoldNoTax
                    });

                }

            }
            User.ListBetHistory = User.ListBet; // Reset ListBet
            User.ListBet = []; // Reset ListBet
            history.TotalBet = totalBet;
            history.TotalWin = totalWin;
            this.CollectUserWinLose(User.GameName, totalBet, totalWin);
            this.RecordUserBetHistory(User.UserID, JSON.stringify(history));
        }
        totalSysLose += totalWinNoTax;
        totalSysWin += totalBet;
        totalSysTax += (totalWinNoTax - totalWin);
        User.OnUserWin(this.MatchID, UserWinList, this.GetTax()); // record end match
        if (UserWinList.length > 0) {
            this.GameServer.AddStock(-totalWin);
            this.HandleUserWin(User, UserWinList, totalWin);
        }
        //Write Log♠
    }
    return {
        Win: totalSysWin,
        Lose: totalSysLose,
        Tax: totalSysTax
    }
};
DeskCore.prototype.HandleUserWin = function (User, UserWinList, TotalWin) {
    //Handle User win
    //Record History
    if (User.UserState == this.GameServer.UserStateDefine.JoinRoomCompleted) {//User đang ko ở trạng thái khác
        User.Wallet += TotalWin;
        // this.GameServer.SendSocketBinary(User.Socket, new Packet.UserResultResponse(UserWinList));
        // this.GameServer.SendSocketBinary(User.Socket, new Packet.UpdateUserGoldResponse(User.Wallet));
    } else {
        if (User.UserState == this.GameServer.UserStateDefine.LogOut) {
            this.GameServer.MoneyRefundWinGoldForOfflineUser(User, TotalWin);
        } else {
            this.GameServer.Logger.Game().error('DeskCore.prototype.HandleUserWin - Trạng thái refund bất thường', User.UserState, "TotalWin Gold", TotalWin);
        }


    }
};
DeskCore.prototype.CheckBetIDWin = function (WinList, ID) {
    for (var i = 0; i < WinList.length; i++) {
        if (WinList[i] == ID) {
            return true;
        }
    }
    return false;
};
DeskCore.prototype.GetBetRatioByID = function (BetID) {
    for (var i = 0; i < this.BetListConfig.length; i++) {
        if (this.BetListConfig[i].ID == BetID) {
            return this.BetListConfig[i].Ratio;// Thêm phần tiền cược của User
        }
    }
    return 0;
};

DeskCore.prototype.UserBetInsertUpdate = function (User) {
    if (this.UserBetFind(User) == 0) {
        this.ListUserBet.push(User);
    }
};

DeskCore.prototype.UserBetFind = function (User) {
    for (var i = 0; i < this.ListUserBet.length; i++) {
        if (this.ListUserBet[i].UserID == User.UserID) {
            return this.ListUserBet[i];
        }
    }
    return 0;
};

DeskCore.prototype.UserBet = function (User, BetList) {
    if (this.DeskState != this.GameServer.DeskStateConfig.Open) {
        this.GameServer.ShowPopup(User.Socket, "Đã hết giờ đặt cược, vui lòng chờ ván tiếp theo");
        return;// Handle Error
    }
    if (Utility.CheckVariable(BetList)) {
        var totalBet = 0;
        for (var i = 0; i < BetList.length; i++) {
            if (Utility.CheckVariable(BetList[i], 'ID', 'Money')) {
                if (BetList[i].Money < this.GameServer.Config.GameServerConfig.TaiXiuConfig.MinBet || BetList[i].Money < 0) {//ko xử lý case tào lao
                    this.GameServer.ShowPopup(User.Socket, "Không được cược bé hơn " + this.GameServer.Config.GameServerConfig.TaiXiuConfig.MinBet);
                    return;
                }
                totalBet += BetList[i].Money;
            }
        }
        //Check tổng tiền cược
        var allBet = User.GetUserTotalBet(this.MatchID) + totalBet;

        if (User.Wallet >= totalBet && allBet <= this.GameServer.Config.GameServerConfig.TaiXiuConfig.MaxBet) {
            var isBetSuccess = false;
            for (var i = 0; i < BetList.length; i++) {
                if (Utility.CheckVariable(BetList[i], 'ID', 'Money')) {
                    if (User.Wallet >= BetList[i].Money) {
                        User.Wallet -= BetList[i].Money;
                        this.GameServer.AddStock(BetList[i].Money);
                        isBetSuccess = true;
                        User.OnUserBetSuccess(this.MatchID, BetList[i].ID, BetList[i].Money, this.GetTax());
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
                // this.GameServer.SendSocketBinary(User.Socket, new Packet.UserBetResponse(0));
                // this.GameServer.SendSocketBinary(User.Socket, new Packet.UpdateUserGoldResponse(User.Wallet));
                this.UserBetInsertUpdate(User);
                return;
            }

        } else {
            if (allBet > this.GameServer.Config.GameServerConfig.TaiXiuConfig.MaxBet) {
                //handle max bet
                this.GameServer.ShowPopup(User.Socket, "Tổng cược của bạn đã vượt mức " + this.GameServer.Config.GameServerConfig.TaiXiuConfig.MaxBet);
            }
        }
    } else {
        console.log("BETLSIT ERROR ", BetList);
    }
    //this.GameServer.SendSocketBinary(User.Socket, new Packet.UserBetResponse(1));
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
DeskCore.prototype.UserEnterDesk = function (Socket) {
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
             //   this.GameServer.SendSocketBinary(Socket, new Packet.StartMatchResponse(this.ResultTextEncrypted, timeEst, this.MatchID));
            }
            //Transfer BET
            var disConnectedUser = this.UserBetFind(User);
            if (disConnectedUser != 0) {
                this.TransferBetForUser(Socket.UserModel, disConnectedUser);
            } else {
            }
        }

    } else {
        this.GameServer.Logger.Game().error('DeskCore.prototype.OnUserEnterDesk - User co trang thai tien bat thuong', User.MoneyState);
        this.GameServer.DestroySocket(Socket);
    }

};
DeskCore.prototype.IsAvailable = function () {
    return this.ListUser.length <= this.GameServer.Config.GameServerConfig.RoomTypeConfig.DeskMaxUserLimit;
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

DeskCore.prototype.UserGetMatchHistory = function (User) {
    //this.GameServer.SendSocketBinary(User.Socket, new Packet.MatchHistoryResponse(this.History));
};

DeskCore.prototype.RecordUserBetHistory = function (UserID, HistoryStr) {
    try {
        this.GameServer.RedisAdapter.zAdd(this.GameServer.Config.RedisConfig.Define.TaiXiuBetUserHistory + UserID, +new Date(), HistoryStr);
        this.GameServer.RedisAdapter.zCount(this.GameServer.Config.RedisConfig.Define.TaiXiuBetUserHistory + UserID, function (e, d) {
            if (!e) {
                if (d > this.MaxBetHistory) {
                    var rem = d - this.MaxBetHistory;
                    this.GameServer.RedisAdapter.zRemByRank(this.GameServer.Config.RedisConfig.Define.TaiXiuBetUserHistory + UserID, 0, rem);
                }
            }
        }.bind(this));
    } catch (e) {

    }
};

DeskCore.prototype.MatchBetInfoFindByID = function (ID) {
    for (var i = 0; i < this.MatchBetInfo.length; i++) {
        if (this.MatchBetInfo[i].ID == ID) {
            return this.MatchBetInfo[i]
        }
    }
    return 0;
};

DeskCore.prototype.UserGetUserHistory = function (User) {
    this.GameServer.RedisAdapter.zRange(this.GameServer.Config.RedisConfig.Define.TaiXiuBetUserHistory + User.UserID, 0, -1, function (err, d) {
        if (!err) {
            try {
                var h = [];
                for (var i = 0; i < d.length; i++) {
                    h.push(JSON.parse(d[i]));
                }
                //var msg = new Packet.UserHistoryResponse(h);
                //this.GameServer.SendSocketBinary(User.Socket, msg);
            } catch (ex) {
                this.GameServer.Logger.Game().error('DeskCore.prototype.UserGetUserHistory Build DataErr', ex.stack);
            }
        } else {
            this.GameServer.Logger.Game().error('DeskCore.prototype.UserGetUserHistory Get DataErr', err);
        }
    }.bind(this));
};

DeskCore.prototype.CollectUserWinLose = function (GameName, TotalBet, TotalWin) {
    this.GameServer.RedisAdapter.zAdd(this.GameServer.Config.RedisConfig.Define.TaiXiuTopUserWin, TotalWin - TotalBet, GameName);
};

DeskCore.prototype.UserGetTopUserWin = function (User) {
    if (this.TopUserWinListBinary != 0) {
        this.GameServer.SendSocketBinary(User.Socket, this.TopUserWinListBinary);
    }
};

DeskCore.prototype.UserChatOnDesk = function (User, Msg) {
    try {
        //this.DeskSendAllUser(new Packet.GameChatResponse(User.UserID, User.GameName, Msg));
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.UserChatOnDesk Build DataErr', e.stack);
    }

};

DeskCore.prototype.GetListUserOnDesk = function (User) {
    try {
        //this.GameServer.SendSocketBinary(User.Socket, new Packet.GetListUserResponse(this.ListUser));
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.GetListUserOnDesk Build DataErr', e.stack);
    }

};

DeskCore.prototype.BuildTopWinList = function () {
    this.GameServer.RedisAdapter.zRevRangeWithScores(this.GameServer.Config.RedisConfig.Define.TaiXiuTopUserWin, 0, 50, function (err, d) {
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
                //this.TopUserWinListBinary = new Packet.TopUserWinResponse(topwin);

            } catch (ex) {
                this.GameServer.Logger.Game().error('DeskCore.prototype.BuildTopWinList Build DataErr', ex.stack);
            }
        } else {
            this.GameServer.Logger.Game().error('DeskCore.prototype.BuildTopWinList Get DataErr', err);
        }
    }.bind(this));
};

DeskCore.prototype.TransferBetForUser = function (User, DisconnectedUser) {
    if (DisconnectedUser.ListBet.length > 0) {

        var ListBet = DisconnectedUser.ListBet;
        DisconnectedUser.ListBet = [];
        User.ListBet = ListBet;
        this.ReplaceUserDisconnectByUserOnline(User, DisconnectedUser);
        //this.GameServer.SendSocketBinary(User.Socket, new Packet.UpdateUserBetListResponse(User.ListBet));
    } else {
        console.log("loi đéo transfer dc");
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


DeskCore.prototype.GetTax = function () {
    var tax = (100 - this.Tax) / 100;
    if (tax > 1) {
        tax = 1;
    } else {
        if (tax < 0) {
            tax = 0;
        }
    }
    return tax;
};