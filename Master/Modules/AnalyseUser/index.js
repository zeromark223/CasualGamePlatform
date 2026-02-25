var Utility = require('../../../SharedModule/Utility');
exports.checkAnalyseUserRule = function (Master, User) {
    try {
        //ShowStoreConfigData
        var continueCheck = 1;
        User.IsPassingRule = 0;
        if (Utility.CheckVariable(Master, 'ShowStoreConfigData') && Utility.CheckVariable(Master.ShowStoreConfigData, 'BlackListOS', 'BlackListVersion', 'BlackListPackage')) {
            if (Master.ShowStoreConfigData.BlackListOS.indexOf(User.UserPlatformID) != -1 && User.UserPlatformID != '') {
                continueCheck = 0;
            }
            if (Master.ShowStoreConfigData.BlackListVersion.indexOf(User.UserVersionClient) != -1 && User.UserVersionClient != '') {
                continueCheck = 0;
            }
            if (Master.ShowStoreConfigData.BlackListPackage.indexOf(User.UserPackageID) != -1 && User.UserPackageID != '') {
                continueCheck = 0;
            }
        }
        if (continueCheck) {
            if (User.OnlineGetCount >= Master.ShowStoreConfigData.AwardOnlineCount
                || User.AwardDailyCount >= Master.ShowStoreConfigData.AwardDailyCount
                || User.RechargeGold >= Master.ShowStoreConfigData.RechargeGold) {
                User.IsPassingRule = 1;
            }
        }
    } catch (e) {
        console.log("Error AnalyseUser checkAnalyseUserRule ", e.stack);
    }

};

exports.updateAnalyseUserRule = function (User, d) {
    try {
        var data = d.split(',');//OnlineGetCount,OnlineGetDayCount,DailyGet
        User.OnlineGetCount += (+data[0]) || 0;
        User.OnlineGetDayCount += (+data[1]) || 0;
        User.DailyGet += (+data[2]) || 0;
    } catch (e) {
        console.log("Error AnalyseUser updateAnalyseUserRule ", e.stack);
    }

};

exports.recordAnalyseUserRule = function (User, d) {
    try {
        return '' + User.OnlineGetCount + ',' + User.OnlineGetDayCount + ',' + User.DailyGet;
    } catch (e) {
        console.log("Error AnalyseUser recordAnalyseUserRule ", e.stack);

    }
    return '0,0,0';
};

