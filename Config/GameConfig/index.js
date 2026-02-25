var GameConfig = {
    SQLConfig: require('../Common/SQLConfig'),
    LogRecorderConfig: require('../Common/LogRecorderConfig'),
    RedisConfig: require('../Common/RedisConfig'),
    KeyConfig: require('../Common/KeyConfig'),
    GameServerConfig: require('./GameServerConfig'),
    FishConfig: require('./FishConfig'),
    StockConfig: require('./StockConfig'),
    LoggerConfig:require('./LoggerConfig'),
    GMToolConfig:require('../Common/GMToolConfig'),
    ModuleConfig:require('./ModuleConfig'),
    PathConfig:require('./PathConfig'),
    GunConfig: require('./GunConfig'),
    FishScriptConfig: require('./FishScript'),
    RoomKindConfig: require('../Common/RoomKindConfig'),
    RoomKind: require('./RoomKind'),
    EventFishConfig: require('./EventFishConfig'),
    BossSkillConfig:require('./BossSkillConfig'),
    FishScriptConfig_2D: require('./FishScript_2D'),
    FishConfig_2D: require('./FishConfig_2D'),
    ParadeFishConfig: require('./ParadeFishConfig') ,
    MoneyReasonConfig:require('./MoneyReasonConfig'),
    LanguageConfig:require('../Common/LanguageConfig'),
    StockHandicap:require('./StockHandicap')
};

module.exports = GameConfig;