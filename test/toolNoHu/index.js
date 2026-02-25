var redis = require('redis');
//var host = '139.99.27.157';//uncomment để xài
var redisConfig = {
    Host: host,
    Port: 9998,
    Password: 'xbiWivjespryoas4TonEdt'
};
var SQLConfig = {
    connectionLimit: 10,
    host: host,
    port: 2204,
    user: 'root',
    password: '123456',
    database: 'bc68'
};
var LogRecorderConfig = {
    connectionLimit: 10,
    host: host,
    port: 2204,
    user: 'root',
    password: '123456',
    database: 'bc68_log'
};
var isConnected = false;
var client = redis.createClient({
    host: redisConfig.Host,
    port: redisConfig.Port,
    password: redisConfig.Password,
    db: redisConfig.DB
});
client.on("connect", function () {
    console.log("Redis is ready, task delay 5000 ms");
    isConnected = true;
    setTimeout(function () {
        InitCompleted();
    }, 1000);

});

client.on('error', function (e) {
    console.log("Redis error", e);
});
client.on('disconnect', function (e) {
    console.log("Redis disconnect");
});

function InitCompleted() {
    //InitJackpot();
    //GetJackpotForuser(224, 'ngoc', 401, 25000);
    GetJackpotForuser(2371166,'nnnnnn88888',401,50000)
}

function GetJackpotForuser(UserID, GameName, GameKind, IDBet) {
    // SlotJackpot:"SLOTJP:",
    //     SlotJackpotSave:"SLOTJPS:",

    var key = "SLOTJP:" + GameKind + ":" + IDBet;
    var keySave = "SLOTJPS:" + GameKind + ":" + IDBet;
    var keyConfig = "SLOTJPC:" + GameKind;
    var WinLabel = "Nổ Hủ";
    getConfig(keyConfig, IDBet, function (val) {
        console.log("val ", val);
        if (val > 0) {
            incrby(keySave, -val);
            getAndSet(key, val, function (e1, d1) {
                var JackpotVal = d1;
                var WinGold = getMul() * Math.floor(IDBet / 25);
                WinGold += +JackpotVal;

                setUserGold(UserID, GameName, WinLabel, WinGold, GameKind)

            });
        }
    });
}

function getConfig(keyConfig, IDBet, callback) {
    client.get(keyConfig, function (e, d) {
        if (!e && d) {
            d = JSON.parse(d);
            console.log(d);
            for (var i = 0; i < d.length; i++) {
                if (d[i].ID == IDBet) {
                    console.log("d[i].ID ",d[i].ID,IDBet,d[i].Default);
                    callback(d[i].Default);
                    return;
                }
            }
        }
        callback(0);
    });
}

function incrby(key, value) {
    client.incrby(key, value);
}

function getAndSet(key, newVal, callback) {
    try {
        var batch = client.batch();
        batch.get(key, callback);
        batch.set(key, newVal);
        batch.exec();
    }
    catch (e) {
        console.error('RedisAdapter - get - try err: ', key, e.stack);
    }
}

function zAdd(zkey, keyScore, keyValue) {
    client.zadd(zkey, keyScore, keyValue);
}

function zRemByRank(zkey, start, end) {
    client.zremrangebyrank(zkey, start, end);
}

function setUserGold(UserID, GameName, WinLabel, WinGold, GameKindID) {
    setUserLog(UserID, GameName, WinLabel, WinGold, GameKindID);
}

function setUserLog(UserID, GameName, WinLabel, WinGold, GameKindID) {
    addTopBigWin(UserID, GameName, WinLabel, WinGold, GameKindID); // Redis

}

function addTopBigWin(UserID, GameName, WinLabel, WinGold, GameKindID) {
    //TopBigWinUser
    try {
        var key = "SLOTTW" + ":" + GameKindID;
        var time = +new Date();
        var val = UserID + ',' + GameName + ',' + WinLabel + ',' + WinGold + ',' + time;
        zAdd(key, -time, val);
        zRemByRank(key, 100, -1); // Xóa các phần tử ngoài 100
        console.log("xong sir ",UserID,WinGold);
    } catch (e) {
        console.error("GameServer.prototype.AddTopBigWin ", e.stack);
    }
}

function getMul() {
    var arrayK = [15, 20, 25, 10, 8, 5, 40, 50, 75, 100, 120, 150];
    return arrayK[randomBetween(0, arrayK.length)];
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}