/**
 * Created by ngocnpt on 03/06/2016.
 */
var DefaultConfig = require('./DefaultConfig');
var RedisConfig = {
    Host: DefaultConfig.Redis.Host,
    Port: DefaultConfig.Redis.Port,
    Password: DefaultConfig.Redis.Password,
    DB: 0,
    Define:{
        LogGold: "lg:"
    }
};
module.exports = RedisConfig;

