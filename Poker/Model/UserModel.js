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

    this.UserTrackingID = -1; // ma dung de tracking
    this.UserChannelID = -1; // ma kenh user den
    this.UserProviderID = -1; // ma loai hinh account
    this.UserPlatformID = -1; // ma loai hinh account
}

module.exports = UserModel;


UserModel.prototype.OnUserEnterDesk = function (Desk) {
    this.MyDesk = Desk;
    this.UserState = this.GameServer.UserStateDefine.JoinRoomCompleted;
};

UserModel.prototype.OnUserLeftDesk = function () {
    this.MyDesk = 0;
};

UserModel.prototype.FindBetByID = function (ID) {
    for (var i = 0; i < this.ListBet.length; i++) {
        if (this.ListBet[i].ID == ID) {
            return this.ListBet[i];
        }
    }
    return 0;
};

UserModel.prototype.FindBetHistoryByID = function (ID) {
    for (var i = 0; i < this.ListBetHistory.length; i++) {
        if (this.ListBetHistory[i].ID == ID) {
            return this.ListBetHistory[i];
        }
    }
    return 0;
};

UserModel.prototype.OnUserBetSuccess = function (MatchID, ID, Gold, Tax) {
    var bet = this.FindBetByID(ID);
    this.HistoryBet.push({
        MatchID: MatchID,
        ID: ID,
        Gold: Gold
    });
    if (bet == 0) {
        this.ListBet.push(
            {
                MatchID: MatchID,
                ID: ID,
                Gold: Gold,
                WinGold: 0,
                WinGoldNoTax: 0
            }
        )
    } else {
        bet.Gold += Gold;
    }
    this.GameServer.LogUserBet_Insert(this, ID, Gold, MatchID, Tax);

};

UserModel.prototype.OnUserWin = function (MatchID, UserWinList, Tax) {
    for (var i = 0; i < UserWinList.length; i++) {
        var bet = this.FindBetHistoryByID(UserWinList[i].ID);
        if (bet != 0) {
            bet.WinGold += UserWinList[i].Money;
            bet.WinGoldNoTax += UserWinList[i].WinGoldNoTax;
        }
    }
    //UpdateHistory
    this.GameServer.LogUserBetEndMatch_Insert(this, MatchID, Tax);
};

UserModel.prototype.GetUserTotalBet = function (MatchID) {
    var total = 0;
    for (var i = 0; i < this.ListBet.length; i++) {
        if (this.ListBet[i].MatchID == MatchID) {
            total += this.ListBet[i].Gold;
        }
    }
    return total;

};
