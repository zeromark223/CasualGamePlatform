/**
 * Created by Ngoc on 01-02-2019.
 */
var http = require('http');
var Modules = require('./Modules');
var Utility = require('../SharedModule/Utility');
var Config = require('../Config/Lobby');
function Main() {
    this.ApiListener = {};
    this.Modules = Modules;
    this.Config = Config;
    //Timer
    this.MainTime = +new Date;
    this.TimerList = [ {
        Tick: 0,
        Interval: 5000,
        Wake: this.Timer5seconds.bind(this)
    }];
    //End Timer
    //Logger
    this.LoggerConfig = this.Config.LoggerConfig;
    this.Logger = this.Modules.Logger;
}
module.exports = Main;
function requireUnCached(NameLink) {//Use to re require
    var l = module.children.length;
    for (var i = 0; i < l; i++) {
        if (module.children[i].id === require.resolve(NameLink)) {
            module.children.splice(i, 1);
            break;
        }
    }
    delete require.cache[require.resolve(NameLink)];
    return require(NameLink);
}
Main.prototype.Start = function () {
    this.Init();
};
Main.prototype.Init = function () {
    this.InitTimer();
    this.InitListener();
};
Main.prototype.InitTimer = function () {
    setTimeout(this.MainLoop.bind(this), 100);
};
Main.prototype.InitListener = function () {
    this.ApiListener = http.createServer(this.HandleApiRequest.bind(this));
    this.ApiListener.listen(this.Config.ListenerConfig.BindingPort, this.Config.ListenerConfig.BindingIP)
};
/**
*  Timer Begin
**/
Main.prototype.MainLoop = function () {
    var local = new Date();
    var difTime = (local - this.MainTime);
    this.MainTime = local;
    for (var i = 0; i < this.TimerList.length; i++) {
        this.TimerList[i].Tick += difTime;
        if (this.TimerList[i].Tick > this.TimerList[i].Interval) {
            this.TimerList[i].Tick = 0;
            this.TimerList[i].Wake();
        }
    }

    setTimeout(this.MainLoop.bind(this), 100);
};
Main.prototype.Timer5seconds = function () {
    this.Logger.Default().debug('>>>>>>>>>>>>>>' );
    this.ReloadModule();
};
/**
 *  Timer End
 **/
/**
 * Reload Module Begin
 **/
Main.prototype.ReloadModule = function () {
    this.ReloadLoggerLevel();
};
Main.prototype.ReloadLoggerLevel = function () {
    try {
        var LoggerNewConfig = requireUnCached('../Config/Common/LoggerConfig.js');//Không gán trực tiếp, gán giáng tiếp để tránh bị lổi
        var LogLevel = LoggerNewConfig.LogLevel;
        this.Logger.setLogLevel(LogLevel);
    } catch (e) {
        this.Logger.Default().error('Main.prototype.ForceReloadConfigStock - try err: ' + e.stack);
    }
};
/**
 * Reload Module End
 **/
/**
 * Request Handle
**/
Main.prototype.HandleApiRequest = function (request, response) {
    try {

    } catch (e) {
        this.Logger.Default().error('Main.prototype.HandleApiRequest - try err: ' + e.stack);
        request.end();
    }
};
/*
 * Room
 */
Main.prototype.RoomOnStart = function () {

};
Main.prototype.RoomOnUpdate = function () {

};
Main.prototype.RoomOnUserEnter = function () {

};
Main.prototype.RoomOnUserExit = function () {

};
Main.prototype.RoomOnUserDisconnect = function () {

};
Main.prototype.RoomOnUserReconnect = function () {

};
Main.prototype.RoomFind = function () {

};

