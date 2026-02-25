var Packet = require('../Packet');
var DefinePacket = require('../Packet/Define');
var Config = require('../../Config/GameConfig');
var Encryption = require('../../SharedModule/encrytion');
var BinaryLib = require('../../SharedModule/Binary');
var Utility = require('../../SharedModule/Utility');
var fs = require('fs');

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
        switch (packetId) {
            case DefinePacket.LoginGame:
                try {
                    var ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.LoginGameInfo
                    );
                    if (Utility.CheckVariable(ParseInfo, 'Token')) {
                        var Info = Encryption.aesDecryptIV(ParseInfo.Token, this.GameServer.Config.KeyConfig.RoomKey, this.GameServer.Config.KeyConfig.RoomIV); // Giải mã thông tin chứng thực.
                        Info = JSON.parse(Info);
                        this.UserLoginGameServer(0, this.Socket, Info);
                    } else {
                        this.UserLoginGameServer(0, this.Socket, 'invaid data ' + ParseInfo);
                    }

                } catch (e) {
                    this.UserLoginGameServer(0, this.Socket, "Catch Error " + e.stack);
                    this.GameServer.Logger.Game().error('LoginGame - try err: ' + e.stack);
                }
                break;

            case DefinePacket.UserFire:
                var ParseInfo = new BinaryLib.BinaryParser(
                    message,
                    Packet.Struct.UserFireInfo
                );
                this.OnUserFire(this.Socket.UserModel, ParseInfo.PosX, ParseInfo.PosY, ParseInfo.BulletMultiple, ParseInfo.BulletID, ParseInfo.LockedFishID);
                break;

            case DefinePacket.FireSkill:
                var parse = new BinaryLib.BinaryParser(message, Packet.Struct.FireSkillRequest);
                this.OnUserFireSkill(this.Socket.UserModel, parse.Angle, parse.x, parse.y);
                break;

            case DefinePacket.SkillCatchFish:
                var parse = new BinaryLib.BinaryParser(message, Packet.Struct.SkillCatchFish);
                this.OnUseSkillCatchFish(this.Socket.UserModel, parse.BulletID, parse.SkillID, parse.ListFish);
                break;

            case DefinePacket.CatchFish:
                var ParseInfo = new BinaryLib.BinaryParser(
                    message,
                    Packet.Struct.CatchFishInfo
                );
                this.OnCatchFish(this.Socket.UserModel, ParseInfo.FishID, ParseInfo.BulletMultiple);
                break;
            case DefinePacket.UserLeft:
                this.UserLeft(this.Socket);
                break;
            case DefinePacket.CatchRedFish:
                var info = new BinaryLib.BinaryParser(
                    message,
                    Packet.Struct.CatchRedFishInfo
                );
                this.OnCatchRedFish(info.FishID, info.FishIDArray, info.BulletMultiple);
                break;
            case DefinePacket.PingPong:
                this.UserPingPong(this.Socket);
                break;
            case DefinePacket.OnUserChat:
                var info = new BinaryLib.BinaryParser(
                    message,
                    Packet.Struct.OnUserChatInfo
                );
                this.OnUserChat(info);
                break;
            case DefinePacket.GetRoomConfig:
                this.OnGetRoomConfig();
                break;
            case DefinePacket.CatchBoss:
                var info = new BinaryLib.BinaryParser(
                    message,
                    Packet.Struct.CatchBossInfo
                );
                this.OnCatchBoss(info);
                break;
            default:
                break;
        }
    }
    catch (e) {
        this.GameServer.Logger.Game().error('UserController.prototype.HandleMessage - try err: ' + e.stack);
    }
};


UserController.prototype.OnUserFire = function (User, PosX, PosY, BulletMultiple, BulletID, LockedFishID) {
    try {
        //Chặn các loại đạn ko cho phép bắn
        if (BulletMultiple < this.GameServer.GunConfig.Gun.GunMultiple.Min) return;
        if (BulletMultiple > this.GameServer.GunConfig.Gun.GunMultiple.Max) return;
        User.MyDesk.OnUserFire(User.Socket, PosX, PosY, BulletMultiple, BulletID, LockedFishID);
    } catch (e) {
        this.GameServer.Logger.Game().error('UserController.prototype.OnUserFire - try err: ' + e);
    }
};

UserController.prototype.OnUserFireSkill = function (userModel, angle, x, y) {
    try {
        userModel.MyDesk.OnUserFireSkill(userModel.Socket, angle, x, y);
    } catch (e) {
        this.GameServer.Logger.Game().error('UserController.prototype.OnUserFireSkill - try err: ' + e.stack);
    }
};

UserController.prototype.OnUseSkillCatchFish = function (userModel, bulletID, skillID, listFish) {
    try {
        userModel.MyDesk.OnUseSkillCatchFish(userModel.Socket, bulletID, skillID, listFish);
    } catch (e) {
        this.GameServer.Logger.Game().error('UserController.prototype.OnUseSkillCatchFish - try err: ' + e.stack);
    }
};

UserController.prototype.UserLoginGameServer = function (isError, socket, Info) {
    this.GameServer.UserLoginGameServer(isError,socket, Info);
};

UserController.prototype.OnCatchFish = function (User, FishID, BulletMultiple) {
    User.MyDesk.OnCatchFish(User, FishID, BulletMultiple);
};

UserController.prototype.UserLeft = function (socket) {
    socket.UserModel.MyDesk.UpdateUserLeftDesk(socket);
};

UserController.prototype.OnCatchRedFish = function (fishID, FishIDArray, BulletMultiple) {
    this.Socket.UserModel.MyDesk.OnCatchRedFish(this.Socket.UserModel, fishID, FishIDArray, BulletMultiple);
};

UserController.prototype.UserPingPong = function (socket) {
    try {
        this.GameServer.UserPingPong(socket);
    } catch (e) {
        this.GameServer.Logger.Game().error('UserController.prototype.OnUseSkillCatchFish - try err: ' + e.stack);
    }
};

UserController.prototype.OnUserChat = function (info) {
    try {
        this.Socket.UserModel.MyDesk.OnUserChat(this.Socket.UserModel,info);
    } catch (e) {
        this.GameServer.Logger.Game().error('UserController.prototype.OnUserChat - try err: ' + e.stack);
    }
};

UserController.prototype.OnGetRoomConfig = function () {
    try {
        this.GameServer.SendGameConfigForUser(this.Socket);
    } catch (e) {
        this.GameServer.Logger.Game().error('UserController.prototype.OnUserGetListGun - try err: ' + e.stack);
    }
};

UserController.prototype.OnCatchBoss = function (info) {
    try {
        if (Utility.CheckVariable(info, 'FishID', 'BulletMultiple')) {
            this.Socket.UserModel.MyDesk.OnUserCatchBoss(this.Socket.UserModel, info.FishID, info.BulletMultiple);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('UserController.prototype.OnCatchBoss - try err: ' + e.stack);
    }
};