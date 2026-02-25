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
        if (message.length < 4) {
            return
        }

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
            case DefinePacket.JackpotChangeType:
                try {
                    ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.JackpotChangeType
                    );
                    if (ParseInfo.TotalBet) {
                        this.OnUserJackpotChangeType(ParseInfo.TotalBet);
                    } else {
                        this.GameServer.Logger.Game().error('UserController JackpotChangeType ParseInfo', ParseInfo);
                    }
                }
                catch (e) {
                    this.GameServer.Logger.Game().error('UserController JackpotChangeType - try err: ' + e.stack);
                }
                break;
            default:
                this.HandleRequestExtend(packetId, message);
                break;
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('UserController.prototype.HandleMessage - try err: ' + e.stack);
    }
};

UserController.prototype.HandleRequestExtend = function (packetId, message) { // Thang nay se bi override khi extend no load.
};

UserController.prototype.OnUserLoginGameServer = function (isError, socket, Info) {
    this.GameServer.UserLoginGameServer(isError, socket, Info);
};

UserController.prototype.OnUserJackpotChangeType = function (TotalBet) {
    if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
        this.Socket.UserModel.JackpotCurrentID = TotalBet;
        this.GameServer.UpdateJackpotOnUserChangeType(this.Socket, TotalBet);
    }
    else {
        this.GameServer.Logger.Game().error('UserController.prototype.OnUserJackpotChangeType CheckParam Fail ');
    }
};