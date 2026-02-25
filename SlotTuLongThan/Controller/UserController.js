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
            case DefinePacket.UserStartRoll:
                try {
                    ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.UserStartRoll
                    );
                    this.OnUserStartRoll(ParseInfo.TotalBet, ParseInfo.IsFreeSpin);

                } catch (e) {
                    this.GameServer.Logger.Game().error('UserStartRoll - try err: ' + e.stack);
                }
                break;
            case DefinePacket.BonusMiniGamePick:
                try {
                    this.OnUserPickBonusMiniGame();
                } catch (e) {
                    this.GameServer.Logger.Game().error('BonusMiniGamePick - try err: ' + e.stack);
                }
                break;
            case DefinePacket.UserStartRollByClientReel:
                try {
                    ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.UserStartRollByClientReel
                    );
                    this.OnUserStartRollByClientReel(ParseInfo.TotalBet, ParseInfo.IsFreeSpin, ParseInfo.Reel);
                } catch (e) {
                    this.GameServer.Logger.Game().error('BonusMiniGamePick - try err: ' + e.stack);
                }
                break;
            case DefinePacket.TopUserWin:
                try {
                    this.OnHandleRequest_TopUserWin();
                } catch (e) {
                    this.GameServer.Logger.Game().error('TopUserWin - try err: ' + e.stack);
                }
                break;
            case DefinePacket.RollHistory:
                try {
                    this.OnHandleRequest_RollHistory();
                } catch (e) {
                    this.GameServer.Logger.Game().error('RollHistory - try err: ' + e.stack);
                }
                break;
            case DefinePacket.JackpotChangeType:
                try {
                    ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.JackpotChangeType
                    );
                    this.OnHandleRequest_JackpotChangeType(ParseInfo.TotalBet);
                } catch (e) {
                    this.GameServer.Logger.Game().error('JackpotChangeType - try err: ' + e.stack);
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

UserController.prototype.OnUserStartRoll = function (TotalBet, IsFreeSpin) {
    if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
        this.Socket.UserModel.MyDesk.OnUserStartRoll(this.Socket.UserModel, TotalBet, IsFreeSpin);
    } else {
        this.GameServer.Logger.Game().error('UserController.prototype.OnUserStartRoll CheckParam Fail ');

    }
};

UserController.prototype.OnUserPickBonusMiniGame = function () {
    if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
        this.Socket.UserModel.MyDesk.OnUserPickBonusMiniGame(this.Socket.UserModel);
    } else {
        this.GameServer.Logger.Game().error('UserController.prototype.OnUserStartRoll CheckParam Fail ');

    }
};

UserController.prototype.OnUserStartRollByClientReel = function (TotalBet, IsFreeSpin, Reel) {
    if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
        this.Socket.UserModel.MyDesk.OnUserStartRollByReel(this.Socket.UserModel, TotalBet, IsFreeSpin, Reel);
    } else {
        this.GameServer.Logger.Game().error('UserController.prototype.OnUserStartRoll CheckParam Fail ');

    }
};

UserController.prototype.OnHandleRequest_TopUserWin = function () {
    if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
        this.Socket.UserModel.MyDesk.OnUserGetTopWin(this.Socket.UserModel);
    } else {
        this.GameServer.Logger.Game().error('UserController.prototype.OnHandleRequest_TopUserWin CheckParam Fail ');

    }

};

UserController.prototype.OnHandleRequest_RollHistory = function () {
    if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
        this.Socket.UserModel.MyDesk.OnUserGetHistory(this.Socket.UserModel);
    } else {
        this.GameServer.Logger.Game().error('UserController.prototype.OnHandleRequest_RollHistory CheckParam Fail ');

    }

};

UserController.prototype.OnHandleRequest_JackpotChangeType = function (TotalBet) {
    this.Socket.UserModel.JackpotCurrentID = TotalBet;
    this.GameServer.JackpotUpdateByID(this.Socket, TotalBet);
};