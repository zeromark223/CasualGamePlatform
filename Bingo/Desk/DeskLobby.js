/*{"build":1}*/
var rootFile = __stack[0].getFileName();
var path = require('path');
var cDir = path.dirname(rootFile);
var Utility = require(path.resolve(cDir, '../../SharedModule/Utility'));
var Packet = require('../Packet');

function DeskLobby() {
    this.DeskID = 0;
    this.GameServer = 0;
    this.IsReadyForMaintain = true;
    this.SecretKey = Utility.GetUUID(); // SecretKey cũng từ gen, không cho can thiệp.

    this.ListUser = [];

    this.CardPrice = 0;
    this.DeskName = 'Lobby';
    this.DeskKind = 0;
    this.TickUpdateMaxTreasure = 0;
}

module.exports = DeskLobby;

/**
 * @return {number}
 */
DeskLobby.prototype.GetCardPrice = function () {
    return this.CardPrice;
};

DeskLobby.prototype.GetDeskKind = function () {
    return this.DeskKind;
};
/**
 * @return {boolean}
 */
DeskLobby.prototype.IsLobby = function () {
    return true;
};

DeskLobby.prototype.Init = function (GameServer, DeskID, DeskKind, CardPrice) {
    this.DeskID = DeskID;
    this.GameServer = GameServer;
    this.CardPrice = CardPrice;
    this.DeskKind = DeskKind;
    //
    this.TickUpdateMaxTreasure = 0;
};

/**
 * @return {number}
 */
DeskLobby.prototype.IsAvailable = function () {
    return 1;
};

/**
 * @return {boolean}
 */
DeskLobby.prototype.UserEnterDesk = function (Socket) {
    this.GameServer.Logger.Game().info('DeskLobby.prototype.UserEnterDesk: ',
        this.DeskName, this.DeskKind, Socket.UserModel.UserID, Socket.UserModel.GameName, Socket.UserModel.MoneyState);
    try {
        var User = Socket.UserModel;
        if (User.MoneyState == this.GameServer.MoneyStateDefine.GettingCompleted) {
            // set money state to MoneyStateDefine.JoinGameCompleted for refund money of user after disconnecting from game server
            User.MoneyState = this.GameServer.MoneyStateDefine.JoinGameCompleted;
            User.OnUserEnterDesk(this); // this function set state of user to: this.GameServer.UserStateDefine.JoinRoomCompleted
            //
            User.DeskID = this.DeskID;
            this.ListUser.push(User);
            // send max treasure to user
            this.GameServer.SendSocketBinary(Socket, new Packet.UpdateMaxTreasureResponse(this.GameServer.GetDeskTreasureData()));
            //
            return true;
        } else if (User.MoneyState == this.GameServer.MoneyStateDefine.JoinGameCompleted) {
            // re-join lobby
            // set money state to MoneyStateDefine.JoinGameCompleted for refund money of user after disconnecting from game server
            User.OnUserEnterDesk(this); // this function set state of user to: this.GameServer.UserStateDefine.JoinRoomCompleted
            //
            User.DeskID = this.DeskID;
            this.ListUser.push(User);
            // send max treasure to user
            this.GameServer.SendSocketBinary(Socket, new Packet.UpdateMaxTreasureResponse(this.GameServer.GetDeskTreasureData()));
            //
            return true;
        } else {
            this.GameServer.Logger.Game().error('DeskLobby.prototype.UserEnterDesk: wrong User.MoneyState: ', User.MoneyState);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskLobby.prototype.UserEnterDesk - try err: ' + e.stack);
    }
    return false;
};

DeskLobby.prototype.DeskSendAllUser = function (Msg) {
    try {
        for (var i = 0; i < this.ListUser.length; i++) {
            this.GameServer.SendSocketBinary(this.ListUser[i].Socket, Msg);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('DeskLobby.prototype.DeskSendAllUser ', e.stack);
    }
};

DeskLobby.prototype.UpdateUserLeftDesk = function (Socket) {
    this.GameServer.Logger.Game().info('DeskLobby.prototype.UpdateUserLeftDesk ', Socket.UserModel.UserID, Socket.UserModel.GameName);
    Socket.UserModel.OnUserLeftDesk();
    this.GameServer.UserInfoUpdateAll(Socket);

    for (var i = 0; i < this.ListUser.length; i++) {
        if (this.ListUser[i].UserID == Socket.UserModel.UserID) {
            this.ListUser.splice(i, 1);
            return;
        }
    }
};
DeskLobby.prototype.RemoveUser = function (Socket, NeedUpdateUserInfo) {
    this.GameServer.Logger.Game().info('DeskLobby.prototype.RemoveUser ', Socket.UserModel.UserID, Socket.UserModel.GameName);
    Socket.UserModel.OnUserLeftDesk();
    if (NeedUpdateUserInfo) {
        this.GameServer.UserInfoUpdateAll(Socket);
    }

    for (var i = 0; i < this.ListUser.length; i++) {
        if (this.ListUser[i].UserID == Socket.UserModel.UserID) {
            this.ListUser.splice(i, 1);
            return;
        }
    }
};
DeskLobby.prototype.OnUserGetListUser = function (User) {
    this.GameServer.SendSocketBinary(User.Socket, new Packet.GetListUserResponse(this.ListUser));
};

DeskLobby.prototype.DeskTimer2Second = function () {
    this.TickUpdateMaxTreasure += 2;
    if (this.TickUpdateMaxTreasure > 30) {
        this.TickUpdateMaxTreasure = 0;
        this.DeskSendAllUser(new Packet.UpdateMaxTreasureResponse(this.GameServer.GetDeskTreasureData()));
    }
};

DeskLobby.prototype.OnUserEnterGame = function (Socket, UserEnterGameRequest) {
    let oDesk = this.GameServer.FindSuitableDesk(Socket, UserEnterGameRequest.DeskMode, UserEnterGameRequest.CardPrice);
    if (oDesk == 0) {
        this.GameServer.Logger.Game().error('DeskLobby.prototype.OnUserEnterGame: find desk return null', UserEnterGameRequest);
        this.GameServer.SendSocketBinary(Socket, new Packet.UserHistoryResponse(1));
    } else {
        let rc = oDesk.OnUserPlay(Socket, UserEnterGameRequest.NumCard);
        if (rc) {
            for (let i = 0; i < this.ListUser.length; i++) {
                if (this.ListUser[i].UserID == Socket.UserModel.UserID) {
                    this.ListUser.splice(i, 1);
                    return;
                }
            }
        }
    }
};

DeskLobby.prototype.UserGetUserHistory = function (User, UserHistoryInfo) {
    let redisKey = this.GameServer.Config.RedisConfig.Define.BingoUserPlayHistory + UserHistoryInfo.GameMode + ':' + User.UserID;
    this.GameServer.RedisAdapter.zRange(redisKey, 0, -1,
        function (err, d) {
            if (!err) {
                try {
                    let h = [];
                    for (let i = 0; i < d.length; i++) {
                        h.push(JSON.parse(d[i]));
                    }
                    let msg = new Packet.UserHistoryResponse(h);
                    this.GameServer.SendSocketBinary(User.Socket, msg);
                } catch (ex) {
                    this.GameServer.Logger.Game().error('DeskLobby.prototype.UserGetUserHistory Build DataErr', ex.stack);
                }
            } else {
                this.GameServer.Logger.Game().error('DeskLobby.prototype.UserGetUserHistory Get DataErr', err);
            }
        }.bind(this));
};

DeskLobby.prototype.OnUserLeaveGame = function (Socket) {
    // always success
    this.GameServer.SendSocketBinary(Socket, new Packet.UserLeaveGameResponse(0));
};