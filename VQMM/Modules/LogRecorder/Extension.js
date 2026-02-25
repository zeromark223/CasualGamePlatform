var Utility = require('../../../SharedModule/Utility');

module.exports = function (LogRecorder) {
    //LogRecorder.Logger Logger
    LogRecorder.logEndMatch = function (MatchID, Result, CurrentStock, Tax, UserID, BeforeMoney, BetGold, TotalReward, AfterMoney, BeforeFreeSpin, AfterFreeSpin, RoomID, DeskID, KindID, SpinKind, ChannelID, callback) {
        var tableName = 'vqmm_user_betandwin_log';
        try {
            LogRecorder.insertTable(tableName + Utility.GenSuffixDateSql(),
                [
                    "MatchID",
                    "Result",
                    "CurrentStock",
                    "Tax",
                    "UserID",
                    "BeforeMoney",
                    "BetGold",
                    "TotalReward",
                    "AfterMoney",
                    "BeforeFreeSpin",
                    "AfterFreeSpin",
                    "CreateDate",
                    "RoomID",
                    "KindID",
                    "DeskID",
                    "SpinKind",
                    "ChannelID"
                ], [

                    MatchID,
                    Result,
                    CurrentStock,
                    Tax,
                    UserID,
                    BeforeMoney,
                    BetGold,
                    TotalReward,
                    AfterMoney,
                    BeforeFreeSpin,
                    AfterFreeSpin,
                    new Date(),
                    RoomID,
                    KindID,
                    DeskID,
                    SpinKind,
                    ChannelID
                ], callback);
        } catch (e) {
            LogRecorder.Logger.error(tableName, e.stack);
        }

    };

    LogRecorder.CheckDailySpin = function(UserID, callback){
        var tableName = 'vqmm_user_betandwin_log' + Utility.GenSuffixDateSql();

        var query = 'select COUNT(1) AS SpinNumber from ' + tableName + ' where userid =' + UserID;

        LogRecorder.queryRaw(query, function(e, r){
            callback(e, r);
        })
    };
};


