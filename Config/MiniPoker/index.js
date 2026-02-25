var GameConfig = {
    SQLConfig: require('../Common/SQLConfig'),
    LogRecorderConfig: require('../Common/LogRecorderConfig'),
    RedisConfig: require('../Common/RedisConfig'),
    KeyConfig: require('../Common/KeyConfig'),
    GMToolConfig:require('../Common/GMToolConfig'),
    RoomKindConfig: require('../Common/RoomKindConfig'),
    LanguageConfig:require('../Common/LanguageConfig'),
    MoneyReasonConfig:require('../Common/MoneyReasonConfig'),
    GameServerConfig: require('./GameServerConfig'),
    LoggerConfig:require('../Common/LoggerConfig'),
    BetLimitConfig:require('./BetLimitConfig'),
    BetRatioConfig:require('./BetRatioConfig'),
    RewardConfig: require('./RewardConfig')
};

module.exports = GameConfig;