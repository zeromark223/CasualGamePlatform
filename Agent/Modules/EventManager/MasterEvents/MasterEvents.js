/**
 * Created by Ngoc on 01-05-2018.
 */
var Utility = require('../../../../SharedModule/Utility');
function MasterEvents() {
    this.Run = false;
    this.EventCode = 0;
    this.Agent = 0;
    this.EventConfig = 0;
    this.DataKey = 0;
    this.IsExpired = false;
    this.EventConfigCode = {
        CreateAccBonus:1,//01
        DailyLoginEvent:2,//10
        LuckyTime:4//100
    };
}
module.exports = MasterEvents;

MasterEvents.prototype.Init = function (Agent, EventCode, DataKey, EventConfig) {
    this.EventCode = EventCode;
    this.Agent = Agent;
    this.EventConfig = EventConfig;
    this.DataKey = DataKey;
    this.TurnOn();//Init xong tự bật (code ngu học)
};

MasterEvents.prototype.UpdateConfig = function (DataKey, EventConfig) {
    this.DataKey = DataKey;
    this.EventConfig = EventConfig;
};

MasterEvents.prototype.TurnOn = function () {
    this.Run = true;
    this.OnTurnOnTrigger();
};

MasterEvents.prototype.TurnOff = function () {
    this.OnTurnOffTrigger();
    this.Run = false;
};

MasterEvents.prototype.OnTurnOnTrigger = function () {

};

MasterEvents.prototype.OnTurnOffTrigger = function () {

};

MasterEvents.prototype.OnUserRechargeEvent = function (UserID, Money) {

};
