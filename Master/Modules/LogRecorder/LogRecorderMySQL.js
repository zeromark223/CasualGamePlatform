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

function insertTableMulti(table, colarr, valarr, callback) {
    if (typeof callback == 'undefined') callback = function () {

    };
    try {
        var queryStr = 'insert into ' + table + '(';

        queryStr += colarr.join(',') + ') values ?';

        pool.getConnection(function (err, con) {
            try {
                if (!err) {
                    con.query({
                        sql: queryStr,
                        timeout: 40000, // 40s
                        values: [valarr]
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

exports.callSp = callSp;
exports.insertTable = insertTable;
exports.queryRaw = queryRaw;

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

exports.loginLoggingTest = function (UserID, Token, CreateDate, IP, ServerID, ChannelID, ProviderID, PlatformID, cb) {
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
            ], cb);
    } catch (e) {
        Logger.error(tableName, e.stack);
    }

};

exports.dailyAwardRecord = function (UserID, Createdate, AwardMoney, AwardBounding, TotalMoney, WebMoney, GameMoney, ChannelID, ProviderID, PlatformID, IsGet, AwardID, callback) {
    var tableName = 'dailyaward_log';
    try {
        insertTable(tableName + Utility.GenSuffixDateSql(),
            [
                "UserID",
                "Createdate",
                "AwardMoney",
                "AwardBounding",
                "TotalMoney",
                "WebMoney",
                "GameMoney",
                "ChannelID",
                "ProviderID",
                "PlatformID",
                "IsGet",
                "AwardID"
            ], [
                UserID,
                Createdate,
                AwardMoney,
                AwardBounding,
                TotalMoney,
                WebMoney,
                GameMoney,
                ChannelID,
                ProviderID,
                PlatformID,
                IsGet,
                AwardID
            ], callback);
    } catch (e) {
        Logger.error(tableName, e.stack);
    }

};


exports.dailyAwardCheck = function (UserID, callback) {
    var tableName = 'dailyaward_log' + Utility.GenSuffixDateSql();
    var sqlQuery = 'SELECT * from ' + tableName +
        ' where UserID = ' + UserID + ' LIMIT 1';
    queryRaw(sqlQuery, function (e, r) {
        if (!e) {
            if (Utility.CheckVariable(r, 0)) {// Đảm bảo có data
                callback(0, r[0]);
                return;
            }
        }
        callback(1, e, r);
    });
};

exports.dailyAwardCheckAndGetAward = function (UserID, callback) {
    var tableName = 'dailyaward_log' + Utility.GenSuffixDateSql();
    var sqlQuery = 'Update ' + tableName +
        ' SET IsGet = 1' +
        ' where UserID = ' + UserID + ' and IsGet = 0';
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

exports.onlineAwardRecord = function (UserID, AwardID, TimeLeft, Createdate, AwardMoney, AwardMoneyCfg, LimitedGold, UpdateTime, TotalMoney, WebMoney, GameMoney, ChannelID, ProviderID, PlatformID, IsGet, callback) {
    var tableName = 'onlineaward_log';
    try {
        insertTable(tableName + Utility.GenSuffixDateSql(),
            [
                "UserID",
                "AwardID",
                "TimeLeft",
                "Createdate",
                "AwardMoney",
                "AwardMoneyCfg",
                "LimitedGold",
                "UpdateTime",
                "TotalMoney",
                "WebMoney",
                "GameMoney",
                "ChannelID",
                "ProviderID",
                "PlatformID",
                "IsGet"
            ], [
                UserID,
                AwardID,
                TimeLeft,
                Createdate,
                AwardMoney,
                AwardMoneyCfg,
                LimitedGold,
                UpdateTime,
                TotalMoney,
                WebMoney,
                GameMoney,
                ChannelID,
                ProviderID,
                PlatformID,
                IsGet
            ], callback);
    } catch (e) {
        Logger.error(tableName, e.stack);
    }

};


exports.onlineAwardCheck = function (UserID, callback) {
    var tableName = 'onlineaward_log' + Utility.GenSuffixDateSql();
    var sqlQuery = 'SELECT * from ' + tableName +
        ' where UserID = ' + UserID + ' ORDER BY AwardID DESC LIMIT 1';
    queryRaw(sqlQuery, function (e, r) {
        if (!e) {
            if (Utility.CheckVariable(r, 0)) {// Đảm bảo có data
                callback(0, r[0]);
                return;
            }
        }
        callback(1, e, r);
    });
};

exports.onlineAwardCheckAndGetAward = function (UserID, AwardID, AwardMoney, callback) {
    var tableName = 'onlineaward_log' + Utility.GenSuffixDateSql();
    var sqlQuery = 'Update ' + tableName +
        ' SET IsGet = 1 , AwardMoney = ' + AwardMoney +
        ' where UserID = ' + UserID + ' and IsGet = 0 and AwardID = ' + AwardID;
    //Ko check Order By vì còn đang căn nhắc.
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

exports.onlineAwardUpdateOnUserLeft = function (UserID, AwardID, TimeLeft, callback) {
    var tableName = 'onlineaward_log' + Utility.GenSuffixDateSql();
    var sqlQuery = 'Update ' + tableName +
        ' SET TimeLeft = ' + TimeLeft + ' , UpdateTime = NOW()' +
        ' where UserID = ' + UserID + ' and IsGet = 0 and AwardID = ' + AwardID;
    //Ko check Order By vì còn đang căn nhắc.
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

exports.getUserEventInfo = function (UserID, callback) {
    var tableName = 'userevent_log';
    var sqlQuery = 'SELECT * FROM ' + tableName +
        ' where UserID = ' + UserID;
    //Ko check Order By vì còn đang căn nhắc.
    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);// Không thể Update
    });
};

exports.genNewUserEventInfo = function (UserID, callback) {
    var tableName = 'userevent_log';
    var sqlQuery = 'INSERT ' + tableName + ' (UserID,EventFlag,UpdateTime,CreateAccBonus,DailyLoginEvent,LuckyTime)' +
        ' VALUES( ' + UserID + ',0,NOW(),0,0,0)';
    //Ko check Order By vì còn đang căn nhắc.
    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);// Không thể Update
    });
};

exports.addUserEventInfo = function (UserID, ValueAdd, callback) { // + - giá trị // Có risk khi xài qq này
    var tableName = 'userevent_log';
    var sqlQuery = 'Update ' + tableName +
        ' SET EventFlag = EventFlag + ' + ValueAdd + ', UpdateTime = NOW()' +
        ' where UserID = ' + UserID;
    //Ko check Order By vì còn đang căn nhắc.
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

exports.setUserEventInfo = function (UserID, ValueAdd, callback) { //overide giá trị, // Có risk khi xài qq này
    var tableName = 'userevent_log';
    var sqlQuery = 'Update ' + tableName +
        ' SET EventFlag =  ' + ValueAdd + ', UpdateTime = NOW()' +
        ' where UserID = ' + UserID;
    //Ko check Order By vì còn đang căn nhắc.
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

exports.setUserEventInfoSafe = function (UserID, Flag, OldValue, ValueAdd, callback) { //overide giá trị, //xài thằng này đi, đỡ risk
    var tableName = 'userevent_log';
    var sqlQuery = 'Update ' + tableName +
        ' SET ' + Flag.toString() + ' =  ' + ValueAdd + ', UpdateTime = NOW()' +
        ' where UserID = ' + UserID + ' AND ' + Flag.toString() + ' = ' + OldValue;
    //Ko check Order By vì còn đang căn nhắc.
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

exports.checkUserIpCount = function (IP, callback) { //overide giá trị, //xài thằng này đi, đỡ risk
    var tableName = 'login_log' + Utility.GenSuffixDateSql();
    var sqlQuery = 'Select IP,UserID,COUNT(DISTINCT UserID)  as NickCount FROM ' + tableName
        + ' WHERE IP LIKE \'%' + IP + '\''
        + ' GROUP BY IP ';
    //Ko check Order By vì còn đang căn nhắc.
    queryRaw(sqlQuery, function (e, d) {
        callback(e, d);// Không thể Update
    });
};
//ID	UserID	MissionID	TypeID	Target	Completed	IsGet	Param	RewardGold

exports.dailyMissionRecord = function (TimeCheck, valArr, callback) {
    var tableName = 'daily_mission_log';
    try {
        insertTableMulti(tableName + Utility.GenSuffixDateSqlByDate(new Date(TimeCheck)),
            [
                "UserID",
                "MissionID",
                "TypeID",
                "Target",
                "Completed",
                "IsGet",
                "GameList",
                "Param",
                "RewardGold",
                "CreateTime",
                "UpdateTime"
            ], valArr, callback);
    } catch (e) {
        Logger.error(tableName, e.stack);
    }

};

exports.dailyMissionGetAll = function (TimeCheck, UserID, callback) {
    var tableName = 'daily_mission_log' + Utility.GenSuffixDateSqlByDate(new Date(TimeCheck));
    var sqlQuery = 'SELECT * from ' + tableName +
        ' where UserID = ' + UserID;
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


exports.dailyMissionGetAndUpdateSafe = function (TimeCheck, ID, callback) {
    var tableName = 'daily_mission_log' + Utility.GenSuffixDateSqlByDate(new Date(TimeCheck));
    var sqlQuery = 'UPDATE ' + tableName +
        ' SET IsGet =  1' +
        ' where ID = ' + ID + ' and IsGet = 0'; // Lấy tất cả NV chưa hoàn thành
    try {
        queryRaw(sqlQuery, function (e, r) {
            if (!e) {
                if (Utility.CheckVariable(r, 'affectedRows')) {
                    callback(r.affectedRows); // Kết quả Update
                    return;
                }
            }
            callback(0);// Không thể Update
        });
    } catch (e) {
        Logger.error(tableName, e.stack);
        callback(0)
    }
};

exports.achievementGetAll = function (UserID, callback) {
    var tableName = 'achievement_user_log'; // Ko có thời gian
    var sqlQuery = 'SELECT * from ' + tableName +
        ' where UserID = ' + UserID;
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

exports.achievementRecordAll = function (UserID, CompletedData, GetRewardData, callback) {
    var tableName = 'achievement_user_log';
    try {
        insertTable(tableName,
            [
                "UserID",
                "IsGetAll",
                "UpdateTime",
                "CreateTime",
                "CompletedData",
                "GetRewardData"
            ], [
                UserID,
                0,
                new Date(),
                new Date(),
                CompletedData,
                GetRewardData
            ], callback);
    } catch (e) {
        Logger.error(tableName, e.stack);
    }

};


exports.achievementGetAndUpdateUnSafe = function (UserID, GetRewardData, callback) {
    //Unsafe vì ko chắc chắn achievement có bị insect ko, cần thêm hàm Safe
    var tableName = 'achievement_user_log';
    var sqlQuery = 'UPDATE ' + tableName +
        " SET GetRewardData =  '" + GetRewardData + "'" +
        ' where UserID = ' + UserID; // Lấy tất cả NV chưa hoàn thành
    try {
        queryRaw(sqlQuery, function (e, r) {
            if (!e) {
                if (Utility.CheckVariable(r, 'affectedRows')) {
                    callback(r.affectedRows); // Kết quả Update
                    return;
                }
            }
            callback(0);// Không thể Update
        });
    } catch (e) {
        Logger.error(tableName, e.stack);
        callback(0)
    }

};