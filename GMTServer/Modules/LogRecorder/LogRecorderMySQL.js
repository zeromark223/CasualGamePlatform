var mysql = require('mysql');
var Utility = require('../../../SharedModule/Utility');
var Logger = console;
var pool;
var isConnected = false;
var dbmain = 0;
exports.Init = function (config, logger, _dbmain) {
    pool = mysql.createPool(config);
    dbmain = _dbmain;
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

//GMTool

exports.GetDAU = function(date, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'SELECT COUNT(*) AS DAU, ChannelID from (select tableLog.* from login_log_' + logDate + ' as tableLog group by tableLog.UserID, ChannelID) as T1 group by ChannelID';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    });
};

exports.GetListMoneyWinByDate = function(date, DateTimeFrom, DateTimeTo, Top, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'select UserID, SUM(MoneyChange) AS MoneyWin from outgame_log_' + logDate +' where TimeOut BETWEEN \'' + DateTimeFrom + '\' AND \'' + DateTimeTo + '\' group by UserID having MoneyWin > 0 order by MoneyWin desc LIMIT ' + Top;

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetLogGoldUser = function(userid, date, callback){
    var logDate = date.replace(/-/gi, '_');

    var sqlQuery = 'SELECT Id AS MatchID, UserID, MoneyIn, MoneyOut, MoneyChange, TimeOut  FROM outgame_log_' + logDate +' where UserID = '+ userid;
    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetMoneyWinByDate = function(date, TimeFrom, TimeTo, callback){
    var logDate = date.replace(/-/gi, '_');

    var sqlQuery = 'SELECT SUM(MoneyChange) AS TotalMoneyWin, GameID, ChannelID FROM outgame_log_' + logDate + ' where MoneyChange >= 0 AND TIME(TimeOut) BETWEEN \'' + TimeFrom + '\' AND \'' + TimeTo + '\''  +' group by GameID, ChannelID';
    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetMoneyLoseByDate = function(date, TimeFrom, TimeTo, callback){
    var logDate = date.replace(/-/gi, '_');

    var sqlQuery = 'SELECT SUM(MoneyChange) AS TotalMoneyLose, GameID, ChannelID FROM outgame_log_' + logDate + ' where MoneyChange < 0 AND TIME(TimeOut) BETWEEN \'' + TimeFrom + '\' AND \'' + TimeTo + '\''  +' group by GameID, ChannelID';
    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetTotalDailyAwardByDate = function(date, TimeFrom, TimeTo, callback){
    var logDate = date.replace(/-/gi, '_');

    var sqlQuery = 'select SUM(AwardMoney) AS TotalDailyAward, ChannelID FROM dailyaward_log_' + logDate + ' group by ChannelID';
    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetTotalOnlineAwardByDate = function(date, TimeFrom, TimeTo, callback){
    var logDate = date.replace(/-/gi, '_');

    var sqlQuery = 'select SUM(AwardMoney) AS TotalOnlineAward, ChannelID FROM onlineaward_log_' + logDate + ' group by ChannelID';
    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetMoneyFlowStatisticsByDate = function(date, callback){
    var logDate = date.replace(/-/gi, '_');

    var sqlQuery = 'select ReasonID, SUM(MoneyTransfer) AS TotalMoneyTransfer FROM  moneytransfer_log_' + logDate +' group by ReasonID';
    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetLogGoldUserByArr = function(userid, date, timefrom, timeto, callback){
    //must to check if userid is not empty array first
    var logDate = date.replace(/-/gi, '_');

    //var sqlQuery = 'SELECT UserID, ReasonID, ServerID, ServerTrackID, MoneyBefore, MoneyAfter, MoneyTransfer, UpdateTime, Description, GameID  FROM moneytransfer_log_' + logDate +' where UserID = '+ userid[0].UserID;
    var sqlQuery = 'SELECT *  FROM moneytransfer_log_' + logDate +' where (UserID = '+ userid[0].UserID;

    for(var i = 1; i < userid.length; i++){
        var AdditionalQuery = " OR UserID = " + userid[i].UserID;
        sqlQuery = sqlQuery + AdditionalQuery;
    }

    sqlQuery = sqlQuery + ') AND TIME(UpdateTime) BETWEEN \'' + timefrom + '\' AND \'' + timeto + '\'';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetCCULog = function(datefrom, dateto, callback){
    var sqlQuery = 'SELECT UpdateTime, CCU, CCU_MAX, CCU_MIN, GameID FROM ccu_log WHERE DATE(UpdateTime) BETWEEN \'' + datefrom + '\' AND \'' + dateto + '\'';
    queryRaw(sqlQuery, function(e, r){
       callback(e, r);
    });
};

exports.GetTotalSystemGoldByDate = function(DateFrom, DateTo, callback){
    var sqlQuery = 'SELECT UpdateTime, TotalSystemGold from totalsystemgold_log where Date(UpdateTime) BETWEEN \'' + DateFrom + '\' AND \'' + DateTo + '\'';
    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    });
};


exports.GetUserWinCount = function(date, DateTimeFrom, DateTimeTo, callback){
    var logDate = date.replace(/-/gi, '_');
    //select count(1) as Count from (select UserID, SUM(MoneyChange) AS MoneyWin from outgame_log_2018_09_12 GROUP BY UserID ) as l;
    var sqlQuery = 'select count(1) as Count from (select UserID, SUM(MoneyChange) AS MoneyWin from outgame_log_' + logDate
        +' where TimeOut BETWEEN \'' + DateTimeFrom + '\' AND \'' + DateTimeTo + '\' group by UserID having MoneyWin > 0 ) as tmp';
    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetUserLoseCount = function(date, DateTimeFrom, DateTimeTo, callback){
    var logDate = date.replace(/-/gi, '_');
    //select count(1) as Count from (select UserID, SUM(MoneyChange) AS MoneyWin from outgame_log_2018_09_12 GROUP BY UserID ) as l;
    var sqlQuery = 'select count(1) as Count from (select UserID, SUM(MoneyChange) AS MoneyWin from outgame_log_' + logDate
        +' where TimeOut BETWEEN \'' + DateTimeFrom + '\' AND \'' + DateTimeTo + '\' group by UserID having MoneyWin < 0 ) as tmp';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetUserWinSum = function(date, DateTimeFrom, DateTimeTo, callback){
    var logDate = date.replace(/-/gi, '_');
    //select count(1) as Count from (select UserID, SUM(MoneyChange) AS MoneyWin from outgame_log_2018_09_12 GROUP BY UserID ) as l;
    var sqlQuery = 'select SUM(MoneyWin) as MoneyWin from (select UserID, SUM(MoneyChange) AS MoneyWin from outgame_log_' + logDate
        +' where TimeOut BETWEEN \'' + DateTimeFrom + '\' AND \'' + DateTimeTo + '\' group by UserID having MoneyWin > 0 ) as tmp';
    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetUserLoseSum = function(date, DateTimeFrom, DateTimeTo, callback){
    var logDate = date.replace(/-/gi, '_');
    //select count(1) as Count from (select UserID, SUM(MoneyChange) AS MoneyWin from outgame_log_2018_09_12 GROUP BY UserID ) as l;
    var sqlQuery = 'select SUM(MoneyWin) as MoneyWin from (select UserID, SUM(MoneyChange) AS MoneyWin from outgame_log_' + logDate
        +' where TimeOut BETWEEN \'' + DateTimeFrom + '\' AND \'' + DateTimeTo + '\' group by UserID having MoneyWin < 0 ) as tmp';
    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetListMoneyLoseByDate = function(date, DateTimeFrom, DateTimeTo, Top, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'select UserID, SUM(MoneyChange) AS MoneyWin from outgame_log_' + logDate +' where TimeOut BETWEEN \'' + DateTimeFrom + '\' AND \'' + DateTimeTo + '\' group by UserID having MoneyWin < 0 order by MoneyWin LIMIT ' + Top;

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetLogUserHitBoss = function(date, datetimefrom, datetimeto, UserID_Nick_Array, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'select * from globalboss_userhit_log_' + logDate + ' where CreateTime between \'' + datetimefrom + '\' AND \'' + datetimeto + '\' AND lasthitaward > 0';
    var AdditionalText = '';

    if(UserID_Nick_Array.length > 0){
        AdditionalText += ' AND UserID IN (' + UserID_Nick_Array[0].UserID;

        for(var i = 1; i < UserID_Nick_Array.length; i++){
            AdditionalText += ',' + UserID_Nick_Array[i].UserID;
        }

        AdditionalText += ')';
    }

    sqlQuery+=AdditionalText;

    queryRaw(sqlQuery, function(e,r){
        callback(e, r);
    })
};

exports.Slot_GetBetAndWinSummary = function(date, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'select BetID, KindID, SUM(TotalBet) AS TotalBet, SUM(TotalWin) AS TotalWin, SUM(FreeBetCount) AS FreeBetCount, SUM(FreeBet) AS FreeBet, SUM(BetCount) AS BetCount, SUM(FreeWin) AS FreeWin, SUM(Bonus) AS Bonus, SUM(Jackpot) AS Jackpot from slot_user_betandwin_log_' + logDate + ' group by BetID, KindID ';    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.Slot_GetJackpotWin = function(date, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'select * from slot_jackpot_win_' + logDate;
    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetSumMoneyChange = function(date, GameID, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'select SUM(MoneyChange) AS MoneyChange from outgame_log_' + logDate + ' WHERE GameID =' + GameID;

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetSummaryBCInfo = function(date, TimeFrom, TimeTo, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'select SUM(FishCount) AS FishCount, SUM(BulletCount) AS BulletCount, SUM(UserPayMoney) AS PayMoney, SUM(UserEarnMoney) AS EarnMoney, ChannelID, KindID FROM listfishdie_log_' + logDate + ' WHERE TIME(UpdateTime) BETWEEN \'' + TimeFrom + '\' AND \'' + TimeTo + '\' GROUP BY ChannelID, KindID';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetSummaryTXInfo = function(date, TimeFrom, TimeTo, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'select count(*) AS TotalBetCount, AVG(Tax) AS AVGTax, SUM(BetGold) AS TotalBetGold, SUM(WinGold) AS TotalWinGold, SUM(WinGoldWithTax) AS TotalWinGoldWithTax, ChannelID From taixiu_betlog_withwin_' + logDate + ' where TIME(CreateDate) BETWEEN \'' + TimeFrom + '\' AND \'' + TimeTo + '\' GROUP BY ChannelID';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};


exports.GetNAUDetail = function(date, callback){
	var logDate = date.replace(/-/gi, '_');
	var tableName = 'login_log_'+logDate;
    //var sqlQuery = 'select usr.UserID,DATEDIFF(DATE(loginlog.CreateDate),DATE (usr.CreateDate )) as Dif from (select UserID,CreateDate from '+ tableName+' GROUP BY UserID ) as loginlog LEFT JOIN ' + dbmain + '.user as usr on loginlog.UserID = usr.UserID Order By Dif DESC';
    var sqlQuery = 'select usr.UserID, loginlog.ChannelID,DATEDIFF(DATE(loginlog.CreateDate),DATE (usr.CreateDate )) as Dif from (select UserID,CreateDate,ChannelID from '+ tableName+' GROUP BY UserID ) as loginlog LEFT JOIN ' + dbmain + '.user as usr on loginlog.UserID = usr.UserID Order By Dif DESC';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.TX_GetLogEndMatch = function(date, timefrom, timeto, callback){
    var logDate = date.replace(/-/gi, '_');

    var sqlQuery = 'select * FROM taixiu_endmatch_log_' + logDate + ' where TIME(CreateDate) BETWEEN \'' + timefrom + '\' AND \'' + timeto + '\'';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.TX_GetLogStartMatch = function(date, timefrom, timeto, callback){
    var logDate = date.replace(/-/gi, '_');

    var sqlQuery = 'select * from taixiu_startmatch_log_' + logDate + ' where TIME(CreateDate) BETWEEN \'' + timefrom + '\' AND \'' + timeto + '\'';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.TX_GetBetLogWithWin = function(date, timefrom, timeto, RequestInfo, Filter, callback){
    var logDate = date.replace(/-/gi, '_');
    var TableName = 'taixiu_betlog_withwin_' + logDate;
    var Additional = ' ';

    if(RequestInfo.length > 0){
        if(Filter == 0){
            //UserID
            Additional += 'AND UserID=' + RequestInfo;
        }
        else{

        }
    }

    var sqlQuery = 'select * from '+ TableName + ' where TIME(CreateDate) BETWEEN \'' + timefrom + '\' AND \'' + timeto + '\'' + Additional;

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetSummarySlotInfo = function(date, TimeFrom, TimeTo, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'select SUM(TotalBet) AS TotalBet, SUM(TotalWin) AS TotalWin, SUM(BetCount) AS BetCount, KindID, ChannelID from slot_user_betandwin_log_' + logDate + ' where TIME(CreateDate) BETWEEN \'' + TimeFrom + '\' AND \'' + TimeTo + '\' GROUP BY KindID, ChannelID';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.Baccarat_GetBetLogWithWin = function(date, timefrom, timeto, RequestInfo, Filter, callback){
    var logDate = date.replace(/-/gi, '_');
    var TableName = 'baccarat_betlog_withwin_' + logDate;
    var Additional = ' ';

    if(RequestInfo.length > 0){
        if(Filter == 0){
            //UserID
            Additional += 'AND UserID=' + RequestInfo;
        }
        else{

        }
    }

    var sqlQuery = 'select * from '+ TableName + ' where TIME(CreateDate) BETWEEN \'' + timefrom + '\' AND \'' + timeto + '\'' + Additional;

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetSummaryBaccaratInfo = function(date, TimeFrom, TimeTo, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'select count(*) AS TotalBetCount,  AVG(Tax) AS AVGTax, SUM(BetGold) AS TotalBetGold, SUM(WinGold) AS TotalWinGold, SUM(WinGoldWithTax) AS TotalWinGoldWithTax, ChannelID from baccarat_betlog_withwin_' + logDate + ' where TIME(CreateDate) BETWEEN \'' + TimeFrom + '\' AND \'' + TimeTo + '\' GROUP BY ChannelID';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetLogUserPlayArray = function(userid, date, timefrom, timeto, callback){
    var logDate = date.replace(/-/gi, '_');

    var sqlQuery = 'SELECT *  FROM outgame_log_' + logDate +' where (UserID = '+ userid[0].UserID;

    for(var i = 1; i < userid.length; i++){
        var AdditionalQuery = " OR UserID = " + userid[i].UserID;
        sqlQuery = sqlQuery + AdditionalQuery;
    }

    sqlQuery = sqlQuery + ') AND TIME(TimeIn) > \'' + timefrom + '\' AND TIME(TimeOut) < \'' + timeto + '\'';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetLoginLogArray = function(userid, date, timefrom, timeto, callback){
    var logDate = date.replace(/-/gi, '_');

    var sqlQuery = 'SELECT *  FROM login_log_' + logDate +' where (UserID = '+ userid[0].UserID;

    for(var i = 1; i < userid.length; i++){
        var AdditionalQuery = " OR UserID = " + userid[i].UserID;
        sqlQuery = sqlQuery + AdditionalQuery;
    }

    sqlQuery = sqlQuery + ') AND TIME(CreateDate) BETWEEN \'' + timefrom + '\' AND \'' + timeto + '\'';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.XocDia_GetBetLogWithWin = function(date, timefrom, timeto, RequestInfo, Filter, callback){
    var logDate = date.replace(/-/gi, '_');
    var TableName = 'xocdia_betlog_withwin_' + logDate;
    var Additional = ' ';

    if(RequestInfo.length > 0){
        if(Filter == 0){
            //UserID
            Additional += 'AND UserID=' + RequestInfo;
        }
        else{

        }
    }

    var sqlQuery = 'select * from '+ TableName + ' where TIME(CreateDate) BETWEEN \'' + timefrom + '\' AND \'' + timeto + '\'' + Additional;

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetSummaryXocDiaInfo = function(date, TimeFrom, TimeTo, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'select count(*) AS TotalBetCount,  AVG(Tax) AS AVGTax, SUM(BetGold) AS TotalBetGold, SUM(WinGold) AS TotalWinGold, SUM(WinGoldWithTax) AS TotalWinGoldWithTax, ChannelID from xocdia_betlog_withwin_' + logDate + ' where TIME(CreateDate) BETWEEN \'' + TimeFrom + '\' AND \'' + TimeTo + '\' GROUP BY ChannelID';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.TLMN_GetStartMatchLog = function(date, timefrom, timeto, callback){
    var logDate = date.replace(/-/gi, '_');
    var TableName = 'tlmn_startmatch_log' + logDate;

    var sqlQuery = 'select * from '+ TableName + ' where TIME(CreateDate) BETWEEN \'' + timefrom + '\' AND \'' + timeto + '\'';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.TLMN_GetEndMatchLog = function(date, timefrom, timeto, callback){
    var logDate = date.replace(/-/gi, '_');
    var TableName = 'tlmn_endmatch_log' + logDate;

    var sqlQuery = 'select * from '+ TableName + ' where TIME(CreateDate) BETWEEN \'' + timefrom + '\' AND \'' + timeto + '\'';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.VQMM_GetBetLogWithWin = function(date, timefrom, timeto, RequestInfo, Filter, callback){
    var logDate = date.replace(/-/gi, '_');
    var TableName = 'vqmm_user_betandwin_log_' + logDate;
    var Additional = ' ';

    if(RequestInfo.length > 0){
        if(Filter == 0){
            //UserID
            Additional += 'AND UserID=' + RequestInfo;
        }
        else{

        }
    }

    var sqlQuery = 'select * from '+ TableName + ' where TIME(CreateDate) BETWEEN \'' + timefrom + '\' AND \'' + timeto + '\'' + Additional;

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetSummaryVQMMInfo = function(date, TimeFrom, TimeTo, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'SELECT COUNT(*) AS TotalSpin, SUM(BetGold) AS TotalBet, SUM(TotalReward) AS TotalWin, SUM(AfterFreeSpin - BeforeFreeSpin) AS TotalFreeSpin, SpinKind, ChannelID FROM vqmm_user_betandwin_log_' + logDate + ' where TIME(CreateDate) BETWEEN \'' + TimeFrom + '\' AND \'' + TimeTo + '\' group by SpinKind, ChannelID';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.TXMini_GetBetLogWithWin = function(date, timefrom, timeto, RequestInfo, Filter, callback){
    var logDate = date.replace(/-/gi, '_');
    var TableName = 'taixiumini_betlog_withwin_' + logDate;
    var Additional = ' ';

    if(RequestInfo.length > 0){
        if(Filter == 0){
            //UserID
            Additional += 'AND UserID=' + RequestInfo;
        }
        else{

        }
    }

    var sqlQuery = 'select * from '+ TableName + ' where TIME(CreateDate) BETWEEN \'' + timefrom + '\' AND \'' + timeto + '\'' + Additional;

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetSummaryTXMiniInfo = function(date, TimeFrom, TimeTo, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'select count(*) AS TotalBetCount, AVG(Tax) AS AVGTax, SUM(BetGold) AS TotalBetGold, SUM(WinGold) AS TotalWinGold, SUM(WinGoldWithTax) AS TotalWinGoldWithTax, ChannelID From taixiumini_betlog_withwin_' + logDate + ' where TIME(CreateDate) BETWEEN \'' + TimeFrom + '\' AND \'' + TimeTo + '\' GROUP BY ChannelID';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetSummaryBingoInfo = function(date, TimeFrom, TimeTo, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'select count(*) AS TotalBetCount, AVG(Tax) AS AVGTax, SUM(BetGold) AS TotalBetGold, SUM(WinGold) AS TotalWinGold, SUM(WinGoldWithTax) AS TotalWinGoldWithTax, ChannelID From bingo_betlog_withwin_' + logDate + ' where TIME(CreateDate) BETWEEN \'' + TimeFrom + '\' AND \'' + TimeTo + '\' GROUP BY ChannelID';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetMoneyTransferSummryByDate = function(date, TimeFrom, TimeTo, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'SELECT SUM(MoneyTransfer) AS SumMoneyTransfer, ReasonID, Description FROM moneytransfer_log_' + logDate +' WHERE ReasonID IN (100, 101) group by ReasonID, Description';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.Tracking_GetNAUDetail = function(date, Filter, callback){
    var logDate = date.replace(/-/gi, '_');
    var tableName = 'login_log_'+logDate;
    var additional = '';
    var count = 0;

    for(var prop in Filter){
        if(additional == ''){
            additional += 'WHERE ';
        }

        if(Filter[prop] == 'Tất cả'){
            continue;
        }
        count++;
        additional += ' tracking.' + prop + '=\'' + Filter[prop] + '\' ';

        if(Filter[prop] != 'Tất cả'){
            additional += 'AND ';
        }
    }

    additional += ' 1';

    var sqlQuery = 'select usr.UserID, loginlog.ChannelID,DATEDIFF(DATE(loginlog.CreateDate),DATE (usr.CreateDate )) as Dif from (select UserID,CreateDate,ChannelID from '+ tableName+' GROUP BY UserID ) as' +
        ' loginlog LEFT JOIN (SELECT usr.UserID, usr.GameName, usr.AccountID, usr.CreateDate as CreateDate FROM ' + dbmain + '.usertracking as tracking LEFT JOIN ' + dbmain + '.user as usr on usr.AccountID = tracking.AccountID ' + additional + ') as' +
        ' usr on loginlog.UserID = usr.UserID WHERE usr.UserID IS NOT NULL Order By Dif DESC';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.Tracking_GetDAU = function(date, Filter, callback){
    var logDate = date.replace(/-/gi, '_');
    var tableName = 'login_log_'+logDate;
    var additional = '';
    var count = 0;

    for(var prop in Filter){
        if(additional == ''){
            additional += 'WHERE ';
        }

        if(Filter[prop] == 'Tất cả'){
            continue;
        }
        count++;
        additional += ' tracking.' + prop + '=\'' + Filter[prop] + '\' ';

        if(Filter[prop] != 'Tất cả'){
            additional += 'AND ';
        }
    }

    additional += ' 1';

    var sqlQuery = 'select COUNT(*) AS DAU from (select UserID,CreateDate,ChannelID from '+ tableName+' GROUP BY UserID ) as' +
        ' loginlog LEFT JOIN (SELECT usr.UserID, usr.GameName, usr.AccountID, usr.CreateDate as CreateDate FROM ' + dbmain + '.usertracking as' +
        ' tracking LEFT JOIN ' + dbmain + '.user as usr on usr.AccountID = tracking.AccountID ' + additional + ') as' +
        ' usr on loginlog.UserID = usr.UserID WHERE usr.UserID IS NOT NULL';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    });
};

exports.GetTopDoi = function(date, Top, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'SELECT UserID, SUM(MoneyTransfer) AS SumMoney FROM moneytransfer_log_' + logDate + ' where ReasonID IN (101) AND Description IN (\'Rewards\') GROUP BY UserID ORDER BY SUM(MoneyTransfer) LIMIT ' + Top;

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetTopNap = function(date, Top, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'SELECT UserID, SUM(MoneyTransfer) AS SumMoney FROM moneytransfer_log_' + logDate + ' where ReasonID IN (100) AND Description IN (\'Charge Card\') GROUP BY UserID ORDER BY SUM(MoneyTransfer) DESC LIMIT ' + Top;

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetSummaryMiniPokerInfo = function(date, TimeFrom, TimeTo, callback){
    var logDate = date.replace(/-/gi, '_');
    var sqlQuery = 'SELECT COUNT(*) AS TotalBetCount, SUM(BetGold) AS TotalBet, SUM(TotalReward) AS TotalWin, ChannelID FROM minipoker_user_betandwin_log_' + logDate + ' where TIME(CreateDate) BETWEEN \'' + TimeFrom + '\' AND \'' + TimeTo + '\' group by ChannelID';

    queryRaw(sqlQuery, function(e, r){
        callback(e, r);
    })
};

exports.GetTotalSystemGoldInGame = function (callback) {
    var logDate = Utility.GenSuffixDateSql();

    var sqlQuery = 'select IF(SUM(MoneyTransfer) is null,0,SUM(MoneyTransfer)) AS TotalSystemGold from moneytransfer_log' + logDate +' where id in ( select MAX(ID) as ID from moneytransfer_log' + logDate + ' where UserID not in (SELECt UserID from ' + dbmain+'.wallet where money > 0 ) group by userid ) and ReasonID = 102';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};
