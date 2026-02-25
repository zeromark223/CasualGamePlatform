var PacketConfig = require('../PacketConfig');
var fs = require('fs');

function UserController(gameServer, socket) {
    this.GameServer = gameServer;
    this.Socket = socket;
    this.Socket.currentPacketId = 0;
}

module.exports = UserController;

UserController.prototype.HandleMessage = function (message) {
    try {
        //console.log("handleMEssage", message);

        var RequestObject = JSON.parse(message);
        var packetId = RequestObject.packetId;
        var data = RequestObject.data;

        console.log("packetId", packetId);
        console.log("data", data);

        var PacketIndex = this.Socket.Permission.indexOf(packetId);

        if((PacketIndex < 0 && packetId != 99) && this.Socket.IsAdmin == 0){
            console.log("wrong role");
            return;
        }

        this.Socket.currentPacketId = packetId;
        if (packetId != 99 && !this.Socket.IsLoginCompleted) {
            console.log("Client is not Logged in");
            return;
        }

        this.WriteLog(packetId, data);
        switch (packetId) {

            case PacketConfig.GetTotalSystemGold:
                var DateFrom = data.DateFrom;
                var DateTo = data.DateTo;
                this.GameServer.GetTotalSystemGold(this.Socket, DateFrom, DateTo);
                break;

            case PacketConfig.GetGameStatus:
                var DateFrom = data.DateFrom;
                var DateTo = data.DateTo;
                this.GameServer.GetGameStatus(this.Socket, DateFrom, DateTo);
                break;
            case PacketConfig.GetTopGold:
                var Top = data.Top;

                if(Top > 5000){
                    Top = 1;
                }

                this.GameServer.GetTopGold(this.Socket, Top);
                break;

            case PacketConfig.GetTopWin:
                var DateFrom = data.DateFrom;
                var DateTo = data.DateTo;
                var Top = data.Top;
                this.GameServer.GetTopWin(this.Socket, DateFrom, DateTo, Top);
                break;

            case PacketConfig.GetLogGoldUser:
                var UserID = data.UserID;
                var DateFrom = data.DateFrom;
                var DateTo = data.DateTo;
                var Nick = data.Nick;
                var TimeFrom = data.TimeFrom;
                var TimeTo = data.TimeTo;
                this.GameServer.GetLogGoldUser(this.Socket, UserID, DateFrom, DateTo, Nick, TimeFrom, TimeTo);
                break;

            case PacketConfig.GetMoneyStatus:
                var DateFrom = data.DateFrom;
                var DateTo = data.DateTo;
                var TimeFrom = data.TimeFrom;
                var TimeTo = data.TimeTo;
                this.GameServer.GetMoneyStatus(this.Socket, DateFrom, DateTo, TimeFrom, TimeTo);
                break;

            case PacketConfig.GetMoneyFlowStatistics:
                var DateFrom = data.DateFrom;
                var DateTo = data.DateTo;
                this.GameServer.GetMoneyFlowStatistics(this.Socket, DateFrom, DateTo);
                break;

            case PacketConfig.GetGlobalBossList:
                this.GameServer.GetGlobalBossList(this.Socket);
                break;

            case PacketConfig.GetGlobalBossName:
                this.GameServer.GetGlobalBossName(this.Socket);
                break;

            case PacketConfig.UpdateGlobalBoss:
                var GlobalBoss = data;
                this.GameServer.UpdateGlobalBoss(this.Socket, GlobalBoss);
                break;

            case PacketConfig.AddGlobalBoss:
                var GlobalBoss = data;
                this.GameServer.AddGlobalBoss(this.Socket, GlobalBoss);
                break;

            case PacketConfig.DeleteGlobalBoss:
                var BossID = data.BossID;
                this.GameServer.DeleteGlobalBoss(this.Socket, BossID);
                break;

            case PacketConfig.GetCCULog:
                var DateFrom = data.DateFrom;
                var DateTo = data.DateTo;

                this.GameServer.GetCCULog(this.Socket, DateFrom, DateTo);
                break;

            case PacketConfig.GetBroadcast:
                this.GameServer.GetBroadcast(this.Socket);
                break;

            case PacketConfig.UpdateBroadcast:

                var BroadCast = data;
                this.GameServer.UpdateBroadcast(this.Socket, BroadCast);
                break;

            case PacketConfig.DeleteBroadcast:
                var ID = data.ID;
                this.GameServer.DeleteBroadcast(this.Socket, ID);

                break;

            case PacketConfig.AddBroadcast:

                var BroadCast = data;
                this.GameServer.AddBroadcast(this.Socket, BroadCast);

                break;

            case PacketConfig.GetLogGoldUser_Redis:
                var DateFrom = data.DateFrom;
                var UserID = data.UserID;
                this.GameServer.GetLogGoldUser_Redis(this.Socket, UserID, DateFrom);
                break;

            case PacketConfig.GetStock:
                this.GameServer.GetStock(this.Socket);

                break;

            case PacketConfig.UpdateStock:
                var Key = data.Key;
                var Value = data.Value;
                this.GameServer.UpdateStock(this.Socket, Key, Value);

                break;

            case PacketConfig.GetEventList:

                this.GameServer.GetEventList(this.Socket);
                break;

            case PacketConfig.UpdateEvent:

                var Data = data;
                this.GameServer.UpdateEvent(this.Socket, Data);
                break;

            case PacketConfig.GetEventData:
                var EventCode = data.EventCode;
                var Top = data.Top;
                this.GameServer.ShowEventData(this.Socket, EventCode, Top);
                break;

            case PacketConfig.DeleteEventData:

                var EventCode = data.EventCode;
                this.GameServer.DeleteEventData(this.Socket, EventCode);
                break;

            case PacketConfig.GetUserList:

                var RequestInfo = data.RequestInfo;
                var OptionID = data.OptionID;

                this.GameServer.GetUserList(this.Socket, RequestInfo, OptionID);
                break;

            case PacketConfig.GetUserInfo:
                var UserID = data.UserID;

                this.GameServer.GetUserInfo(this.Socket, UserID);
                break;

            case PacketConfig.KickUser:

                var UserID = data.UserID;
                this.GameServer.KickUser(this.Socket, UserID);
                break;

            case PacketConfig.GetLogUserKillBoss:
                //var UserID = data.UserID;
                var DateFrom = data.DateFrom;
                var DateTo = data.DateTo;
                var UserID = data.UserID;
                var Nick = data.Nick;

                this.GameServer.GetLogUserKillBoss(this.Socket, DateFrom, DateTo, UserID, Nick);
                break;

            case PacketConfig.Slot_GetInfo:
                var Date = data.Date;

                this.GameServer.Slot_GetInfo(this.Socket, Date);
                break;

            case PacketConfig.GetAdminList:
                var AccountID = data.AccountID;

                this.GameServer.GetAdminList(this.Socket, AccountID);
                break;

            case PacketConfig.GetAdminInfo:
                var AccountID = data.AccountID;

                this.GameServer.GetAdminInfo(this.Socket, AccountID);

                break;

            case PacketConfig.UpdateAdminInfo:
                var AccountID = data.AccountID;
                var IsAdmin = data.IsAdmin;
                var MenuConfig = data.MenuConfig;

                this.GameServer.UpdateAdminInfo(this.Socket, AccountID, IsAdmin, MenuConfig);

                break;

            case PacketConfig.TX_GetInfo:
                var Date = data.Date;
                var RequestInfo = data.RequestInfo;
                var Filter = data.Filter;

                this.GameServer.TX_GetInfo(this.Socket, Date, RequestInfo, Filter);
                break;

            case PacketConfig.Baccarat_GetInfo:
                var Date = data.Date;
                var RequestInfo = data.RequestInfo;
                var Filter = data.Filter;

                this.GameServer.Baccarat_GetInfo(this.Socket, Date, RequestInfo, Filter);
                break;

            case PacketConfig.GetLogUserPlay:
                var UserID = data.UserID;
                var DateFrom = data.DateFrom;
                var DateTo = data.DateTo;
                var Nick = data.Nick;
                var TimeFrom = data.TimeFrom;
                var TimeTo = data.TimeTo;

                this.GameServer.GetLogUserPlay(this.Socket, UserID, DateFrom, DateTo, Nick, TimeFrom, TimeTo);
                break;

            case PacketConfig.XocDia_GetInfo:
                var Date = data.Date;
                var RequestInfo = data.RequestInfo;
                var Filter = data.Filter;

                this.GameServer.XocDia_GetInfo(this.Socket, Date, RequestInfo, Filter);
                break;

            case PacketConfig.VQMM_GetInfo:
                var Date = data.Date;
                var RequestInfo = data.RequestInfo;
                var Filter = data.Filter;

                this.GameServer.VQMM_GetInfo(this.Socket, Date, RequestInfo, Filter);
                break;

            case PacketConfig.ShowStore:

                this.GameServer.ShowStoreConfig(this.Socket);
                break;

            case PacketConfig.UpdateStoreConfig:
                this.GameServer.UpdateStoreConfig(this.Socket, data);
                break;

            case PacketConfig.TXMN_GetInfo:
                var Date = data.Date;
                var RequestInfo = data.RequestInfo;
                var Filter = data.Filter;

                this.GameServer.TXMN_GetInfo(this.Socket, Date, RequestInfo, Filter);
                break;

            case PacketConfig.VQMM_AddFreeTicket:
                var UserID = data.UserID;
                var DailyTicket = data.DailyTicket;
                var FreeTicket = data.FreeTicket;

                this.GameServer.VQMM_AddFreeTicket(this.Socket, UserID, DailyTicket, FreeTicket);

                break;

            case PacketConfig.Tracking_GameStatus:
                var DateFrom = data.DateFrom;
                var DateTo = data.DateTo;
                var Filter = data.Filter;
                this.GameServer.Tracking_GameStatus(this.Socket, DateFrom, DateTo, Filter);
                break;

            case PacketConfig.Tracking_GetTotalReCharge:
                var DateFrom = data.DateFrom;
                var DateTo = data.DateTo;
                var Filter = data.Filter;
                this.GameServer.Tracking_GetTotalReCharge(this.Socket, DateFrom, DateTo, Filter);

                break;

            case PacketConfig.TopDoiNap:
                var DateFrom = data.DateFrom;
                var DateTo = data.DateTo;
                var Top = data.Top;
                this.GameServer.GetTopDoiNap(this.Socket, DateFrom, DateTo, Top);
                break;

            case PacketConfig.GetChargeInfo:
                var AccountID = data.AccountID;
                this.GameServer.GetChargeInfo(this.Socket, AccountID);
                break;

            case PacketConfig.GetArticleList:
                this.GameServer.GetArticleList(this.Socket);
                break;

            case PacketConfig.EditArticle:
                this.GameServer.UpdateArticle(this.Socket, data);
                break;

            case PacketConfig.AddArticle:
                this.GameServer.AddArticle(this.Socket, data);
                break;

            case PacketConfig.DeleteArticle:
                this.GameServer.DeleteArticle(this.Socket, data);
                break;
            case 99:
                this.GameServer.CheckLoginByToken(this.Socket, data);
                break;
            default:
                break;
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('UserController.prototype.HandleMessage - try err: ' + e.stack);
    }
};

UserController.prototype.WriteLog = function(PacketID, Data){
    try{
        var now = new Date();
        var year = now.getFullYear();
        var month = pad(now.getMonth() + 1, 2);
        var day = pad(now.getDate(), 2);
        var hour = pad(now.getHours(), 2);
        var minute = pad(now.getMinutes(), 2);
        var second = pad(now.getSeconds(), 2);
        var AccountID = this.Socket.AccountID;
        var IP = this.Socket._socket.remoteAddress;

        var FileName = "logs/ActionLog_" + year + "_" + month + "_" + day + ".log";
        var Prefix = hour + ":" + minute + ":" + second + ": ";
        var DataToWrite = AccountID + "\t" + IP + "\t" + PacketID + "\t" + JSON.stringify(Data) + "\r\n";
        var ObjectToWrite = {
            AccountID: AccountID,
            IP: IP,
            PacketID: PacketID,
            Data: Data
        };
        fs.appendFileSync(FileName, Prefix + JSON.stringify(ObjectToWrite) + "\r\n");
    }
    catch(e){
        this.GameServer.Logger.Game().error('UserController.prototype.WriteLog - try err: ' + e.stack);
    }
};

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}
