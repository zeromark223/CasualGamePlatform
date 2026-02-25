/**
 * Created by ngocnpt on 09/05/2016.
 */
var MasterID = 0;
var MQLib = require('amqplib/callback_api'); // RabbitMQ
var RabbitConnection ;
var Config;
var PublishChannel;// Channel dùng để gửi
var sentCount =0;
var revCount =0;
var sentTotal=0;
var revTotal=0;
exports.InitRabbitMQ = function(masterID,cfg,Master) {


    MasterID = masterID;
    Config=cfg;
    MQLib.connect(Config.Host, function(err, conn) {

        if (!err){

            RabbitConnection = conn;
            //Tạo Kênh nhận lệnh
            RabbitConnection.createChannel(function(e,ch){
                if(!e){

                    //Hàm nhận lệnh của GameServer
                    ch.assertQueue(Config.Master.Main.Consumer+MasterID);
                    ch.consume(Config.Master.Main.Consumer+MasterID, function(msg) {
                        if (msg != null) {

                            Master.OnRabbitMQConsumer(Config.Master.Main.Consumer,msg.content);
                            ch.ack(msg);
                        }

                    });
                    ch.on('error',console.log)


                }
                else
                {
                    console.log("InitRabbitMQ Init Error 4");
                    //Error
                    // TODO: Add Log
                }
            });

            RabbitConnection.createChannel(function(e,ch){
                if(!e){
                    //Hàm nhận lệnh của RoomManager
                    ch.assertQueue(Config.Master.RoomManager.Consumer+MasterID);
                    ch.consume(Config.Master.RoomManager.Consumer+MasterID, function(msg) {
                        if (msg != null) {

                            Master.OnRabbitMQConsumer(Config.Master.RoomManager.Consumer,msg.content);
                            ch.ack(msg);
                        }

                    });
                    ch.on('error',console.log)

                }
                else
                {
                    console.log("InitRabbitMQ Init Error 4");
                    //Error
                    // TODO: Add Log
                }
            });
            //Tạo Kệnh Gửi lệnh
            RabbitConnection.createChannel(function(e,ch){
                if(!e){
                    ch.deliveryMode = 1;
                    PublishChannel=ch;
                }
                else
                {
                    //Error
                    console.log("InitRabbitMQ Init Error 2");
                    // TODO: Add Log
                }
            });
        }else{
            //Error
            console.log("InitRabbitMQ Init Error 1");
            // TODO: Add Log
        }
    });
};



exports.Publish2Master = function(MID,Obj){
    if(typeof PublishChannel !='undefined')
    PublishChannel.sendToQueue(Config.Master.Main.Consumer+MID, new Buffer(JSON.stringify(Obj)));//Parse Dữ liệu qua JSON sau đó chuyển thành Buffer

};
exports.Publish2Room = function(Obj){
    if(typeof PublishChannel !='undefined'){
        PublishChannel.sendToQueue(Config.Master.RoomManager.Publisher, new Buffer(JSON.stringify(Obj)));//Parse Dữ liệu qua JSON sau đó chuyển thành Buffer
    }

};

exports.Calc = function(){
    return {
        sent:sentCount,
        rev:revCount,
        tsent:sentTotal,
        trev:revTotal
    };
};
exports.ResetCalc = function(){
    revCount =0;
    sentCount =0;
};