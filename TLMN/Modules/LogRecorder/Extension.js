var Utility = require('../../../SharedModule/Utility');

module.exports = function (LogRecorder) {
    //LogRecorder.Logger Logger
    LogRecorder.logStartMatch = function (DeskID, RoomID, KindID, Tax, GoldBet, CardDeck, callback) {
        var tableName = 'tlmn_startmatch_log';
        try {
            LogRecorder.insertTable(tableName + Utility.GenSuffixDateSql(),
                [
                    "CreateDate",
                    "DeskID",
                    "RoomID",
                    "KindID",
                    "Tax",
                    "GoldBet",
                    "CardDeck"
                ], [

                    new Date(),
                    DeskID,
                    RoomID,
                    KindID,
                    Tax,
                    GoldBet,
                    CardDeck

                ], callback);
        } catch (e) {
            LogRecorder.Logger.error(tableName, e.stack);
        }

    };

    LogRecorder.logEndMatch = function (MatchID, Detail, Tax, GoldBet, KindID, RoomID, DeskID, callback) {
        var tableName = 'tlmn_endmatch_log';
        try {
            LogRecorder.insertTable(tableName + Utility.GenSuffixDateSql(),
                [
                    "MatchID",
                    "Detail",
                    "Tax",
                    "GoldBet",
                    "KindID",
                    "RoomID",
                    "DeskID",
                    "CreateDate",
                ], [

                    MatchID,
                    Detail,
                    Tax,
                    GoldBet,
                    KindID,
                    RoomID,
                    DeskID,
                    new Date()
                ], callback);
        } catch (e) {
            LogRecorder.Logger.error(tableName, e.stack);
        }

    };

    LogRecorder.logUserBet = function (UserID, BetID, BetGold, MatchID, Tax) {
        var tableName = 'baccarat_betlog';
        try {
            LogRecorder.insertTable(tableName + Utility.GenSuffixDateSql(),
                [
                    "UserID",
                    "BetID",
                    "BetGold",
                    "MatchID",
                    "Tax",
                    "CreateDate"
                ], [
                    UserID,
                    BetID,
                    BetGold,
                    MatchID,
                    Tax,
                    new Date()
                ]);
        } catch (e) {
            LogRecorder.Logger.error(tableName, e.stack);
        }

    };

    LogRecorder.logUserBetEndGame = function (UserID, BetID, BetGold, MatchID, Tax, WinGold, WinGoldWithTax) {
        var tableName = 'baccarat_betlog_withwin';
       	
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
                    "CreateDate"
                ], [
                    UserID,
                    BetID,
                    BetGold,
                    WinGold,
                    WinGoldWithTax,
                    MatchID,
                    Tax,
                    new Date()
                ]);
        } catch (e) {
            LogRecorder.Logger.error(tableName, e.stack);
        }

    };

    LogRecorder.LoadHistory = function(callback){
        var tableName = 'baccarat_endmatch_log' + Utility.GenSuffixDateSql();

        var query = 'SELECT * FROM ' + tableName + ' order by MatchID desc LIMIT 100';
        LogRecorder.queryRaw(query, function(e, r){
            callback(e, r);
        })
    };
};


