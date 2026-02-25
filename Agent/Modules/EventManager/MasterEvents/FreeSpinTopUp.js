/**
 * Created by Ngoc on 01-05-2018.
 */
var MasterEvents = require('./MasterEvents');
var Utility = require('../../../../SharedModule/Utility');

function FreeSpinTopUp() {
    MasterEvents.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
}

module.exports = FreeSpinTopUp;
FreeSpinTopUp.prototype = new MasterEvents();

FreeSpinTopUp.prototype.OnUserRechargeEvent = function (UserID, Money) {
    //
    try {
        if (Utility.CheckVariable(this.EventConfig, "SpinRewardConfig")) {
            var cfg = {
                DailySpinTicket: 0,
                FreeSpinTicket: 0,
                GoldRequired: 0
            };
            for (var i = 0; i < this.EventConfig.SpinRewardConfig.length; i++) {
                if (Utility.CheckVariable(this.EventConfig.SpinRewardConfig[i], "GoldRequired", "DailySpinTicket", "FreeSpinTicket")) {
                    if (Money >= this.EventConfig.SpinRewardConfig[i].GoldRequired && this.EventConfig.SpinRewardConfig[i].GoldRequired > cfg.GoldRequired) { // Tiền lớn = hơn móc cfg và lớn hơn cfg củ
                        cfg = this.EventConfig.SpinRewardConfig[i];
                    }
                }
            }
            if (Utility.CheckVariable(cfg, "DailySpinTicket", "FreeSpinTicket")) {
                if (cfg.DailySpinTicket > 0) {
                    var hashDaily = UserID + ":" + this.Agent.AgentConfig.RedisConfig.Define.VQMMSpinBonusDaily;
                    this.Agent.RedisAdapter.hIncrby(this.Agent.AgentConfig.RedisConfig.Define.VQMMSpinInfo, hashDaily, cfg.DailySpinTicket);
                }
                if (cfg.FreeSpinTicket > 0) {
                    var hashFree = UserID + ":" + this.Agent.AgentConfig.RedisConfig.Define.VQMMSpinBonusFree;
                    this.Agent.RedisAdapter.hIncrby(this.Agent.AgentConfig.RedisConfig.Define.VQMMSpinInfo, hashFree, cfg.FreeSpinTicket);
                }
            }
        }
    } catch (e) {
        this.Agent.Logger.Game().error('FreeSpinTopUp.prototype.OnUserRechargeEvent Err ', e.stack)
    }

};
