function UserModel(gameserver, socket) {
    this.UserID = 0;
    this.GameServer = gameserver;
    this.MyDesk = 0;
    this.DeskID = 0;
    this.Socket = socket;
    this.PingMiss = 0;
    this.TimeIn = new Date();
    this.BeginWallet = 0;
    this.Wallet = 0;
    this.ListBet = [];
    this.ListBetHistory = [];
    this.HistoryBet = [];
    this.HistoryResult = [];
    this.UserState = 0;


    this.BonusMiniGameTicket = 0;
    this.BonusMiniGameMultiple = 0;
    this.BonusMiniGameStage = 0;
    this.BonusMiniGameTotalBet = 0;
    this.BonusMiniGameTotalWin = 0;

    this.FreeSpinTicket = 0;
    this.FreeSpinTotalBet = 0;

    this.JackpotCurrentID = 250;

    this.UserTrackingID = -1; // ma dung de tracking
    this.UserChannelID = -1; // ma kenh user den
    this.UserProviderID = -1; // ma loai hinh account
    this.UserPlatformID = -1; // ma loai hinh account

    //Count Bet, Total Bet, Total Reward, Count ID
    this.RecordData = [];
    this.BonusTotalWin = 0;
    this.JackpotTotalWin = 0;
    this.InitDataRsID();
    this.RechargeGold = 0;
    this.PreSlotCollectData = 0;
    this.PreSlotTotalWin = 0;
    this.PreSlotTotalLose = 0;
    this.SlotTotalWin = 0;
    this.SlotTotalLose = 0;
    this.CocktailData = {};
    this.SlotRollCount = 0;
    this.UserMissionList = [];
    this.UserAchievementList = [];
    this.MatchPlayed = 0;
    this.TotalGoldUserPayForSys = 0;
}

module.exports = UserModel;


UserModel.prototype.OnUserEnterDesk = function (Desk) {
    this.MyDesk = Desk;
    this.UserState = this.GameServer.UserStateDefine.JoinRoomCompleted;
};

UserModel.prototype.RecordData_Gen = function (BetID, TotalBet, TotalWin, IsFree, Bonus, Jackpot) {
    var f = 0;
    for (var i = 0; i < this.RecordData.length; i++) {
        if (this.RecordData[i].BetID == BetID) {
            f = 1;
        }
    }
    if (f == 0) {
        var normalBet = TotalBet;
        var normalWin = TotalWin;
        var normalCount = 1;
        var freeBet = 0;
        var freeWin = 0;
        var freeCount = 0;

        if (IsFree) {
            normalCount = 0;
            normalBet = 0;
            normalWin = 0;
            freeBet = TotalBet;
            freeWin = TotalWin;
            freeCount = 1;
        }
        this.RecordData.push({
            BetID: BetID,
            Count: normalCount,
            TotalBet: normalBet,
            TotalWin: normalWin,
            FreeCount: freeCount,
            FreeBet: freeBet,
            FreeWin: freeWin,
            Bonus: Bonus,
            Jackpot: Jackpot
        })
    }
};

UserModel.prototype.RecordData_Find = function (BetID) {
    for (var i = 0; i < this.RecordData.length; i++) {
        if (this.RecordData[i].BetID == BetID) {
            return this.RecordData[i];
        }
    }
    return 0;
};

UserModel.prototype.RecordData_Update = function (BetID, TotalBet, TotalWin, IsFree, Bonus, Jackpot) {
    if (TotalBet > 0) {
        this.SlotRollCount++;
    }
    var rd = this.RecordData_Find(BetID);
    if (rd == 0) {
        this.RecordData_Gen(BetID, TotalBet, TotalWin, IsFree, Bonus, Jackpot);
        return;
    }
    var normalBet = TotalBet;
    var normalWin = TotalWin;
    var normalCount = 1;
    var freeBet = 0;
    var freeWin = 0;
    var freeCount = 0;

    if (IsFree) {
        normalCount = 0;
        normalBet = 0;
        normalWin = 0;
        freeBet = TotalBet;
        freeWin = TotalWin;
        if (TotalBet == 0) {// case tra KQ ko record them free count tranh double
            freeCount = 0;
        } else {
            freeCount = 1;
        }

    }
    rd.Count += normalCount || 0;
    rd.TotalBet += normalBet || 0;
    rd.TotalWin += normalWin || 0;
    rd.FreeCount += freeCount || 0;
    rd.FreeBet += freeBet || 0;
    rd.FreeWin += freeWin || 0;
    rd.Bonus += Bonus || 0;
    rd.Jackpot += Jackpot || 0;

};

UserModel.prototype.InitDataRsID = function () {
    this.DataRsID = [];
    this.MaxDataRsID = 20;
    this.MaxDataRsCount = 6;
    for (var i = 0; i < this.MaxDataRsID; i++) {
        this.DataRsID[i] = [];
        for (var j = 0; j < this.MaxDataRsCount; j++) {
            this.DataRsID[i].push(0);

        }
    }
};

UserModel.prototype.RecordDataRsID = function (ID, IDCount, TotalBet) {
    if (ID < 0 || ID > this.MaxDataRsID) return; // KO track các case ngoài luồng
    if (IDCount < 0 || IDCount > this.MaxDataRsCount) return; // KO track các case ngoài luồng
    this.DataRsID[ID][IDCount] += TotalBet;
};

UserModel.prototype.OnUserWinLoseGold = function (User, Bet, Win) {
    this.SlotTotalWin += Win || 0;
    this.SlotTotalLose += Bet || 0;
};

