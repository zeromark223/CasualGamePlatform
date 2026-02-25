module.exports = function (MySQLAdapter) {
    //MySQLAdapter.Logger Logger
    MySQLAdapter.eventReloadAll = function (callback) {
        MySQLAdapter.callSp('eventconfig_GetAll', callback);
    };
    MySQLAdapter.userOnlineGetAll = function (SID, GameID, callback) {
        var tableName = 'useronline';
        var sqlQuery = 'SELECT * FROM ' + tableName +
            ' WHERE GameID =\'' + GameID + '\' AND ServerID = ' + SID + ' AND TIME_TO_SEC(timediff(NOW(),UpdateTime) ) > 30'; // login trước đó 30s mới check, tránh bất đồng bộ
        MySQLAdapter.queryRaw(sqlQuery, function (e, r) {
            callback(e, r);
        });
    };

    MySQLAdapter.moneyRefundAll = function (UserID, ReasonID, Des, Money, ChannelID, ProviderID, PlatformID, ServerID, ServerTrackingID, GameKindID,GameID, callback) {
        MySQLAdapter.callSp('wallet_RefundMoneyV2', UserID, ReasonID, Des, Money, ChannelID, ProviderID, PlatformID, ServerID, ServerTrackingID, GameKindID,GameID, function (e, r, f) {
            if (!e) {
                callback(0, r[0]);
            } else {
                callback('callDbErr', e);// call db error
            }

        });
    };
};


