var ModuleConfig = require('../../../Config/Common/ModulesConfig');

function VPManager(Main) {
    this.Main = Main;
    this.VPConfig = {};
    this.ModuleForceTurnOff = ModuleConfig.VPModuletate || 1; // Lấy dựa trên config, hoặc off
    if (!this.ModuleForceTurnOff) {
        setInterval(this.ReloadVPConfig.bind(this), 10000); //Reload mỗi 5s
        this.ReloadVPConfig();
    }

}

module.exports = VPManager;

VPManager.prototype.VPRecordOnUserOutGame = function (User) {
    if (this.ModuleForceTurnOff) return;
    var score = this.CalcVPForUser(User);
    if (score > 0) {
        this.VPRecordToDB(User.UserID, score);
    }
};

VPManager.prototype.VPRecordOnUserChargeCard = function (UserID, TotalGoldUserPayForSys) {
    if (this.ModuleForceTurnOff) return;
    var score = this.CalcVPForUser({
        TotalGoldUserPayForSys: TotalGoldUserPayForSys
    });
    if (score > 0) {
        this.VPRecordToDB(UserID, score);
    }
};

VPManager.prototype.VPRecordToDB = function (UserID, Score) {

    var queryStr = 'Update vppoint set VPPoint = VPPoint + ' + Score + ', LastUpdateTime = now() where userid = ' + UserID;
    this.Main.LogRecorder.queryRaw(queryStr, function (e, d) {
        if (!e) {
            if (d.affectedRows == 0) { // Chưa tồn tại
                this.Main.LogRecorder.insertTable('vppoint', ['UserID', 'VPPoint', 'LastUpdateTime'], [UserID, Score, new Date()], function () {

                });
            }
        }
    }.bind(this));
};

VPManager.prototype.CalcVPForUser = function (User) {
    var ratio = this.GetVPConfig().Ratio || 0;
    return (User.TotalGoldUserPayForSys * ratio) || 0;
};

VPManager.prototype.GetVPConfig = function () {
    try {
        var cfg = this.VPConfig.VPConfig;
        for (var i = 0; i < cfg.length; i++) {
            //Tránh trường hợp GameKindID ngựa màu đổi text <> int
            if (cfg[i].GameList.indexOf("" + this.Main.GameKindID) > -1
                || cfg[i].GameList.indexOf(+this.Main.GameKindID) > -1) {
                return cfg[i];
            }
        }
    } catch (e) {
        this.Main.Logger.Game().error('VPManager.prototype.GetVPConfig ', e.stack);
    }

    return this.VPConfig.VPConfigDefault || {Ratio: 0}
};

VPManager.prototype.ReloadVPConfig = function () {
    var queryStr = 'select * from commonconfig where configcode = \'vppoint\'';
    this.Main.SQLAdapter.queryRaw(queryStr, function (e, d) {
        if (!e) {
            if (d.length) {
                try {
                    this.VPConfig = JSON.parse(d[0].configvalue);
                } catch (e) {
                    this.Main.Logger.Game().error('VPManager.prototype.ReloadVPConfig ', e.stack);
                }
            }
        }
    }.bind(this));
};