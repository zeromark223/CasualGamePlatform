/**
 * Created by Ngoc on 01-05-2018.
 */
var Utility = require('../../../../SharedModule/Utility');
function GameEvents() {
    this.Run = false;
    this.EventCode = 0;
    this.GameServer = 0;
    this.EventConfig = 0;
    this.DataKey = 0;
    this.IsExpired = false;
}
module.exports = GameEvents;

GameEvents.prototype.Init = function (GameServer, EventCode, DataKey, EventConfig) {
    this.EventCode = EventCode;
    this.GameServer = GameServer;
    this.EventConfig = EventConfig;
    this.DataKey = DataKey;
    this.TurnOn();//Init xong tự bật (code ngu học)
};

GameEvents.prototype.UpdateConfig = function (DataKey, EventConfig) {
    this.DataKey = DataKey;
    this.EventConfig = EventConfig;
};

GameEvents.prototype.TurnOn = function () {
    this.Run = true;
    this.OnTurnOnTrigger();
};

GameEvents.prototype.TurnOff = function () {
    this.OnTurnOffTrigger();
    this.Run = false;
};

GameEvents.prototype.OnTurnOnTrigger = function () {

};

GameEvents.prototype.OnTurnOffTrigger = function () {
    for (var i = 0; i < this.GameServer.UserClient.length; i++) {
        if (Utility.CheckVariable(this.GameServer.UserClient[i], 'UserModel')) {
            var User = this.GameServer.UserClient[i].UserModel;
            this.EvtOnUserOutGame(User);
        }
    }
};

GameEvents.prototype.EvtOnUserOutGame = function () {

};
