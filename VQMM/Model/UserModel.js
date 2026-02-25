module.exports = function (UserModel) {
    UserModel.prototype.OnUserEnterDesk = function (Desk) {
        this.MyDesk = Desk;
        this.UserState = this.GameServer.UserStateDefine.JoinRoomCompleted;

        //Limit Packet feature
        this.LimitTimeStamp = +new Date();
        this.LimitPacket = 20;
        this.PacketSent = 0;
        this.LimitTime = 5000; //ms
        this.VQMMRoll = 0;

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

    UserModel.prototype.GetUserTotalBet = function (MatchID) {
        var total = 0;
        for (var i = 0; i < this.ListBet.length; i++) {
            if (this.ListBet[i].MatchID == MatchID) {
                total += this.ListBet[i].Gold;
            }
        }
        return total;

    };

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

    UserModel.prototype.CheckValidBet = function (ID, BetRatioConfig) {
        if (ID != BetRatioConfig.PlayerWin.ID && ID != BetRatioConfig.BankerWin.ID) {
            return true;
        }

        //not both banker and player
        var LookingForID = BetRatioConfig.PlayerWin.ID;

        if (ID == BetRatioConfig.PlayerWin.ID) {
            LookingForID = BetRatioConfig.BankerWin.ID;
        }

        for (var i = 0; i < this.ListBet.length; i++) {
            var currID = this.ListBet[i].ID;

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

    UserModel.prototype.UpdateMoney = function (MoneyChange) {
        this.Wallet += MoneyChange;
    };

    UserModel.prototype.UpdateFreeSpin = function (FreeSpin) {
        this.SpinInfo.IsChange = true;
        this.SpinInfo.FreeSpinTicket += FreeSpin;
    };

    UserModel.prototype.OnUserSpin = function (GoldBet) {
        if (this.SpinInfo.DailySpinTicket > 0) {
            this.SpinInfo.IsChange = true;
            this.SpinInfo.DailySpinTicket--;
            this.VQMMRoll++;
            return 1;
        }
        if (this.SpinInfo.FreeSpinTicket > 0) {
            this.SpinInfo.IsChange = true;
            this.SpinInfo.FreeSpinTicket--;
            this.VQMMRoll++;
            return 2;
        }
        if (this.Wallet >= GoldBet) {
            this.Wallet -= GoldBet;
            this.TotalGoldUserPayForSys += GoldBet;
            this.VQMMRoll++;
            return 3;
        }
        return 0;
    };

    UserModel.prototype.LoadInfo = function (SpinInfo) {
        this.SpinInfo = SpinInfo;
    };

    UserModel.prototype.UpdateSpinInfo = function (DailyTicket, FreeTicket) {
        if (typeof this.SpinInfo != 'undefined' && typeof this.SpinInfo.DailySpinTicket != 'undefined' && typeof this.SpinInfo.FreeSpinTicket != 'undefined' ) {
            this.SpinInfo.IsChange = true;
            this.SpinInfo.DailySpinTicket += DailyTicket;
            this.SpinInfo.FreeSpinTicket += FreeTicket;

            this.MyDesk.UpdateUserInfo(this);
        }
    };

    UserModel.prototype.GetTotalFreeSpin = function () {
        if (typeof this.SpinInfo != 'undefined') {
            return this.SpinInfo.DailySpinTicket + this.SpinInfo.FreeSpinTicket;
        }
        return 0;
    };
};