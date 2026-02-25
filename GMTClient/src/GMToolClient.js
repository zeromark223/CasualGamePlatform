/**
 * Created by quinx on 8/19/2018.
 */
const http = require('http');
var PacketConfig = require('./Config/PacketConfig');
var Config = require('./Config/index.js');

function GMToolClient(mainPage) {
    this.Client = 0;
    this.BindingIP = Config.GMToolClientConfig.BindingIP;
    this.BindingPort = Config.GMToolClientConfig.BindingPort;
    this.MainPage = mainPage;

    this.ReconnectTime = 0;
    this.LimitReconnectTime = 10;
    var newCfg = this.GetConfig();
    this.BindingIP = newCfg.BindingIP;
    this.BindingPort = newCfg.BindingPort;
    this.Start();
}

module.exports = GMToolClient;

GMToolClient.prototype.Start = function () {
    this.Init();
};

GMToolClient.prototype.Init = function () {
    var keyAuth = window.location.href;
    this.Client = new WebSocket('ws://' + this.BindingIP + ':' + this.BindingPort);

    this.Client.onopen = function () {
        // first we want users to enter their names
        console.log("connected");
        this.OnExecute(99, keyAuth);// login
    }.bind(this);

    this.Client.onmessage = function (message) {
        this.HandleResponse(message);
    }.bind(this);

    this.Client.onclose = function (e) {
        console.log('Socket is closed. Reconnect will be attempted in 1 second.', e.reason);
        if (this.ReconnectTime < this.LimitReconnectTime) {
            this.ReconnectTime++;
            setTimeout(function () {
                this.Init();
            }.bind(this), 1000);
        }
    }.bind(this);
};

GMToolClient.prototype.HandleResponse = function (message) {
    var ResponseObject = JSON.parse(message.data);

    if (ResponseObject.packetId === 99) {
        this.MainPage.IsLoginCompleted = true;
        //console.log("login", ResponseObject.data.AccountID);
    }

    this.MainPage.OnReceiveResponseData(ResponseObject);
};

GMToolClient.prototype.OnExecute = function (packetId, data) {
    var dataObj = {};

    switch (packetId) {
        case PacketConfig.GetTotalSystemGold:
        case PacketConfig.GetMoneyFlowStatistics:
        case PacketConfig.GetGameStatus:
        case PacketConfig.GetCCuLog:
            dataObj.DateFrom = data.DateFrom;
            dataObj.DateTo = data.DateTo;
            break;

        case PacketConfig.GetStock:
            break;

        case PacketConfig.GetLogGoldUser:
            dataObj.UserID = data.UserID;
            dataObj.DateFrom = data.DateFrom;
            dataObj.DateTo = data.DateTo;
            dataObj.Nick = data.Nick;
            dataObj.TimeFrom = data.TimeFrom;
            dataObj.TimeTo = data.TimeTo;

            break;

        case PacketConfig.Baccarat_GetInfo:
        case PacketConfig.TX_GetInfo:
        case PacketConfig.UpdateAdminInfo:
        case PacketConfig.GetAdminList:
        case PacketConfig.GetAdminInfo:
        case PacketConfig.GetTopWin:
        case PacketConfig.Slot_GetInfo:
        case PacketConfig.GetLogUserKillBoss:
        case PacketConfig.KickUser:
        case PacketConfig.GetUserInfo:
        case PacketConfig.GetUserList:
        case PacketConfig.GetMoneyStatus:
        case PacketConfig.GetEventData:
        case PacketConfig.DeleteEventData:
        case PacketConfig.UpdateEvent:
        case PacketConfig.UpdateStock:
        case PacketConfig.GetLogGoldUser_Redis:
        case PacketConfig.AddGlobalBoss:
        case PacketConfig.UpdateGlobalBoss:
        case PacketConfig.AddBroadcast:
        case PacketConfig.UpdateBroadcast:
        case PacketConfig.GetLogUserPlay:
        case PacketConfig.XocDia_GetInfo:
        case PacketConfig.VQMM_GetInfo:
        case PacketConfig.UpdateStoreConfig:
        case PacketConfig.TXMN_GetInfo:
        case PacketConfig.VQMM_AddFreeTicket:
        case PacketConfig.Tracking_GameStatus:
        case PacketConfig.Tracking_GetTotalReCharge:
        case PacketConfig.TopDoiNap:
        case PacketConfig.GetChargeInfo:
        case PacketConfig.GetTopGold:
        case PacketConfig.GetArticleList:
        case PacketConfig.EditArticle:
        case PacketConfig.AddArticle:
        case PacketConfig.DeleteArticle:
            dataObj = data;

            break;

        case PacketConfig.DeleteBroadcast:
            dataObj.ID = data.ID;

            break;

        case PacketConfig.DeleteGlobalBoss:
            dataObj.BossID = data.BossID;
            break;
        case 99:
            dataObj.keyAuth = data;
            break;
        default:
            break;
    }

    console.log("GMToolClient.prototype.OnExecute data to send", dataObj);
    this.Client.send(this.BuildData(packetId, dataObj));
};

GMToolClient.prototype.BuildData = function (packetId, data) {
    var objectRequest = {
        packetId: packetId,
        data: data
    };

    return JSON.stringify(objectRequest);
};

GMToolClient.prototype.OnLoggedIn = function () {
    this.MainPage.SetLoggedIn();
};

GMToolClient.prototype.Bacarat_Request = function (packetName, data) {
    // var Address = "http://" + Config.GMToolClientConfig.Bacarat_IP + ":" + Config.GMToolClientConfig.Bacarat_Port + "/" + packetName + "?";
    //
    // for (var prop in data) {
    //     var temp = "" + prop + "=" + data[prop] + "&";
    //     Address += temp;
    // }
    //
    // Address = Address.slice(0, -1);
    //
    //
    // http.get(Address, function (res) {
    //     res.setEncoding('utf8');
    //     var rawData = '';
    //     res.on('data', (chunk) = > {rawData += chunk;
    // })
    //     ;
    //
    //     res.on('end', () = > {
    //         var Arr = JSON.parse(rawData);
    //
    //     this.Bacarat_Response({
    //         PacketName: packetName,
    //         Data: Arr
    //     });
    // })
    //     ;
    // }.bind(this));
};

GMToolClient.prototype.Bacarat_Response = function (Data) {
    this.MainPage.OnReceiveResponseData_Bacarat(Data);
};

GMToolClient.prototype.GetConfig = function () {
    try {
        var xmlHttp = new XMLHttpRequest();

        //Đoạn này lấy Domain và port
        var url = window.location.href;
        var arr = url.split("/");
        url = arr[0] + "//" + arr[2];
        //

        xmlHttp.open("GET", url + '/config.json', false); // false for synchronous request
        xmlHttp.send(null);
        return JSON.parse(xmlHttp.responseText);
    } catch (e) {

    }
    return 0;
};