/**
 * Created by ngocnpt on 09/05/2016.
 */

var log4js = require('log4js');

module.exports = LoggerCommon;

function LoggerCommon(MasterID){
    log4js.configure({
        appenders: [
            {
                "type": "dateFile",
                "filename": "./logs/M"+MasterID+"_Default.log",
                "pattern": "-yyyyMMddhh.log",
                "alwaysIncludePattern": true,
                "maxLogSize": 1024,
                "category": "Default"
            },
            {
                "type": "dateFile",
                "filename": "./logs/M"+MasterID+"_Game.log",
                "pattern": "-yyyyMMddhh.log",
                "alwaysIncludePattern": true,
                "maxLogSize": 1024,
                "category": "Game"
            },
            {
                "type": "console"
            }
        ],
        replaceConsole: true
    });
}

LoggerCommon.prototype.Default = function (level) {
    level = level || "DEBUG";
    var loggerCommon = log4js.getLogger('Default');
    loggerCommon.setLevel(level);
    return loggerCommon;
};

LoggerCommon.prototype.Game = function (level) {
    level = level || "DEBUG";
    var loggerCommon = log4js.getLogger('Game');
    loggerCommon.setLevel(level);
    return loggerCommon;
};

