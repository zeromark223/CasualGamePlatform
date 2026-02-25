/**
 * Created by ngocnpt on 23/05/2016.
 */

var LoggerConfig = {
    LogLevel:'ALL',//ALL,DEBUG,INFO,WARN,ERROR,FATAL,MARK,OFF
    Default:{
        Filename:'DefaultLog',
        RootDir:'./logs/Default/'
    },
    Game:{
        Filename:'GameLog',
        RootDir:'./logs/Game/'
    },
    Redis:{
        Filename:'RedisLog',
        RootDir:'./logs/Redis/'
    },
    Sql:{
        Filename:'SqlLog',
        RootDir:'./logs/Sql/'
    },
    LogRecorder:{
        Filename:'LogRecorder',
        RootDir:'./logs/logRecorder/'
    },
    Master:{
        Filename:'MasterLog',
        RootDir:'./logs/Master/'
    }

};

module.exports = LoggerConfig;