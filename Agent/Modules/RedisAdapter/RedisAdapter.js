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

function loadScriptIncrbyLua() {
    var script = fs.readFileSync(require.resolve('./script/hincryby.lua'));

    client.send_command('script', ['load', script], function (err, sha) {
        if (!err) {
            scriptList['IncrbyLua'] = sha;
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

function incrbyLuaExcute(myHash, field, incr, valueLimit, callback) {
    execLuaScript(scriptList[''], myHash, field, incr, valueLimit, callback);
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

exports.recordBatchMassZSet = function (zkey, dataRaw, keyScore, keyValue, isNegative) {
    var batch = client.batch();
    for (var i = 0; i < dataRaw.length; i++) {
        if (Utility.CheckVariable(dataRaw[i], keyScore, keyValue)) {
            if (isNegative) { // Nghịch đảo, biến thành số âm để sort
                dataRaw[i][keyScore] = dataRaw[i][keyScore] * -1;
            }
            batch.zadd(zkey, dataRaw[i][keyScore], dataRaw[i][keyValue]);
        }
    }
    batch.exec();
};

exports.zlistGetRevRangeWithScore = function (zkey, start, end, callback) {
    client.zrevrange(zkey, start, end, 'withscores', function (e, d) {
        if (!e) {
            callback(d);
        }
    });
};

exports.hset = function (key, hkey, value) {
    client.hset(key, hkey, value);
};

exports.hget = function (key, hkey, callback) {
    client.hget(key, hkey, callback);
};

exports.hgetall = function (key, callback) {
    client.hgetall(key, callback);
};

exports.del = function (key, callback) {
    client.del(key, callback);
};

exports.keys = function (key, callback) {
    client.keys(key, callback);
};

exports.zAdd = function (zkey, keyScore, keyValue) {
    try {
        client.zadd(zkey, keyScore, keyValue);
    }
    catch (e) {
        loggerRedis.error('RedisAdapter - zAdd - try err: ', zkey, keyScore, keyValue, e.stack);
    }
};

exports.zIncrby = function (zkey, keyScore, keyValue) {
    try {
        client.zincrby(zkey, keyScore, keyValue);
    }
    catch (e) {
        loggerRedis.error('RedisAdapter - zIncrby - try err: ', zkey, keyScore, keyValue, e.stack);
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

exports.recordTopUserWin = function (ListUser, Key) {
    var batch = client.batch();
    batch.del(Key); // Xóa key hiện tại
    for (var i = 0; i < ListUser.length; i++) {
        if (Utility.CheckVariable(ListUser[i], 'UserID', 'UserWin')) {
            if (ListUser[i].UserWin > 0) {
                batch.zadd(Key, ListUser[i].UserWin, ListUser[i].UserID);
            }
        }
    }
    batch.exec();
};

exports.setNx = function (Key,Val,cb) {
  client.setnx(Key,Val,cb);
};

exports.expire = function (Key,Time) {
    client.expire(Key,Time);
};