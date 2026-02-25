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
                } catch (e) {
                    this.GameServer.Logger.Game().error('UserController GetRoomConfig - try err: ' + e.stack);
                }
                break;

            case DefinePacket.UserBet:
                try {
                    ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.UserBetInfo
                    );

                    this.OnUserBet(ParseInfo);
                } catch (e) {
                    this.GameServer.Logger.Game().error('UserController UserBet - try err: ' + e.stack);
                }
                break;

            case DefinePacket.MatchHistory:
                try {
                    this.OnUserGetMatchHistory();
                } catch (e) {
                    this.GameServer.Logger.Game().error('UserController MatchHistory - try err: ' + e.stack);
                }
                break;

            case DefinePacket.UserHistory:
                try {
                    this.OnUserGetHistory();
                } catch (e) {
                    this.GameServer.Logger.Game().error('UserController UserHistory - try err: ' + e.stack);
                }
                break;

            case DefinePacket.TopUserWin:
                try {
                    this.OnHandleRequest_TopUserWin();
                } catch (e) {
                    this.GameServer.Logger.Game().error('UserController UserHistory - try err: ' + e.stack);
                }
                break;
            case DefinePacket.GameChat:
                try {
                    ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.GameChat
                    );
                    this.OnHandleRequest_GameChat(ParseInfo);
                } catch (e) {
                    this.GameServer.Logger.Game().error('UserController UserHistory - try err: ' + e.stack);
                }
                break;
            case DefinePacket.GetListUser:
                try {

                    this.OnHandleRequest_GetListUser();
                } catch (e) {
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

    UserController.prototype.OnUserBet = function (ParseInfo) {
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            var BetList = ParseInfo.BetList;

            this.Socket.UserModel.MyDesk.UserBet(this.Socket, BetList);
        } else {
            this.GameServer.Logger.Game().error('UserController.prototype.OnUserBet CheckParam Fail ');
        }
    };

    UserController.prototype.OnUserGetMatchHistory = function () {
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            this.Socket.UserModel.MyDesk.UserGetMatchHistory(this.Socket);
        } else {
            this.GameServer.Logger.Game().error('UserController.prototype.OnUserGetMatchHistory CheckParam Fail ');
        }
    };

    UserController.prototype.OnUserGetHistory = function () {
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            this.Socket.UserModel.MyDesk.UserGetUserHistory(this.Socket.UserModel);
        } else {
            this.GameServer.Logger.Game().error('UserController.prototype.OnUserGetHistory CheckParam Fail ');
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
    };

    UserController.prototype.OnHandleRequest_GameChat = function (ParseInfo) {
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0 && Utility.CheckVariable(ParseInfo, 'Msg')) {
            this.Socket.UserModel.MyDesk.OnUserGameChat(this.Socket.UserModel, ParseInfo.Msg);
        } else {
            this.GameServer.Logger.Game().error('UserController.prototype.OnHandleRequest_GameChat CheckParam Fail ');

        }
    };
    UserController.prototype.OnHandleRequest_GetListUser = function () {
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            this.Socket.UserModel.MyDesk.OnUserGetListUser(this.Socket.UserModel);
        } else {
            this.GameServer.Logger.Game().error('UserController.prototype.OnHandleRequest_GetListUser CheckParam Fail ');
        }
    };
};


