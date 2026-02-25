

module.exports = function (UserModel) {
    UserModel.prototype.OnUserEnterDesk = function (Desk) {
        this.MyDesk = Desk;
        this.Cards = [];
        this.SignToQuit = 0;
        this.UserState = this.GameServer.UserStateDefine.JoinRoomCompleted;
        this.MatchResult = {
            GoldWin: 0,
            IsDone: 0,
            WinType: 0,
            Order: 0,
            PenaltyDetail: {
                //CONG: 0,
                //HEO_DEN: 0,
                //HEO_DO: 0,
                //BA_DOI_THONG: 0,
                //TU_QUY: 0,
                //BON_DOI_THONG: 0
            },
            GetPenalty: 0
        }
        this.LastChatTime = 0;
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

    UserModel.prototype.CheckValidBet = function(ID, BetRatioConfig){
        if(ID != BetRatioConfig.PlayerWin.ID && ID != BetRatioConfig.BankerWin.ID){
            return true;
        }

        //not both banker and player
        var LookingForID = BetRatioConfig.PlayerWin.ID;

        if(ID == BetRatioConfig.PlayerWin.ID){
            LookingForID = BetRatioConfig.BankerWin.ID;
        }

        for(var i = 0; i < this.ListBet.length; i++){
            var currID = this.ListBet[i].ID;

            if(currID == LookingForID){
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

    UserModel.prototype.GetSmallestCard = function(){
        var SmallestCard = {
            Score: 0,
            Suit: 0
        };

        if(this.Cards.length == 0){
            return SmallestCard;
        }

        SmallestCard = this.Cards[0];

        for(var i = 0; i < this.Cards.length; i++){
            if((SmallestCard.Score * 10 + SmallestCard.Suit) > (this.Cards[i].Score * 10 + this.Cards[i].Suit)){
                SmallestCard = this.Cards[i];
            }
        }

        return SmallestCard;
    }

    UserModel.prototype.CheckHandCards = function(_Cards){
        //??m b?o check ko trùng tr??c

        var Count = 0;

        for(var i = 0; i < _Cards.length; i++){
            for(var j = 0; j < this.Cards.length; j++){
                if(_Cards[i].Score == this.Cards[j].Score
                && _Cards[i].Suit == this.Cards[j].Suit){
                    Count++;
                    break;
                }
            }
        }

        if(Count == _Cards.length){
            return 1;
        }
        return 0;
    }

    UserModel.prototype.DropCards = function(_Cards){
        for(var i = 0; i < _Cards.length; i++){
            for(var j = 0; j < this.Cards.length; j++){
                if(_Cards[i].Score == this.Cards[j].Score
                    && _Cards[i].Suit == this.Cards[j].Suit){
                    this.Cards.splice(j, 1);
                    j--;
                    break;
                }
            }
        }
    }

    UserModel.prototype.AddPenaltyDetail = function(PenaltyTitle, PenaltyNumber){
        if(this.MatchResult.GetPenalty == 0){
            this.MatchResult.GetPenalty = 1;
        }

        if(PenaltyNumber <= 0){
            return;
        }

        if(typeof this.MatchResult.PenaltyDetail[PenaltyTitle] == 'undefined'){
            this.MatchResult.PenaltyDetail[PenaltyTitle] = 0;
        }

        this.MatchResult.PenaltyDetail[PenaltyTitle] += PenaltyNumber;
    }
};