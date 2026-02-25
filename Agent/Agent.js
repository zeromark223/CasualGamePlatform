/**
 * Created by Ngoc on 24-03-2018.
 */
var AgentConfig = require('../Config/Agent');
var GMToolAdapter = require('./Modules/GMToolAdapter');
var RedisAdapter = require('./Modules/RedisAdapter');
var Logger = require('./Modules/Log4JS');
var SQLAdapter = require('./Modules/SQLAdapter');
var LogRecorder = require('./Modules/LogRecorder');
var GlobalBoss = require('./Modules/GlobalBoss');
var GMToolApi = require('./Modules/GMToolApi');
var EventTrigger = require('./Modules/EventTrigger');
var Broadcast = require('./Modules/Broadcast');
var NhanVienVeSinh = require('./Modules/NhanVienVeSinh');
var TopUserWin = require('./Modules/TopUserWin');
var CronJob = require('./Modules/CronJob');
var EventManager = require('./Modules/EventManager');

function Agent() {
    this.AgentID = 1;
    this.AgentConfig = AgentConfig;
    this.Logger = Logger;
    this.GMToolAdapter = GMToolAdapter;
    this.RedisAdapter = RedisAdapter;
    this.SQLAdapter = SQLAdapter;
    this.LogRecorder = LogRecorder;
    this.GlobalBoss = new GlobalBoss();
    this.GMToolApi = new GMToolApi();
    this.MainTime = +new Date();
    this.EventTrigger = new EventTrigger();
    this.Broadcast = new Broadcast();
    this.NhanVienVeSinh = new NhanVienVeSinh();
    //this.TopUserWin = new TopUserWin();
    this.CronJob = new CronJob();
    this.MainTimers = [{
        Tick: 0,
        Interval: 10000,
        Wake: this.Timer10seconds.bind(this)
    }
    ]; // Các function con sẽ init timer của mình vào đây
    this.EventManager = new EventManager();
}

module.exports = Agent;

Agent.prototype.Start = function () {
    this.Logger.Init(this.AgentID, this.AgentConfig.LoggerConfig, function () {
        this.RedisAdapter.Init(this.AgentID, this.AgentConfig.RedisConfig, this.Logger.Redis());
        this.SQLAdapter.Init(this.AgentConfig.SQLConfig, this.Logger.Sql());
        this.LogRecorder.Init(this.AgentConfig.LogRecorderConfig, this.Logger.LogRecorder());
        this.GMToolAdapter.Init(this.AgentID, this.AgentConfig.GMToolConfig, this.HandleGMTool.bind(this));
    }.bind(this));

    setTimeout(this.Initialling.bind(this), 1000);
};

Agent.prototype.Initialling = function () {
    this.Logger.Game().info("Agent Initialling !");
    if (this.SQLAdapter.getStatus()
        && this.LogRecorder.getStatus()
        && this.RedisAdapter.getStatus()
        && this.GMToolAdapter.getStatus()
    ) {
        this.InitCompleted();
    } else {
        this.Logger.Game().info("Agent Init Status : ",
            "\r\nSQLAdapter", this.SQLAdapter.getStatus(),
            "\r\nLogRecorder", this.LogRecorder.getStatus(),
            "\r\nRedisAdapter", this.RedisAdapter.getStatus(),
            "\r\nGMToolAdapter", this.GMToolAdapter.getStatus()
        );
        setTimeout(this.Initialling.bind(this), 1000);
    }
};

Agent.prototype.InitCompleted = function () {
    this.Logger.Game().info("Agent InitCompleted !");

    setTimeout(this.TimerEngine.bind(this), 100);// số càng nhỏ càng chính xác và càng giảm hiệu năng.
    //Init các function của Agent
    this.InitFunctionModule();
};


Agent.prototype.TimerEngine = function () {
    var local = new Date();
    var difTime = (local - this.MainTime);
    this.MainTime = local;
    for (var i = 0; i < this.MainTimers.length; i++) {
        this.MainTimers[i].Tick += difTime;
        if (this.MainTimers[i].Tick > this.MainTimers[i].Interval) {
            this.MainTimers[i].Tick = 0;
            this.MainTimers[i].Wake();
        }
    }

    setTimeout(this.TimerEngine.bind(this), 100);
};

Agent.prototype.InitFunctionModule = function () {
    this.GlobalBoss.Init(this);
    this.GMToolApi.Init(this, this.AgentConfig.GMToolApiConfig);
    this.Broadcast.Init(this);
    this.NhanVienVeSinh.Init(this);
    //this.TopUserWin.Init(this);
    this.CronJob.Init(this);
    this.EventManager.Init(this);//Quản lý tất cả event
    this.EventManager.ReloadAllEvent();
};

Agent.prototype.HandleGMTool = function (channel, message) {
    switch (channel) {
        case this.AgentConfig.GMToolConfig.Channel.GameGM: {
            try {
                var Object = JSON.parse(message);
                this.GMToolExecute(Object.CMD, Object.SID, Object.Data);
            } catch (e) {
                this.Logger.Game().error('GameServer.prototype.HandleGMTool - try err: ' + e.stack);
            }

            break;
        }
        default: {
            break;
        }
    }
};

Agent.prototype.GMToolExecute = function (CMD, SID, data) {
};

Agent.prototype.Timer10seconds = function () {
    try {
        this.EventManager.ReloadAllEvent();
        this.ReloadLoggerLevel();
    } catch (e) {
        this.Logger.Master().error('Agent.prototype.Timer10seconds - try err: ' + e.stack);
    }
};

Agent.prototype.OnUserRecharge = function (UserID, Money) {
    try {
        this.SQLAdapter.onUserCharge(UserID, Money);
        this.EventManager.OnUserRechargeEventAll(UserID, Money);
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.OnUserRecharge - try err: ' + e.stack);
    }

};

Agent.prototype.ReloadLoggerLevel = function () {
    try {
        var LoggerNewConfig = requireUnCached('../Config/Common/LoggerConfig.js');//Không gán trực tiếp, gán giáng tiếp để tránh bị lổi
        var LogLevel = LoggerNewConfig.LogLevel;
        this.Logger.setLogLevel(LogLevel);
    } catch (e) {
        this.Logger.Master().error('Master.prototype.ForceReloadConfigStock - try err: ' + e.stack);
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