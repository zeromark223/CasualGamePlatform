/**
 * Created by ngocnpt on 10/06/2016.
 */

var ServerID = 0;
var redis = require("redis"),
    SubChannel = 0, PubChannel = 0;
var Config;
var isPubConnected = false;
var isSubConnected = false;
var HandleMessage = function () {/*TODO : Handler not init*/
};

exports.Init = function (serverID, cfg, Handler) {

    ServerID = serverID;
    Config = cfg;
    HandleMessage = Handler;
    ConnectRedis();
};

exports.getStatus = function () {
    return isPubConnected && isSubConnected;
};

exports.SendMasterCommand = function (data) {
    data.SID = ServerID;
    Publish(Config.Channel.MasterGM, JSON.stringify(data));
};

exports.SendBroadCastMasterCommand = function (data) {
    Publish(Config.Channel.MasterGM, JSON.stringify(data));
};

exports.SendGameCommand = function (data) {
    data.SID = ServerID;
    Publish(Config.Channel.GameGM, JSON.stringify(data));
};

exports.SendGameCommandAll = function (data) {
    data.SID = 0;
    Publish(Config.Channel.GameGM, JSON.stringify(data));
};

function Publish(channel, message) {

    PubChannel.publish(channel, message);
}
function Subcribe(channel) {
    SubChannel.subscribe(channel);
}
function UnSubcribe(channel) {
    SubChannel.unsubscribe(channel);
}
function ConnectRedis() {


    SubChannel = redis.createClient({
        host: Config.Host,
        port: Config.Port,
        password: Config.Password,
        db: Config.DB
    });
    PubChannel = redis.createClient({
        host: Config.Host,
        port: Config.Port,
        password: Config.Password,
        db: Config.DB
    });
    SubChannel.on("connect", function () {
        InitChannelSubcribe();
        isPubConnected = true;
    }.bind(this));
    SubChannel.on('error', HandleDisconnect);
    SubChannel.on('disconnect', HandleDisconnect);
    SubChannel.on("message", HandleMessage);
    PubChannel.on("connect", function () {
        isSubConnected = true;
    }.bind(this));
    PubChannel.on('error', HandleDisconnect);
    PubChannel.on('disconnect', HandleDisconnect);

}
function HandleDisconnect(err) {
    // Be carefull.
}
function InitChannelSubcribe() {
    Subcribe(Config.Channel.GameGM);

}

