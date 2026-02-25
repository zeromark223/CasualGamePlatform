/**
 * Created by Ngoc on 01-05-2018.
 */
var MasterEvents = require('./MasterEvents');
var Utility = require('../../../../SharedModule/Utility');
function TopUserWinDisplay() {
    MasterEvents.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
}
module.exports = TopUserWinDisplay;
TopUserWinDisplay.prototype = new MasterEvents();

TopUserWinDisplay.prototype.OnTurnOnTrigger = function () {
    this.InitTimer();
};

TopUserWinDisplay.prototype.OnTurnOffTrigger = function () {
    this.ClearTimer();
};

TopUserWinDisplay.prototype.InitTimer = function () {
    this.TopUserWinDisplayTimer = setInterval(this.Timer300seconds.bind(this),30000);
    this.ReCalcTopUserWin();
};

TopUserWinDisplay.prototype.ClearTimer = function () {
    if(Utility.CheckVariable(this.TopUserWinDisplayTimer)){
        clearInterval(this.TopUserWinDisplayTimer);
    }
};


TopUserWinDisplay.prototype.Timer300seconds = function () {
    this.ReCalcTopUserWin();
};


TopUserWinDisplay.prototype.ReCalcTopUserWin = function () {
    this.Agent.LogRecorder.getTopUserWin(10,function (e,d) {
        if(!e){
            if(Utility.CheckVariable(d)){
                this.UpdateTopUserWinRedis(d);
            }
        }
    }.bind(this));
};

TopUserWinDisplay.prototype.UpdateTopUserWinRedis = function (ListUser) {
    this.Agent.RedisAdapter.recordTopUserWin(ListUser,this.DataKey);
};