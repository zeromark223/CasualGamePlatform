var MySQLAdapter = require('./MySQLAdapter'); // all function common

MySQLAdapter.listFishGetAll = function (callback) {
    MySQLAdapter.callSp('FishConfig_GetAll', function (e, r, f) {
        if (!e) {
            callback(0, r[0]);
        } else {
            callback('callDbErr', e);// call db error
        }

    });
};
MySQLAdapter.getDisplayNameByMultiUserID = function (ListUserID, callback) {
    var tableName = 'user';

    var sqlQuery = 'SELECT UserID,GameName,FBID FROM ' + tableName +
        ' WHERE UserID in(' +ListUserID.join(',') + ' ) ';

    MySQLAdapter.queryRaw(sqlQuery, function (e, r) {
        callback(e,r);
    });
};
MySQLAdapter.getAllEventDisplay = function (callback) {
    var tableName = 'eventconfig';
    var sqlQuery = 'SELECT * FROM ' + tableName +
        ' WHERE StartDisplayTime < NOW() AND EndDisplayTime > NOW() ';
    MySQLAdapter.queryRaw(sqlQuery, function (e, r) {
        callback(e,r);
    });
};
MySQLAdapter.userOnlineGetListByMasterID = function (MasterID,callback) {
    var tableName = 'useronline';
    var sqlQuery = 'SELECT * FROM ' + tableName +
        ' WHERE GameID = 0 AND ServerID = '+MasterID+' AND TIME_TO_SEC(timediff(NOW(),UpdateTime) ) > 30'; // login trước đó 30s mới check, tránh bất đồng bộ
    MySQLAdapter.queryRaw(sqlQuery, function (e, r) {
        callback(e,r);
    });
};
MySQLAdapter.getAllServerGame = function (callback) {
    MySQLAdapter.callSp('serverstatus_getAllByGame', function (e, r, f) {
        if (!e) {
            callback(0, r[0]);
        } else {
            callback('callDbErr', e);// call db error
        }

    });
};

MySQLAdapter.eventReloadAllByMaster = function (callback) {
    MySQLAdapter.callSp('eventconfig_GetAllByMaster', callback);
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