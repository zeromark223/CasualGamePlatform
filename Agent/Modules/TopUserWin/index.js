var Utility = require('../../../SharedModule/Utility');

function TopUserWin() {
    this.Agent = 0;
    this.TopUserWinTimer = [
        {
            Tick: 0,
            Interval: 300000,
            Wake: this.Timer300seconds.bind(this)
        }
    ];
}

module.exports = TopUserWin;

TopUserWin.prototype.Init = function (Agent) {
    this.Agent = Agent;
    this.InitTimer();
};

TopUserWin.prototype.InitTimer = function () {
    for (var i = 0; i < this.TopUserWinTimer.length; i++) {
        this.Agent.MainTimers.push(this.TopUserWinTimer[i]);
    }
    this.ReCalcTopUserWin();
};


TopUserWin.prototype.Timer300seconds = function () {
    this.ReCalcTopUserWin();
};


TopUserWin.prototype.ReCalcTopUserWin = function () {
    this.Agent.LogRecorder.getTopUserWin(100,function (e,d) {
        if(!e){
            if(Utility.CheckVariable(d)){
                this.UpdateTopUserWinRedis(d);
            }
        }

    }.bind(this));
};

TopUserWin.prototype.UpdateTopUserWinRedis = function (ListUser) {
     this.Agent.RedisAdapter.recordTopUserWin(ListUser,'EVL:TopUserWinDisplay:Data');
};