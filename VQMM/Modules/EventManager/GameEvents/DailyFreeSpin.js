/**
 * Created by Ngoc on 01-05-2018.
 */
var GameEvents = require('./GameEvents');
var Utility = require('../../../../SharedModule/Utility');

function DailyFreeSpin() {
    GameEvents.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
}

module.exports = DailyFreeSpin;
DailyFreeSpin.prototype = new GameEvents();

DailyFreeSpin.prototype.EvtOnUserEnter = function (User) {
    if (Utility.CheckVariable(User, "SpinInfo") && Utility.CheckVariable(User.SpinInfo, "DailySpinTicket", "FreeSpinTicket", "DailySpinDay", "IsChange")) {
        var diffDay = this.CalcDayCount(User.SpinInfo.DailySpinDay);
        if (diffDay > 0) {// Đã qua ngày mới
            User.SpinInfo.IsChange = true;
            User.SpinInfo.DailySpinDay = +new Date();
            if(User.SpinInfo.DailySpinTicket < this.EventConfig.DailySpinTicket){
                User.SpinInfo.DailySpinTicket += this.EventConfig.DailySpinTicket;
            }

        }
    }

};

DailyFreeSpin.prototype.CalcDayCount = function (checkDate) {
    var diffDay = 99999;
    var dayMiliSecond = (24 * 3600 * 1000);
    try {
        var today = +new Date();
        today = Math.floor(today / dayMiliSecond);
        var check = +new Date(checkDate);
        check = Math.floor(check / dayMiliSecond);
        diffDay = today - check;
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskCore.prototype.LoadUserInfo Err', e.stack);
    }
    return diffDay;
};