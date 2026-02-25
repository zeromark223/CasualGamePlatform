/**
 * Created by ngocnpt on 10/06/2016.
 */

var MasterID = 0;
var redis = require("redis"),
    SubChannel = 0,PubChannel = 0;
var Config;
var HandleMessage = function(){/*TODO : Handler not init*/};
exports.Init = function(masterID, cfg,Handler) {

    MasterID = masterID;
    Config = cfg;
    HandleMessage=Handler;
    ConnectRedis();
};
exports.Publish2Room = function(data){
    Publish(Config.Master.RoomManager.Publisher,JSON.stringify(data));
};

function Publish(channel,message){
    //console.log("C: "+channel + " >> "+message);
    PubChannel.publish(channel,message);
}
function Subcribe(channel){
    SubChannel.subscribe(channel);
}
function UnSubcribe(channel){
    SubChannel.unsubscribe(channel);
}
function ConnectRedis(){


    SubChannel = redis.createClient({
        host:Config.Host,
        port:Config.Port,
        password:Config.Password,
        db:Config.DB
    });
    PubChannel = redis.createClient({
        host:Config.Host,
        port:Config.Port,
        password:Config.Password,
        db:Config.DB
    });
    SubChannel.on("connect", function () {
        InitChannelSubcribe();
        console.log("Redis is ready");
    }.bind(this));
    SubChannel.on('error',HandleDisconnect);
    SubChannel.on('disconnect',HandleDisconnect);
    SubChannel.on("message", HandleMessage);
    PubChannel.on("connect", function () {
    }.bind(this));
    PubChannel.on('error',HandleDisconnect);
    PubChannel.on('disconnect',HandleDisconnect);

}
function HandleDisconnect(err) {
   // Be carefull.
}
function InitChannelSubcribe(){
    Subcribe(Config.Master.RoomManager.Subcriber+MasterID);
    Subcribe(Config.Master.Main.Subcriber+MasterID);
}
