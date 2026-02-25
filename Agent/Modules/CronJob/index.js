var Utility = require('../../../SharedModule/Utility');

function CronJob() {
    this.Agent = 0;
    this.CheckDay = new Date().getDay();
    this.CronTimer = [
        {
            Tick: 0,
            Interval: 30000,
            Wake: this.Timer300seconds.bind(this)
        }
    ];
    this.ListStockRatioHandler = [];

}

module.exports = CronJob;

CronJob.prototype.Init = function (Agent) {
    this.Agent = Agent;
    this.InitTimer();
    this.StockCronGetConfigAndCheck();
};

CronJob.prototype.InitTimer = function () {
    for (var i = 0; i < this.CronTimer.length; i++) {
        this.Agent.MainTimers.push(this.CronTimer[i]);
    }
};

CronJob.prototype.Timer300seconds = function () {
    this.StockCronGetConfigAndCheck();

};

CronJob.prototype.StockCronGetConfigAndCheck = function () {
    var now = new Date();
    var nowMin = now.getMinutes() + now.getHours() * 60;
    //StockRatioConfig
    this.Agent.RedisAdapter.hgetall(this.Agent.AgentConfig.RedisConfig.Define.StockRatioConfig, function (e, d) {
        if (!e) {
            if (Utility.CheckVariable(d, 'config')) {
                try {
                    var config = JSON.parse(d.config);
                    for (var i = 0; i < config.length; i++) {
                        if (Utility.CheckVariable(config[i], 'KindID', 'TimeStart', 'TimeEnd', 'StockDown')) {
                            if (nowMin > config[i].TimeStart && nowMin < config[i].TimeEnd) {
                                this.HandleStockRatio(config[i]);
                            }
                        }
                    }
                } catch (e) {
                    this.Agent.Logger.Game().error('CronJob.prototype.StockCronGetConfigAndCheck - try err: ' + e.stack);
                }

            } else {
                this.StockGenConfig();
            }
        }
    }.bind(this));
};

CronJob.prototype.StockGenConfig = function () {
    var config = [
        {
            KindID: 1,
            Name: "BC Thường",
            TimeStart: 0,
            TimeEnd: 300,
            StockDown: -0.02

        },
        {
            KindID: 2,
            Name: "BC VIP",
            TimeStart: 0,
            TimeEnd: 300,
            StockDown: -0.02

        },
        {
            KindID: 1,
            Name: "BC Thường",
            TimeStart: 300,
            TimeEnd: 1440,
            StockDown: 0

        },
        {
            KindID: 2,
            Name: "BC VIP",
            TimeStart: 300,
            TimeEnd: 1440,
            StockDown: 0

        }
    ];
    this.Agent.RedisAdapter.hset(this.Agent.AgentConfig.RedisConfig.Define.StockRatioConfig, 'config', JSON.stringify(config));
};

CronJob.prototype.HandleStockRatio = function (config) {
    var handler = this.FindStockRatioConfigHandler(config.KindID);
    if (handler == 0) {
        this.ListStockRatioHandler.push(config);
        //this.ModifyStockRatioConfig(+config.KindID, +config.StockDown); // lan dau tien ko edit
    } else {
        //Check
        var newStock = config.StockDown - handler.StockDown;
        this.ModifyStockRatioConfig(+config.KindID, +newStock); // Dieu chinh Stock
        this.ReplaceStockRatioConfigHandler(+config.KindID, config);

    }
};

CronJob.prototype.FindStockRatioConfigHandler = function (KindID) {
    for (var i = 0; i < this.ListStockRatioHandler.length; i++) {
        if (this.ListStockRatioHandler[i].KindID == KindID) {
            return this.ListStockRatioHandler[i];
        }
    }
    return 0;
};

CronJob.prototype.ReplaceStockRatioConfigHandler = function (KindID, newConfig) {
    for (var i = 0; i < this.ListStockRatioHandler.length; i++) {
        if (this.ListStockRatioHandler[i].KindID == KindID) {
            this.ListStockRatioHandler[i] = newConfig;
            return 1;
        }
    }
    return 0;
};


CronJob.prototype.ModifyStockRatioConfig = function (KindID, Stock) {
    if (Stock == 0) return;//Ko can dieu chinh khi ko co thay doi
    this.Agent.RedisAdapter.hget(this.Agent.AgentConfig.RedisConfig.Define.StockRatioConfig, KindID, function (e, d) {
        if (!e) {
            try {
                var scfg = JSON.parse(d);
                if (Utility.CheckVariable(scfg, 'StockRatio')) {
                    for (var i = 0; i < scfg.StockRatio.length; i++) {
                        scfg.StockRatio[i].Ratio += Stock;
                    }
                    this.Agent.Logger.Game().info('CronJob.prototype.ModifyStockRatioConfig Update ',this.Agent.AgentConfig.RedisConfig.Define.StockRatioConfig, KindID, JSON.stringify(scfg));
                    this.Agent.RedisAdapter.hset(this.Agent.AgentConfig.RedisConfig.Define.StockRatioConfig, KindID, JSON.stringify(scfg));
                }else{
                    // ko xu lay Config chua co'
                }
            } catch (e) {
                //handle error
                this.Agent.Logger.Game().error('CronJob.prototype.ModifyStockRatioConfig - try err: ' + e.stack);
            }
        }
    }.bind(this));
};