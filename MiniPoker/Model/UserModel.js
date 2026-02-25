module.exports = function (UserModel) {

    UserModel.prototype.OnUserEnterDesk = function (Desk) {
        this.MyDesk = Desk;
        this.UserState = this.GameServer.UserStateDefine.JoinRoomCompleted;

        //Limit Packet feature
        this.LimitTimeStamp = +new Date();
        this.LimitPacket = 20;
        this.PacketSent = 0;
        this.LimitTime = 5000; //ms
        this.JackpotCurrentID = 0;
        this.SlotTotalWin = 0;
        this.SlotTotalLose = 0;
        this.DataRsID = {};
    };


    UserModel.prototype.InitDataRsID = function () {

        for (var i = 0; i < 52; i++) {
            this.DataRsID[i] = 0
        }
    };

    UserModel.prototype.RecordDataRsID = function (Cards, TotalBet) {
        for (var i = 0; i < Cards.length; i++) {//Vì cards này lấy cái trả cho client, client đánh từ 1 server từ 0
            this.DataRsID[Cards[i]-1] = (this.DataRsID[Cards[i]-1] || 0) + TotalBet;
        }
    };

    UserModel.prototype.OnUserWinLoseGold = function (User, Bet, Win) {
        this.SlotTotalWin += Win || 0;
        this.SlotTotalLose += Bet || 0;
    };


};