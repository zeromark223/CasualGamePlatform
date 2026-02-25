/**
 * Created by ngocnpt on 09/05/2016.
 */
var MasterID = 0;
var redis = require("redis"),
    client = 0;
var Config;
var loggerRedis = 0;
var scriptList = [];
var Utility = require('../../../SharedModule/Utility');
var fs = require('fs');
var isConnected = false;
exports.Init = function (masterID, cfg, LoggerRedis) {
    MasterID = masterID;
    Config = cfg;
    loggerRedis = LoggerRedis;

    client = redis.createClient({
        host: Config.Host,
        port: Config.Port,
        password: Config.Password,
        db: Config.DB
    });

    client.on("connect", function () {
        initRedisLuaScript();
        isConnected = true;
        loggerRedis.debug("Redis is ready");
    });

    client.on('error', function (e) {
        loggerRedis.error("Redis error " + e);
    });
    client.on('disconnect', function (e) {
        loggerRedis.error("Redis disconnect");
    });
};


exports.getStatus = function () {
    return isConnected;
};

function loadScriptCheckDailyAward() {
    var script = fs.readFileSync(require.resolve('./script/checkAwardLogin.lua'));
    client.send_command('script', ['load', script], function (err, sha) {
        if (!err) {
            scriptList['checkAwardLogin'] = sha;
        } else {
            loggerRedis.error("loadScriptHitGlobalBoss error ", err);
        }
    }.bind(this));
}

function initRedisLuaScript() {
    loadScriptCheckDailyAward();
}

function execLuaScript() {
    var callback = function () {
    };
    try {
        var param = [];
        for (var i = 0; i < arguments.length; i++) {
            if (typeof arguments[i] == 'function') {
                callback = arguments[i];
                continue;
            }
            param.push(arguments[i]);
        }
        if (Utility.CheckVariable(scriptList[param[0]])) {//Check Param đầu tiên xem có hash ko.
            var args = [scriptList[param[0]], param.length - 1].concat(param.slice(1, param.length));
            client.send_command('evalsha', args, function (err, res) {
                if (!err && res) {
                    callback(0, res);//0: thất bại, 1: thành công - param2: giá trị tăng/giảm trả về
                } else {
                    loggerRedis.error("execLuaScript callback data  ", err, res);
                    callback(1, err);
                }
            });
        } else {
            loggerRedis.error("execLuaScript Check Param  ", scriptList, param);
            callback(1, param[0]);
        }
    } catch (e) {
        loggerRedis.error("execLuaScript Try ", e.stack);

    }
}

exports.ReloadExpiredTime = function () {
    client.get(Config.Define.UserBeginPlaying + "Config", function (e, d) {
        if (!e) {
            if (d) {
                try {
                    if (d > 0 && d < 99) {//Case have Config
                        Config.ExpireTime = d;
                    }
                } catch (e) {
                }

            } else {//Case not exists
                client.set(Config.Define.UserBeginPlaying + "Config", 15, function (e, d) {
                });
            }
        }
    });


};

exports.SetUserIsBeginPlaying = function (UserID, callback) {
    if (typeof Config.ExpireTime == 'undefined') Config.ExpireTime = 15;
    client.set(Config.Define.UserBeginPlaying + UserID, 1, function (e, d) {
        if (!e) {
            client.expire(Config.Define.UserBeginPlaying + UserID, Config.ExpireTime, callback);
        } else {
            callback(e, d);
        }
    });
    //////////////////////////////


};

exports.GetUserIsBeginPlaying = function (UserID, callback) {
    client.get(Config.Define.UserBeginPlaying + UserID, function (e, d) {
        if (!e) {
            if (d) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });

};

exports.CheckAndLockUser = function (UserID, callback) {
    callback(true);
    //Nếu Chặn Login 1 nick tại 1 thời điểm thì bật cờ này lên
    //Cần thêm cơ chế expire.
    //client.setnx(Config.Define.UserCheckAndLock+UserID,1,function(e,d){
    //        if(!e){
    //            if(d){
    //                callback(true);
    //            }else{
    //                callback(false);
    //            }
    //        }else{
    //            callback(false);
    //        }
    //});
};

exports.ClearCheckAndLockUser = function (UserID) {
    client.del(Config.Define.UserCheckAndLock + UserID, function (e, d) {
    });
};

exports.InsertToUserOnlineList = function (UserID, MasterID) {
    client.hset(Config.Define.UserOnlineList, UserID, MasterID, function (e, d) {
    });
};

exports.RemoveToUserOnlineList = function (UserID) {
    client.hdel(Config.Define.UserOnlineList, UserID, function (e, d) {
    });
};

exports.GetUserOnlineList = function (callback) {
    client.hgetall(Config.Define.UserOnlineList, callback);
};

exports.InsertToUserBeginGetReward = function (UserID, callback) {
    client.setnx(Config.Define.UserBeginGetReward + UserID, 1, function (e, d) {
        if (!e) {
            if (d) {
                client.expire(Config.Define.UserBeginGetReward + UserID, 2);
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

exports.GetRecordMoneyHistory = function (UserID, callback) {
    client.zrange(Config.Define.MoneyHistoryPlayer + UserID, 0, 100, callback);
};


exports.CheckAwardLogin = function (accountId, callback) {
    try {
        execLuaScript('checkAwardLogin', accountId, callback);
    }
    catch (e) {
        callback(0);
        loggerRedis.error('RedisAdapter - CalcAwardMoney - try err: ' + e.stack);
    }
};

exports.hgetall = function (key, callback) {
    client.hgetall(key, function (e, d) {
        callback(e, d);
    });
};

exports.zlistGetRevRangeWithScore = function (zkey, start, end, callback) {
    client.zrevrange(zkey, start, end, 'withscores', function (e, d) {
        if (!e) {
            callback(d);
        }
    });
};

exports.zlistGetRevRank = function (zkey, userid, callback) {
    client.zrevrank(zkey, userid, function (e, d) {
        if (!e) {
            var rank = d;
            if (rank != null) {
                client.zscore(zkey, userid, function (ee, dd) {
                    if (!ee) {
                        callback(rank, dd);
                    } else {
                        callback(-1, 0);
                    }

                });
            } else {
                callback(-1, 0);
            }
        } else {
            callback(-1, 0);
        }
    });
};

exports.get = function (key, callback) {
    try {
        client.get(key, callback);
    }
    catch (e) {
        loggerRedis.error('RedisAdapter - get - try err: ', key, e.stack);
    }
};

exports.set = function (key, val) {
    try {
        client.set(key, val)
    }
    catch (e) {
        loggerRedis.error('RedisAdapter - set - try err: ', key, val, e.stack);
    }
};


exports.getMaxValOfAllKeys = function (keys, callback) {
    try {
        client.keys(keys, function (e, d) {
            if (!e && d) {
                try {
                    var batch = client.batch();
                    for (var i = 0; i < d.length; i++) {
                        batch.get(d[i]);
                    }
                    batch.exec(function (e2, d2) {
                        if (!e2 && d2) {
                            try {
                                var max = 0;
                                var val = 0;
                                for (var i = 0; i < d2.length; i++) {
                                    val = +d2[i] || 0;
                                    if (val > max) {
                                        max = val;
                                    }
                                }
                                callback(max);
                            } catch (e) {
                                loggerRedis.error('RedisAdapter - getAllKeyVal - try err 3 : ', keys, e.stack);
                            }

                        } else {
                            callback(0);
                        }
                    });
                } catch (e) {
                    loggerRedis.error('RedisAdapter - getAllKeyVal - try err 2 : ', keys, e.stack);
                    callback(0);
                }

            } else {
                callback(0);
            }
        });
    }
    catch (e) {
        loggerRedis.error('RedisAdapter - getAllKeyVal - try err: ', keys, e.stack);
    }
};

exports.hset = function (key, field, value) {
    try {
        client.hset(key, field, value);
    }
    catch (e) {
        loggerRedis.error('RedisAdapter - hset - try err: ', key, e.stack);
    }
};

exports.hget = function (key, field, callback) {
    try {
        if (typeof  callback != 'function') callback = function () {
        };
        client.hget(key, field, callback);
    }
    catch (e) {
        loggerRedis.error('RedisAdapter - hget - try err: ', key, e.stack);
    }
};


exports.hIncrby = function (key, hash, val) {
    try {
        client.hincrby(key, hash, val);
    }
    catch (e) {
        loggerRedis.error('RedisAdapter - hIncrby - try err: ', key, hash, val, e.stack);
    }
};
