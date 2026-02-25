/**
 * Created by Ngoc on 01-05-2018.
 */
var Utility = require('../../../SharedModule/Utility');

function EventManager() {
    this.Agent = 0;
    this.RunningEvent = [];
}

module.exports = EventManager;

EventManager.prototype.Init = function (Agent) {
    this.Agent = Agent;
};

EventManager.prototype.ReloadAllEvent = function () {
    this.Agent.SQLAdapter.eventReloadAllByAgent(function (e, d) {
        if (!e) {
            if (Utility.CheckVariable(d) ) {
                this.HandleOnOffAllGameEvent(d);
            }
        }
    }.bind(this));
};

EventManager.prototype.HandleOnOffAllGameEvent = function (EventList) {
    //Check config
    for (var i = 0; i < this.RunningEvent.length; i++) {
        this.RunningEvent[i].IsExpired = true; // Set Event về trạng thái quá hạn
    }
    for (var i = 0; i < EventList.length; i++) {
        if (Utility.CheckVariable(EventList[i], 'EventCode', 'Config', 'DataKey')) {
            var event = this.FindRunningEvent(EventList[i].EventCode);
            if (event != 0) {
                if (EventList[i].Config != '') {
                    EventList[i].Config = JSON.parse(EventList[i].Config)
                }
                event.UpdateConfig(EventList[i].DataKey, EventList[i].Config);
                event.IsExpired = false; // Event vẫn đang chạy
                EventList[i].isHandle = true;
            }
        }
    }
    for (var i = 0; i < EventList.length; i++) {
        if (EventList[i].isHandle) continue;//Đã xử lý, bỏ qua
        if (Utility.CheckVariable(EventList[i], 'EventCode', 'Config', 'DataKey')) {
            try {
                if (EventList[i].Config != '') {
                    EventList[i].Config = JSON.parse(EventList[i].Config)
                }

                this.StartEventByEventCode(EventList[i].EventCode, EventList[i].DataKey, EventList[i].Config);
            } catch (e) {
                this.Agent.Logger.Game().error('HandleOnOffAllGameEvent Parse JSON err ', EventList[i].Config)
            }

        }
    }
    for (var i = 0; i < this.RunningEvent.length; i++) {
        if (this.RunningEvent[i].IsExpired) {
            this.RunningEvent[i].TurnOff();
            this.RunningEvent.splice(i, 1);
            i--;
        }
    }
};

EventManager.prototype.FindRunningEvent = function (EventCode) {
    for (var i = 0; i < this.RunningEvent.length; i++) {
        if (this.RunningEvent[i].EventCode == EventCode) {
            return this.RunningEvent[i];
        }
    }
    return 0;
};

EventManager.prototype.StartEventByEventCode = function (EventCode, DataKey, EventConfig) {
    try {
        var evtModule = require('./MasterEvents/' + EventCode);
        var Event = new evtModule();
        Event.Init(this.Agent, EventCode, DataKey, EventConfig);
        this.RunningEvent.push(Event);
        this.Agent.Logger.Game().info('StartEventByEventCode  ', EventCode, ' success ')
    } catch (e) {
        this.Agent.Logger.Game().error('StartEventByEventCode Err ', EventCode, ' Check module ', './MasterEvents/' + EventCode, ' with match case', e.stack)
    }

};

EventManager.prototype.OnUserRechargeEventAll = function (UserID, Money) {
    for (var i = 0; i < this.RunningEvent.length; i++) {
        this.RunningEvent[i].OnUserRechargeEvent(UserID, Money);
    }
};