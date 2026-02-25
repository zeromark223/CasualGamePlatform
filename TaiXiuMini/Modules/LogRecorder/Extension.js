var Utility = require('../../../SharedModule/Utility');

module.exports = function (LogRecorder) {
    //LogRecorder.Logger Logger
    LogRecorder.logStartMatch = function (DeskID, RoomID, KindID, Tax, CurrentStock, ResultTextEncrypted, callback) {
        var tableName = 'taixiumini_startmatch_log';
        try {
            LogRecorder.insertTable(tableName + Utility.GenSuffixDateSql(),
                [
                    "CreateDate",
                    "DeskID",
                    "RoomID",
                    "KindID",
                    "Tax",
                    "CurrentStock",
                    "ResultTextEncrypted"
                ],
                [
                    new Date(),
                    DeskID,
                    RoomID,
                    KindID,
                    Tax,
                    CurrentStock,
                    ResultTextEncrypted

                ], callback);
        } catch (e) {
            LogRecorder.Logger.error(tableName, e.stack);
        }

    };

    LogRecorder.logEndMatch = function (MatchID, ResultDices, ResultText, ResultTextEncrypted, TotalSysWin, TotalSysLose, TotalTax, Tax, CurrentStock, RoomID, DeskID, KindID, callback) {
        var tableName = 'taixiumini_endmatch_log';
        try {
            LogRecorder.insertTable(tableName + Utility.GenSuffixDateSql(),
                [
                    "MatchID",
                    "ResultDices",
                    "ResultText",
                    "ResultTextEncypted",
                    "TotalSysWin",
                    "TotalSysLose",
                    "TotalTax",
                    "Tax",
                    "CurrentStock",
                    "CreateDate",
                    "RoomID",
                    "KindID",
                    "DeskID"
                ], [

                    MatchID,
                    ResultDices,
                    ResultText,
                    ResultTextEncrypted,
                    TotalSysWin,
                    TotalSysLose,
                    TotalTax,
                    Tax,
                    CurrentStock,
                    new Date(),
                    RoomID,
                    KindID,
                    DeskID

                ], callback);
        } catch (e) {
            LogRecorder.Logger.error(tableName, e.stack);
        }

    };

    LogRecorder.logUserBet = function (UserID, BetID, BetGold, MatchID, Tax, UserChannelID) {
        var tableName = 'taixiumini_betlog';
        try {
            LogRecorder.insertTable(tableName + Utility.GenSuffixDateSql(),
                [
                    "UserID",
                    "BetID",
                    "BetGold",
                    "MatchID",
                    "Tax",
                    "CreateDate",
                    "ChannelID"
                ], [
                    UserID,
                    BetID,
                    BetGold,
                    MatchID,
                    Tax,
                    new Date(),
                    UserChannelID
                ]);
        } catch (e) {
            LogRecorder.Logger.error(tableName, e.stack);
        }

    };

    LogRecorder.logUserBetEndGame = function (UserID, BetID, BetGold, MatchID, Tax, WinGold, WinGoldWithTax, UserChannelID) {
        var tableName = 'taixiumini_betlog_withwin';

        try {
            LogRecorder.insertTable(tableName + Utility.GenSuffixDateSql(),
                [
                    "UserID",
                    "BetID",
                    "BetGold",
                    "WinGold",
                    "WinGoldWithTax",
                    "MatchID",
                    "Tax",
                    "CreateDate",
                    "ChannelID"
                ], [
                    UserID,
                    BetID,
                    BetGold,
                    WinGold,
                    WinGoldWithTax,
                    MatchID,
                    Tax,
                    new Date(),
                    UserChannelID
                ]);
        } catch (e) {
            LogRecorder.Logger.error(tableName, e.stack);
        }

    };

    LogRecorder.LoadHistory = function (callback) {
        var tableName = 'taixiumini_endmatch_log' + Utility.GenSuffixDateSql();

        var query = 'SELECT * FROM ' + tableName + ' order by MatchID desc LIMIT 0,120';
        LogRecorder.queryRaw(query, function (e, r) {
            callback(e, r);
        })
    };
};


