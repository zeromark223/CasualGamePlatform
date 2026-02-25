/**
 * Created by ngocnpt on 08-May-17.
 */
var Utility = require('../../../SharedModule/Utility');

function Broadcast() {
    this.Agent = 0;
    this.AutoID = Math.floor((+new Date() - new Date(new Date().getFullYear() + '-01-01')) / 1000);
    this.BroadcastTimers = [
        {
            Tick: 0,
            Interval: 10000,
            Wake: this.Timer10seconds.bind(this)
        },
        {
            Tick: 0,
            Interval: 30000,
            Wake: this.Timer30seconds.bind(this)
        }
    ];
    this.BroadcastList = [];

}

module.exports = Broadcast;

Broadcast.prototype.Init = function (Agent) {
    this.Agent = Agent;
    this.InitTimer();
    this.Timer10seconds();
};

Broadcast.prototype.InitTimer = function () {
    for (var i = 0; i < this.BroadcastTimers.length; i++) {
        this.Agent.MainTimers.push(this.BroadcastTimers[i]);
    }
};

Broadcast.prototype.Timer10seconds = function () {
    this.CheckAndSendBroadcast();
};

Broadcast.prototype.Timer30seconds = function () {
    this.GetAllBroadcast();
};

Broadcast.prototype.GetAllBroadcast = function () {
    this.Agent.SQLAdapter.getBroadcast(function (e, d) {
        if (!e) {
            this.BroadcastListExpiredAll();
            for (var i = 0; i < d.length; i++) {
                if (Utility.CheckVariable(d[i], 'ID', 'Text', 'Url', 'LangCode', 'Priority', 'GameID', 'Interval', 'StartTime', 'EndTime')) {					
                    var br = this.GlobalBossFindById(d[i].ID);
                    if (br != 0) {
                        this.BroadcastListUpdate(br, d[i]);
                    } else {
                        this.BroadcastListAdd(d[i]);
                    }
                }
            }
            this.BroadcastListExpiredRemove();
        }
    }.bind(this));
};

Broadcast.prototype.GlobalBossFindById = function (id) {
    for (var i = 0; i < this.BroadcastList.length; i++) {
        if (this.BroadcastList[i].ID == id) {
            return this.BroadcastList[i];
        }
    }
    return 0;
};

Broadcast.prototype.BroadcastListAdd = function (newData) {
    //Insert some data to newBoss;
    newData.SendTime = 0;// Chưa thả nên thời gian thả = 0;
    this.BroadcastListRenew(newData);// Renew boss
    this.BroadcastList.push(newData);
};

Broadcast.prototype.BroadcastListUpdate = function (oldData, newData) {
    //Edit some value = new value
    oldData.Text = newData.Text;
    oldData.Url = newData.Url;
    oldData.LangCode = newData.LangCode;
    oldData.Priority = newData.Priority;
    oldData.GameID = newData.GameID;
    oldData.Interval = newData.Interval;
    oldData.StartTime = newData.StartTime;
    oldData.EndTime = newData.EndTime;
    //Sau khi update xong phải renew
    this.BroadcastListRenew(oldData);
};

Broadcast.prototype.BroadcastListRenew = function (oldBoss) {
    //Refresh some data
    oldBoss.Expired = false;
};

Broadcast.prototype.BroadcastListExpiredAll = function () {
    for (var i = 0; i < this.BroadcastList.length; i++) {
        this.BroadcastList[i].Expired = true;
    }
};

Broadcast.prototype.BroadcastListExpiredRemove = function () {
    for (var i = 0; i < this.BroadcastList.length; i++) {
        if (this.BroadcastList[i].Expired) {
            this.BroadcastList.splice(i, 1);//Xóa object
            i--;
        }
    }
};

Broadcast.prototype.CheckAndSendBroadcast = function () {
    for (var i = 0; i < this.BroadcastList.length; i++) {
        var br = this.BroadcastList[i];
        if (this.BroadcastCheckTime(br)) { // Boss đã bơi xong chu kỳ
            this.BroadcastSendAll(br);
        }
    }
};

Broadcast.prototype.BroadcastCheckTime = function (brData) {
    var completeTime = brData.Interval * 1000; // Thời gian boss hoàn thành 1 chu kỳ
    return (brData.SendTime + completeTime) < +new Date();// Thời gian thả + thời gian hoàn thành đã quá hạn
};

Broadcast.prototype.BroadcastSendAll = function (brData) {
    //'Priority', 'Msg', 'UrlLink','LangCode'
    //'Text', 'Url', 'LangCode', 'Priority', 'GameID', 'Interval'
    brData.SendTime = +new Date();
    this.Agent.GMToolAdapter.SendBroadCastMasterCommand({
        CMD: this.Agent.AgentConfig.GMToolConfig.CMD.Notification,
        SID:0,
        Data: {
            Text:brData.Text,
            Url:brData.Url,
            LangCode:brData.LangCode,
            Priority:brData.Priority,
            GameID:brData.GameID
        }
    });
};