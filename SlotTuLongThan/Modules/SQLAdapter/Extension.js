var MySQLAdapter = require('./MySQLAdapter');

MySQLAdapter.eventReloadAllByGameID = function (GameID, callback) {
    MySQLAdapter.callSp('eventconfig_GetAllByGameID', GameID, callback);
};
MySQLAdapter.userOnlineGetAll = function (SID, GameID, callback) {
    var tableName = 'useronline';
    var sqlQuery = 'SELECT * FROM ' + tableName +
        ' WHERE GameID =\'' + GameID + '\' AND ServerID = ' + SID + ' AND TIME_TO_SEC(timediff(NOW(),UpdateTime) ) > 30'; // login trước đó 30s mới check, tránh bất đồng bộ
    MySQLAdapter.queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    });
};

MySQLAdapter.getUserCharge = function (UserID, callback) {
    MySQLAdapter.callSp('getUserCharge', UserID, function (e, r, f) {
        if (!e) {
            callback(0, r[0]);
        } else {
            callback('callDbErr', e);// call db error
        }

    });
};

module.exports = MySQLAdapter;