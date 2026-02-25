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

exports.outGameRecord = function (UserID, ServerId, DeskId, KindID, MoneyIn, MoneyOut, MoneyChange, TimeIn, TimeOut, GameID,ChannelID, callback) {
    var tableName = 'outgame_log';
    try {
        insertTable(tableName + Utility.GenSuffixDateSql(),
            [
                "UserID",
                "ServerId",
                "DeskId",
                "KindID",
                "MoneyIn",
                "MoneyOut",
                "MoneyChange",
                "TimeIn",
                "TimeOut",
                "GameID",
                "ChannelID"
            ], [
                UserID,
                ServerId,
                DeskId,
                KindID,
                MoneyIn,
                MoneyOut,
                MoneyChange,
                TimeIn,
                TimeOut,
                GameID,
                ChannelID
            ], callback);
    } catch (e) {
        Logger.error(tableName, e.stack);
    }

};

exports.listUserFishRecord = function (UserID, KindID, MatchID, FishKind, FishCount, BulletCount, UserPayMoney, UserEarnMoney, UpdateTime) {
    var tableName = 'listfishdie_log';
    try {
        insertTable(tableName + Utility.GenSuffixDateSql(),
            [
                "UserID",
                "KindID",
                "MatchID",
                "FishKind",
                "FishCount",
                "BulletCount",
                "UserPayMoney",
                "UserEarnMoney",
                "UpdateTime"
            ], [
                UserID,
                KindID,
                MatchID,
                FishKind,
                FishCount,
                BulletCount,
                UserPayMoney,
                UserEarnMoney,
                UpdateTime
            ]);
    } catch (e) {
        Logger.error(tableName, e.stack);
    }

};


exports.moneyTransferRecord = function (UserID, ReasonID, ServerID, ServerTrackID, ChannelID, ProviderID, KindID, MoneyTransfer, MoneyBefore, MoneyAfter, UpdateTime, Description, ActionType, ErrorCode, ErrorDescription, callback) {
    var tableName = 'moneytransfer_log';
    try {
        insertTable(tableName + Utility.GenSuffixDateSql(),
            [
                "UserID",
                "ReasonID",
                "ServerID",
                "KindID",
                "ServerTrackID",
                "ChannelID",
                "ProviderID",
                "MoneyTransfer",
                "MoneyBefore",
                "MoneyAfter",
                "UpdateTime",
                "Description",
                "ActionType",
                "ErrorCode",
                "ErrorDescription"
            ], [
                UserID,
                ReasonID,
                ServerID,
                KindID,
                ServerTrackID,
                ChannelID,
                ProviderID,
                MoneyTransfer,
                MoneyBefore,
                MoneyAfter,
                UpdateTime,
                Description,
                ActionType,
                ErrorCode,
                ErrorDescription,
                callback
            ]);
    } catch (e) {
        Logger.error(tableName, e.stack);
    }

};

exports.loginLogging = function (UserID, Token, CreateDate, IP, ServerID, ChannelID, ProviderID, PlatformID) {
    var tableName = 'login_log';
    try {
        insertTable(tableName + Utility.GenSuffixDateSql(),
            [
                "UserID",
                "Token",
                "CreateDate",
                "IP",
                "ServerID",
                "ChannelID",
                "ProviderID",
                "PlatformID"
            ], [
                UserID,
                Token,
                CreateDate,
                IP,
                ServerID,
                ChannelID,
                ProviderID,
                PlatformID
            ]);
    } catch (e) {
        Logger.error(tableName, e.stack);
    }

};

exports.onlineAwardCalcEndGame = function (UserID, PlayTime, callback) {
    var tableName = 'onlineaward_log' + Utility.GenSuffixDateSql();
    var sqlQuery = 'Update ' + tableName +
        ' SET TimeLeft = TimeLeft - ' + PlayTime +
        ' where UserID = ' + UserID + ' ORDER BY AwardID DESC LIMIT 1';
    queryRaw(sqlQuery, function (e, r) {
        if (!e) {
            if (Utility.CheckVariable(r, 'affectedRows')) {
                callback(r.affectedRows); // Kết quả Update
                return;
            }
        }
        callback(0);// Không thể Update
    });
};

exports.logUserBet = function (UserID, BetID, BetGold, MatchID, Tax,ChannelID) {
    var tableName = 'taixiu_betlog';
    try {
        insertTable(tableName + Utility.GenSuffixDateSql(),
            [
                "UserID",
                "BetID",
                "BetGold",
                "MatchID",
                "Tax",
                "CreateDate",
                "ChannelID"
            ], [
                UserID,
                BetID,
                BetGold,
                MatchID,
                Tax,
                new Date(),
                ChannelID
            ]);
    } catch (e) {
        Logger.error(tableName, e.stack);
    }

};

exports.logUserBetEndGame = function (UserID, BetID, BetGold, MatchID, Tax, WinGold, WinGoldWithTax,ChannelID) {
    var tableName = 'taixiu_betlog_withwin';
    try {
        insertTable(tableName + Utility.GenSuffixDateSql(),
            [
                "UserID",
                "BetID",
                "BetGold",
                "WinGold",
                "WinGoldWithTax",
                "MatchID",
                "Tax",
                "CreateDate",
                "ChannelID"
            ], [
                UserID,
                BetID,
                BetGold,
                WinGold,
                WinGoldWithTax,
                MatchID,
                Tax,
                new Date(),
                ChannelID
            ]);
    } catch (e) {
        Logger.error(tableName, e.stack);
    }

};

exports.logStartMatch = function (DeskID, RoomID, KindID, Tax, CurrentStock, ResultTextEncrypted, callback) {
    var tableName = 'taixiu_startmatch_log';
    try {
        insertTable(tableName + Utility.GenSuffixDateSql(),
            [
                "CreateDate",
                "DeskID",
                "RoomID",
                "KindID",
                "Tax",
                "CurrentStock",
                "ResultTextEncrypted"
            ], [

                new Date(),
                DeskID,
                RoomID,
                KindID,
                Tax,
                CurrentStock,
                ResultTextEncrypted

            ], callback);
    } catch (e) {
        Logger.error(tableName, e.stack);
    }

};

exports.logEndMatch = function (MatchID, ResultDices, ResultText, ResultTextEncypted, TotalSysWin, TotalSysLose, TotalTax, Tax, CurrentStock, RoomID, DeskID, KindID, callback) {
    var tableName = 'taixiu_endmatch_log';
    try {
        insertTable(tableName + Utility.GenSuffixDateSql(),
            [
                "MatchID",
                "ResultDices",
                "ResultText",
                "ResultTextEncypted",
                "TotalSysWin",
                "TotalSysLose",
                "TotalTax",
                "Tax",
                "CurrentStock",
                "CreateDate",
                "RoomID",
                "KindID",
                "DeskID"
            ], [

                MatchID,
                ResultDices,
                ResultText,
                ResultTextEncypted,
                TotalSysWin,
                TotalSysLose,
                TotalTax,
                Tax,
                CurrentStock,
                new Date(),
                RoomID,
                KindID,
                DeskID

            ], callback);
    } catch (e) {
        Logger.error(tableName, e.stack);
    }

};


exports.dailyMissionGetAllByGame = function (TimeCheck, UserID, callback) {
    var tableName = 'daily_mission_log' + Utility.GenSuffixDateSqlByDate(new Date(TimeCheck));
    var sqlQuery = 'SELECT * from ' + tableName +
        ' where UserID = ' + UserID + ' and Completed < Target '; // Lấy tất cả NV chưa hoàn thành
    try {
        queryRaw(sqlQuery, function (e, r) {
            if (!e) {
                callback(0, r);
            } else {
                callback(1, e, r);
            }
        });
    } catch (e) {
        Logger.error(tableName, e.stack);
    }

};

exports.dailyMissionRecordByGame = function (TimeCheck, ID, Completed) {
    var tableName = 'daily_mission_log' + Utility.GenSuffixDateSqlByDate(new Date(TimeCheck));
    var sqlQuery = 'UPDATE ' + tableName +
        ' SET Completed = ' + Completed +
        ' where ID = ' + ID; // Lấy tất cả NV chưa hoàn thành
    try {
        queryRaw(sqlQuery, function (e, r) {

        });
    } catch (e) {
        Logger.error(tableName, e.stack);
    }
};

exports.achievementGetAllByGame = function (TimeCheck, UserID, callback) {
    var tableName = 'achievement_user_log'; // Ko có thời gian
    var sqlQuery = 'SELECT * from ' + tableName +
        ' where UserID = ' + UserID + ' and IsGetAll = 0';//Chỉ lấy khi chưa hoàn thành tất cả
    try {
        queryRaw(sqlQuery, function (e, r) {
            if (!e) {
                callback(0, r);
            } else {
                callback(1, e, r);
            }
        });
    } catch (e) {
        Logger.error(tableName, e.stack);
    }
};

exports.achievementGetAllByGame = function (UserID, callback) {
    var tableName = 'achievement_user_log';
    var sqlQuery = 'SELECT * from ' + tableName +
        ' where UserID = ' + UserID + ' and IsGetAll = 0 '; // Lấy tất cả NV chưa hoàn thành
    try {
        queryRaw(sqlQuery, function (e, r) {
            if (!e) {
                callback(0, r);
            } else {
                callback(1, e, r);
            }
        });
    } catch (e) {
        Logger.error(tableName, e.stack);
    }

};

exports.achievementRecordByGameUnSafe = function (UserID, CompletedData, callback) {
    var tableName = 'achievement_user_log';
    var sqlQuery = 'UPDATE ' + tableName +
        " SET CompletedData = '" + CompletedData + "'" +
        ' where UserID = ' + UserID; // Lấy tất cả NV chưa hoàn thành
    try {
        queryRaw(sqlQuery, function (e, r) {
            callback(e)
        });
    } catch (e) {
        Logger.error(tableName, e.stack);
    }
};