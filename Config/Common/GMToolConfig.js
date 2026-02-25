/**
 * Created by ngocnpt on 02/06/2016.
 */
var DefaultConfig = require('./DefaultConfig');
var GMToolConfig = {
    Host: DefaultConfig.Redis.Host,
    Port: DefaultConfig.Redis.Port,
    Password: DefaultConfig.Redis.Password,
    DB: 0,
    Channel: {
        MasterGM: 'MasterGM',
        GameGM: 'GameGM'
    },
    CMD: {
        UserKickByUserID: 1001,
        UserKickByAccountID: 1002,
        UpdateUserGold: 1003,
        UserOutGameCompleted: 1004,
        ServerMaintain: 1005,
        ServerOnOffline: 1006,
        BroadCastBossInfo: 1007,
        UserEnterMaster: 1009,
        ResetMission: 1010,
        Notification: 1011,
        GlobalBossStartBoss: 1012,
        GlobalBossUserKill: 1013,
        GlobalBossDie: 1014,
        ShowTopDamage: 1015,
        SpawnGoldenEventFish: 1016,
        ResetFishTimer_Group: 1017,
        ResetFishTimer: 1018

    }
};
module.exports = GMToolConfig;