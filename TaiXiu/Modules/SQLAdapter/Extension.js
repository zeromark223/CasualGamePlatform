var MySQLAdapter = require('./MySQLAdapter');

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
MySQLAdapter.eventReloadAllByGameID = function (GameID, callback) {
    MySQLAdapter.callSp('eventconfig_GetAllByGameID', GameID, callback);
};
module.exports = MySQLAdapter;