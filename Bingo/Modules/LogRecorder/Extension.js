var Utility = require('../../../SharedModule/Utility');

module.exports = function (LogRecorder) {
    //LogRecorder.Logger Logger
    LogRecorder.logStartMatch = function (DeskID, RoomID, KindID, CardPrice, Tax, CurrentStock, ListNumber, callback) {
        var tableName = 'bingo_startmatch_log';
        try {
            LogRecorder.insertTable(tableName + Utility.GenSuffixDateSql(),
                [
                    "CreateDate",
                    "DeskID",
                    "RoomID",
                    "KindID",
                    "CardPrice",
                    "Tax",
                    "CurrentStock",
                    "ListNumber"
                ],
                [
                    new Date(),
                    DeskID,
                    RoomID,
                    KindID,
                    CardPrice,
                    Tax,
                    CurrentStock,
                    ListNumber

                ], callback);
        } catch (e) {
            LogRecorder.Logger.error(tableName, e.stack);
        }

    };

    LogRecorder.logEndMatch = function (MatchID, ListCalledNumber, TotalSysWin, TotalSysLose, TotalTax, Tax, CurrentStock,
                                        RoomID, DeskID, KindID, CardPrice, callback) {
        var tableName = 'bingo_endmatch_log';
        try {
            LogRecorder.insertTable(tableName + Utility.GenSuffixDateSql(),
                [
                    "MatchID",
                    "ListCalledNumber",
                    "TotalSysWin",
                    "TotalSysLose",
                    "TotalTax",
                    "Tax",
                    "CurrentStock",
                    "CreateDate",
                    "RoomID",
                    "DeskID",
                    "KindID",
                    "CardPrice"
                ], [
                    MatchID,
                    ListCalledNumber,
                    TotalSysWin,
                    TotalSysLose,
                    TotalTax,
                    Tax,
                    CurrentStock,
                    new Date(),
                    RoomID,
                    DeskID,
                    KindID,
                    CardPrice

                ], callback);
        } catch (e) {
            LogRecorder.Logger.error(tableName, e.stack);
        }

    };
    
    LogRecorder.logUserBet = function (UserID, CardData, BetGold, MatchID, Tax, CurrentStock, UserChannelID) {
        let tableName = 'bingo_betlog';
        try {
            LogRecorder.insertTable(tableName + Utility.GenSuffixDateSql(),
                [
                    "UserID",
                    "CardData",
                    "BetGold",
                    "MatchID",
                    "Tax",
                    "CurrentStock",
                    "ChannelID",
                    "CreateDate"
                ], [
                    UserID,
                    CardData,
                    BetGold,
                    MatchID,
                    Tax,
                    CurrentStock,
                    UserChannelID,
                    new Date()
                ]);
        } catch (e) {
            LogRecorder.Logger.error(tableName, e.stack);
        }

    };

    LogRecorder.logUserBetEndGame = function (MatchID, UserID, CardData, BetGold, Tax, CurrentStock, WinGold, WinGoldWithTax, WinTreasure, UserChannelID) {
        let tableName = 'bingo_betlog_withwin';
        try {
            LogRecorder.insertTable(tableName + Utility.GenSuffixDateSql(),
                [
                    "UserID",
                    "CardData",
                    "BetGold",
                    "WinGold",
                    "WinGoldWithTax",
                    "MatchID",
                    "Tax",
                    "CurrentStock",
                    "WinTreasure",
                    "ChannelID",
                    "CreateDate",
                ], [
                    UserID,
                    CardData,
                    BetGold,
                    WinGold,
                    WinGoldWithTax,
                    MatchID,
                    Tax,
                    CurrentStock,
                    WinTreasure,
                    UserChannelID,
                    new Date()
                ]);
        } catch (e) {
            LogRecorder.Logger.error(tableName, e.stack);
        }

    };

    LogRecorder.LoadHistory = function (callback) {
        var tableName = 'bingo_endmatch_log' + Utility.GenSuffixDateSql();

        var query = 'SELECT * FROM ' + tableName + ' order by MatchID desc LIMIT 0,80';
        LogRecorder.queryRaw(query, function (e, r) {
            callback(e, r);
        })
    };
};


