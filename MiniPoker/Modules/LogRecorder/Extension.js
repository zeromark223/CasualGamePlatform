var Utility = require('../../../SharedModule/Utility');

module.exports = function (LogRecorder) {
    //MatchID, Result, this.Stock, Tax, UserID, BeforeMoney, BetGold, TotalReward, AfterMoney, this.GameServerID, DeskID, this.GameKindID, ChannelID
    LogRecorder.logEndMatch = function ( Result, CurrentStock, Tax, UserID, BeforeMoney, BetGold, TotalReward, AfterMoney, RoomID, DeskID, KindID, ChannelID, callback) {
        var tableName = 'minipoker_user_betandwin_log';
        try {
            LogRecorder.insertTable(tableName + Utility.GenSuffixDateSql(),
                [
                    "Result",
                    "CurrentStock",
                    "Tax",
                    "UserID",
                    "BeforeMoney",
                    "BetGold",
                    "TotalReward",
                    "AfterMoney",
                    "CreateDate",
                    "RoomID",
                    "KindID",
                    "DeskID",
                    "ChannelID"
                ], [
                    Result,
                    CurrentStock,
                    Tax,
                    UserID,
                    BeforeMoney,
                    BetGold,
                    TotalReward,
                    AfterMoney,
                    new Date(),
                    RoomID,
                    KindID,
                    DeskID,
                    ChannelID
                ], callback);
        } catch (e) {
            LogRecorder.Logger.error(tableName, e.stack);
        }

    };
};


