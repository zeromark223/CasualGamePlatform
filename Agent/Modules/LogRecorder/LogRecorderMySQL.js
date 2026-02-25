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

exports.spawnBossRecord = function (BossAutoID, BossID, KindID, FishKind, MaxHp, RoundTime, RoundCount, Delay, BossCount, TotalGoldHit, GoldHitMultiple, GoldHitRatio, LastHitGold, DayStart, DayEnd, TimeStart, TimeEnd, SpawnTime) {
    try{
        insertTable('globalboss_spawn_log' + Utility.GenSuffixDateSql(),
            [
                "BossAutoID",
                "BossID",
                "KindID",
                "FishKind",
                "MaxHp",
                "RoundTime",
                "RoundCount",
                "Delay",
                "BossCount",
                "TotalGoldHit",
                "GoldHitMultiple",
                "GoldHitRatio",
                "LastHitGold",
                "DayStart",
                "DayEnd",
                "TimeStart",
                "TimeEnd",
                "SpawnTime"
            ], [
                BossAutoID,
                BossID,
                KindID,
                FishKind,
                MaxHp,
                RoundTime,
                RoundCount,
                Delay,
                BossCount,
                TotalGoldHit,
                GoldHitMultiple,
                GoldHitRatio,
                LastHitGold,
                DayStart,
                DayEnd,
                TimeStart,
                TimeEnd,
                SpawnTime
            ]);
    }catch (e){
        Logger.error('globalboss_spawn_log', e.stack);
    }

};

exports.collectDataKingOfTheSeaByDay = function (Date,StartTime,EndTime, callback) {
    var tableName = 'listfishdie_log' + Utility.GenSuffixDateSqlByDate(Date);
    var sqlQuery = 'SELECT UserID,SUM(UserEarnMoney) as UserEarnMoney FROM ' + tableName +
        ' WHERE UpdateTime > ' + pool.escape(StartTime) + ' AND UpdateTime < ' + pool.escape(EndTime) +
        ' GROUP BY UserID ORDER BY UserPayMoney DESC ' ;

    queryRaw(sqlQuery, function (e, r) {
        if (!e) {
            callback(0,r); // Kết quả Update
            return;
        }
        callback(1);// Không thể Update
    });
};

exports.collectDataSeaHunterByDay = function (Date,StartTime,EndTime, callback) {
    var tableName = 'listfishdie_log' + Utility.GenSuffixDateSqlByDate(Date);
    var sqlQuery = 'SELECT UserID,SUM(UserPayMoney) as UserPayMoney FROM ' + tableName +
        ' WHERE UpdateTime > ' + pool.escape(StartTime) + ' AND UpdateTime < ' + pool.escape(EndTime) +
        ' GROUP BY UserID ORDER BY UserPayMoney DESC ' ;

    queryRaw(sqlQuery, function (e, r) {
        if (!e) {
            callback(0,r); // Kết quả Update
            return;
        }
        callback(1);// Không thể Update
    });
};


exports.getTotalFishByTime = function (date,callback) {
    var suffix = Utility.GenSuffixDateSqlByDate(date);
    var sqlQuery = 'select Sum(MoneyOut) as sum from outgame_log'+suffix;
    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);// trả kết quả
    });
};

exports.getTableList = function (callback) {
    var sqlQuery = 'SELECT Table_name as name FROM information_schema.tables where table_schema = \'bc68_log\'';
    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);// trả kết quả
    });
};

exports.clearTable = function (tbName) {
    var sqlQuery = 'DROP TABLE IF EXISTS '+tbName;
    console.log(sqlQuery);
    queryRaw(sqlQuery, function (e, r) {

    });
};

exports.getTopUserWin = function (count,callback) {
    var tableName = 'outgame_log' + Utility.GenSuffixDateSql();
    var sqlQuery = 'SELECT UserID,SUM(MoneyChange) as UserWin FROM ' + tableName +
        ' GROUP BY UserID ORDER BY UserWin DESC LIMIT '+count ;
    queryRaw(sqlQuery, function (e, r) {
        if (!e) {
            callback(0,r); // Kết quả Update
            return;
        }
        callback(1);// Không thể Update
    });
};