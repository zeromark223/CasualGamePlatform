/**
 * Created by ngocnpt on 17-May-17. fixed
 */
var Utility = require('../../../SharedModule/Utility');
function ManhThe() {
    this.ItemID = 0;
    this.GameServer = 0;
    this.Reconfig = 0;
    this.DropRatio = 0;
    this.ListPlayer = [];
    this.RedisConnection = 0;
    this.TotalCountAll = 0;
    this.TotalCountPerDay = 0;
    this.StartTime = +new Date();
    this.EndTime = +new Date();
    this.FilterPlayerConfig = [];
    this.LastReload = +new Date();
    this.CountAll = 0;
    this.CountPerDay = 0;
}
module.exports = ManhThe;

ManhThe.prototype.InitOrReconfig = function (GameServer, Config, RedisConnection) {
    if (this.ItemID == 0) {
        this.GameServer = GameServer;
        this.ItemID = Config.ItemID;
        this.TotalCountAll = Config.TotalCount;
        this.TotalCountPerDay = Config.LimitPerDay;
        this.DropRatio = Config.RatioPerGold / 1000000;
        this.StartTime = Config.StartTime;
        this.EndTime = Config.EndTime;
        this.FilterPlayerConfig = Config.FilterPlayerConfig;
        this.RedisConnection = RedisConnection;
        this.LastReload = +new Date();
    } else {
        this.ItemID = Config.ItemID;
        this.TotalCountAll = Config.TotalCount;
        this.TotalCountPerDay = Config.LimitPerDay;
        this.DropRatio = Config.RatioPerGold / 1000000;
        this.StartTime = Config.StartTime;
        this.EndTime = Config.EndTime;
        this.FilterPlayerConfig = Config.FilterPlayerConfig;
        this.LastReload = +new Date();
    }

};

ManhThe.prototype.DropCalc = function (Player, Mul, FishKind, callback) {
    if (Math.random() > this.DropRatio * Mul) {// Check tỉ lệ
        callback(this.ItemID, false);
    } else {
        this.RedisCheckLimitPlayer(Player, function (isRedisCheckLimitPlayer) {
            if (isRedisCheckLimitPlayer) {
                this.RedisCheckLimitAll(function (isRedisCheckLimitAll) {
                    if (isRedisCheckLimitAll) {
                        this.RedisCheckLimitPerDay(function (isRedisCheckLimitPerDay) {
                            callback(this.ItemID, isRedisCheckLimitPerDay);
                        }.bind(this));
                    } else {
                        callback(this.ItemID, false);
                    }
                }.bind(this));
            } else {
                callback(this.ItemID, false);
            }
        }.bind(this));
    }

};

ManhThe.prototype.LimitCalc = function (Player) {
    for (var i = 0; i < this.FilterPlayerConfig.length; i++) {
        if (this.FilterPlayerConfig[i].RechargeGoldStart <= Player.RechargeGold && Player.RechargeGold <= this.FilterPlayerConfig[i].RechargeGoldEnd) {
            return this.FilterPlayerConfig[i].LimitPlayer;
        }
    }
    return 0
};

ManhThe.prototype.RedisCheckLimitAll = function (callback) {
    try {
        if (this.RedisConnection == 0) {
            callback(false);
            return;
        }
        this.RedisConnection.hincrby(this.GameServer.Config.RedisConfig.Define.ManhTheLimitAll, this.ItemID, 1, function (e, d) {//Tăng số lượng itemà của user này lên 1
            if (!e && d <= this.TotalCountAll) {//Check Vượt quá giới hạn
                this.SetLimitAll(d);
                callback(true);//Thỏa điều kiện giới hạn.
            } else {
                if (e) {
                    callback(false);
                } else {
                    this.SetLimitAll(d);
                    this.RedisConnection.hincrby(this.GameServer.Config.RedisConfig.Define.ManhTheLimitAll, this.ItemID, -1);// Trả lại giá trị củ
                    callback(false);
                }
            }
        }.bind(this));

        //this.SetIncrbyLua(this.GameServer.Config.RedisConfig.Define.ManhTheLimitAll, this.ItemID, 1, this.TotalCountAll, function (isSuccess, d) {
        //    if(isSuccess){
        //        this.SetLimitAll(d);
        //    }
        //
        //    callback(isSuccess);
        //}.bind(this));
    } catch (e) {
        callback(false);
    }

};

ManhThe.prototype.RedisCheckLimitPerDay = function (callback) {
    try {
        if (this.RedisConnection == 0) {
            callback(false);
            return;
        }
        var now = new Date();
        var day = Utility.AddZero(now.getUTCDate());
        var month = Utility.AddZero(now.getUTCMonth() + 1);
        var year = now.getUTCFullYear();
        var path = year + ':' + month + ':' + day;
        this.RedisConnection.hincrby(this.GameServer.Config.RedisConfig.Define.ManhTheLimitPerDay + path, this.ItemID, 1, function (e, d) {//Tăng số lượng itemà của user này lên 1
            if (!e && d <= this.TotalCountPerDay) {//Check Vượt quá giới hạn
                this.SetLimitPerDay(d);
                callback(true);//Thỏa điều kiện giới hạn.
            } else {
                if (e) {
                    callback(false);
                } else {
                    this.SetLimitPerDay(d);
                    this.RedisConnection.hincrby(this.GameServer.Config.RedisConfig.Define.ManhTheLimitPerDay + path, this.ItemID, -1);// Trả lại giá trị củ
                    callback(false);
                }
            }
        }.bind(this));
        //
        //this.SetIncrbyLua(this.GameServer.Config.RedisConfig.Define.ManhTheLimitPerDay + path, this.ItemID, 1, this.TotalCountPerDay, function (isSuccess, d) {
        //    if(isSuccess){
        //        this.SetLimitPerDay(d);
        //    }
        //
        //    callback(isSuccess);
        //}.bind(this));
    } catch (e) {
        callback(false);
    }

};

ManhThe.prototype.RedisCheckLimitPlayer = function (Player, callback) {
    try {
        if (this.RedisConnection == 0) {
            callback(false);
            return;
        }
        var now = new Date();
        var day = Utility.AddZero(now.getUTCDate());
        var month = Utility.AddZero(now.getUTCMonth() + 1);
        var year = now.getUTCFullYear();
        var path = year + ':' + month + ':' + day + ':';
        this.RedisConnection.hincrby(this.GameServer.Config.RedisConfig.Define.ManhTheLimitPlayer + path + this.ItemID, Player.UserID, 1, function (e, d) {//Tăng số lượng itemà của user này lên 1
            if (!e && d <= this.LimitCalc(Player)) {//Check Vượt quá giới hạn
                this.SetLimitPlayer(Player, d);
                callback(true);//Thỏa điều kiện giới hạn.
            } else {
                if (e) {
                    callback(false);
                } else {
                    this.SetLimitPlayer(Player, d);
                    this.RedisConnection.hincrby(this.GameServer.Config.RedisConfig.Define.ManhTheLimitPlayer + path + this.ItemID, Player.UserID, -1);// Trả lại giá trị củ
                    callback(false);
                }
            }
        }.bind(this));

        //this.GameServer.RedisAdapter.SetIncrbyLua(this.GameServer.Config.RedisConfig.Define.ManhTheLimitPlayer + path + this.ItemID, Player.UserID, 1, this.LimitCalc(Player), function (isSuccess, d) {
        //    if(isSuccess){
        //        this.SetLimitPlayer(Player, d);
        //    }
        //
        //    callback(isSuccess);
        //}.bind(this));
    } catch (e) {
        callback(false);
    }

};

ManhThe.prototype.SetLimitAll = function (Count) {
    this.CountAll = Count;
};

ManhThe.prototype.SetLimitPerDay = function (Count) {
    this.CountPerDay = Count;
};

ManhThe.prototype.CheckPlayer = function (Player) {
    var f = 0;
    for (var i = 0; i < Player.ItemList.length; i++) {
        if (Player.ItemList[i].ItemID == this.ItemID) {
            f = 1;
            if (Player.ItemList[i].Count > Player.ItemList[i].LimitPlayer) {
                return false
            }
        }
    }
    if (f == 0) {
        this.SetLimitPlayer(Player, 0);
    }
    return true;
};

ManhThe.prototype.SetLimitPlayer = function (Player, Count) {
    var f = 0;
    for (var i = 0; i < Player.ItemList.length; i++) {
        if (Player.ItemList[i].ItemID == this.ItemID) {
            f = 1;
            Player.ItemList[i].Count = Count
        }
    }
    if (f == 0) {
        Player.ItemList.push({
            ItemID: this.ItemID,
            Count: Count,
            LimitPlayer: this.LimitCalc(Player)
        })
    }
};

