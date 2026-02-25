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
    this.MainTime = + new Date();
    this.EventTrigger = new EventTrigger();
    this.Broadcast = new Broadcast();
    this.MainTimers = [
    ]; // Các function con sẽ init timer của mình vào đây
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
    //this.GlobalBoss.Init(this);
    this.GMToolApi.Init(this, this.AgentConfig.GMToolApiConfig);
    //this.EventTrigger.Init(this);
    //this.Broadcast.Init(this);
};

Agent.prototype.HandleGMTool = function (channel, message) {
    switch (channel) {
        case this.AgentConfig.GMToolConfig.Channel.GameGM: {
            try {
                var Object = JSON.parse(message);
                this.GMToolExecute(Object.CMD, Object.SID, Object.Data);
            } catch (e) {
                this.Logger.Game().error('GameServer.prototype.HandleGMTool - try err: ' + e);
            }

            break;
        }
        default: {
            break;
        }
    }
};

Agent.prototype.GMToolExecute = function (CMD, SID, data) {};