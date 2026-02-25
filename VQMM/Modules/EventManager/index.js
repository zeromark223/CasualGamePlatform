/**
 * Created by Ngoc on 01-05-2018.
 */
var Utility = require('../../../SharedModule/Utility');

function EventManager() {
    this.GameServer = 0;
    this.RunningEvent = [];
}

module.exports = EventManager;

EventManager.prototype.Init = function (GameServer) {
    this.GameServer = GameServer;
};

EventManager.prototype.ReloadAllEvent = function () {
    if (this.GameServer.IsRoomTrial()) return;
    this.GameServer.SQLAdapter.eventReloadAllByGameID(this.GameServer.GameID, function (e, d) {
        if (!e) {
            if (Utility.CheckVariable(d) && Utility.CheckVariable(d[0])) {
                this.HandleOnOffAllGameEvent(d[0]);
            } else {
                console.log("wtffffff ", d);
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
                this.GameServer.Logger.Game().error('HandleOnOffAllGameEvent Parse JSON err ', EventList[i].Config)
            }

        }
    }
    for (var i = 0; i < this.RunningEvent.length; i++) {
        if (this.RunningEvent[i].IsExpired) {
            try {
                this.RunningEvent[i].TurnOff();
                this.GameServer.Logger.Game().info('HandleOnOffAllGameEvent  ', this.RunningEvent[i].EventCode, ' turn off ');
                this.RunningEvent.splice(i, 1);
                i--;
            } catch (e) {
                this.GameServer.Logger.Game().error('HandleOnOffAllGameEvent err ', e.stack)
            }

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
        var evtModule = require('./GameEvents/' + EventCode);
        var Event = new evtModule();
        Event.Init(this.GameServer, EventCode, DataKey, EventConfig);
        this.RunningEvent.push(Event);
        this.GameServer.Logger.Game().info('StartEventByEventCode  ', EventCode, ' success ')
    } catch (e) {
        this.GameServer.Logger.Game().error('StartEventByEventCode Err ', EventCode, ' Check module ', './GameEvents/' + EventCode, ' with match case', e.stack)
    }

};

EventManager.prototype.EvtOnUserOutGameAll = function (User) {
    for (var i = 0; i < this.RunningEvent.length; i++) {
        this.RunningEvent[i].EvtOnUserOutGame(User);
    }
};

EventManager.prototype.EvtOnUserEndMatchAll = function (User, BetList, WinList) {
    for (var i = 0; i < this.RunningEvent.length; i++) {
        this.RunningEvent[i].EvtOnUserEndMatch(User, BetList, WinList);
    }
};

EventManager.prototype.EvtOnUserEnterAll = function (User, DisConnectedUser) {
    for (var i = 0; i < this.RunningEvent.length; i++) {
        this.RunningEvent[i].EvtOnUserEnter(User, DisConnectedUser);
    }
};

EventManager.prototype.EvtOnUserWinLoseAll = function (User, TotalBet, TotalWin,BetList) {
    for (var i = 0; i < this.RunningEvent.length; i++) {
        this.RunningEvent[i].EvtOnUserWinLose(User, TotalBet, TotalWin,BetList);
    }
};