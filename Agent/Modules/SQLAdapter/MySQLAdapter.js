var mysql = require('mysql');
var Utility = require('../../../SharedModule/Utility');
var Logger = console;
var pool;
var isConnected = false;
exports.Init = function (config, logger) {
    pool = mysql.createPool(config);
    Logger = logger;
    pool.getConnection(function (err, con) {
        if (!err) {
            isConnected = true;
        } else {
            logger.error('Connect MySQL Fail ' + err);
        }
    });
};

exports.getStatus = function () {
    return isConnected;
};

function callSp(spName) {
    var callback = function () {

    };
    try {
        var param = [];
        var val = [];

        for (var i = 1; i < arguments.length; i++) {
            if (typeof arguments[i] == 'function') {
                callback = arguments[i];
                continue;
            }
            param.push('?');
            val.push(arguments[i]);
        }

        pool.getConnection(function (err, con) {
            try {
                if (!err) {
                    con.query({
                        sql: 'call ' + spName + '(' + param.join(',') + ')',
                        timeout: 40000, // 40s
                        values: val
                    }, function (error, results, fields) {
                        try {
                            con.release(); // release connection
                            if (!error) {
                                callback(error, results, fields);
                            } else {
                                callback(error);
                                Logger.error(spName, error, results, fields);
                            }
                        } catch (e3) {
                            callback(e3.stack);
                            Logger.error(spName, e3.stack);
                        }

                    });
                } else {
                    callback(err);
                    Logger.error(spName, err);
                }
            } catch (e2) {
                callback(e2.stack);
                Logger.error(spName, e2.stack);
            }
        });
    } catch (e) {
        callback(e.stack);
        Logger.error(spName, e.stack);
    }
}

function insertTable(table, colarr, valarr, callback) {
    if (typeof callback == 'undefined') callback = function () {

    };
    try {
        if (colarr.length != valarr.length) {
            //handle err
        }
        var queryStr = 'insert into ' + table + '(';
        var param = [];

        for (var i = 0; i < colarr.length; i++) {
            param.push('?');
        }

        queryStr += colarr.join(',') + ') values(' + param.join(',') + ')';

        pool.getConnection(function (err, con) {
            try {
                if (!err) {
                    con.query({
                        sql: queryStr,
                        timeout: 40000, // 40s
                        values: valarr
                    }, function (error, results, fields) {
                        try {
                            con.release(); // release connection
                            if (!error) {
                                callback(error, results, fields);
                            } else {
                                callback(error);
                                Logger.error(table, error, results, fields);
                            }
                        } catch (e3) {
                            callback(e3.stack);
                            Logger.error(table, e3.stack);
                        }

                    });
                } else {
                    callback(err);
                    Logger.error(table, err);
                }
            } catch (e2) {
                callback(e2.stack);
                Logger.error(table, e2.stack);
            }
        });
    } catch (e) {
        callback(e.stack);
        Logger.error(table, e.stack);
    }
}

function queryRaw(sqlQuery, callback) {
    try {
        pool.getConnection(function (err, con) {
            try {
                if (!err) {
                    con.query({
                        sql: sqlQuery,
                        timeout: 40000 // 40s
                    }, function (error, results, fields) {
                        try {
                            con.release(); // release connection
                            if (!error) {
                                callback(error, results, fields);
                            } else {
                                callback(error);
                                Logger.error(sqlQuery, error, results, fields);
                            }
                        } catch (e3) {
                            callback(e3.stack);
                            Logger.error(sqlQuery, e3.stack);
                        }

                    });
                } else {
                    callback(err);
                    Logger.error(sqlQuery, err);
                }
            } catch (e2) {
                callback(e2.stack);
                Logger.error(sqlQuery, e2.stack);
            }
        });
    } catch (e) {
        callback(e.stack);
        Logger.error(sqlQuery, e.stack);
    }
}

exports.callSp = callSp;
exports.insertTable = insertTable;
exports.queryRaw = queryRaw;

function checkDataLogin(data) {
    if (!Utility.CheckVariable(data) && !Utility.CheckVariable(data[0])) return false; // Sai data
    return Utility.CheckVariable(data[0], 'UserID', 'AccountID', 'GameName', 'CreateDate', 'Lv', 'Exp', 'StockHandicap')
}

exports.checkLogin = function (AccountID, callback) {
    callSp('CheckLogin', AccountID, function (e, r, f) {
        if (!e) {
            if (Utility.CheckVariable(r, 'length')) {
                if (r.length == 3) {//New user
                    if (checkDataLogin(r[1])) {
                        callback(0, r[1][0]);
                    } else {
                        callback('chkRsParamErrN', r[1]);// ko đủ param
                    }

                } else if (r.length == 2) {
                    if (checkDataLogin(r[0])) {
                        callback(0, r[0][0]);
                    } else {
                        callback('chkRsParamErr', r[0]);// ko đủ param
                    }
                } else {
                    callback('chkRsLenErr', r);// ko đủ param
                }
            } else {
                callback('chkRsErr', r);// Check result error
            }
        } else {
            callback('callDbErr', e);// call db error
        }

    });
};

exports.listFishGetAll = function (callback) {
    callSp('FishConfig_GetAll', function (e, r, f) {
        if (!e) {
            callback(0, r[0]);
        } else {
            callback('callDbErr', e);// call db error
        }

    });
};

exports.serverStatusStart = function (sid, ip, ccu, portr, portws, portwss) {
    callSp('serverstatus_start', sid, ip, ccu, portr, portws, portwss);
};

exports.serverStatusUpdate = function (sid, ccu) {
    callSp('serverstatus_update', sid, ccu);
};

exports.globalBossGet = function (callback) {
    callSp('GlobalBoss_GetByGame', function (e, r, f) {
        if (!e) {
            callback(0, r[0]);
        } else {
            callback('callDbErr', e);// call db error
        }

    });
};

exports.recordSpawnBoss = function (bossId, callback) {
    //callback(0,1);return;
    callSp('GlobalBoss_SpawnBoss', bossId, function (e, r, f) {
        if (!e) {
            if (Utility.CheckVariable(r) && Utility.CheckVariable(r[0]) && Utility.CheckVariable(r[0][0])) {
                callback(0, r[0][0]);
            } else {
                callback('errParam', r);
            }

        } else {
            callback('callDbErr', e);// call db error
        }

    });
};

exports.getBroadcast = function (callback) {
    var tableName = 'broadcast';
    var sqlQuery = 'SELECT * FROM ' + tableName +
        ' WHERE StartTime < NOW() AND NOW() < EndTime';

    queryRaw(sqlQuery, function (e, r) {
        if (!e) {
            callback(0, r); // Kết quả Update
            return;
        }
        callback(1);// Không thể Update
    });
};

exports.getEventConfigByEventCode = function (eventcode, callback) {
    var tableName = 'eventconfig';
    var sqlQuery = 'SELECT EventCode,StartTime,EndTime,StartDisplayTime,EndDisplayTime,Config FROM ' + tableName +
        ' WHERE EventCode = \'' + eventcode + '\'';

    queryRaw(sqlQuery, function (e, r) {
        if (!e) {
            callback(0, r); // Kết quả Update
            return;
        }
        callback(1);// Không thể Update
    });
};

exports.getAllFishName = function (callback) {
    var tableName = 'fishconfig';
    var sqlQuery = 'SELECT FishKind,FishName FROM ' + tableName;
    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    });
};

exports.updateEventConfigByEventCode = function (eventcode, data, callback) {
    var tableName = 'eventconfig';
    var sqlQuery = 'UPDATE  ' + tableName +
        ' SET ' +
        ' StartTime = ' + pool.escape(new Date(data.startTime)) +
        ' ,EndTime = ' + pool.escape(new Date(data.endTime)) +
        ' ,StartDisplayTime = ' + pool.escape(new Date(data.startDisplayTime)) +
        ' ,EndDisplayTime = ' + pool.escape(new Date(data.endDisplayTime)) +
        ' ,Config = ' + pool.escape(data.config) +
        ' WHERE EventCode = \'' + eventcode + '\'';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);// trả kết quả
    });
};

exports.getEventDataKeyByEventCode = function (eventcode, callback) {
    var tableName = 'eventconfig';
    var sqlQuery = 'SELECT DataKey FROM ' + tableName +
        ' WHERE EventCode = \'' + eventcode + '\'';

    queryRaw(sqlQuery, function (e, r) {
        if (!e) {
            callback(0, r); // Kết quả Update
            return;
        }
        callback(1);// Không thể Update
    });
};

//API Gold
exports.moneyUpdate = function (UserID, MoneyUpdate, ReasonID, Des, UserChannelID, UserProviderID, UserPlatformID, callback) {
    // wallet_UpdateMoneySafe(IN uid bigint, IN imoney bigint, IN reasonid int, IN des text, IN cid int,
    //     IN pid int, IN plid int, IN sid int, IN stid int, IN kid int, IN gid int)
    //ServerID,ServerTrackingID,KindID,GameID
    callSp('wallet_UpdateMoneySafeV2', UserID, MoneyUpdate, ReasonID, Des, UserChannelID, UserProviderID, UserPlatformID, 0, 0, 0, 0, function (e, r, f) {
        if (!e) {
            if (Utility.CheckVariable(r) && Utility.CheckVariable(r[0]) && Utility.CheckVariable(r[0][0])) {
                callback(0, r[0][0]);
            } else {
                callback('dataErr', r);// call db error
            }
        } else {
            callback('callDbErr', e);// call db error
        }
    });
};

exports.moneyGetAll = function (UserID, callback) {
    callSp('wallet_getAllV2', UserID, function (e, r, f) {
        if (!e) {
            if (Utility.CheckVariable(r) && Utility.CheckVariable(r[0]) && Utility.CheckVariable(r[0][0])) {
                callback(0, r[0][0]);
            } else {
                callback('dataErr', r);// call db error
            }

        } else {
            callback('callDbErr', e);// call db error
        }

    });
};


exports.onUserCharge = function (UserID, Money) {
    //onUserCharge
    callSp('onUserChargeV2', UserID, Money, function (e, r, f) {

    });
};

//End Api Gold

exports.createTableByNameAndDate = function (table, date, callback) {
    var suffix = Utility.GenSuffixDateSqlByDate(date);
    var sqlQuery = 'CREATE TABLE IF NOT EXISTS `' + table + '_' + suffix + '`like ' + table;
    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);// trả kết quả
    });
};

exports.getUserInfoByAccId = function (accountId, callback) {
    var sqlQuery = 'SELECT * from user where AccountID = \'' + accountId + '\'';
    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);// trả kết quả
    });
};

exports.getUserIDByAccId = function (accountId, callback) {
    var sqlQuery = 'SELECT UserID from user where AccountID = \'' + accountId + '\'';
    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);// trả kết quả
    });
};

exports.getCCUAllGame = function (callback) {
    var sqlQuery = 'SELECT COUNT(1) AS CCU FROM useronline where GameID = 0 ';
    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);// trả kết quả
    });
};

exports.getUserWinLoseInfoByUserID = function (userId, callback) {
    var sqlQuery = 'SELECT * from userwin where UserID = \'' + userId + '\'';
    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);// trả kết quả
    });
};

exports.eventReloadAllByAgent = function (callback) {
    var tableName = 'eventconfig';
    var sqlQuery = 'SELECT * FROM ' + tableName +
        ' WHERE StartTime < NOW() AND EndTime > NOW()  ' // Chỉ lấy Event đang chạy
        + 'AND IsMaster <> 1 ' // Ko lấy Event do Master handle
        + 'AND Enable = 1 ' // Chỉ lấy Event đang bật
        + 'AND GameID = 0 ';
//        + 'AND DataKey <> \'\' '; // ko cần thiết vì event chạy ở Agent đôi khi ko cần datakey
    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    });
};

exports.diamondUpdate = function (UserID, Diamond, ReasonID, Des, UserChannelID, UserProviderID, UserPlatformID, callback) {
    // wallet_UpdateMoneySafe(IN uid bigint, IN imoney bigint, IN reasonid int, IN des text, IN cid int,
    //     IN pid int, IN plid int, IN sid int, IN stid int, IN kid int, IN gid int)
    //ServerID,ServerTrackingID,KindID,GameID
    callSp('wallet_UpdateDiamondSafeV2', UserID, Diamond, ReasonID, Des, UserChannelID, UserProviderID, UserPlatformID, 0, 0, 0, 0, function (e, r, f) {
        if (!e) {
            if (Utility.CheckVariable(r) && Utility.CheckVariable(r[0]) && Utility.CheckVariable(r[0][0])) {
                callback(0, r[0][0]);
            } else {
                callback('dataErr', r);// call db error
            }
        } else {
            callback('callDbErr', e);// call db error
        }
    });
};

exports.insertTrackingUser = function (AccountID, utm_source, utm_medium, utm_content, utm_campaign, fbclid, gameid, landingPage, IP, callback) {
    //AccountID	utm_source	utm_medium	utm_content	utm_campaign	fbclid	gameid	landingPage	UpdateTime
    var tableName = 'usertracking';
    try {
        insertTable(tableName,
            [
                "AccountID",
                "utm_source",
                "utm_medium",
                "utm_content",
                "utm_campaign",
                "fbclid",
                "gameid",
                "landingPage",
                "UpdateTime",
                "IP"
            ], [
                AccountID,
                utm_source,
                utm_medium,
                utm_content,
                utm_campaign,
                fbclid,
                gameid,
                landingPage,
                new Date(),
                IP
            ], callback);
    } catch (e) {
        Logger.error(tableName, e.stack);
    }

};