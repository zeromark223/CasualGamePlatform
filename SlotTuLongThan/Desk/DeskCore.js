/*{"build":1}*/
var rootFile = __stack[0].getFileName();
var path = require('path');
var cDir = path.dirname(rootFile);
var Utility = require(path.resolve(cDir, '../../SharedModule/Utility'));
var Packet = require(path.resolve(cDir, '../Packet'));
var Engine = require(path.resolve(cDir, './Engine'));

function DeskCore() {
    this.DeskID = 0;
    this.GameServer = 0;
    this.StockRatio = 1;
    this.MaxLine = 25;
    this.IsReadyForMaintain = true;
    this.BonusMiniRewardConfig = [
        [1 / 5, 1 / 5, 1 / 5, 2 / 5, 2 / 5, 3 / 5],
        [0, 3 / 5, 3 / 5, 3 / 5, 4 / 5, 1, 8 / 5],
        [0, 0, 4 / 5, 4 / 5, 6 / 5, 8 / 5, 2],
        [0, 0, 0, 0, 0, 4, 8]
    ];
    this.InitSumaryReel();
    this.CocktailMaxPoint = 12;
    this.CocktailRewardMulti = 11;

}

module.exports = DeskCore;
DeskCore.prototype.Init = function (GameServer, DeskID) {
    this.DeskID = DeskID;
    this.GameServer = GameServer;
};

DeskCore.prototype.OnUserStartRoll = function (User, TotalBet, IsFreeSpin) {
    //Handle Start
    this.RollForUser(User, TotalBet, IsFreeSpin);
};

DeskCore.prototype.RollForUser = function (User, TotalBet, IsFreeSpin) {
    //Check Tiền
    if (IsFreeSpin) {
        //Check freespin
        this.RollForUserFree(User);
    } else {
        if (User.Wallet < TotalBet) {
            return;
            //Handle ko đủ tiền
        }
        User.MatchPlayed++;
        var goldLimit = this.GetLimitBet(TotalBet);
        if (User.Wallet < goldLimit) {
            this.GameServer.ShowPopup(User.Socket, this.GameServer.GetUserMsgByLangCode(this.GameServer.Config.LanguageConfig.LimitGoldPlayable_Error, User.Socket.LangCode).toString().replace('%s',goldLimit));//#321
            return;
            //Handle ko đủ tiền tối thiểu
        }
        var MatchID = this.GameServer.GetMatchID();
        User.Wallet = User.Wallet - TotalBet;
        User.TotalGoldUserPayForSys += TotalBet;
        this.GameServer.AddStock(TotalBet);
        this.GameServer.JackpotAdd(TotalBet);
        //RecordBetting
        this.GameServer.RecordBetting(User, TotalBet, MatchID, 0);
        //nên Track tiền user
        var rs = Engine.SlotRollingByReel(this.GameServer.GetReelByStock(), 3, 5); // Reel Dễ
        this.CalcWinList(User, TotalBet, rs, MatchID, 0, function (winList) {
            User.OnUserWinLoseGold(User, TotalBet, 0);
            this.HandleUserWin(User, rs, winList);
        }.bind(this));
    }

};

DeskCore.prototype.RollForUserFree = function (User) {
    if (User.FreeSpinTicket > 0) {
        var MatchID = this.GameServer.GetMatchID();
        User.FreeSpinTicket--;
        var TotalBet = User.FreeSpinTotalBet;
        this.GameServer.RecordBetting(User, TotalBet, MatchID, 1);
        this.GameServer.AddStock(TotalBet * -1); // Ví tiền hệ thống cấp ra nên trừ
        var rs = Engine.SlotRollingByReel(this.GameServer.GetReelByStock(), 3, 5); // Reel bt
        this.CalcWinList(User, TotalBet, rs, MatchID, 1, function (winList) {
            this.HandleUserWin(User, rs, winList);
        }.bind(this));
    }
};

DeskCore.prototype.IsAvailable = function () {
    return true;
};

DeskCore.prototype.CalcWinList = function (User, TotalBet, Rs, MatchID, useFreeSpin, callback) {
    if (this.GameServer.GameKindID == 403) {
        this.CalcWinListHawaii(User, TotalBet, Rs, MatchID, useFreeSpin, callback);
        return;
    }
    var totalWin = 0;
    var isBonus = 0;
    var isFreeSpin = 0;
    var isJackpot = 0;
    var tracking = [];
    var i;
    var winLine = [];
    var bonusTracking = 0;
    var freeSpinTracking = 0;
    var jackpotTracking = 0;
    var lineGold = Math.floor(TotalBet / 25);
    for (i = 0; i < this.GameServer.ReelConfig.WinLine.length; i++) {
        var line = this.GameServer.ReelConfig.WinLine[i];
        var tempTrack = [];
        var wildCount = 0; // wildCount trên line này
        var j;
        for (j = 0; j < line.length; j++) {//Quét line
            if (line[j] == 1) { // vị trí line
                var id = Rs[j]; // vì line = check list
                if (Utility.CheckVariable(id)) {
                    switch (+id) {
                        case 2:
                            break;
                        case 3:
                            break;
                        case 1: // Đây là wild
                            wildCount++;
                        default:
                            if (!Utility.CheckVariable(tempTrack[id])) { // ko tìm thấy id này
                                tempTrack[id] = {id: id, count: 1, lineid: i}; // Tạo mới
                            } else {// tìm thấy id này
                                tempTrack[id].count++; // Tăng count
                            }
                            break;
                    }

                }
            }
        }
        var getTrack = 0;
        var getTrackWinRatio = 0;

        for (j = 0; j < tempTrack.length; j++) {
            if (Utility.CheckVariable(tempTrack[j])) {
                if (wildCount > 0 && (tempTrack[j].id != 1 && tempTrack[j].id != 4)) { //Cộng wild cho các case của line này
                    tempTrack[j].count += wildCount;
                }
                if (tempTrack[j].count > 2) { // xét dk trên line này
                    var ratio = this.GetRewardByIDAndCount(tempTrack[j].id, tempTrack[j].count);
                    if (getTrack == 0) {
                        getTrack = tempTrack[j];
                        getTrackWinRatio = ratio;

                    } else {
                        if (getTrackWinRatio < ratio) {
                            getTrack = tempTrack[j];
                            getTrackWinRatio = ratio;
                        }
                    }
                }
            }
        }
        if (getTrack != 0) {
            if (getTrack.id == 4 && getTrack.count == 5 && this.GameServer.GetRuleJackpot5Any()) {
                continue;// ko tracking jackpot 5 o trong line, default skip; vi track ben duoi (chi case jackpot 5)
            }
            tracking.push(getTrack);
        }


    }
    for (i = 0; i < Rs.length; i++) { // Bonus va freeSpin ko cần áp line
        switch (+Rs[i]) {
            case 2:
                bonusTracking++;
                break;
            case 3:
                freeSpinTracking++;
                break;
            case 4:
                jackpotTracking++;
                break;

        }

    }
    if (bonusTracking > 2) {
        isBonus = 1;
        this.HandleBonus(User, TotalBet, bonusTracking);
        isBonus = User.BonusMiniGameMultiple;
        User.RecordDataRsID(2, bonusTracking, TotalBet);
        //this.CollectData[2][bonusTracking]++;//#1
    }
    if (freeSpinTracking > 2) {
        isFreeSpin = freeSpinTracking;
        User.RecordDataRsID(3, freeSpinTracking, TotalBet);
        //this.CollectData[3][freeSpinTracking]++;//#1
        this.HandleScatter(User, TotalBet, freeSpinTracking);
    }
    if (jackpotTracking >= 5 && this.GameServer.GetRuleJackpot5Any()) {
        isJackpot = 1;
        User.RecordDataRsID(4, 5, TotalBet);
        // this.CollectData[4][5]++;//#1
    }
    for (i = 0; i < tracking.length; i++) {
        if (!Utility.CheckVariable(tracking[i], 'id', 'count', 'lineid')) {
            continue;
        }
        var count = tracking[i].count;

        var reward = this.FindRewardByID(tracking[i].id);
        if (reward != 0) {
            var value = 0;
            winLine.push(tracking[i].lineid);

            if (count <= reward.values.length) {
                value = reward.values[count - 1];
                //this.CollectData[tracking[i].id][count]++;//#1
                User.RecordDataRsID(tracking[i].id, count, TotalBet);
                switch (reward.type) {
                    case 0://Normal
                    case 1://Wild
                        totalWin += (value || 0);
                        break;
                    case 4://Jackpot
                        if (value != 'j') {
                            totalWin += (value || 0);
                        } else {
                            if (!this.GameServer.GetRuleJackpot5Any()) { // ko phải case any;
                                isJackpot = 1;
                            }
                        }
                        break;
                }


            }

        }
    }
    if (isJackpot != 0) {
        this.HandleJackpot(User, TotalBet, function (value) {
            if (value <= 0) { // jackpot 0
                this.HandleScatter(User, TotalBet, 1);
                this.RollForUserFree(User);
                //cần handle các case bonus,freespin
            } else {
                callback({
                    totalBet: TotalBet,
                    totalWin: totalWin * lineGold,
                    isBonus: isBonus,
                    isFreeSpin: isFreeSpin,
                    isJackpot: +value,
                    winLine: winLine,
                    matchId: MatchID,
                    useFreeSpin: useFreeSpin
                });
            }

        }.bind(this));
    } else {
        callback({
            totalBet: TotalBet,
            totalWin: totalWin * lineGold,
            isBonus: isBonus,
            isFreeSpin: isFreeSpin,
            isJackpot: 0,
            winLine: winLine,
            matchId: MatchID,
            useFreeSpin: useFreeSpin
        });
    }


};

DeskCore.prototype.CalcWinListHawaii = function (User, TotalBet, Rs, MatchID, useFreeSpin, callback) {

    var totalWin = 0;
    var isBonus = 0;
    var isFreeSpin = 0;
    var isJackpot = 0;
    var tracking = [];
    var i;
    var winLine = [];
    var cocktailCount = 0;
    var lineGold = Math.floor(TotalBet / 9);
    for (i = 0; i < this.GameServer.ReelConfig.WinLine.length; i++) {
        var line = this.GameServer.ReelConfig.WinLine[i];
        var tempTrack = [];
        var wildCount = 0; // wildCount trên line này
        var j;
        for (j = 0; j < line.length; j++) {//Quét line
            if (line[j] == 1) { // vị trí line
                var id = Rs[j]; // vì line = check list
                if (Utility.CheckVariable(id)) {
                    switch (+id) {
                        case 1: // Đây là wild
                            wildCount++;
                            break;
                        case 2://Cocktail
                            cocktailCount++;
                            break;
                        default:
                            if (!Utility.CheckVariable(tempTrack[id])) { // ko tìm thấy id này
                                tempTrack[id] = {id: id, count: 1, lineid: i}; // Tạo mới
                            } else {// tìm thấy id này
                                tempTrack[id].count++; // Tăng count
                            }
                            break;
                    }

                }
            }
        }
        var getTrack = 0;
        var getTrackWinRatio = 0;

        for (j = 0; j < tempTrack.length; j++) {
            if (Utility.CheckVariable(tempTrack[j])) {
                if (tempTrack[j].id == 1 && tempTrack[j].count < 5) { // Check Wild
                    if (tempTrack[j].count < 5) {
                        tempTrack.splice(i, 1);
                        i--;
                        //xóa line này
                        continue;
                    } else {
                        getTrack = tempTrack[j];
                        isJackpot = 1;
                        break;
                    }
                }
                if (wildCount > 0 && (tempTrack[j].id != 1 && tempTrack[j].id != 2)) { //Cộng wild cho các case của line này
                    tempTrack[j].count += wildCount;
                }
                if (tempTrack[j].count > 2) { // xét dk trên line này
                    var ratio = this.GetRewardByIDAndCount(tempTrack[j].id, tempTrack[j].count);
                    if (getTrack == 0) {
                        getTrack = tempTrack[j];
                        getTrackWinRatio = ratio;

                    } else {
                        if (getTrackWinRatio < ratio) {
                            getTrack = tempTrack[j];
                            getTrackWinRatio = ratio;
                        }
                    }
                }
            }
        }
        tracking.push(getTrack);
    }

    for (i = 0; i < tracking.length; i++) {
        if (!Utility.CheckVariable(tracking[i], 'id', 'count', 'lineid')) {
            continue;
        }
        var count = tracking[i].count;

        var reward = this.FindRewardByID(tracking[i].id);
        if (reward != 0) {
            var value = 0;
            winLine.push(tracking[i].lineid);

            if (count <= reward.values.length) {
                value = reward.values[count - 1];
                //this.CollectData[tracking[i].id][count]++;//#1
                User.RecordDataRsID(tracking[i].id, count, TotalBet);
                switch (reward.type) {
                    case 0://Normal
                        totalWin += (value || 0);
                        break;
                }


            }

        }
    }
    if(cocktailCount > 0){
        this.CalcCocktail(User,cocktailCount,TotalBet)
    }
    if (isJackpot != 0) {
        this.HandleJackpot(User, TotalBet, function (value) {
            if (value <= 0) { // jackpot 0
                this.HandleScatter(User, TotalBet, 1);
                this.RollForUserFree(User);
                //cần handle các case bonus,freespin
            } else {
                callback({
                    totalBet: TotalBet,
                    totalWin: totalWin * lineGold,
                    isBonus: isBonus,
                    isFreeSpin: isFreeSpin,
                    isJackpot: +value,
                    winLine: winLine,
                    matchId: MatchID,
                    useFreeSpin: useFreeSpin
                });
            }

        }.bind(this));
    } else {
        callback({
            totalBet: TotalBet,
            totalWin: totalWin * lineGold,
            isBonus: isBonus,
            isFreeSpin: isFreeSpin,
            isJackpot: 0,
            winLine: winLine,
            matchId: MatchID,
            useFreeSpin: useFreeSpin
        });
    }

};

DeskCore.prototype.HandleJackpotZero = function () {

};

DeskCore.prototype.HandleBonus = function (User, TotalBet, Value) {
    //Kick hoạt minigame
    var mul = 1;
    if (Value == 4) mul = 3;
    if (Value == 5) mul = 5;
    User.BonusMiniGameTicket += 4;
    User.BonusMiniGameMultiple = mul; // Chỉ số nhân khi end game
    User.BonusMiniGameTotalBet = TotalBet;
};

DeskCore.prototype.HandleScatter = function (User, TotalBet, Value) {//free spin
    User.FreeSpinTicket += Value || 0;
    User.FreeSpinTotalBet = TotalBet;

};

DeskCore.prototype.HandleJackpot = function (User, TotalBet, callback) {
    this.GameServer.JackpotGetAndSet(User, TotalBet, callback);
};

DeskCore.prototype.FindRewardByID = function (ID) {
    for (var i = 0; i < this.GameServer.ReelConfig.Reward.length; i++) {
        if (this.GameServer.ReelConfig.Reward[i].id == ID) {
            return this.GameServer.ReelConfig.Reward[i];
        }
    }
    return 0;
};

DeskCore.prototype.GetRewardByIDAndCount = function (ID, Count) {
    try {
        for (var i = 0; i < this.GameServer.ReelConfig.Reward.length; i++) {
            if (this.GameServer.ReelConfig.Reward[i].id == ID) {
                return this.GameServer.ReelConfig.Reward[i].values[Count - 1];
            }
        }
    } catch (e) {

    }

    return 0;
};

DeskCore.prototype.HandleUserWin = function (User, Rs, WinList) {
    //this.CollectDataReel(Rs, WinList);//#1

    User.Wallet += WinList.totalWin || 0;
    User.Wallet += (+WinList.isJackpot) || 0;
    var totalWin = ((WinList.totalWin || 0) + (+WinList.isJackpot || 0)) || 0;
    User.OnUserWinLoseGold(User, 0, totalWin);
    this.AddHistory(User, WinList);
    this.GameServer.AddStock(-WinList.totalWin || 0);
    this.GameServer.SendSocketBinary(User.Socket, new Packet.RollingResultResponse(Rs, WinList.isBonus, WinList.isFreeSpin, WinList.isJackpot, WinList.totalWin, User.Wallet, WinList.matchId, WinList.winLine));

};


DeskCore.prototype.OnUserPickBonusMiniGame = function (User, IsOffline) {
    if (User.BonusMiniGameTicket > 0) {
        User.BonusMiniGameTicket--; // Reset Ticket
        var pick = this.BonusMiniRewardConfig[User.BonusMiniGameStage];
        pick = pick[randomBetween(0, pick.length - 1)];
        var win = Math.floor(pick * User.BonusMiniGameTotalBet);

        if (!IsOffline) {
            this.GameServer.SendSocketBinary(User.Socket, new Packet.BonusMiniGameResult(win));
        }
        if (pick == 0) {
            this.OnUserEndBonusMiniGame(User, IsOffline);
        } else {
            User.BonusMiniGameTotalWin += win;
            User.BonusMiniGameStage++;
            if (User.BonusMiniGameStage > 3) {
                this.OnUserEndBonusMiniGame(User, IsOffline);
            }
        }
    }
};

DeskCore.prototype.OnUserEndBonusMiniGame = function (User, IsOffline) {
    User.BonusMiniGameTotalWin = (User.BonusMiniGameMultiple * User.BonusMiniGameTotalWin) || 0;

    this.GameServer.RecordResult(User, User.BonusMiniGameTotalBet, 0, 0, User.BonusMiniGameTotalWin, 0);
    User.BonusMiniGameStage = 0;
    User.BonusMiniGameTicket = 0;
    User.BonusMiniGameTotalBet = 0;
    User.Wallet += User.BonusMiniGameTotalWin;
    User.BonusTotalWin += User.BonusMiniGameTotalWin;//#3

    if (!IsOffline) {
        this.GameServer.SendSocketBinary(User.Socket, new Packet.BonusMiniGameEndResult(User.BonusMiniGameTotalWin, User.Wallet));
    }
    User.BonusMiniGameMultiple = 0;
    User.BonusMiniGameTotalWin = 0;

};

DeskCore.prototype.OnUserStartRollByReel = function (User, TotalBet, IsFreeSpin, Rs) {
    //Handle Start
    if (!this.GameServer.Debug) return;
    this.RollForUserByReel(User, TotalBet, IsFreeSpin, Rs);
};

DeskCore.prototype.RollForUserByReel = function (User, TotalBet, IsFreeSpin, Rs) {
    //Check Tiền
    if (!this.GameServer.Debug) return;

    this.CalcWinList(User, TotalBet, Rs, this.GameServer.GetMatchID(), 0, function (winList) {
        this.HandleUserWin(User, Rs, winList);
    }.bind(this));
};

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

DeskCore.prototype.CollectDataReel = function (rs, winList) {
    //WinList.isBonus, WinList.isFreeSpin, WinList.isJackpot, WinList.totalWin, User.Wallet, ++this.MatchID,WinList.winLin
    this.CollectDataTotalWin += winList.totalWin;
    // for (var i = 0; i < rs.length; i++) {
    //     var id = rs[i];
    //     this.CollectData[id]++;
    //     this.CollectDataSum++;
    // }
};

DeskCore.prototype.SummaryReel = function () {


    return {
        CollectDataSum: this.CollectDataSum,
        CollectDataTotalWin: this.CollectDataTotalWin,
        CollectData: this.CollectData
    }


};


DeskCore.prototype.InitSumaryReel = function () {
    this.CollectDataSum = 0;
    this.CollectDataTotalWin = 0;
    this.CollectData = [];
    for (var i = 0; i < 20; i++) {
        this.CollectData[i] = [];
        for (var j = 0; j < 6; j++) {
            this.CollectData[i].push(0);

        }

    }
};

DeskCore.prototype.AddHistory = function (User, WinList) {
    try {
        var isBigWin = 0;
        var bigWinMul = 50;
        var wild = 355;//8888/25
        var title = "";
        //var lbl = ["Nổ Hủ","Wild x5","Thường"];
        if (WinList.totalWin > WinList.totalBet * bigWinMul) {
            isBigWin = 1;
            title = "Thường";
        }
        if (WinList.totalWin > WinList.totalBet * wild) {
            isBigWin = 1;
            title = "Wild x5";
        }
        if (WinList.isJackpot > 0) {
            isBigWin = 1;
            title = "Nổ Hủ";
            User.JackpotTotalWin += WinList.isJackpot;
            this.GameServer.RecordWinJackpot(User.UserID, User.GameName, WinList.totalBet, WinList.isJackpot, WinList.matchId, User.UserChannelID);
            this.GameServer.SendBroadcastMsg(User.GameName + " vừa nổ hủ " + numberWithCommas(WinList.isJackpot) + " gold trong game " + this.GetSlotGameName(0) + ", quá phê quay ngay thôi!", 0);
            this.GameServer.SendBroadcastMsg(User.GameName + " earn jackpot " + numberWithCommas(WinList.isJackpot) + " gold in game " + this.GetSlotGameName(1) + ", awesome you will may be next!", 1);

        }
        if (isBigWin) {
            this.AddTopWin(User.UserID, User.GameName, title, WinList.totalWin, WinList.matchId, WinList.isJackpot);
            this.GameServer.RecordBigWin(User.UserID, User.GameName, title,
                WinList.totalWin, WinList.matchId, WinList.winLine, WinList.isJackpot);
        }
        this.GameServer.RecordResult(User, WinList.totalBet, WinList.totalWin, WinList.useFreeSpin, 0, WinList.isJackpot);
        this.GameServer.AddUserWinHistory(User, WinList.matchId, WinList.totalBet, WinList.winLine.length, WinList.totalWin, WinList.isJackpot)
    } catch (e) {
        this.GameServer.Logger.Game().error('RoomCore.prototype.AddHistory ', e.stack);
    }
};

DeskCore.prototype.UserEnterDesk = function (Socket) {
    if (Utility.CheckVariable(Socket, 'UserModel')) {
        var User = Socket.UserModel;
        if (User.MoneyState == this.GameServer.MoneyStateDefine.GettingCompleted) {
            User.MoneyState = this.GameServer.MoneyStateDefine.JoinGameCompleted;
        } else {
            if (!this.GameServer.IsRoomTrial()) {
                this.GameServer.DestroySocket(User.Socket);
                this.GameServer.Logger.Game().error('RoomCore.prototype.OnUserEnterDesk - User co trang thai tien bat thuong', User.MoneyState);
                return;
            }
        }
        this.GameServer.UserClient.push(Socket);
    } else {
        //Handle case ngoài luồng
    }

};

DeskCore.prototype.UpdateUserLeftDesk = function (Socket) {
    if (Utility.CheckVariable(Socket, 'UserModel')) {
        var User = Socket.UserModel;
        var i;
        if (Socket.UserModel.BonusMiniGameTicket > 0) {
            //Handle Auto
            var ticketCount = Socket.UserModel.BonusMiniGameTicket;
            for (i = 0; i < ticketCount; i++) {
                //Tự chơi mini game
                this.OnUserPickBonusMiniGame(User, 1);
            }
        }
        if (Socket.UserModel.FreeSpinTicket > 0) {
            var freeCount = Socket.UserModel.FreeSpinTicket;
            //Tự quay free spin
            for (i = 0; i < freeCount; i++) {
                this.RollForUserFree(User);
            }
            //Sẽ có case nổ hủ, handle case này

        }
    }
    this.GameServer.UserInfoUpdateAll(Socket);
};

DeskCore.prototype.OnUserGetTopWin = function (User) {
    this.GameServer.SendSocketBinary(User.Socket, new Packet.TopUserWinResponse(this.GameServer.TopBigWinUser));
};

DeskCore.prototype.AddTopWin = function (UserID, GameName, WinLabel, WinGold, MatchID, JackpotValue) {
    this.GameServer.AddTopBigWin(UserID, GameName, WinLabel, (+WinGold + JackpotValue), MatchID);
};

DeskCore.prototype.OnUserGetTopWin = function (User) {
    this.GameServer.SendSocketBinary(User.Socket, new Packet.TopUserWinResponse(this.GameServer.TopBigWinUser));
};

DeskCore.prototype.OnUserGetHistory = function (User) {
    this.GameServer.SendUserHistory(User)
};

DeskCore.prototype.GetLimitBet = function (TotalBet) {
    //TotalBet
    var LimitBet = TotalBet * this.GameServer.ReelConfig.BetListLimitDefault;
    for (var i = 0; i < this.GameServer.ReelConfig.BetListLimit.length; i++) {
        if (TotalBet == this.GameServer.ReelConfig.BetListLimit[i].TotalBet) {
            LimitBet = this.GameServer.ReelConfig.BetListLimit[i].LimitBet;
            break;
        }
    }
    return LimitBet;
};

DeskCore.prototype.GetSlotGameName = function (langCode) {
    var name = "Slot Tứ Long Thần";
    if (this.GameServer.GameKindID == 402) {
        name = "Slot Hoa Quả";
    }
    if (langCode == 1) {
        name = "Dragon Slot";
        if (this.GameServer.GameKindID == 402) {
            name = "Fruit Slot";
        }
    }
    return name;
};

DeskCore.prototype.CalcCocktail = function (User, Count, TotalBet) {
    if (!Utility.CheckVariable(User.CocktailData, "CocktailPoint", "BetRecord")) {
        User.CocktailData = {
            CocktailPoint: 0,
            BetRecord: TotalBet
        }
    }
    if (User.CocktailData.BetRecord != TotalBet) {
        User.CocktailData.CocktailPoint = 0;
    }
    User.CocktailData.CocktailPoint += Count;
    if (User.CocktailData.CocktailPoint >= this.CocktailMaxPoint) {
        User.CocktailData.CocktailPoint = 0;
        this.HandleUserFillUpCocktail(User, TotalBet);
    }
    var percent = Math.floor(Count / this.CocktailMaxPoint * 100);
    if (percent > 100) percent = 100;
    this.GameServer.SendSocketBinary(User.Socket, new Packet.CocktailUpdateResponse(percent));
};

DeskCore.prototype.HandleUserFillUpCocktail = function (User, TotalBet) {
    var reward = TotalBet * this.CocktailRewardMulti;
    User.Wallet += reward;
    this.GameServer.SendSocketBinary(User.Socket, new Packet.CocktailFillUpResponse(0,reward));
};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
