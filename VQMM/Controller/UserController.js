var Packet = require('../Packet');
var DefinePacket = require('../Packet/Define');
var BinaryLib = require('../../SharedModule/Binary');
var Utility = require('../../SharedModule/Utility');
module.exports = function (UserController) {
    UserController.prototype.HandleRequestExtend = function (packetId, message) {
        var ParseInfo;
        var CheckLimitPacket = this.CheckLimitPacket();

        if(!CheckLimitPacket){
            return;
        }

        //console.log(">>>>>>>>>>>>>>>>>>");
        console.log("PacketID", packetId);
        //console.log("message", message);
        //console.log("<<<<<<<<<<<<<<<<<<");

        switch (packetId) {
            case DefinePacket.LoginGame:
                break;

            case DefinePacket.GetRoomConfig:
                try {
                    this.GetRoomConfig();
                }
                catch (e) {
                    this.GameServer.Logger.Game().error('UserController GetRoomConfig - try err: ' + e.stack);
                }
                break;

            case DefinePacket.UserSpin:
                try {
                    this.OnUserSpin();
                }
                catch (e) {
                    this.GameServer.Logger.Game().error('UserController UserBet - try err: ' + e.stack);
                }
                break;

            case DefinePacket.UserHistory:
                try{
                    this.OnUserGetHistory();
                }
                catch(e){
                    this.GameServer.Logger.Game().error('UserController UserHistory - try err: ' + e.stack);
                }
                break;

            case DefinePacket.TopUserWin:
                try{
                    this.OnUserGetTopUserWin();
                }
                catch(e){
                    this.GameServer.Logger.Game().error('UserController UserHistory - try err: ' + e.stack);
                }
                break;

            default:
                break;
        }
    };

    UserController.prototype.GetRoomConfig = function () {
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            this.Socket.UserModel.MyDesk.GetRoomConfig(this.Socket);
        } else {
            this.GameServer.Logger.Game().error('UserController.prototype.GetRoomConfig CheckParam Fail ');
        }
    };

    UserController.prototype.OnUserSpin = function(){
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            this.Socket.UserModel.MyDesk.OnUserSpin(this.Socket);
        } else {
            this.GameServer.Logger.Game().error('UserController.prototype.OnUserBet CheckParam Fail ');
        }
    };

    UserController.prototype.OnUserGetHistory = function(){
        if(Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            this.Socket.UserModel.MyDesk.UserGetUserHistory(this.Socket.UserModel);
        }
        else{
            this.GameServer.Logger.Game().error('UserController.prototype.OnUserGetHistory CheckParam Fail ');
        }
    };

    UserController.prototype.OnUserGetTopUserWin = function(){
        if(Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            this.Socket.UserModel.MyDesk.UserGetTopUserWin(this.Socket.UserModel);
        }
        else{
            this.GameServer.Logger.Game().error('UserController.prototype.OnUserGetHistory CheckParam Fail ');
        }
    };

    UserController.prototype.CheckLimitPacket = function(){
        var now = +new Date();
        if(now - this.Socket.UserModel.LimitTimeStamp >= this.Socket.UserModel.LimitTime){
            this.Socket.UserModel.LimitTimeStamp = now;
            this.Socket.UserModel.PacketSent = 0;
            return 1;
        }

        if(this.Socket.UserModel.PacketSent >= this.Socket.UserModel.LimitPacket){
            return 0;
        }

        this.Socket.UserModel.PacketSent++;
        return 1;
    }
};


