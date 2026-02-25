/**
 * Created by ngocnpt on 02/06/2016.
 */
/**
 * Created by ngocnpt on 09/05/2016.
 */

var MQLib = require('amqplib/callback_api'); // RabbitMQ
var RabbitConnection ;
var RabbitChannel = {};
var Config;
exports.InitRabbitMQ = function(MasterID,cfg,Handler, Logger) {
    Config=cfg;
    MQLib.connect(Config.Host, function(err, conn) {
        if (!err){
            Logger.info("InitRabbitMQ Completed");
            RabbitConnection = conn;
            //Tạo Kênh nhận lệnh của Master
            RabbitConnection.createChannel(function(e,ch){
                if(!e){
                    RabbitChannel=ch;
                    ch.assertExchange(cfg.Exchange, 'topic');
                    ch.assertQueue('', {exclusive: true}, function(err, q) {
                        ch.bindQueue(q.queue, cfg.Exchange, cfg.Queue);
                        ch.consume(q.queue, Handler,{noAck: true});
                    });
                    ch.on('error',Logger.error);

                }
                else
                {
                    Logger.error("InitRabbitMQ Init Error 4");
                    //Error
                    // TODO: Add Log
                }
            });
        }else{
            //Error
            Logger.error("InitRabbitMQ Init Error 1");
            // TODO: Add Log
        }
    });

};

exports.UserJoinGame = function(UserID,IP,Port,IsWebSocket,GameID, isMobile, LoginTime){
    var msgStr = UserID+"|"+IP+":"+Port+"|"+IsWebSocket+"|"+GameID+"|"+isMobile+"|"+LoginTime;
    RabbitChannel.publish(Config.Exchange,Config.Queue,new Buffer(msgStr));
};

exports.Channel = RabbitChannel;