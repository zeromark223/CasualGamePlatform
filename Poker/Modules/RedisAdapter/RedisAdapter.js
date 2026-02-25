/**
 * Created by ngocnpt on 09/05/2016.
 */
var MasterID = 0;
var redis = require("redis"),
    client = 0;
var Config;
var Utility = require('../../../SharedModule/Utility');
var fs = require('fs');
var loggerRedis = console;
var scriptList = [];
var shaIncrbyLua = 0;
var isConnected = false;

//lấy giá trị mặc định của stock lên
function LoadStockConfigDefault(IP, port, callback) {
    var stockConfigDefault = {
        Stock: 5000000,
        IP: IP,
        Port: port
    };
    try {
        var key = Config.Define.StockConfigDefault;
        var name = 'default';
        client.hget(key, name, function (e, d) {
            if (!e) {
                if (Utility.CheckVariable(d)) {
                    stockConfigDefault = JSON.parse(d);
                } else {//gán giá trị mặc định cho stock
                    client.hset(key, name, JSON.stringify(stockConfigDefault), function () {
                    });
                }
            }
        });
    } catch (e) {
        loggerRedis.error('RedisAdapter - loadStockConfigDefault try err: ' + e);
    }

    callback(stockConfigDefault);
}

//lấy giá trị mặc định của stock lên
function LoadStockRatioConfigDefault(gameKind, callback) {
    var stockRatioConfigDefault = {
        StockMin: 1000000, // 1 tr
        StockMax: 15000000, // 15 tr
        StockRatio: [
            {Stock: 0, Ratio: 0.9},
            {Stock: 7000000, Ratio: 0.20},
            {Stock: 8000000, Ratio: 0.97},
            {Stock: 9000000, Ratio: 0.98},
            {Stock: 10000000, Ratio: 0.99},
            {Stock: 11000000, Ratio: 1.00},
            {Stock: 12000000, Ratio: 1.01},
            {Stock: 14000000, Ratio: 1.02}
        ]
    };
    if (gameKind == 3 || gameKind == 13) {
        stockRatioConfigDefault = {
            StockMin: 5000000, // 5 tr
            StockMax: 75000000, // 75 tr
            StockRatio: [
                {Stock: 0, Ratio: 0.9},
                {Stock: 35000000, Ratio: 0.20},
                {Stock: 40000000, Ratio: 0.96},
                {Stock: 45000000, Ratio: 0.97},
                {Stock: 50000000, Ratio: 0.98},
                {Stock: 55000000, Ratio: 0.99},
                {Stock: 60000000, Ratio: 1.00},
                {Stock: 70000000, Ratio: 1.01}
            ]
        }
    }

    try {
        var key = Config.Define.StockRatioConfigDefault;
        var name = gameKind;
        client.hget(key, name, function (e, d) {
            if (!e) {
                if (Utility.CheckVariable(d)) {
                    stockRatioConfigDefault = JSON.parse(d);
                } else {//gán giá trị mặc định cho stock
                    client.hset(key, name, JSON.stringify(stockRatioConfigDefault), function () {
                    });
                }
            }
        });
    } catch (e) {
        loggerRedis.error('RedisAdapter - loadStockRatioConfigDefault try err: ' + e);
    }

    callback(stockRatioConfigDefault);
}

function loadScriptIncrbyLua() {
    var script = fs.readFileSync(require.resolve('./script/hincryby.lua'));

    client.send_command('script', ['load', script], function (err, sha) {
        if (!err) {
            scriptList['hincryby'] = sha;
        } else {
            loggerRedis.error("loadScriptIncrbyLua error ", err);
        }
    }.bind(this));
}

function loadScriptHitGlobalBoss() {
    var script = fs.readFileSync(require.resolve('./script/hitGlobalBoss.lua'));
    client.send_command('script', ['load', script], function (err, sha) {
        if (!err) {
            scriptList['HitGlobalBoss'] = sha;
        } else {
            loggerRedis.error("loadScriptHitGlobalBoss error ", err);
        }
    }.bind(this));
}

function initRedisLuaScript() {
    loadScriptIncrbyLua();
    loadScriptHitGlobalBoss();
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
        loggerRedis.debug("Redis is ready");
        isConnected = true;
    });

    client.on('error', function (e) {
        loggerRedis.error("Redis error", e);
    });
    client.on('disconnect', function (e) {
        loggerRedis.error("Redis disconnect");
    });
};

exports.getStatus = function () {
    return isConnected;
};

exports.LogRedisMiniBoss = function (infoBoss, RoomID) {
    try {
        var now = new Date();

        var day = Utility.AddZero(now.getDate());
        var month = Utility.AddZero(now.getMonth() + 1);
        var year = now.getFullYear();
        var hour = now.getHours();
        var min = now.getMinutes();
        var sec = now.getSeconds();

        var path = 'lb' + ':' + year + ':' + month + ':' + day + ':' + RoomID;
        var key = hour + ':' + min + ':' + sec;
        client.hset(path, key, infoBoss, function (e, d) {
            //console.log('e: ' + e);
            //console.log('d: ' + d);
        });
    } catch (e) {
        loggerRedis.error('RedisAdapter - LogRedisMiniBoss - try err: ' + e);
    }
    loggerRedis.debug('RedisAdapter - LogRedisMiniBoss done');
};

exports.LogRedisUserInRoomDetail = function (infoUser, UserID) {
    try {
        var now = new Date();

        var day = Utility.AddZero(now.getDate());
        var month = Utility.AddZero(now.getMonth() + 1);
        var year = now.getFullYear();
        var hour = now.getHours();
        var min = now.getMinutes();
        var sec = now.getSeconds();

        var path = 'lg' + ':' + year + ':' + month + ':' + day + ':' + UserID;
        var key = hour + ':' + min + ':' + sec;
        client.hset(path, key, infoUser, function () {
        });
    } catch (e) {
        loggerRedis.error('RedisAdapter - LogRedisUserInRoomDetail try err: ' + e);
    }
};

exports.GetStockDetail = function (callback) {//isSuccess,Data
    client.hgetall(Config.Define.StockDetail, function (e, d) {
        try {
            if (!e) {
                if (!d || !d.MinStock || !d.MaxStock || !d.Stock || !d.NeedReload) {
                    callback(true, d)
                } else {
                    callback(false, d);
                }

            } else {
                callback(false, e);
            }
        } catch (ex) {
            callback(false, ex);

            loggerRedis.error('RedisAdapter - GetStockDetail - try err: ' + e);
        }
    });
};

exports.RecordDetail = function (infoServer) {
    try {
        var now = new Date();

        var day = Utility.AddZero(now.getDate());
        var month = Utility.AddZero(now.getMonth() + 1);
        var year = now.getFullYear();
        var hour = now.getHours();
        var min = now.getMinutes();
        var sec = now.getSeconds();

        var path = Config.Define.RecordDetail + ':' + year + ':' + month + ':' + day + ':' + MasterID;
        var key = hour + ':' + min + ':' + sec;
        client.hset(path, key, infoServer, function () {
        });
    } catch (e) {
        loggerRedis.error('RedisAdapter - RecordDetail try err: ' + e);
    }
};

//lấy cấu hình stock
exports.GetStockConfig = function (gameID, IP, port, callback) {
    try {
        var key = Config.Define.StockConfig;
        var name = gameID;
        client.hget(key, name, function (e, d) {
            if (!e) {
                if (Utility.CheckVariable(d)) {
                    callback(false, JSON.parse(d));
                } else {//lấy giá trị stock mặc định
                    LoadStockConfigDefault(IP, port, function (data) {
                        try {
                            //set giá trị stock theo roomID
                            data.UpdateTime = new Date();
                            client.hset(key, name, JSON.stringify(data), function () {
                            });

                            //trả giá trị về cho client
                            callback(false, data);
                        } catch (e) {
                            loggerRedis.error('RedisAdapter - GetStockConfig - LoadStockConfigDefault try err: ' + e);
                        }
                    });
                }
            } else
                callback(true, null);
        });
    } catch (e) {
        loggerRedis.error('RedisAdapter - GetStockConfig try err: ' + e);
    }
};

exports.SetStockConfig = function (gameID, IP, port, stock) {
    try {
        var key = Config.Define.StockConfig;
        client.hset(key, gameID, JSON.stringify({
            Stock: stock,
            IP: IP,
            Port: port,
            UpdateTime: new Date()
        }), function () {
        });
    } catch (e) {
        loggerRedis.error('RedisAdapter - GetStockConfig try err: ' + e);
    }
};

//lấy cấu hình stock ratio
exports.GetStockRatioConfig = function (gameKind, callback) {
    try {
        var key = Config.Define.StockRatioConfig;
        var name = gameKind;
        client.hget(key, name, function (e, d) {
            if (!e) {
                if (Utility.CheckVariable(d)) {
                    callback(false, JSON.parse(d));
                } else {//lấy giá trị stock mặc định
                    LoadStockRatioConfigDefault(gameKind, function (data) {
                        try {
                            //set giá trị stock theo roomID
                            client.hset(key, name, JSON.stringify(data), function () {
                            });
                            //trả giá trị về cho client
                            callback(false, data);
                        } catch (e) {
                            loggerRedis.error('RedisAdapter - GetStockRatioConfig - LoadStockRatioConfigDefault try err: ' + e);
                        }
                    });
                }
            } else
                callback(true, null);
        });
    } catch (e) {
        loggerRedis.error('RedisAdapter - GetStockRatioConfig try err: ' + e);
    }
};

exports.LogRedisBoss = function (info, UserID) {
    try {
        var now = new Date();

        var day = Utility.AddZero(now.getDate());
        var month = Utility.AddZero(now.getMonth() + 1);
        var year = now.getFullYear();
        var hour = now.getHours();
        var min = now.getMinutes();
        var sec = now.getSeconds();

        var path = 'stb' + ':' + year + ':' + month + ':' + day + ':' + UserID;
        var key = hour + ':' + min + ':' + sec;
        client.hset(path, key, info, function (e, d) {
            //console.log('e: ' + e);
            //console.log('d: ' + d);
        });
    } catch (e) {
        loggerRedis.error('RedisAdapter - LogRedisBoss - try err: ' + e);
    }
    loggerRedis.debug('RedisAdapter - LogRedisBoss done');
};

exports.LogRedisFish = function (info, UserID, GameServerID) {
    try {
        var now = new Date();

        var day = Utility.AddZero(now.getDate());
        var month = Utility.AddZero(now.getMonth() + 1);
        var year = now.getFullYear();
        var hour = now.getHours();
        var min = now.getMinutes();
        var sec = now.getSeconds();

        var path = 'lbc' + ':' + year + ':' + month + ':' + day + ':' + UserID;
        var key = hour + ':' + min + ':' + sec + ':';
        client.hset(path, key, info, function (e, d) {
            //console.log('e: ' + e);
            //console.log('d: ' + d);
        });
    } catch (e) {
        loggerRedis.error('RedisAdapter - LogRedisBoss - try err: ' + e);
    }
    loggerRedis.debug('RedisAdapter - LogRedisBoss done');
};

exports.GetUserLoginGameKey = function (userID, callback) {
    try {
        client.hget(Config.Define.UserLoginGameKey, userID, function (e, d) {
            if (!e) {
                client.hdel(Config.Define.UserLoginGameKey, userID, function (e, d) {
                    if (!e)
                        callback(true, d);
                    else
                        callback(false, '');
                });

            } else {
                callback(false, '');
            }

        });
    } catch (e) {
        loggerRedis.error('RedisAdapter - GetUserLoginGameKey - try err: ' + e.stack);
    }
};

exports.GetRedisConnection = function () {
    return client;
};

exports.LoadGlobalBossConfig = function (FishID, callback) {
    try {
        var key = Config.Define.BossGlobal + FishID;
        var name = Config.Define.BossGlobal_CurrentConfig;
        client.hget(key, name, function (e, d) {
            if (!e) {
                callback(1, d)
            }
            else {
                callback(0);
            }
        });
    }
    catch (e) {
        callback(0);
        console.log('RedisAdapter - LoadGlobalBossConfig - try err: ' + e.stack);
    }
};

exports.GlobalBossRercordUserLastHit = function (FishID, UserID, LastHitTime) {
    try {
        client.zadd(Config.Define.GlobalBossListUser + FishID, LastHitTime, UserID);
    } catch (e) {
        loggerRedis.error('RedisAdapter - GlobalBossSetListUserHitBoss - try err: ' + e.stack);
    }

};

exports.GlobalBossSetUserHit = function (UserID, BossID, LastHitTime) {
    try {
        client.zadd(Config.Define.GlobalBossListUser + BossID, LastHitTime, UserID);
    } catch (e) {
        loggerRedis.error('RedisAdapter - GlobalBossSetUserHit - try err: ' + e.stack);
    }

};

exports.GlobalBossSetDie = function (FishID, callback) {
    try {
        client.hsetnx(Config.Define.GlobalBossDie, FishID, 1, function (e, d) {
            if (!e && d == 1) {
                callback(1);
            } else {
                callback(0);
                if (e) {
                    loggerRedis.error('RedisAdapter - GlobalBossSetDie : ' + e);
                }
            }
        });
    } catch (e) {
        callback(0);
        loggerRedis.error('RedisAdapter - GlobalBossSetDie - try err: ' + e.stack);
    }
};

exports.GlobalBossCheckLastHit = function (FishID, callback) {
    try {
        client.zrange(Config.Define.GlobalBossListUser + FishID, 0, 0, function (e, d) {
            if (!e) {
                callback(0, d);
            } else {
                callback(1, e);
                loggerRedis.error('RedisAdapter - GlobalBossCheckLastHit : ' + e);
            }
        });
    } catch (e) {
        callback(1);
        loggerRedis.error('RedisAdapter - GlobalBossCheckLastHit - try err: ' + e.stack);
    }
};

exports.GlobalBossCheckCount = function (FishID, callback) {
    try {
        client.zcount(Config.Define.GlobalBossListUser + FishID, '-inf', '+inf', function (e, d) {
            if (!e) {
                callback(d);
            } else {
                callback(0);
                loggerRedis.error('RedisAdapter - GlobalBossCheckCount : ' + e);
            }
        });
    } catch (e) {
        callback(0);
        loggerRedis.error('RedisAdapter - GetUserLoginGameKey - try err: ' + e.stack);
    }
};

exports.CalcAwardMoney = function (globalBossHash, globalBossHitMoneyHash, rewardMoney, totalReward, callback) {
    try {
        execLuaScript('hincryby', globalBossHash, globalBossHitMoneyHash, rewardMoney, totalReward, callback);
    }
    catch (e) {
        callback(0);
        loggerRedis.error('RedisAdapter - CalcAwardMoney - try err: ' + e.stack);
    }
};

exports.CalcAwardItem = function (FishID, ItemCount, TotalCount, callback) {
    try {
        var key = Config.Define.BossGlobal + FishID;
        var name = Config.Define.BossGlobal_CurrentAwardItemCount;
        this.SetIncrbyLua(key, name, ItemCount, TotalCount, callback);

    }
    catch (e) {
        callback(0);
        loggerRedis.error('RedisAdapter - CalcAwardItem - try err: ' + e.stack);
    }
};


exports.RecordMoneyHistory = function (User) {
    try {
        var key = Config.Define.MoneyHistoryPlayer + User.UserID;
        var multi = client.multi();
        for (var i = 0; i < User.MoneyHistory.length; i++) {
            multi.zadd(key, -User.MoneyHistory[i].Time, JSON.stringify(User.MoneyHistory[i]));
        }
        multi.zremrangebyrank(key, 100, 1000);
        multi.exec();


    }
    catch (e) {
        callback(0);
        loggerRedis.error('RedisAdapter - CalcAwardItem - try err: ' + e.stack);
    }
};

exports.CalcHitBoss = function (globalBossHash, globalBossHpHash, globalBossWinHash, UserID, HPValue, TotalHP, callback) {
    try {
        //globalBossHash, globalBossHpHash, globalBossWinHash
        execLuaScript('HitGlobalBoss', globalBossHash, globalBossHpHash, globalBossWinHash, UserID, HPValue, TotalHP, callback);
    }
    catch (e) {
        callback(0);
        loggerRedis.error('RedisAdapter - CalcHitBoss - try err: ' + e.stack);
    }
};

exports.zRemByRank = function (zkey,start,end) {
    try {
        //ZREMRANGEBYRANK
        client.zremrangebyrank(zkey, start, end);
    }
    catch (e) {
        loggerRedis.error('RedisAdapter - zCount - try err: ',zkey, e.stack);
    }
};

exports.zCount = function (zkey,callback) {
    try {
        client.zcount(zkey, '-inf', '+inf',callback);
    }
    catch (e) {
        loggerRedis.error('RedisAdapter - zCount - try err: ',zkey, e.stack);
    }
};


exports.zAdd = function (zkey, keyScore, keyValue) {
    try {
       client.zadd(zkey, keyScore, keyValue);
    }
    catch (e) {
        loggerRedis.error('RedisAdapter - zAdd - try err: ',zkey,keyScore,keyValue, e.stack);
    }
};

exports.zIncrby = function (zkey, keyScore, keyValue) {
    try {
       client.zincrby(zkey, keyScore, keyValue);
    }
    catch (e) {
        loggerRedis.error('RedisAdapter - zIncrby - try err: ',zkey,keyScore,keyValue, e.stack);
    }
};

exports.zRange = function (zkey, start, end,callback) {
    try {
        //ZRANGE TXBH:212 0 1
        client.zrange(zkey, start, end,callback);
    }
    catch (e) {
        loggerRedis.error('RedisAdapter - zRange - try err: ',zkey,start,end, e.stack);
    }
};

exports.zRevRangeWithScores = function (zkey, start, end,callback) {
    try {
        //ZREVRANGE TXBH:212 0 1
        client.zrevrange(zkey, start, end,'withscores',callback);
    }
    catch (e) {
        loggerRedis.error('RedisAdapter - zRange - try err: ',zkey,start,end, e.stack);
    }
};