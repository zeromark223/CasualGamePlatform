var Packet = require('../Packet');
var DefinePacket = require('../Packet/Define');
var BinaryLib = require('../../SharedModule/Binary');
var Utility = require('../../SharedModule/Utility');
module.exports = function (UserController) {
    UserController.prototype.HandleRequestExtend = function (packetId, message) {
        var ParseInfo;

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
                    ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.UserSpin
                    );
                    this.OnUserSpin(ParseInfo.GoldBet);
                }
                catch (e) {
                    this.GameServer.Logger.Game().error('UserController UserSpin - try err: ' + e.stack);
                }
                break;
            case DefinePacket.UserSpinDebug:
                try {
                    ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.UserSpinDebug
                    );
                    this.OnUserSpinDebug(ParseInfo.GoldBet, ParseInfo.CardsList);
                }
                catch (e) {
                    this.GameServer.Logger.Game().error('UserController UserSpinDebug - try err: ' + e.stack);
                }
                break;

            case DefinePacket.UserHistory:
                try {
                    this.OnUserGetHistory();
                }
                catch (e) {
                    this.GameServer.Logger.Game().error('UserController UserHistory - try err: ' + e.stack);
                }
                break;

            case DefinePacket.TopUserWin:
                try {
                    this.OnUserGetTopUserWin();
                }
                catch (e) {
                    this.GameServer.Logger.Game().error('UserController TopUserWin - try err: ' + e.stack);
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

    UserController.prototype.OnUserSpin = function (GoldBet) {
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            this.Socket.UserModel.MyDesk.OnUserSpin(this.Socket.UserModel, GoldBet);
        } else {
            this.GameServer.Logger.Game().error('UserController.prototype.OnUserBet CheckParam Fail ');
        }
    };

    UserController.prototype.OnUserSpinDebug = function (GoldBet, CardsList) {
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            this.Socket.UserModel.MyDesk.OnUserSpinDebug(this.Socket.UserModel, GoldBet, CardsList);
        } else {
            this.GameServer.Logger.Game().error('UserController.prototype.OnUserBet CheckParam Fail ');
        }
    };

    UserController.prototype.OnUserGetHistory = function () {
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            this.Socket.UserModel.MyDesk.UserGetUserHistory(this.Socket.UserModel);
        }
        else {
            this.GameServer.Logger.Game().error('UserController.prototype.OnUserGetHistory CheckParam Fail ');
        }
    };

    UserController.prototype.OnUserGetTopUserWin = function () {
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            this.Socket.UserModel.MyDesk.UserGetTopUserWin(this.Socket.UserModel);
        }
        else {
            this.GameServer.Logger.Game().error('UserController.prototype.OnUserGetHistory CheckParam Fail ');
        }
    };

};


