module.exports = function (UserModel) {

    UserModel.prototype.OnUserEnterDesk = function (Desk) {
        this.MyDesk = Desk;
        this.UserState = this.GameServer.UserStateDefine.JoinRoomCompleted;
        this.MaxComboWin = 0;
        this.MaxComboLose = 0;
        this.ComboWinLose = 0;
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
        var rd = this.RecordData_Find(BetID);
        if (rd == 0) {
            this.RecordData_Gen(BetID, TotalBet, TotalWin, IsFree, Bonus, Jackpot);
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
            freeCount = 1;
        }
        rd.Count += normalCount || 0;
        rd.TotalBet += normalBet || 0;
        rd.TotalWin += normalWin || 0;
        rd.FreeCount += freeCount || 0;
        rd.FreeBet += freeBet || 0;
        rd.FreeWin += freeWin || 0;
        rd.FreeWin += freeWin || 0;
        rd.Bonus += Bonus || 0;
        rd.Jackpot += Jackpot || 0;

    };

    /**
     * @return {number}
     */
    UserModel.prototype.GetUserTotalBet = function (MatchID) {
        var total = 0;
        for (var i = 0; i < this.ListBet.length; i++) {
            if (this.ListBet[i].MatchID == MatchID) {
                total += this.ListBet[i].Gold;
            }
        }
        return total;

    };

    /**
     * @return {number}
     */
    UserModel.prototype.FindBetByID = function (ID) {
        for (var i = 0; i < this.ListBet.length; i++) {
            if (this.ListBet[i].ID == ID) {
                return this.ListBet[i];
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

    /**
     * @return {boolean}
     */
    UserModel.prototype.CheckValidBet = function (ID, BetRatioConfig) {

        if (ID != BetRatioConfig.Tai.ID && ID != BetRatioConfig.Xiu.ID) {
            return false;
        }

        //not both [tai] and [xiu]
        var LookingForID = BetRatioConfig.Xiu.ID;

        if (ID == BetRatioConfig.Xiu.ID) {
            LookingForID = BetRatioConfig.Tai.ID;
        }

        for (var k = 0; k < this.ListBet.length; k++) {
            var currID = this.ListBet[k].ID;

            if (currID == LookingForID) {
                return false;
            }
        }

        return true;
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

    UserModel.prototype.FindBetHistoryByID = function (ID) {
        for (var i = 0; i < this.ListBetHistory.length; i++) {
            if (this.ListBetHistory[i].ID == ID) {
                return this.ListBetHistory[i];
            }
        }
        return 0;
    };

    UserModel.prototype.CheckChatRule = function (Msg) {
        if (!this.ChatTracking) {
            this.ChatTracking = {
                LastChatTime: +new Date(),
                ChatCount: 0
            }
        }
        if (this.ChatTracking.LastChatTime - 5000 < +new Date()) {
            this.ChatTracking.ChatCount = 0;
        }

        if (this.ChatTracking.ChatCount > 5) {
            return false;
        }
        this.ChatTracking.LastChatTime = +new Date();
        return true;
    };
};