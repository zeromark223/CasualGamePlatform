var Utility = require('../../../SharedModule/Utility');

function JackpotManager() {
    this.GameServer = 0;
}

module.exports = JackpotManager;

JackpotManager.prototype.Init = function (gameServer) {
    this.GameServer = gameServer;
};

JackpotManager.prototype.CollectTotal = function () {
    var total = 0;
    for (var i = 0; i < this.GameServer.UserClient.length; i++) {
        if (Utility.CheckVariable(this.GameServer.UserClient[i], 'UserModel')) {
            if (Utility.CheckVariable(this.GameServer.UserClient[i].UserModel, 'TotalGoldUserPayForSys')) {
                if (!Utility.CheckVariable(this.GameServer.UserClient[i].UserModel, 'JackpotTracking')) {
                    this.GameServer.UserClient[i].UserModel.JackpotTracking = 0
                }
                var p = this.GameServer.UserClient[i].UserModel.JackpotTracking;
                var n = this.GameServer.UserClient[i].UserModel.TotalGoldUserPayForSys;
                var d = n - p;
                this.GameServer.UserClient[i].UserModel.JackpotTracking = n;
                total += d;
            }
        }
    }
    return total;
};

JackpotManager.prototype.SyncData = function () {
    var main = 0;
    var save = 0;
    main = this.CollectTotal();
    //cacl main vs save
    save = Math.floor(main / 2 * 0.01);
    main = save;
    this.GameServer.RedisAdapter.zIncrby(this.GameServer.Config.RedisConfig.Define.Jackpot
        , main,
        this.GameServer.Config.RedisConfig.Define.Jackpot_Main);
    this.GameServer.RedisAdapter.zIncrby(this.GameServer.Config.RedisConfig.Define.Jackpot
        , save
        , this.GameServer.Config.RedisConfig.Define.Jackpot_Save);
};




