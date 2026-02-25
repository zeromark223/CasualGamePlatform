var BinaryLib = require('../../SharedModule/Binary');
var Packet = require('../Packet');
var DefinePacket = Packet.Define;
var Utility = require('../../SharedModule/Utility');
var Encryption = require('../../SharedModule/encrytion');

function UserController(master, socket) {
    this.Master = master;
    this.Socket = socket;
};

module.exports = UserController;

UserController.prototype.HandleMessage = function (message) {
    if (message != null && typeof message != 'undefined' && message != 'undefined') {
        if (this.Master.MaintainFlag) {
            var msg = new Packet.KickUserResponse(0, 'Hệ thống bảo trì.');
            if (msg != 0)
                this.Master.SendSocketBinary(this.Socket, msg);
        }
        else {
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

                switch (packetId) {
                    case DefinePacket.LoginGame://update ping pong
                        try {
                            var LoginInfo = new BinaryLib.BinaryParser(
                                message,
                                Packet.Struct.LoginGameInfo
                            );
                            if (Utility.CheckVariable(LoginInfo, 'Token', 'AppVersion', 'LangCode')) {
                                var Info = Encryption.aesDecryptIV(LoginInfo.Token, this.Master.Config.KeyConfig.LoginKey, this.Master.Config.KeyConfig.LoginIV); // Giải mã thông tin chứng thực.
                                try {
                                    Info = JSON.parse(Info);
                                    Info.Token = LoginInfo.Token;
                                    Info.LangCode = LoginInfo.LangCode;
                                    this.Master.OnCheckUserLoginByToken(0, this.Socket, Info);
                                } catch (e) {
                                    this.Master.OnCheckUserLoginByToken(1, this.Socket, 'Parser JSON Data Error ');
                                }


                            } else {
                                this.Master.OnCheckUserLoginByToken(1, this.Socket, 'Invaid Data');
                            }

                        } catch (e) {
                            this.Master.OnCheckUserLoginByToken(1, this.Socket, "Catch Error " + e.stack);
                        }
                        break;
                    case DefinePacket.JoinGameByKindID://update ping pong
                        try {
                            var JoinGameInfo = new BinaryLib.BinaryParser(
                                message,
                                Packet.Struct.JoinGameByKindID
                            );
                            if (Utility.CheckVariable(JoinGameInfo, 'KindID')) {
                                this.Master.GetRoomInfoByKindID(0, this.Socket, JoinGameInfo.KindID);
                            } else {
                                this.Master.GetRoomInfoByKindID(1, this.Socket, 'Invaid Data');
                            }

                        } catch (e) {
                            this.Master.GetRoomInfoByKindID(1, this.Socket, "Catch Error " + e.stack);
                        }
                        break;
                    case DefinePacket.UpdateGoldForUser:
                        try {
                            this.Master.UpdateGoldForUser(this.Socket);
                        }
                        catch (e) {
                            this.Master.GetRoomInfoByKindID(1, this.Socket, "Catch Error " + e.stack);
                        }
                        break;
                    case DefinePacket.GetUserOnline:
                        this.GetUserOnline(this.Socket);
                        break;
                    case DefinePacket.MoneyHistory:
                        var moneyHistoryRequest = new BinaryLib.BinaryParser(
                            message,
                            Packet.Struct.MoneyHistoryRequest
                        );
                        this.OnUserGetMoneyHistory(moneyHistoryRequest);
                        break;
                    case DefinePacket.DailyAward_Get:
                        this.UserDailyAward_Get();
                        break;
                    case DefinePacket.DailyAward_GetAward:
                        this.UserDailyAward_GetAward();
                        break;
                    case DefinePacket.OnlineAward_Get:
                        this.UserOnlineAward_Get();
                        break;
                    case DefinePacket.OnlineAward_GetAward:
                        this.UserOnlineAward_GetAward();
                        break;
                    case DefinePacket.ChangeLanguage:
                        var changeLangData = new BinaryLib.BinaryParser(
                            message,
                            Packet.Struct.ChangeLanguage
                        );
                        if (Utility.CheckVariable(changeLangData, 'LangCode')) {
                            this.UserChangeLanguage(changeLangData.LangCode);
                        }

                        break;
                    case DefinePacket.GetTopPlayerListAll:
                        this.OnUserGetTopPlayerListAll();
                        break;
                    case DefinePacket.GetTopPlayerListByID:
                        var getTopPlayerListByIDData = new BinaryLib.BinaryParser(
                            message,
                            Packet.Struct.GetTopPlayerListByID
                        );
                        if (Utility.CheckVariable(getTopPlayerListByIDData, 'ID')) {
                            this.OnUserGetTopPlayerListByID(getTopPlayerListByIDData.ID);
                        }
                        break;
                    case DefinePacket.GetTopPlayerListWithAvatarByID:
                        var GetTopPlayerListWithAvatarByIDData = new BinaryLib.BinaryParser(
                            message,
                            Packet.Struct.GetTopPlayerListByID
                        );
                        if (Utility.CheckVariable(GetTopPlayerListWithAvatarByIDData, 'ID')) {
                            this.OnUserGetTopPlayerListWithAvatarByID(GetTopPlayerListWithAvatarByIDData.ID);
                        }
                        break;
                    case DefinePacket.ChangeGame:
                        var changeGameData = new BinaryLib.BinaryParser(
                            message,
                            Packet.Struct.ChangeGame
                        );
                        if (Utility.CheckVariable(changeGameData, 'GameID')) {
                            //do something here with changeGameData.GameID ChangeUserGameByID
                            this.OnUserChangeUserGameByID(changeGameData.GameID);
                        }
                        break;
                    case DefinePacket.MissionList:
                        this.OnUserGetMissionList();
                        break;
                    case DefinePacket.MissionGetAward:
                        var missionGetAward = new BinaryLib.BinaryParser(
                            message,
                            Packet.Struct.MissionGetAward
                        );
                        if (Utility.CheckVariable(missionGetAward, 'ID')) {
                            //do something here with changeGameData.GameID ChangeUserGameByID
                            this.OnUserMissionGetAward(missionGetAward.ID);
                        }
                        break;
                    case DefinePacket.AchievementList:
                        this.OnUserGeAchievementList();
                        break;
                    case DefinePacket.AchievementGetAward:
                        var achievementGetAward = new BinaryLib.BinaryParser(
                            message,
                            Packet.Struct.AchievementGetAward
                        );
                        if (Utility.CheckVariable(achievementGetAward, 'ID')) {
                            //do something here with changeGameData.GameID ChangeUserGameByID
                            this.OnUserAchievementGetAward(achievementGetAward.ID);
                        }
                        break;
                    case DefinePacket.GetMasterConfig:
                        this.OnUserGetMasterConfig();
                        break;
                    default:
                        break;
                }
            }
            catch (e) {
                this.Master.Logger.Master().error('UserController.prototype.HandleMessage - try err: ' + e.stack);
            }
        }
    }
};
//end


UserController.prototype.GetUserInfo_Gold = function (socket) {
    this.Master.GetUserInfo_Gold(socket);
};

UserController.prototype.GetListBossFish = function (socket, isFinish) {
    this.Master.GetListBossFish(socket, isFinish);
};


UserController.prototype.OnUserLoginByToken = function (LoginData) {
    if (Utility.CheckVariable(LoginData, 'Token')) {

    }

};


UserController.prototype.GetRoomList = function (socket, kindID) {
    this.Master.GetRoomList(socket, kindID);
};

UserController.prototype.UpdateGoldForUser = function (socket) {
    this.Master.UpdateGoldForUser(socket);
};

UserController.prototype.GetUserOnline = function (socket) {
    try {
        this.Master.GetUserOnline(socket);
    }
    catch (e) {
        this.Master.Logger.Master().error('UserController.prototype.GetUserOnline - try err: ' + e.stack);
    }
};

UserController.prototype.OnUserGetMoneyHistory = function (moneyHistoryRequest) {
    try {
        if (Utility.CheckVariable(moneyHistoryRequest, 'PageIndex')) {
            this.Master.OnUserGetMoneyHistory(this.Socket, moneyHistoryRequest.PageIndex);
        } else {
            this.Master.OnUserGetMoneyHistory(this.Socket, 1);
        }

    }
    catch (e) {
        this.Master.Logger.Master().error('UserController.prototype.OnUserGetMoneyHistory - try err: ' + e.stack);
    }
};

UserController.prototype.GetMoneyTransNotification = function () {
    try {
        this.Master.GetMoneyTransNotification(this.Socket);
    }
    catch (e) {
        this.Master.Logger.Master().error('UserController.prototype.GetMoneyTransNotification - try err: ' + e.stack);
    }
};


UserController.prototype.UserDailyAward_Get = function () {
    try {
        this.Master.UserDailyAward_Get(this.Socket.UserModel);
    }
    catch (e) {
        this.Master.Logger.Master().error('UserController.prototype.UserDailyAward_Get - try err: ' + e.stack);
    }
};
UserController.prototype.UserDailyAward_GetAward = function () {
    try {
        this.Master.UserDailyAward_GetAward(this.Socket.UserModel);
    }
    catch (e) {
        this.Master.Logger.Master().error('UserController.prototype.DailyAward_GetAward - try err: ' + e.stack);
    }
};

UserController.prototype.UserOnlineAward_Get = function () {
    try {
        this.Master.UserOnlineAward_Get(this.Socket.UserModel);
    }
    catch (e) {
        this.Master.Logger.Master().error('UserController.prototype.UserOnlineAward_Get - try err: ' + e.stack);
    }
};

UserController.prototype.UserOnlineAward_GetAward = function () {
    try {
        this.Master.UserOnlineAward_GetAward(this.Socket.UserModel);
    }
    catch (e) {
        this.Master.Logger.Master().error('UserController.prototype.UserOnlineAward_GetAward - try err: ' + e.stack);
    }
};
UserController.prototype.UserChangeLanguage = function (LangCode) {
    try {
        this.Socket.LangCode = LangCode;
    }
    catch (e) {
        this.Master.Logger.Master().error('UserController.prototype.UserChangeLanguage - try err: ' + e.stack);
    }
};

UserController.prototype.OnUserGetTopPlayerListAll = function () {
    try {
        this.Master.GetTopPlayerListAllForUser(this.Socket.UserModel);
    }
    catch (e) {
        this.Master.Logger.Master().error('UserController.prototype.OnUserGetTopPlayerListAll - try err: ' + e.stack);
    }
};

UserController.prototype.OnUserGetTopPlayerListByID = function (ID) {
    try {
        this.Master.GetTopPlayerListByIDForUser(this.Socket.UserModel, ID);
    }
    catch (e) {
        this.Master.Logger.Master().error('UserController.prototype.OnUserGetTopPlayerListAll - try err: ' + e.stack);
    }
};

UserController.prototype.OnUserGetTopPlayerListWithAvatarByID = function (ID) {
    try {
        this.Master.GetTopPlayerListWithAvartaByIDForUser(this.Socket.UserModel, ID);
    }
    catch (e) {
        this.Master.Logger.Master().error('UserController.prototype.OnUserGetTopPlayerListAll - try err: ' + e.stack);
    }
};

UserController.prototype.OnUserChangeUserGameByID = function (GameID) {
    try {
        this.Master.ChangeUserGameByID(this.Socket.UserModel, GameID);
    }
    catch (e) {
        this.Master.Logger.Master().error('UserController.prototype.OnUserChangeUserGameByID - try err: ' + e.stack);
    }
};

UserController.prototype.OnUserRequestTransferMoneyToGame = function (GameID, Money) {
    try {
        this.Master.TransferWebMoneyToGameByID(this.Socket.UserModel, GameID, Money);
    }
    catch (e) {
        this.Master.Logger.Master().error('UserController.prototype.OnUserRequestTransferMoneyToGame - try err: ' + e.stack);
    }
};

UserController.prototype.OnUserGetMissionList = function () {
    try {
        this.Master.GetMissionListForUser(this.Socket);
    }
    catch (e) {
        this.Master.Logger.Master().error('UserController.prototype.OnUserRequestTransferMoneyToGame - try err: ' + e.stack);
    }
};

UserController.prototype.OnUserMissionGetAward = function (ID) {
    try {
        this.Master.MissionGetAwardForUser(this.Socket, ID);
    }
    catch (e) {
        this.Master.Logger.Master().error('UserController.prototype.OnUserMissionGetAward - try err: ' + e.stack);
    }
};

UserController.prototype.OnUserGeAchievementList = function () {
    try {
        this.Master.GeAchievementListForUser(this.Socket);
    }
    catch (e) {
        this.Master.Logger.Master().error('UserController.prototype.OnUserAchievementGetAward - try err: ' + e.stack);
    }
};

UserController.prototype.OnUserAchievementGetAward = function (ID) {
    try {
        this.Master.AchievementGetAwardForUser(this.Socket, ID);
    }
    catch (e) {
        this.Master.Logger.Master().error('UserController.prototype.OnUserAchievementGetAward - try err: ' + e.stack);
    }
};

UserController.prototype.OnUserGetMasterConfig = function () {
    try {
        this.Master.GetMasterConfigForUser(this.Socket);
    }
    catch (e) {
        this.Master.Logger.Master().error('UserController.prototype.OnUserGetMasterConfig - try err: ' + e.stack);
    }
};
