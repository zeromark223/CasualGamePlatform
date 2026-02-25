/**
 * Created by ngocnpt on 21/09/2016.
 * All function in this Module can hot update
 */
var Utility = require('../../../SharedModule/Utility');
exports.GetUserOnlineCount = function () {
    return 100;
};

exports.debugReal = function (Master) {
    try {

        //
        // Master.LogRecorder.setUserEventInfoSafe(391715,'LuckyTime',0,1,function (rowCount) {
        //     if(rowCount>0){
        //         console.log("Set ok")
        //     }else{
        //         //update fail
        //         console.log("set fail");
        //     }
        //
        // }.bind(this));
    } catch (e) {

    }
};

exports.EventTurnOnOff = function () {

};

exports.ReloadOnlineDailyAwardCfg = function (Master) {
    try{
        Master.DailyAwardAdapter.DailyLoginConfig = Master.DynamicConfig.DailyLoginConfig;
        Master.OnlineAwardAdapter.OnlineAwardConfig = Master.DynamicConfig.OnlineAwardConfig;
        console.log("ReloadOnlineDailyAwardCfg Ok ");
    }catch (e){
        console.log("ReloadOnlineDailyAwardCfg Fail ",e.stack);
    }

};