var mysql = require('mysql');
var Utility = require('../../../SharedModule/Utility');
var Logger = console;
var pool;
var isConnected = false;
var dblog = 0;
exports.Init = function (config, logger, _dblog) {
    pool = mysql.createPool(config);
    dblog = _dblog;
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
    callSp('wallet_UpdateMoneySafe', UserID, MoneyUpdate, ReasonID, Des, UserChannelID, UserProviderID, UserPlatformID, 0, 0, 0, 0, function (e, r, f) {
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
    callSp('wallet_getAll', UserID, function (e, r, f) {
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

//GMTool
exports.testFunc = function (callback) {
    var sqlQuery = 'SELECT t.* FROM ' + dblog + '.dailyaward_log_2018_06_01 t';
    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.GetNAU = function (date, callback) {
    //year_month_day
    var dbDate = date;
    var logDate = date.replace(/-/gi, '_');

    var sqlQuery = 'SELECT COUNT(*) as NAU from user as u where DATE(u.CreateDate) = \'' + dbDate + '\';';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    });
};

exports.GetTopGold = function (Top, callback) {
    var sqlQuery = 'SELECT UserID, Money, UpdateTime from wallet where datediff(now(),UPDATEtime) < 30 order by Money DESC LIMIT ' + Top;

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    });
};

exports.GetGameNameByUserID = function (UserID, callback) {
    var sqlQuery = 'SELECT UserID, AccountID, GameName from user where UserID = ' + UserID;

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r[0] || {
                GameName: "",
                UserID: 0,
                AccountID: ""
            });
    });
};

exports.GetTotalSystemGold = function (callback) {
    var sqlQuery = 'select SUM(Money) AS TotalSystemGold from wallet where datediff(now(),UPDATEtime) < 30';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.GetGlobalBossList = function (callback) {
    var sqlQuery = 'select BossID, KindID, FishKind, MaxHp, RoundTime, RoundCount, Delay, BossCount, TotalGoldHit, GoldHitMultiple, GoldHitRatio, LastHitGold, DayStart, DayEnd, TimeStart, TimeEnd from globalboss';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.GetGlobalBossName = function (limit, callback) {
    var sqlQuery = 'select FishKind, FishName FROM  fishconfig where FishKind >= ' + limit;

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.UpdateGlobalBoss = function (GlobalBoss, callback) {
    //BossID, KindID, FishKind, MaxHp, RoundTime, RoundCount, Delay, BossCount, TotalGoldHit, GoldHitMultiple, GoldHitRatio, LastHitGold, DayStart, DayEnd, TimeStart, TimeEnd
    var sqlQuery = 'UPDATE globalboss set ' +
        'KindID=' + GlobalBoss.KindID + ',' +
        'FishKind=' + GlobalBoss.FishKind + ',' +
        'MaxHp=' + GlobalBoss.MaxHp + ',' +
        'RoundTime=' + GlobalBoss.RoundTime + ',' +
        'RoundCount=' + GlobalBoss.RoundCount + ',' +
        'Delay=' + GlobalBoss.Delay + ',' +
        'BossCount=' + GlobalBoss.BossCount + ',' +
        'TotalGoldHit=' + GlobalBoss.TotalGoldHit + ',' +
        'GoldHitMultiple=' + GlobalBoss.GoldHitMultiple + ',' +
        'GoldHitRatio=' + GlobalBoss.GoldHitRatio + ',' +
        'LastHitGold=' + GlobalBoss.LastHitGold + ',' +
        'DayStart=\'' + GlobalBoss.DayStart + '\',' +
        'DayEnd=\'' + GlobalBoss.DayEnd + '\',' +
        'TimeStart=' + GlobalBoss.TimeStart + ',' +
        'TimeEnd=' + GlobalBoss.TimeEnd +
        ' WHERE BossID=' + GlobalBoss.BossID;

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.GetBossID = function (callback) {
    var sqlQuery = 'select BossID from globalboss order by BossID DESC LIMIT 1';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.AddGlobalBoss = function (GlobalBoss, callback) {
    //BossID, KindID, FishKind, MaxHp, RoundTime, RoundCount, Delay, BossCount, TotalGoldHit, GoldHitMultiple, GoldHitRatio, LastHitGold, DayStart, DayEnd, TimeStart, TimeEnd
    var sqlQuery = 'insert into globalboss (KindID, FishKind, MaxHp, RoundTime, RoundCount, Delay, BossCount, TotalGoldHit, GoldHitMultiple, GoldHitRatio, LastHitGold, DayStart, DayEnd, TimeStart, TimeEnd) values (' +
        GlobalBoss.KindID + ',' +
        GlobalBoss.FishKind + ',' +
        GlobalBoss.MaxHp + ',' +
        GlobalBoss.RoundTime + ',' +
        GlobalBoss.RoundCount + ',' +
        GlobalBoss.Delay + ',' +
        GlobalBoss.BossCount + ',' +
        GlobalBoss.TotalGoldHit + ',' +
        GlobalBoss.GoldHitMultiple + ',' +
        GlobalBoss.GoldHitRatio + ',' +
        GlobalBoss.LastHitGold + ',' +
        '\'' + GlobalBoss.DayStart + '\',' +
        '\'' + GlobalBoss.DayEnd + '\',' +
        GlobalBoss.TimeStart + ',' +
        GlobalBoss.TimeEnd + ')';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.DeleteGlobalBoss = function (BossID, callback) {
    var sqlQuery = 'delete from globalboss where BossID =' + BossID;
    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.GetUserIDByNick = function (NickArr, callback) {
    //need to check if NickArr is not empty first
    var sqlQuery = 'Select UserID, GameName AS Nick FROM user WHERE GameName =\'' + NickArr[0] + '\'';

    for (var i = 1; i < NickArr.length; i++) {
        var additionalQuery = ' OR GameName=\'' + NickArr[i] + '\'';
        sqlQuery = sqlQuery + additionalQuery;
    }

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.GetNickByUserID = function (UserIDArr, callback) {
    //need to check if NickArr is not empty first
    var sqlQuery = 'Select UserID, GameName AS Nick FROM user WHERE UserID =\'' + UserIDArr[0] + '\'';

    for (var i = 1; i < UserIDArr.length; i++) {
        var additionalQuery = ' OR UserID=\'' + UserIDArr[i] + '\'';
        sqlQuery = sqlQuery + additionalQuery;
    }
    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.GetGameNameConfig = function (callback) {
    var sqlQuery = 'SELECT GameName, GameID FROM gamename';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    });
};

exports.GetBroadcast = function (callback) {
    var sqlQuery = 'SELECT * FROM broadcast LIMIT 100';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.UpdateBroadcast = function (Broadcast, callback) {
    var sqlQuery = 'update broadcast set ' +
        'Text=\'' + Broadcast.Text + '\',' +
        'Url=\'' + Broadcast.URL + '\',' +
        'LangCode=' + Broadcast.LangCode + ',' +
        'Priority=' + Broadcast.Priority + ',' +
        'GameID=' + Broadcast.GameID + ',' +
        '`Interval`=' + Broadcast.Interval + ',' +
        'StartTime=\'' + Broadcast.StartTime + '\',' +
        'EndTime=\'' + Broadcast.EndTime + '\' ' +
        'WHERE ID =' + Broadcast.ID;

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.DeleteBroadcast = function (ID, callback) {
    var sqlQuery = 'delete from broadcast where ID=' + ID;
    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.AddBroadcast = function (Broadcast, callback) {
    var sqlQuery = 'insert into broadcast (Text, Url, LangCode, Priority, GameID, `Interval`, StartTime, EndTime) values (' +
        '\'' + Broadcast.Text + '\',' +
        '\'' + Broadcast.URL + '\',' +
        Broadcast.LangCode + ',' +
        Broadcast.Priority + ',' +
        Broadcast.GameID + ',' +
        Broadcast.Interval + ',' +
        '\'' + Broadcast.StartTime + '\',' +
        '\'' + Broadcast.EndTime + '\')';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.GetEventList = function (callback) {
    var sqlQuery = 'SELECT * FROM eventconfig ORDER BY IsMaster';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.UpdateEvent = function (Data, callback) {
    var sqlQuery = 'UPDATE eventconfig SET'
        + ' StartTime=\'' + Data.StartTime + '\','
        + ' EndTime=\'' + Data.EndTime + '\','
        + ' StartDisplayTime=\'' + Data.StartDisplayTime + '\','
        + ' EndDisplayTime=\'' + Data.EndDisplayTime + '\','
        + ' Config=\'' + Data.Config + '\','
        + ' EventName=\'' + Data.EventName + '\''
        + ' WHERE EventCode=\'' + Data.EventCode + '\'';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.GetEventDataKey = function (EventCode, callback) {
    var sqlQuery = 'SELECT DataKey from eventconfig where EventCode=\'' + EventCode + '\'';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.GetNameByRange = function (ListUserID, callback) {
    var sqlQuery = 'SELECT UserID,GameName, AccountID FROM user' +
        ' WHERE UserID in(' + ListUserID.join(',') + ' ) ';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.GetUserList = function (UserID, Nick, callback) {
    var sqlQuery;
    if (UserID == 0 || UserID != +UserID) {
        sqlQuery = 'select * FROM user where GameName LIKE \'%' + Nick + '%\' LIMIT 100';
    } else {
        sqlQuery = 'select * FROM user where UserID = ' + UserID + ' LIMIT 100';
    }

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.GetMoneyForUser = function (UserArr, callback) {
    var sqlQuery = 'select * FROM wallet where UserID in (' + UserArr[0].UserID;
    var AddtionalText = '';

    for (var i = 1; i < UserArr.length; i++) {
        AddtionalText += ',' + UserArr[i].UserID;
    }
    ;

    sqlQuery += AddtionalText;
    sqlQuery += ')';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.GetUserCharge = function (UserID, callback) {
    var sqlQuery = 'select * FROM usercharge where UserID=' + UserID;

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.GetUserWin = function (UserID, callback) {
    var sqlQuery = 'select UserID, SUM(Money) AS SumMoney, GameID from userwin where userid =' + UserID + ' group by GameID';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.GetUserOnline = function (UserID, callback) {
    var sqlQuery = 'select * from useronline where userid =' + UserID;

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.GetGameNameByUserIDArray = function (UserIDArray, callback) {
    var sqlQuery = 'select * from user where userid in (' + UserIDArray[0];
    var additionalText = '';

    for (var i = 1; i < UserIDArray.length; i++) {
        additionalText += ',' + UserIDArray[i];
    }

    additionalText += ')';

    sqlQuery += additionalText;

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    });
};

exports.GetAccountInfo = function (AccountID, callback) {
    var sqlQuery = 'select * from admin where AccountID = \'' + AccountID + '\'';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.GetAdminList = function (AcocuntID, callback) {
    var sqlQuery = 'select * from admin where AccountID LIKE \'%' + AcocuntID + '%\'';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.UpdateAdminInfo = function (AccountID, RoleConfig, callback) {
    var sqlQuery = 'update admin set RoleConfig = \'' + RoleConfig + '\' where AccountID =\'' + AccountID + '\'';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.CreateAdminAccount = function (AccountID, RoleConfig) {
    var sqlQuery = 'insert admin (AccountID, RoleConfig) VALUE (\'' + AccountID + '\', \'' + RoleConfig + '\')';

    queryRaw(sqlQuery, function (e, r) {
        //callback(e, r);
    })
};

exports.getCCUDetail = function (callback) {
    var sqlQuery = 'SELECT COUNT(*) AS CCU, GameID from useronline group by GameID';
    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);// trả kết quả
    });
};

exports.GetChannelName = function (callback) {
    var sqlQuery = 'SELECT * FROM channelname';
    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);// trả kết quả
    });
};

exports.Tracking_GetNAU = function (date, Filter, callback) {
    //year_month_day
    var logDate = date.replace(/-/gi, '_');
    var additional = '';
    var count = 0;

    for (var prop in Filter) {
        if (additional == '') {
            additional += 'AND ';
        }

        if (Filter[prop] == 'Tất cả') {
            continue;
        }
        count++;
        additional += prop + '=\'' + Filter[prop] + '\' ';

        if (Filter[prop] != 'Tất cả') {
            additional += 'AND ';
        }
    }

    additional += ' 1';

    var sqlQuery = 'SELECT COUNT(*) as NAU from usertracking as u where DATE(u.UpdateTime) = \'' + logDate + '\' ' + additional;

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    });
};

exports.Tracking_GetUTMConfig = function (callback) {

    var sqlQuery = 'SELECT utm_source AS Source, utm_medium AS Medium, utm_content AS Content, utm_campaign AS Campaign FROM usertracking GROUP by utm_source, utm_medium, utm_content, utm_campaign';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.Tracking_GetTotalReCharge = function (datefrom, dateto, Filter, callback) {
    var additional = '';
    var count = 0;

    for (var prop in Filter) {
        if (additional == '') {
            additional += 'AND ';
        }

        if (Filter[prop] == 'Tất cả') {
            continue;
        }
        count++;
        additional += prop + '=\'' + Filter[prop] + '\' ';

        if (Filter[prop] != 'Tất cả') {
            additional += 'AND ';
        }
    }

    additional += ' 1';

    var sqlQuery = 'SELECT usr.UserID,' +
        ' usr.AccountID,' +
        ' usr.TotalReCharge,' +
        ' tracking.UpdateTime,' +
        ' tracking.utm_source as Source, ' +
        ' tracking.utm_medium as Medium, ' +
        ' tracking.utm_content as Content, ' +
        ' tracking.utm_campaign as Campaign ' +
        ' from usertracking as tracking LEFT JOIN user as' +
        ' usr ON tracking.AccountID = usr.AccountID' +
        ' WHERE DATE(tracking.UpdateTime) BETWEEN \'' + datefrom + '\' AND \'' + dateto + '\'' +
        additional +
        ' ORDER BY usr.TotalRecharge DESC';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.GetArticleList = function (callback) {
    var sqlQuery = 'select * from article';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};


exports.UpdateArticle = function (Data, callback) {
    var tableName = 'article';
    var sqlQuery = 'UPDATE  ' + tableName +
        ' SET ' +
        ' EventCode = \'' + Data.EventCode + '\'' +
        ' ,EventName = \'' + Data.EventName + '\'' +
        ' ,TimeStart = ' + pool.escape(new Date(Data.TimeStart)) +
        ' ,TimeEnd = ' + pool.escape(new Date(Data.TimeEnd)) +
        ' ,TitleImg = \'' + Data.TitleImg + '\'' +
            ' ,RedirectURL = \'' + Data.RedirectURL + '\'' +
        ' ,Data = ' + pool.escape(Data.Data) +
        ' WHERE EventID = ' + Data.EventID + '';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.AddArticle = function (Data, callback) {
    var sqlQuery = 'insert into article (EventCode, EventName, TimeStart, TimeEnd, TitleImg, RedirectURL, EventType, Data) values (' +
        '\'' + Data.EventCode + '\',' +
        '\'' + Data.EventName + '\',' +
        pool.escape(new Date(Data.TimeStart)) + ',' +
        pool.escape(new Date(Data.TimeEnd)) + ',' +
        '\'' +Data.TitleImg + '\',' +
        '\'' +Data.RedirectURL + '\',' +
        '\'' + Data.EventType + '\',' +
        '\'' + Data.Data + '\')';

    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};

exports.DeleteArticle = function(Data, callback){
    var sqlQuery = 'delete from article where EventID =' + Data.EventID;
    queryRaw(sqlQuery, function (e, r) {
        callback(e, r);
    })
};