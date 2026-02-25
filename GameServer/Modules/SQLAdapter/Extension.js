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
MySQLAdapter.listFishGetAll = function (callback) {
    MySQLAdapter.callSp('FishConfig_GetAll', function (e, r, f) {
        if (!e) {
            callback(0, r[0]);
        } else {
            callback('callDbErr', e);// call db error
        }

    });
};
MySQLAdapter.listFishGetAllByVer = function (ver, callback) {
    MySQLAdapter.callSp('FishConfig_GetAllByVer', ver, function (e, r, f) {
        if (!e) {
            callback(0, r[0]);
        } else {
            callback('callDbErr', e);// call db error
        }

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
MySQLAdapter.onUserOutGame = function (UserID, Money, GameID) {
    MySQLAdapter.callSp('onUserOutGame', UserID, Money, GameID, function (e, r, f) {

    });
};
//onUserOutGame
MySQLAdapter.getUserWinMoney = function (UserID, GameID, callback) {
    MySQLAdapter.callSp('getUserWinMoney', UserID, GameID, function (e, r, f) {
        if (!e) {
            callback(0, r[0]);
        } else {
            callback('callDbErr', e);// call db error
        }

    });
};
module.exports = MySQLAdapter;