var Packet = require('../Packet');
var DefinePacket = require('../Packet/Define');
var Encryption = require('../../SharedModule/encrytion');
var BinaryLib = require('../../SharedModule/Binary');
var Utility = require('../../SharedModule/Utility');

function UserController(gameServer, socket) {
    this.GameServer = gameServer;
    this.Socket = socket;

}

module.exports = UserController;

UserController.prototype.HandleMessage = function (message) {
    try {
        if (message.length < 4) return;

        var msgSize = message.readUInt16LE(0);
        if (msgSize < 4) {
            return;
        }
        if (message.length < msgSize) {
            return;
        }
        var packetId = message.readUInt16LE(2);

        if (message.length > msgSize) {//Tách gói tin bị gộp
            this.HandleMessage(message.slice(msgSize, message.length));
        }
        message = message.slice(4, msgSize); // Cắt bỏ Header

        this.Socket.UserModel.LastActivedTime = +new Date();

        // console.log("packetId ", packetId);
        var ParseInfo;
        switch (packetId) {
            case DefinePacket.LoginGame:
                try {
                    ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.LoginGameInfo
                    );
                    if (Utility.CheckVariable(ParseInfo, 'Token')) {
                        var Info = Encryption.aesDecryptIV(ParseInfo.Token, this.GameServer.Config.KeyConfig.RoomKey, this.GameServer.Config.KeyConfig.RoomIV); // Giải mã thông tin chứng thực.
                        Info = JSON.parse(Info);
                        this.OnUserLoginGameServer(0, this.Socket, Info);
                    } else {
                        this.OnUserLoginGameServer(1, this.Socket, 'invaid data ' + ParseInfo);
                    }

                } catch (e) {
                    this.OnUserLoginGameServer(1, this.Socket, "Catch Error " + e.stack);
                    this.GameServer.Logger.Game().error('LoginGame - try err: ' + e.stack);
                }
                break;
            case DefinePacket.UserBet:
                try {
                    ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.UserBetInfo
                    );
                    if(Utility.CheckVariable(ParseInfo,'BetList')){
                        this.OnUserBet(ParseInfo.BetList);
                    }else{
                        //handle error
                    }

                } catch (e) {
                    this.GameServer.Logger.Game().error('UserBet - try err: ' + e.stack);
                }
                break;
                case DefinePacket.MatchHistory:
                try {
                    this.OnUserGetMatchHistory();

                } catch (e) {
                    this.GameServer.Logger.Game().error('MatchHistory - try err: ' + e.stack);
                }
                break;
                case DefinePacket.UserHistory:
                try {
                    this.OnUserGetUserHistory();

                } catch (e) {
                    this.GameServer.Logger.Game().error('UserHistory - try err: ' + e.stack);
                }
                break;
                case DefinePacket.TopUserWin:
                try {
                    this.OnUserGetTopUserWin();

                } catch (e) {
                    this.GameServer.Logger.Game().error('TopUserWin - try err: ' + e.stack);
                }
                break;
            case DefinePacket.GameChat:
                try {
                    ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.GameChat
                    );
                    if(Utility.CheckVariable(ParseInfo,'Msg')){
                        this.OnUserChat(ParseInfo.Msg);
                    }else{
                        //handle error
                    }

                } catch (e) {
                    this.GameServer.Logger.Game().error('GameChat - try err: ' + e.stack);
                }
                break;
                case DefinePacket.GetListUser:
                try {
                    this.OnGetListUser();
                } catch (e) {
                    this.GameServer.Logger.Game().error('GetListUser - try err: ' + e.stack);
                }
                break;

            default:
                break;
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('UserController.prototype.HandleMessage - try err: ' + e.stack);
    }
};


UserController.prototype.OnUserLoginGameServer = function (isError, socket, Info) {
    this.GameServer.UserLoginGameServer(isError, socket, Info);
};

UserController.prototype.OnUserBet = function (BetList) {
    if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
        this.Socket.UserModel.MyDesk.UserBet(this.Socket.UserModel, BetList);
    }else{
        this.GameServer.Logger.Game().error('UserController.prototype.OnUserBet CheckParam Fail ');

    }
};

UserController.prototype.OnUserGetMatchHistory = function () {
    if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
        this.Socket.UserModel.MyDesk.UserGetMatchHistory(this.Socket.UserModel);
    }else{
        this.GameServer.Logger.Game().error('UserController.prototype.OnUserBet CheckParam Fail ');
    }
};

UserController.prototype.OnUserGetUserHistory = function () {
    if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
        this.Socket.UserModel.MyDesk.UserGetUserHistory(this.Socket.UserModel);
    }else{
        this.GameServer.Logger.Game().error('UserController.prototype.OnUserGetUserHistory CheckParam Fail ');
    }
};

UserController.prototype.OnUserGetTopUserWin = function () {
    if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
        this.Socket.UserModel.MyDesk.UserGetTopUserWin(this.Socket.UserModel);
    }else{
        this.GameServer.Logger.Game().error('UserController.prototype.OnUserGetTopUserWin CheckParam Fail ');
    }
};

UserController.prototype.OnUserChat = function (Msg) {
    if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
        this.Socket.UserModel.MyDesk.UserChatOnDesk(this.Socket.UserModel,Msg);
    }else{
        this.GameServer.Logger.Game().error('UserController.prototype.OnUserChat CheckParam Fail ');
    }
};

UserController.prototype.OnGetListUser = function () {
    if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
        this.Socket.UserModel.MyDesk.GetListUserOnDesk(this.Socket.UserModel);
    }else{
        this.GameServer.Logger.Game().error('UserController.prototype.OnGetListUser CheckParam Fail ');
    }
};