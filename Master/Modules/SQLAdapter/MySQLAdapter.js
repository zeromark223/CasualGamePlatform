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
    return Utility.CheckVariable(data, 'UserID', 'AccountID', 'GameName', 'CreateDate', 'Lv', 'Exp', 'StockHandicap')
}

exports.checkLogin = function (AccountID, GameName, ServerID, GameID, callback) {
    callSp('CheckLogin', AccountID, GameName, ServerID, GameID, function (e, r, f) {
        if (!e) {
            if (Utility.CheckVariable(r, 'length')) {
                var loginData = -1;
                var onlineState = 'Online';
                for (var i = 0; i < r.length; i++) {
                    if (!Utility.CheckVariable(r[i])) {
                        continue;
                    }
                    if (checkDataLogin(r[i][0])) {
                        loginData = r[i][0];
                        continue;
                    } else {

                        if (Utility.CheckVariable(r[i][0], 'onlineState')) {
                            onlineState = r[i][0].onlineState;
                        }
                    }
                }
                if (loginData == -1) {
                    callback('loginFail', r)
                } else {
                    if (onlineState == 'NoOnline') {
                        callback(0, loginData);
                    } else {
                        callback('userOnline', onlineState)
                    }
                }

            } else {
                callback('chkRsErr', r);// Check result error
            }
        } else {
            callback('callDbErr', e);// call db error
        }

    });
};
exports.masterStatusStart = function (sid, ip, ccu, portr, portws, portwss) {
    callSp('masterstatus_start', sid, ip, ccu, portr, portws, portwss);
};
exports.masterStatusUpdate = function (sid, ccu) {
    callSp('masterstatus_update', sid, ccu);
};
exports.checkLoginGame = function (UserID, GameServerID, GameID, callback) {
    callSp('CheckLoginGame', UserID, GameServerID, GameID, function (e, r, f) {
        if (!e) {
            if (Utility.CheckVariable(r, 'length')) {
                var loginData = -1;
                var onlineState = 'online';
                for (var i = 0; i < r.length; i++) {
                    if (!Utility.CheckVariable(r[i])) {
                        continue;
                    }
                    if (checkDataLogin(r[i][0])) {
                        loginData = r[i][0];
                        continue;
                    } else {

                        if (Utility.CheckVariable(r[i][0], 'onlineState')) {
                            onlineState = r[i][0].onlineState;
                        }
                    }
                }
                if (loginData == -1) {
                    callback('loginFail', r)
                } else {
                    if (onlineState == 'NoOnline') {
                        callback(0, loginData);
                    } else {
                        callback('userOnline', onlineState)
                    }
                }
            } else {
                callback('chkRsErr', r);// Check result error
            }
        } else {
            callback('callDbErr', e);// call db error
        }

    });
};
exports.serverStatusStart = function (sid, ip, kindid, ccu, portr, portws, portwss, deskCount, maxccu, moneyRequired, levelRequired, gid) {
    callSp('serverstatus_start', sid, ip, kindid, ccu, portr, portws, portwss, deskCount, maxccu, moneyRequired, levelRequired, gid);
};
exports.serverStatusUpdate = function (sid, ccu) {
    callSp('serverstatus_update', sid, ccu);
};
exports.userOnlineInsert = function (uid, sid, gameid) {
    callSp('userOnline_Insert', uid, sid, gameid);
};
exports.userOnlineRemove = function (uid, sid, gameid) {
    callSp('userOnline_Remove', uid, sid, gameid);
};
//Money
exports.moneyChargeAll = function (UserID, ReasonID, Des, ChannelID, ProviderID, PlatformID, ServerID, ServerTrackingID, GameKindID, GameID, callback) {
    callSp('wallet_ChargeAllV2', UserID, ReasonID, Des, ChannelID, ProviderID, PlatformID, ServerID, ServerTrackingID, GameKindID, GameID, function (e, r, f) {
        if (!e) {
            callback(0, r[0]);
        } else {
            callback('callDbErr', e);// call db error
        }

    });
};
exports.moneyRefundAll = function (UserID, ReasonID, Des, Money, ChannelID, ProviderID, PlatformID, ServerID, ServerTrackingID, GameKindID, GameID, callback) {
    callSp('wallet_RefundMoneyV2', UserID, ReasonID, Des, Money, ChannelID, ProviderID, PlatformID, ServerID, ServerTrackingID, GameKindID, GameID, function (e, r, f) {
        if (!e) {
            callback(0, r[0]);
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
exports.moneyAddOnly = function (User, MoneyAdd, ReasonID, Des, ServerID, GameKindID, GameID, callback) {
    callSp('wallet_AddMoneyV2', User.UserID, MoneyAdd, ReasonID, Des, User.UserChannelID, User.UserProviderID, User.UserPlatformID, ServerID, User.SessionID, GameKindID, GameID, function (e, r, f) {
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
//Money End
exports.checkLoginV2 = function (AccountID, GameName, ServerID, GameID, FBID, LoginIP, callback) {
    callSp('CheckLoginV2', AccountID, GameName, ServerID, GameID, FBID, LoginIP, function (e, r, f) {
        if (!e) {
            if (Utility.CheckVariable(r, 'length')) {
                var loginData = -1;
                var onlineState = 'Online';
                for (var i = 0; i < r.length; i++) {
                    if (!Utility.CheckVariable(r[i])) {
                        continue;
                    }
                    if (checkDataLogin(r[i][0])) {
                        loginData = r[i][0];
                        continue;
                    } else {

                        if (Utility.CheckVariable(r[i][0], 'onlineState')) {
                            onlineState = r[i][0].onlineState;
                        }
                    }
                }
                if (loginData == -1) {
                    callback('loginFail', r)
                } else {
                    if (onlineState == 'NoOnline') {
                        callback(0, loginData);
                    } else {
                        callback('userOnline', onlineState)
                    }
                }

            } else {
                callback('chkRsErr', r);// Check result error
            }
        } else {
            callback('callDbErr', e);// call db error
        }

    });
};