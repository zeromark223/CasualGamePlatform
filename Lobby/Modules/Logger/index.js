/**
 * Created by ngocnpt on 23/05/2016.
 */
/**
 * Created by ngocnpt on 09/05/2016.
 */

var mkdirp = require('mkdirp');
var log4js = require('log4js');
var fs = require('fs');

exports.Init = function (MasterID, Cfg, callback) {

    var appenders = [];

    for (var logCfg in Cfg) {
        if(logCfg == 'LogLevel')continue;
        if(!Cfg.hasOwnProperty(logCfg))continue;
        var logAppender = {
            "type": "dateFile",
            "filename": Cfg[logCfg].RootDir + Cfg[logCfg].Filename,
            "pattern": "-yyyyMMddhh-" + MasterID + ".log",
            "alwaysIncludePattern": true,
            "maxLogSize": 1024,
            "category": logCfg
        };
        appenders.push(logAppender);

        if (!fs.existsSync(Cfg[logCfg].RootDir)) {
            mkdirp.sync(Cfg[logCfg].RootDir);

        }

    }
    appenders.push({
        "type": "console"
    });
    log4js.configure({
        appenders: appenders
        //,
        //replaceConsole: true
    });

    callback();
};
exports.setLogLevel = function (level) {

    log4js.setGlobalLogLevel(level);

};

exports.Default = function () {
    return log4js.getLogger('Default');
};

exports.Game = function () {
    return log4js.getLogger('Game');
};

exports.Redis = function () {
    return log4js.getLogger('Redis');
};

exports.Sql = function () {
    return log4js.getLogger('Sql');
};

exports.LogRecorder = function () {
    return log4js.getLogger('LogRecorder');
};

exports.Master = function () {
    return log4js.getLogger('Master');
};

exports.GetModuleID = function () {
    return module.id;
};
