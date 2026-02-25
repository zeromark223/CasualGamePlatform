var Packet = require('../Packet');
var DefinePacket = require('../Packet/Define');
var BinaryLib = require('../../SharedModule/Binary');
var Utility = require('../../SharedModule/Utility');
module.exports = function (UserController) {
    UserController.prototype.HandleRequestExtend = function (packetId, message) {
        var ParseInfo;

        //console.log(">>>>>>>>>>>>>>>>>>");
        //console.log("TLMN PacketID", packetId);
        //console.log("message", message);

        switch (packetId) {
            case DefinePacket.LoginGame:
                break;

            case DefinePacket.GetRoomList:
                try {
                    this.GetRoomList();
                }
                catch (e) {
                    this.GameServer.Logger.Game().error('UserController GetRoomList - try err: ' + e.stack);
                }
                break;

            case DefinePacket.JoinRoom:
                try{
                    ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.JoinRoomInfo
                    );

                    this.JoinRoom(ParseInfo);
                }
                catch(e){
                    this.GameServer.Logger.Game().error('UserController JoinRoom - try err: ' + e.stack);
                }

                break;

            case DefinePacket.GiveCard:
                try{
                    ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.GiveCardInfo
                    );
                    this.GiveCard(ParseInfo);
                }
                catch(e){
                    this.GameServer.Logger.Game().error('UserController GiveCard - try err: ' + e.stack);
                }
                break;

            case DefinePacket.UserChat:
                try{
                    ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.UserChatInfo
                    );
                    this.OnUserChat(ParseInfo);
                }
                catch(e){
                    this.GameServer.Logger.Game().error('UserController UserChat - try err: ' + e.stack);
                }

                break;

            case DefinePacket.SignToQuit:
                try{
                    this.SignToQuit();
                }
                catch(e){
                    this.GameServer.Logger.Game().error('UserController SignToQuit - try err: ' + e.stack);
                }
                break;

            case DefinePacket.GetGameState:
                try{
                    this.GetGameState();
                }
                catch(e){
                    this.GameServer.Logger.Game().error('UserController GetGameState - try err: ' + e.stack);
                }
                break;

            case DefinePacket.GeneralChat:
                try{
                    ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.GeneralChatInfo
                    );
                    this.GeneralChat(ParseInfo);
                }
                catch(e){
                    this.GameServer.Logger.Game().error('UserController GeneralChat - try err: ' + e.stack);
                }
                break;

            default:
                break;
        }
    };

    UserController.prototype.GetRoomList = function () {
        this.GameServer.GetRoomList(this.Socket);
    };

    UserController.prototype.JoinRoom = function (ParseInfo) {
        var RoomKind = ParseInfo.RoomKind;
        this.GameServer.UserJoinRoom(this.Socket, RoomKind);
    };

    UserController.prototype.GiveCard = function(ParseInfo){
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            var Cards = ParseInfo.Cards;
            var Action = ParseInfo.Action;
            this.Socket.UserModel.MyDesk.GiveCard(this.Socket, Action, Cards);
        }
        else{
            this.GameServer.Logger.Game().error('UserController.prototype.GiveCard CheckParam Fail ');
        }
    };

    UserController.prototype.OnUserChat = function(ParseInfo){
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            var Message = ParseInfo.Message;

            this.Socket.UserModel.MyDesk.OnUserChat(this.Socket, Message);
        } else {
            this.GameServer.Logger.Game().error('UserController.prototype.OnUserChat CheckParam Fail ');
        }
    };

    UserController.prototype.SignToQuit = function(){
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            this.Socket.UserModel.MyDesk.SignToQuit(this.Socket);
        } else {
            this.GameServer.Logger.Game().error('UserController.prototype.SignToQuit CheckParam Fail ');
        }
    };

    UserController.prototype.GetGameState = function(){
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            this.Socket.UserModel.MyDesk.GetGameState(this.Socket);
        } else {
            this.GameServer.Logger.Game().error('UserController.prototype.GetGameState CheckParam Fail ');
        }
    };

    UserController.prototype.GeneralChat = function(ParseInfo){
        var Message = ParseInfo.Message;
        this.GameServer.GeneralChat(this.Socket, Message);
    };
};


