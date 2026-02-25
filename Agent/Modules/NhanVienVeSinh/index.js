var Utility = require('../../../SharedModule/Utility');
function NhanVienVeSinh() {
    this.Agent = 0;
    this.CheckDay = new Date().getDay();
    this.KeepSQLDay = 60;
    this.KeepRedisDay = 7;
    this.RedisClearList = [];
    this.NhanVienVeSinhTimer = [
        {
            Tick: 0,
            Interval: 60000,
            Wake: this.Timer60seconds.bind(this)
        }
    ];
}

module.exports = NhanVienVeSinh;

NhanVienVeSinh.prototype.Init = function (Agent) {

    this.Agent = Agent;
    this.InitTimer();
    this.RedisClearList = [
        this.Agent.AgentConfig.RedisConfig.Define.LogGold,
        this.Agent.AgentConfig.RedisConfig.Define.BossGlobal,
        this.Agent.AgentConfig.RedisConfig.Define.RecordDetail + ':'
    ]
};

NhanVienVeSinh.prototype.InitTimer = function () {
    for (var i = 0; i < this.NhanVienVeSinhTimer.length; i++) {
        this.Agent.MainTimers.push(this.NhanVienVeSinhTimer[i]);
    }
};

NhanVienVeSinh.prototype.CheckNewDay = function () {
    var now = new Date();
    var hour = now.getHours();
    var day = now.getDay();
    if (hour == 0 && this.CheckDay != day) {// Chưa xử lý
        this.CheckDay = day;
        this.BatDauDonVeSinh();
    }
};

NhanVienVeSinh.prototype.BatDauDonVeSinh = function () {
    this.Agent.Logger.Game().info("GMToolAPI.prototype.BatDauDonVeSinh Start clearing !");
    this.DonToiletMySQL();
    this.DonToiletRedis();
};

NhanVienVeSinh.prototype.DonToiletRedis = function () {
    //RedisClearList
    for (var i = 0; i < this.RedisClearList.length; i++) {
        this.GetRedisKeyByPrefix(this.RedisClearList[i]);
    }
};

NhanVienVeSinh.prototype.DonToiletMySQL = function () {
    this.Agent.LogRecorder.getTableList(function (e, d) {
        if (!e) {
            if (Utility.CheckVariable(d, 'length')) {
                this.FilterTableWithSuffixDate(d);
            }
        }
    }.bind(this));
};

NhanVienVeSinh.prototype.FilterTableWithSuffixDate = function (tables) {
    var removeTables = [];
    var start = 0;
    var end = 0;
    var tbName;
    var date;
    var now = +new Date();
    var checkTime = now - 24 * 3600 * 1000 * this.KeepSQLDay;//30 ngày
    for (var i = 0; i < tables.length; i++) {
        try {
            tbName = tables[i].name;
            if (tbName.length > 10) {
                start = tbName.length - 10;
                end = tbName.length;
                var suffix = tbName.slice(start, end); // Cắt lấy 10 ký tự cuối
                if (suffix.indexOf('_') > -1) {
                    suffix = suffix.split('_').join('-'); // đổi _ thành - để parse time
                    date = +new Date(suffix);
                    if (isNaN(date)) {
                        continue;
                    }
                    if (date < checkTime) { // Timeout
                        removeTables.push(tbName);
                    }
                }
            }
        } catch (e) {
            this.Agent.Logger.Game().error("GMToolAPI.prototype.FilterTableWithSuffixDate ", e.stack);
        }
    }
    if(removeTables.length>0){
        this.Agent.LogRecorder.clearTable(removeTables.join(','));
    }

};

NhanVienVeSinh.prototype.GetRedisKeyByPrefix = function (KeyPrefix) {
    this.Agent.RedisAdapter.keys(KeyPrefix + "*", function (e, d) {
        if (!e) {
            this.CheckAndClearRedisKey(KeyPrefix, d);
        }
    }.bind(this));
};

NhanVienVeSinh.prototype.CheckAndClearRedisKey = function (KeyPrefix, List) {
    var removeKey = [];
    var start;
    var end;
    var timeText;
    var date;
    var now = +new Date();
    var checkTime = now - 24 * 3600 * 1000 * this.KeepRedisDay;//7 ngày
    for (var i = 0; i < List.length; i++) {
        start = KeyPrefix.length;
        end = start + 10;
        timeText = List[i].slice(start, end);
        timeText = timeText.split(':').join('-');
        date = +new Date(timeText);
        if (isNaN(date)) continue;
        if (date < checkTime) { // Timeout
            removeKey.push(List[i]);
        }
    }
    if(removeKey.length >0){
        this.Agent.RedisAdapter.del(removeKey,function (e,d) {
        });
    }

};

NhanVienVeSinh.prototype.Timer60seconds = function () {
  this.CheckNewDay();
};

//Thay thế Event trong SQL

NhanVienVeSinh.prototype.GetListTable = function () {

};