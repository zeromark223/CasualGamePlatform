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

            case DefinePacket.MatchHistory:
                try {
                    this.OnUserGetMatchHistory();
                } catch (e) {
                    this.GameServer.Logger.Game().error('UserController MatchHistory - try err: ' + e.stack);
                }
                break;

            case DefinePacket.UserHistory:
                try {
                    ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.UserHistoryInfo
                    );
                    this.OnUserGetHistory(ParseInfo);
                } catch (e) {
                    this.GameServer.Logger.Game().error('UserController UserHistory - try err: ' + e.stack);
                }
                break;

            case DefinePacket.TopUserWin:
                try {
                    ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.TopUserWinInfo
                    );
                    this.OnUserGetTopUserWin(ParseInfo);
                } catch (e) {
                    this.GameServer.Logger.Game().error('UserController TopUserWin - try err: ' + e.stack);
                }
                break;

            case DefinePacket.TopUserWinAllMode:
                try {
                    this.OnUserGetTopUserWinAllMode();
                } catch (e) {
                    this.GameServer.Logger.Game().error('UserController TopUserWinAllMode - try err: ' + e.stack);
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
                    this.GameServer.Logger.Game().error('UserController GetListUser - try err: ' + e.stack);
                }
                break;
            case DefinePacket.UserEnterGame:
                try {
                    ParseInfo = new BinaryLib.BinaryParser(
                        message,
                        Packet.Struct.UserEnterGameRequest
                    );

                    this.OnUserEnterGame(ParseInfo);
                } catch (e) {
                    this.GameServer.Logger.Game().error('UserController UserEnterGame - try err: ' + e.stack);
                }
                break;
            case DefinePacket.LeaveRoom:
                try {
                    this.OnUserLeaveGame();
                } catch (e) {
                    this.GameServer.Logger.Game().error('UserController LeaveRoom - try err: ' + e.stack);
                }
                break;
            case DefinePacket.PlayNow:
                try {
                    this.OnUserPlayNow();
                } catch (e) {
                    this.GameServer.Logger.Game().error('UserController PlayNow - try err: ' + e.stack);
                }
                break;
            default:
                break;
        }
    };

    UserController.prototype.GetRoomConfig = function () {
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            this.GameServer.GetRoomConfig(this.Socket);
        } else {
            this.GameServer.Logger.Game().error('UserController.prototype.GetRoomConfig CheckParam Fail ');
        }
    };

    UserController.prototype.OnUserGetMatchHistory = function () {
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            this.Socket.UserModel.MyDesk.UserGetMatchHistory(this.Socket);
        } else {
            this.GameServer.Logger.Game().error('UserController.prototype.OnUserGetMatchHistory CheckParam Fail ');
        }
    };

    UserController.prototype.OnUserGetHistory = function (UserHistoryInfo) {
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            this.Socket.UserModel.MyDesk.UserGetUserHistory(this.Socket.UserModel, UserHistoryInfo);
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

    UserController.prototype.OnUserGetTopUserWin = function (TopUserWinInfo) {
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            this.GameServer.Logger.Game().info('UserController.prototype.OnUserGetTopUserWin', TopUserWinInfo);
            this.GameServer.OnUserGetTopWin(this.Socket.UserModel, TopUserWinInfo.GameMode);
        } else {
            this.GameServer.Logger.Game().error('UserController.prototype.OnUserGetTopUserWin CheckParam Fail ');

        }

    };

    UserController.prototype.OnUserGetTopUserWinAllMode = function () {
        // if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
        //     this.GameServer.OnUserGetTopWinAllMode(this.Socket.UserModel);
        // } else {
        //     this.GameServer.Logger.Game().error('UserController.prototype.OnUserGetTopUserWinAllMode CheckParam Fail ');
        // }
        this.GameServer.OnUserGetTopWinAllMode(this.Socket.UserModel);
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

    UserController.prototype.OnUserEnterGame = function (UserEnterGameRequest) {
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            var oDesk = this.Socket.UserModel.MyDesk;
            if (oDesk.IsLobby()) {
                oDesk.OnUserEnterGame(this.Socket, UserEnterGameRequest);
            }
        } else {
            this.GameServer.Logger.Game().error('UserController.prototype.OnUserEnterGame CheckParam Fail ');
        }
    };
    UserController.prototype.OnUserLeaveGame = function () {
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            var oDesk = this.Socket.UserModel.MyDesk;
            oDesk.OnUserLeaveGame(this.Socket);
        } else {
            this.GameServer.Logger.Game().error('UserController.prototype.OnUserLeaveGame CheckParam Fail ');
        }
    };
    UserController.prototype.OnUserPlayNow = function () {
        if (Utility.CheckVariable(this.Socket.UserModel, 'MyDesk') && this.Socket.UserModel.MyDesk != 0) {
            this.GameServer.OnUserPlayNow(this.Socket);
        } else {
            this.GameServer.Logger.Game().error('UserController.prototype.OnUserLeaveGame CheckParam Fail ');
        }
    };
};


