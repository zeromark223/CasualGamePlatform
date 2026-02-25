/*{"build":1}*/
//sys lib
var MainCore = require('../MainCore/MainCore');
var Config = require('../Config/TLMN');
var ModuleExtension = require('./Modules');
var UserController = require('./Controller/UserController');
var Packet = require('./Packet');
var SmartRequire = require('../SharedModule/smartRequire');
var Utility = require('../SharedModule/Utility');
var UserModel = require('./Model/UserModel');

function Main() {
    this.GameID = 5;

    //GameID = 5, KindID: 501

    this.MainTimer.push({
        Tick: 0,
        Interval: 2000,
        Wake: this.Timer2seconds.bind(this)
    });

    this.MainTimer.push({
        Tick: 0,
        Interval: 10000,
        Wake: this.Timer10seconds.bind(this)
    });

    this.InitHistory = [];
    this.BetRatioConfig = Config.BetRatioConfig;
    this.BetLimitConfig = Config.BetLimitConfig;
}

Main.prototype = new MainCore(Config);
module.exports = Main;

MainCore.prototype.InitAllExtension = function () {
    ModuleExtension.SQLAdapter(this.SQLAdapter);
    ModuleExtension.RedisAdapter(this.RedisAdapter);
    ModuleExtension.LogRecorder(this.LogRecorder);
    UserController(this.UserController);
    UserModel(this.UserModel);
    //this.LoadHistory();

};

MainCore.prototype.GetDeskForUser = function (Socket) {
    try {
        //push vào danh sách user Room
        if (Socket.UserModel.MoneyState == this.MoneyStateDefine.GettingCompleted) {
            Socket.UserModel.MoneyState = this.MoneyStateDefine.JoinGameCompleted;
            this.UserClient.push(Socket);
            //this.FindDeskForUser(Socket);
            this.SendSocketBinary(Socket, new this.BasicPacket.LoginResponse(Socket.UserModel.UserID, Socket.UserModel.Wallet, Socket.UserModel.GameName));

            var Desk = this.CheckReconnectUser(Socket);
            if (Desk != 0) {
                Desk.OnUserReconnect(Socket);
            }
            this.Logger.Game().debug("Get Desk UserLen", this.UserClient.length);

        } else {
            this.DestroySocket(User.Socket);
            this.Logger.Game().error('DeskCore.prototype.OnUserEnterDesk - User co trang thai tien bat thuong', User.MoneyState);
            return;
        }
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetDeskForUser - try err: ' + e.stack);
    }
};

MainCore.prototype.FindDeskForUser = function (Socket) {
    try {
        for (var i = 0; i < this.DeskList.length; i++) {
            if (this.DeskList[i].IsAvailable()) {
                this.DeskList[i].UserEnterDesk(Socket)
            }
        }
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.FindAvailableDesk - try err: ' + e.stack);
    }
};

MainCore.prototype.Timer2seconds = function () {
    try {
        this.UpdateDeskTimer2Second();
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.Timer2seconds - try err: ' + e.stack);
    }
};

MainCore.prototype.Timer10seconds = function () {
    try {
        this.ReloadBetLimitConfig();
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.Timer2seconds - try err: ' + e.stack);
    }
};

MainCore.prototype.UpdateDeskTimer2Second = function () {
    for (var i = 0; i < this.DeskList.length; i++) {
        this.DeskList[i].DeskTimer2Second();
    }
};

MainCore.prototype.ReloadBetLimitConfig = function () {
    try {

        var BetLimitConfig = requireUnCached('../Config/TLMN/BetLimitConfig.js');//Ko gan truc t iep, tranh loi
        this.BetLimitConfig = BetLimitConfig;

    } catch (e) {
        this.Logger.Game().error('MainCore.prototype.ForceReloadConfigStock - try err: ' + e);
    }
};

MainCore.prototype.CheckStockAndMaintain = function () {

    //them co maintain, check startround.
    if (this.Stock < this.BetLimitConfig.MaintainStock) {
        this.MaintainServer();
    }
};

function requireUnCached(NameLink) {//Use to re require
    var l = module.children.length;
    for (var i = 0; i < l; i++) {
        if (module.children[i].id === require.resolve(NameLink)) {
            module.children.splice(i, 1);
            break;
        }
    }
    delete require.cache[require.resolve(NameLink)];
    return require(NameLink);
}


MainCore.prototype.GenMatchInfo = function (DeskID, Tax, GoldBet, CardDeck, callback) {
    this.LogRecorder.logStartMatch(DeskID, this.GameServerID, this.GameKindID, Tax, GoldBet, CardDeck, function (e, d) {
        if (!e) {
            if (Utility.CheckVariable(d, 'insertId')) {
                callback(e, d.insertId);
            } else {
                callback(e, d);
            }
        }
    }.bind(this));
};

MainCore.prototype.RecordMatchInfo = function (MatchID, DeskID, ResultCards, ResultText, ResultTextEncrypted, Win, Lose, TotalTax, Tax) {
    this.LogRecorder.logEndMatch(MatchID, ResultCards.toString(), ResultText, ResultTextEncrypted, Win, Lose, TotalTax, Tax, this.Stock, this.GameServerID, DeskID, this.GameKindID, function (e, d) {
        if (e) {
            this.Logger.Game().error('GameServer.prototype.RecordMatchInfo Record Error ', "MatchID, DeskID, ResultCards, ResultText, ResultTextEncrypted, Win, Lose, TotalTax,Tax", MatchID, DeskID, ResultCards, ResultText, ResultTextEncrypted, Win, Lose, TotalTax, Tax);
        }
    }.bind(this))
};


MainCore.prototype.LogUserBet_Insert = function (User, ID, Gold, MatchID, Tax) { // Log tam
    try {
        this.LogRecorder.logUserBet(User.UserID, ID, Gold, MatchID, Tax)
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.LogUserBet_Insert - try err:' + e.stack);
    }
};

MainCore.prototype.LogUserBetEndMatch_Insert = function (User, MatchID, Tax) {// Log end game insert DB

    // Insert vao bang tong
    try {
        for (var i = 0; i < User.ListBetHistory.length; i++) {
            if (User.ListBetHistory[i].MatchID == MatchID) {

                this.LogRecorder.logUserBetEndGame(User.UserID, User.ListBetHistory[i].ID, User.ListBetHistory[i].Gold, MatchID, Tax, User.ListBetHistory[i].WinGold, User.ListBetHistory[i].WinGoldNoTax)
            }
        }

        User.ListBetHistory = []; //Sau khi Insert thi clear
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.LogUserBetEndMatch_Insert - try err:' + e.stack);
    }

};

MainCore.prototype.UserInfoUpdateAll = function (socket) {
    if (socket.InfoUpdateAll) {// Chan code ngu, goi nhieu lan
        return;
    }

    socket.InfoUpdateAll = true;
    this.LogUserOutGame(socket.UserModel, function (errCode, matchId) { // Neu thanh cong ghi nhan log out game
        if (errCode == 0) {
            this.CalcAndRefundUserMoney(socket, function () {

                this.OnEndGameAndUpdateCompleted(socket.UserModel);
            }.bind(this));
            this.OnUserEndGame(socket.UserModel, matchId);
        } else {
            this.Logger.Game().error('GameServer.prototype.UserInfoUpdateAll CalcAndRefundUserMoney err ', errCode);
            //Handle Error
        }
    }.bind(this));
};

MainCore.prototype.CalcAndRefundUserMoney = function (Socket, callback) {
    try {
        if (Socket.UserModel.MoneyState == this.MoneyStateDefine.JoinGameCompleted) {//User đã lấy tiền thành công và vào chơi game
            var moneyRefund = Socket.UserModel.Wallet; // tien hien tai cua user
            this.MoneyRefundWithChanged(Socket.UserModel, moneyRefund, callback);

        } else {
            this.Logger.Game().debug('GameServer.prototype.CalcAndRefundUserMoney MoneyState  ', Socket.UserModel.MoneyState);
        }
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.CalcAndRefundUserMoney try  ', e.stack);
    }

};

MainCore.prototype.MoneyRefundWithChanged = function (User, MoneyRefund, callback) {
    this.SQLAdapter.moneyRefundAll(User.UserID,
        this.Config.MoneyReasonConfig.GameOutMoneyRefundAll,
        'Hoàn tiền user ra game',
        MoneyRefund,
        User.UserChannelID,
        User.UserProviderID,
        User.UserPlatformID,
        this.GameServerID,
        User.UserTrackingID,
        this.GameKindID,
        this.GameID,
        function (e, d) {
            if (typeof callback == 'function') {
                callback();
            }
            if (e != 0) {
                this.Logger.Game().error('GameServer.prototype.MoneyRefundWithChanged ', e,
                    this.Config.MoneyReasonConfig.GameOutMoneyRefundAll,

                    'Hoàn tiền user ra game',
                    MoneyRefund,
                    User.UserChannelID,
                    User.UserProviderID,
                    User.UserPlatformID,
                    this.GameServerID,
                    User.UserTrackingID,
                    this.GameKindID
                );
            }
        }.bind(this));

};


MainCore.prototype.OnEndGameAndUpdateCompleted = function (User) {
    this.GMToolAdapter.SendBroadCastMasterCommand({
        CMD: this.Config.GMToolConfig.CMD.UserOutGameCompleted,
        SID: 0,
        Data: {
            UserID: User.UserID
        }
    });
};

MainCore.prototype.OnUserEndGame = function (User, MatchID) {
    try {
        //Logging
        //this.EventManager.EvtOnUserOutGameAll(User);

    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.OnUserEndGame - try err:' + e.stack);
    }

};

MainCore.prototype.LoadHistory = function () {
    try {
        /*
         this.MatchHistory.push({
         BankerScore: BankerScore,
         PlayerScore: PlayerScore,
         BankerPair: BankerPair,
         PlayerPair: PlayerPair
         })
         */

        this.LogRecorder.LoadHistory(function (e, r) {
            if (!e) {
                for (var i = 0; i < r.length; i++) {
                    var History = this.ParseResultFromHistory(r[i].ResultCards);
                    this.InitHistory.push(History);
                }

                for (var i = 0; i < this.DeskList.length; i++) {
                    this.DeskList[i].InitHistory();
                }
            }
        }.bind(this))
    }
    catch (e) {
        this.Logger.Game().error('MainCore.prototype.LoadHistory Get DataErr', e);
    }
};

MainCore.prototype.ParseResultFromHistory = function (strResult) {
    try {
        if (typeof strResult[strResult.length - 1] != 'number') {
            strResult = strResult.substring(0, strResult.length - 1);
        }

        var str = strResult.split('_');

        var Banker_str = str[0];
        var Player_str = str[1];

        //Banker
        Banker_str = Banker_str.substr(Banker_str.indexOf(':') + 1, Banker_str.length);
        var Banker_arr = Banker_str.split(',');
        for (var i = 0; i < Banker_arr.length; i++) {
            Banker_arr[i] = parseInt(Banker_arr[i]);
        }

        //Player
        Player_str = Player_str.substr(Player_str.indexOf(':') + 1, Player_str.length);
        var Player_arr = Player_str.split(',');
        for (var i = 0; i < Player_arr.length; i++) {
            Player_arr[i] = parseInt(Player_arr[i]);
        }

        return {
            BankerCards: Banker_arr,
            PlayerCards: Player_arr
        }
    }
    catch (e) {
        this.Logger.Game().error('MainCore.prototype.ParseResultFromHistory Get DataErr', e);
    }
};

MainCore.prototype.GetRoomList = function (Socket) {
    try {
        //HARDCODED
        var RoomList = [10, 100, 1000];
        //HARDCODED
        this.SendSocketBinary(Socket, new Packet.GetRoomListResponse(RoomList));
    }
    catch (e) {
        this.Logger.Game().error('MainCore.prototype.GetRoomList Get DataErr', e);
    }
};

MainCore.prototype.UserJoinRoom = function (Socket, RoomKind) {
    try {
        if (Socket.IsJoinRoom == true) {
            this.Logger.Game().debug("Multi join room");
            return;
        }

        var MoneyRequired = this.BetLimitConfig.GoldBet * this.BetLimitConfig.MinMultipleJoin;
        //check tien
        if (Socket.UserModel.Wallet < MoneyRequired) {
            var ShowMsg = this.GetUserMsgByLangCode(this.Config.LanguageConfig.TLMNLimitGold_Error, Socket.LangCode);
            ShowMsg = ShowMsg.replace("%s", MoneyRequired);
            this.Logger.Game().debug("ShowPopup", ShowMsg);
            this.ShowPopup(Socket, ShowMsg);
            return;
        }

        Socket.IsJoinRoom = true;

        var FindDeskForUser = this.FindAvailableDesk(RoomKind);

        if (FindDeskForUser.Desk == -1 || FindDeskForUser.Position == -1) {
            return;
        }

        Socket.UserModel.DeskID = FindDeskForUser.Desk;
        Socket.UserModel.Position = FindDeskForUser.Position;

        //push vao desk
        this.JoinDesk(this.DeskList[Socket.UserModel.DeskID], Socket.UserModel);

    }
    catch (e) {
        this.Logger.Game().error('MainCore.prototype.UserJoinRoom Get DataErr', e);
    }
};

MainCore.prototype.FindAvailableDesk = function (RoomKind) {
    try {
        var Result = {
            Desk: -1,
            Position: -1
        };

        for (var i = 0; i < this.DeskList.length; i++) {
            //TODO: check RoomKind
            Result.Desk = i;
            Result.Position = this.DeskList[i].FindPositionForUser();

            if (Result.Position > -1) {
                return Result;
            }
        }
    }
    catch (e) {
        this.Logger.Game().error('MainCore.prototype.FindAvailableDesk Get DataErr', e);
    }

    return {Desk: -1, Position: -1};
};

MainCore.prototype.JoinDesk = function (Desk, User) {
    try {
        Desk.AddUser(User);
    }
    catch (e) {
        this.Logger.Game().error('MainCore.prototype.JoinDesk Error', e);
    }
};

MainCore.prototype.CheckReconnectUser = function (Socket) {
    try {
        var User = Socket.UserModel;
        for (var i = 0; i < this.DeskList.length; i++) {
            var Desk = this.DeskList[i];
            var ReconnectUser = Desk.FindDisconnectedUser(User.UserID);

            if (ReconnectUser != 0) {
                return Desk;
            }
        }

        return 0;
    }
    catch (e) {
        this.Logger.Game().error('MainCore.prototype.CheckReconnectUser Error', e);
    }
};

MainCore.prototype.CheckAvailableUser = function (Socket) {
    var UserID = Socket.UserModel.UserID;

    for (var i = 0; i < this.DeskList.length; i++) {
        if (this.DeskList[i].CheckUserInDesk(Socket.UserModel.UserID)) {
            return 1;
        }
    }

    return 0;
};

MainCore.prototype.CalcAndRefundUserMoneyForDisconnectUser = function (UserModel, callback) {
    try {
        if (UserModel.MoneyState == this.MoneyStateDefine.JoinGameCompleted) {//User đã lấy tiền thành công và vào chơi game
            var moneyRefund = UserModel.Wallet; // tien hien tai cua user
            this.MoneyRefundWithChanged(UserModel, moneyRefund, callback);

        } else {
            this.Logger.Game().debug('GameServer.prototype.CalcAndRefundUserMoney MoneyState  ', Socket.UserModel.MoneyState);
        }
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.CalcAndRefundUserMoney try  ', e.stack);
    }

};

MainCore.prototype.UpdateForDisconnectUser = function (UserModel) {
    this.LogUserOutGame(UserModel, function (errCode, matchId) { // Neu thanh cong ghi nhan log out game
        if (errCode == 0) {
            this.CalcAndRefundUserMoneyForDisconnectUser(UserModel, function () {

                this.OnEndGameAndUpdateCompleted(UserModel);
            }.bind(this));
        } else {
            this.Logger.Game().error('GameServer.prototype.UpdateForDisconnectUser CalcAndRefundUserMoney err ', errCode);
            //Handle Error
        }
    }.bind(this));
};


MainCore.prototype.LogEndMatch = function(MatchID, Tax, GoldBet, DeskID, Detail){
    try{
        this.LogRecorder.logEndMatch(MatchID, Detail, Tax, GoldBet, this.GameKindID, this.GameServerID, DeskID, function(e, d){
            if(e){
                this.Logger.Game().error('GameServer.prototype.LogEndMatch SQL Error', e, MatchID, Tax, GoldBet, this.GameKindID, this.GameServerID, DeskID);
            }
        }.bind(this))
    }
    catch(e){
        this.Logger.Game().error('GameServer.prototype.LogEndMatch try  ', e.stack);
    }
};

MainCore.prototype.GeneralChat = function(Socket, Message){
    try{
        var UserName = Socket.UserModel.GameName;
        var now = +new Date();
        if(now - Socket.UserModel.LastChatTime > 3000){
            var msg = new Packet.GeneralChatResponse(UserName, Message);
            this.SendAllUserNotInRoom(msg);
            Socket.UserModel.LastChatTime = now;
        }
    }
    catch(e){
        this.Logger.Game().error('DeskCore.prototype.GeneralChat Error', e);
    }
};

MainCore.prototype.SendAllUserNotInRoom = function(msg){
    try{
        for(var i = 0; i < this.UserClient.length; i++){
            if(!this.UserClient[i].IsJoinRoom){
                this.SendSocketBinary(this.UserClient[i], msg);
            }
        }
    }
    catch(e){
        this.Logger.Game().error('DeskCore.prototype.SendAllUserNotInRoom Error', e);
    }
};