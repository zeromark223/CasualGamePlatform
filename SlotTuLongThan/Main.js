/*{"build":1}*/
//sys lib

var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
// Config
var Config = require('../Config/SlotTuLongThan');
// Controller & Model
var UserController = require('./Controller/UserController');
var UserModel = require('./Model/UserModel');
// NPM Lib
var WebSocket = require('../node_modules/ws');
var Net = require('net');
// Lib
var Modules = require('./Modules');
var SmartRequire = require('../SharedModule/smartRequire');
var Utility = require('../SharedModule/Utility');
//Packet
var Packet = require('./Packet');
//
var MissionManager = require('./Modules/MissionManager');
var AchievementManager = require('./Modules/AchievementManager');

function Main() {
    this.Config = Config;
    this.GameID = 4;
    this.GameServerID = 0;
    this.GameServerIP = '127.0.0.1';
    this.MaintainFlag = false;
    this.DeskCount = this.Config.GameServerConfig.RoomTypeConfig.DeskCount;
    this.GameKindID = this.Config.GameServerConfig.RoomTypeConfig.GameKindID;
    //Socket
    this.UserPortWS = 0;
    this.UserPortWSS = 0;
    this.UserPortR = 0;
    this.WSocketUser = 0;
    this.WSSocketUser = 0;
    this.RSocketUser = 0;

    //Timer
    this.MainTime = +new Date();
    this.MainTimer = [
        {
            Tick: 0,
            Interval: 2000,
            Wake: this.Timer2seconds.bind(this)
        },
        {
            Tick: 0,
            Interval: 5000,
            Wake: this.Timer5seconds.bind(this)
        },
        {
            Tick: 0,
            Interval: 15000,
            Wake: this.Timer15seconds.bind(this)
        }
    ];
    //
    this.DeskList = [];
    this.UserClient = [];
    //Module
    this.Logger = Modules.Logger;
    this.SQLAdapter = Modules.SQLAdapter;
    this.LogRecorder = Modules.LogRecorder;
    this.RedisAdapter = Modules.RedisAdapter;
    this.GMToolAdapter = Modules.GMToolAdapter;
    //
    this.MoneyStateDefine = {
        Default: 0,
        BeginGetting: 1,
        GettingCompleted: 1,
        JoinGameCompleted: 3,
        BeginRefund: 4,
        RefundCompleted: 5
    };
    this.UserStateDefine = {
        Default: 0,
        LoginCompleted: 1,
        JoinRoomCompleted: 2,
        LogOut: 3,
        Transfer: 4
    };
    this.DeskStateConfig = {
        Close: 1,
        Open: 2
    };
    this.DestroySocketTimeOut = 60 * 1000; //60s
    this.TrackingID = 1;
    this.MaxTrackingID = 200000;
    this.MaxCCU = this.DeskCount * this.Config.GameServerConfig.RoomTypeConfig.DeskMaxUserLimit;
    this.MoneyRequired = this.Config.GameServerConfig.RoomTypeConfig.MoneyRequired;
    this.LevelRequired = this.Config.GameServerConfig.RoomTypeConfig.LevelRequired;

    this.MatchID = 0;
    this.Stock = 0;
    this.StockDetail = {StockMin: 5000000, StockMax: 100000000};
    this.MaintainStock = this.Config.GameServerConfig.SlotTuLongThan.MaintainStock;
    this.ReelConfig = this.Config.ReelConfig;
    this.IsReadyForMaintain = false;
    this.Debug = false;
    this.JackpotConfigDefault = [//250, 500, 1000, 2500, 5000, 10000, 25000
        {
            ID: 250,
            Ratio: 0.01,
            RatioSave: 0.01,
            Default: 100000
        },
        {
            ID: 500,
            Ratio: 0.01,
            RatioSave: 0.01,
            Default: 200000
        },
        {
            ID: 1000,
            Ratio: 0.01,
            RatioSave: 0.01,
            Default: 400000
        },
        {
            ID: 2500,
            Ratio: 0.01,
            RatioSave: 0.01,
            Default: 1000000
        },
        {
            ID: 5000,
            Ratio: 0.01,
            RatioSave: 0.01,
            Default: 2000000
        },
        {
            ID: 10000,
            Ratio: 0.01,
            RatioSave: 0.01,
            Default: 4000000
        },
        {
            ID: 25000,
            Ratio: 0.01,
            RatioSave: 0.01,
            Default: 10000000
        }
    ];
    this.JackpotConfig = this.JackpotConfigDefault;
    this.TopBigWinUser = [];
    this.SSLConfig = Config.GameServerConfig.SSLConfig;
    this.PingLostMax = 3;
    this.EventManager = new Modules.EventManager();

    this.MissionManager = new MissionManager(this);
    this.AchievementManager = new AchievementManager(this);
    this.GMToolConfig = Config.GMToolConfig;
}

module.exports = Main;
Main.prototype.Start = function (GameServerID, RawPort, WSPort, WSSPort, IP, SecretKey, SecretIV) {
    this.SecretKey = SecretKey;
    this.SecretIV = SecretIV;
    this.GameServerID = GameServerID;
    this.UserPortR = RawPort;
    this.UserPortWS = WSPort;
    this.UserPortWSS = WSSPort;
    this.GameServerIP = IP;
    this.Init();
};
//Timer
Main.prototype.MainLoop = function () {
    var local = new Date();
    var difTime = (local - this.MainTime);
    this.MainTime = local;
    for (var i = 0; i < this.MainTimer.length; i++) {
        this.MainTimer[i].Tick += difTime;
        if (this.MainTimer[i].Tick > this.MainTimer[i].Interval) {
            this.MainTimer[i].Tick = 0;
            this.MainTimer[i].Wake();
        }
    }

    setTimeout(this.MainLoop.bind(this), 100);
};

Main.prototype.Timer2seconds = function () {
    this.UpdateDeskTimer2Second();
};

Main.prototype.Timer5seconds = function () {
    this.UpdateGameServer();
    this.ClearUserNotInServer();
    this.JackpotUpdate();
    this.UpdateTopBigWinUserPacket();
    this.ReloadReelConfig();
    this.ReloadLoggerConfig();
    this.LoadStockRatioConfig();
    this.JackpotGetConfig();
};
Main.prototype.Timer15seconds = function () {
    this.PingAndCheckSocketAll();
    this.EventManager.ReloadAllEvent();
};
//End Timer
Main.prototype.Init = function () {
    this.InitUserListener(); // Init User Listenter
    this.Logger.Init(this.GameServerID, this.Config.LoggerConfig, function () {
        this.RedisAdapter.Init(this.GameServerID, this.Config.RedisConfig, this.Logger.Redis());
        this.SQLAdapter.Init(this.Config.SQLConfig, this.Logger.Sql());
        this.LogRecorder.Init(this.Config.LogRecorderConfig, this.Logger.LogRecorder());
        this.GMToolAdapter.Init(this.GameServerID, this.Config.GMToolConfig, this.HandleGMTool.bind(this));
        setTimeout(this.Initialling.bind(this), 1000);
    }.bind(this));

};

Main.prototype.InitUserListener = function () {
    if (this.UserPortWS > 0 && this.UserPortWS < 65000) {
        this.WSocketUser = new WebSocket.Server({
            port: this.UserPortWS,
            perMessageDeflate: false
        }, function (err) {
            if (!err) this.Logger.Game().info("ID " + this.GameServerID + " is online listen all on port [WS] : " + this.UserPortWS);
            else this.Logger.Game().error("Game fail to start on port : " + this.UserPortWS);
        }.bind(this));
        this.WSocketUser.on('connection', this.WebSocketUserConnect.bind(this, false));//Bind This vs IsWSS
        this.WSocketUser.on('error', function (err) {
            this.Logger.Game().error("error W :" + err);
            //Handle Err3or
        }.bind(this));
    } else {
        this.Logger.Game().info("ID " + this.GameServerID + " WebSocket disable ");
    }
    if (this.UserPortWSS > 0 && this.UserPortWSS < 65000) {
        if (!fs.existsSync(this.SSLConfig.Key) || !fs.existsSync(this.SSLConfig.Cert)) {
            this.Logger.Game().error("Load SSL File Error \r\n" + this.SSLConfig.Key + "\r\n" + this.SSLConfig.Cert);
        }
        const options = {
            key: fs.readFileSync(this.SSLConfig.Key),
            cert: fs.readFileSync(this.SSLConfig.Cert)
        };

        var webServer = https.createServer(options, function (req, res) {
            res.writeHead(404);
            res.end('');
        }).listen(this.UserPortWSS, '0.0.0.0', function (err) {
            if (!err) this.Logger.Game().info("ID " + this.GameServerID + " is online listen all on port [WSS] : " + this.UserPortWSS);
            else this.Logger.Game().error("Game fail to start on port : " + this.UserPortWSS);
        }.bind(this));

        this.WSSocketUser = new WebSocket.Server({
            server: webServer,
            perMessageDeflate: false
        }, function (err) {
            if (!err) this.Logger.Game().info("ID " + this.GameServerID + " is online listen all on port [WSS] : " + this.UserPortWSS);
            else this.Logger.Game().error("Game fail to start on port : " + this.UserPortWSS);
        }.bind(this));
        this.WSSocketUser.on('connection', this.WebSocketUserConnect.bind(this, true));//Bind This vs IsWSS
        this.WSSocketUser.on('error', function (err) {
            this.Logger.Game().error("error W :" + err);
            //Handle Error
        }.bind(this));
    } else {
        this.Logger.Game().info("ID " + this.GameServerID + " WebSocket Secure disable ");
    }

    if (this.UserPortR > 0 && this.UserPortR < 65000) {
        this.RSocketUser = Net.createServer(this.RawSocketUserConnect.bind(this));
        this.RSocketUser.listen(this.UserPortR, '0.0.0.0', function () {
            this.Logger.Game().info("ID " + this.GameServerID + " is online listen all on port [Raw] : " + this.UserPortR);
        }.bind(this));
        this.RSocketUser.on('error', function (err) {
            this.Logger.Game().error("error R :" + err);
            //Handle Error
        }.bind(this));
    } else {
        this.Logger.Game().info("ID " + this.GameServerID + " RawSocket disable");
    }
};
Main.prototype.WebSocketUserConnect = function (isWss, socket) {//nhận kết nối của user (đầu tiên)
    try {
        this.Logger.Game().debug('WebSocketUserConnect', socket._socket.remoteAddress);
        socket.socketType = 1;
        socket.isWss = isWss;
        socket.remoteAddress = socket._socket.remoteAddress;
        socket.remotePort = socket._socket.remotePort;
        socket.remoteAddressReal = socket.remoteAddress;
        socket.end = socket.close;
        if (this.MaintainFlag) {
            // var msg = new Packet.KickUserResponse(0, 'Hệ thống bảo trì.');
            // if (msg != 0)
            //     this.SendSocketBinary(socket, msg);
        } else {

            socket.UserController = new UserController(this, socket);
            socket.UserModel = new UserModel(this, socket);
            socket.on('message', socket.UserController.HandleMessage.bind(socket.UserController)); // Handle User Message
            socket.on('error', function (err) {
                this.OnUserDisconnected(err, socket);
            }.bind(this)); // Handle Error
            socket.on('end', function () {
                this.OnUserDisconnected("end", socket);
            }.bind(this)); // Handle End
            socket.on('close', function () {
                this.OnUserDisconnected("close", socket);
            }.bind(this)); // Handle End
            socket.on('pong', function () {
                socket.pingLost = 0;
                //socket.UserModel.PingPongLost = 0;
            });
        }
    } catch (e) {
        this.Logger.Game().error('WebSocketUserConnect try ', e.stack);
    }

};
Main.prototype.RawSocketUserConnect = function (socket) {//nhận kết nối của user (đầu tiên)
    try {
        this.Logger.Game().debug('RawSocketUserConnect', socket.remoteAddress);
        socket.socketType = 0;
        socket.remoteAddressReal = socket.remoteAddress;
        if (this.MaintainFlag) {
            // var msg = new Packet.KickUserResponse(0, 'Hệ thống bảo trì.');
            // if (msg != 0)
            //     this.SendSocketBinary(socket, msg);
        } else {
            socket.UserController = new UserController(this, socket);
            socket.UserModel = new UserModel(this, socket);
            socket.on('data', socket.UserController.HandleMessage.bind(socket.UserController)); // Handle User Message

            socket.on('error', function (err) {
                this.OnUserDisconnected(err, socket);
            }.bind(this)); // Handle Error
            socket.on('end', function () {
                this.OnUserDisconnected("end", socket);
            }.bind(this)); // Handle End
            socket.on('close', function () {
                this.OnUserDisconnected("close", socket);
            }.bind(this)); // Handle End

        }
    } catch (e) {
        this.Logger.Game().error('RawSocketUserConnect try ', e.stack);
    }

};
Main.prototype.OnUserDisconnected = function (err, socket) {
    //Destroy
    this.DestroySocket(socket);
};
Main.prototype.SendSocketBinary = function (socket, msg) {
    try {
        if (socket.socketType == 0) {//Raw Socket
            socket.write(msg);// Send to client
        } else {//Web Socket
            if (socket.readyState == WebSocket.OPEN) {
                socket.send(msg, {binary: true}); // Send to client
            }
        }
    }
    catch (e) {
        this.Logger.Game().debug("SendSocketBinary err " + e.stack);
    }
};
Main.prototype.PingAndCheckSocketAll = function () {
    try {
        var socket, i;
        var deadSocket = [];
        for (i = 0; i < this.UserClient.length; i++) {
            socket = this.UserClient[i];
            if (socket.socketType == 0) {//Raw Socket
                //handle raw socket
            } else {//Web Socket
                socket.ping();
            }
            if (socket.pingLost) {
                socket.pingLost++;
                if (socket.pingLost > this.PingLostMax) { // mat goi ping qua so lan qui dinh
                    deadSocket.push(socket);
                }
            } else {
                socket.pingLost = 1;
            }
        }
        for (i = 0; i < deadSocket.length; i++) { // huy socket
            this.DestroySocket(deadSocket[i]);
        }

    }
    catch (e) {
        this.Logger.Game().debug("PingAlluser err " + e.stack);
    }
};
Main.prototype.DestroySocketOnly = function (socket) {
    try {
        if (!Utility.CheckVariable(socket)) return;
        if (socket.socketType == 0) {//Raw Socket
            socket.removeAllListeners('data');
            socket.end();
            socket.destroy();
        } else {//Web Socket
            socket.removeAllListeners('message');
            socket.close();
        }
        var index = this.UserClient.indexOf(socket);
        if (index != -1) {
            this.UserClient.splice(index, 1);
        }
    }
    catch (e) {
        this.Logger.Game().error("DestroySocketOnly - try err: " + e.stack);
    }
};
Main.prototype.DestroySocketNotJoinGame = function (socket) {
    try {
        if (!socket.isDestroyed) {
            if (Utility.CheckVariable(socket, 'UserModel')) {
                this.HandleRefundMoney(socket);
            }
            socket.isDestroyed = true;
        }
        this.DestroySocketOnly(socket);
    }
    catch (e) {
        this.Logger.Game().error("DestroySocket - try err: " + e.stack);
    }
};
Main.prototype.DestroySocket = function (socket) {
    try {
        this.Logger.Game().debug('DestroySocket ' + socket.UserModel.UserID);
        if (!socket.reCheckDestroyTime) {
            socket.reCheckDestroyTime = 0;
        }
        if (!socket.isDestroyed && socket.reCheckDestroyTime < +new Date()) {
            socket.reCheckDestroyTime = +new Date() + this.DestroySocketTimeOut;
            if (Utility.CheckVariable(socket, 'UserModel')) {
                try {
                    socket.UserModel.UserState = this.UserStateDefine.LogOut;
                    if (socket.UserModel.IsAddUserLogin) {
                        socket.UserModel.IsAddUserLogin = false;
                        this.SQLAdapter.userOnlineRemove(socket.UserModel.UserID, this.GameServerID, this.GameID);
                    }
                    if (Utility.CheckVariable(socket.UserModel, 'MyDesk') && Utility.CheckVariable(socket.UserModel.MyDesk, 'UpdateUserLeftDesk')) {//User có bàn
                        socket.UserModel.MyDesk.UpdateUserLeftDesk(socket);
                    } else {
                        //User chưa được push vào phòng.
                        this.Logger.Game().error("DestroySocket - try err: User ko co phong ");
                        this.DestroySocketNotJoinGame(socket);
                    }
                } catch (e) {
                    this.Logger.Game().error("DestroySocket - try err: " + e.stack);
                }
            } else {
                this.Logger.Game().error("DestroySocket - socket or model undefined ");
            }
            socket.isDestroyed = true;
        }
        this.DestroySocketOnly(socket);
    }
    catch (e) {
        this.Logger.Game().error("DestroySocket - try err: " + e.stack);
    }
};
Main.prototype.Initialling = function () {
    this.Logger.Game().info("GameServer Initialling !");
    if (this.SQLAdapter.getStatus()
        && this.RedisAdapter.getStatus()
        && this.GMToolAdapter.getStatus()
        && this.LogRecorder.getStatus()
    ) {
        this.InitCompleted();
    }
    else {
        this.Logger.Game().info("GameServer Init Status : ",
            "\r\nSQLAdapter", this.SQLAdapter.getStatus(),
            "\r\nRedisAdapter", this.RedisAdapter.getStatus(),
            "\r\nGMToolAdapter", this.GMToolAdapter.getStatus(),
            "\r\nLogRecorder", this.LogRecorder.getStatus()
        );
        setTimeout(this.Initialling.bind(this), 1000);
    }
};

Main.prototype.InitCompleted = function () {
    this.Logger.Game().info("SlotTuLongThan InitCompleted !");
    this.JackpotGetConfig();
    this.OnServerStart();
    setTimeout(this.MainLoop.bind(this), 1000);
};

Main.prototype.InitDesk = function () {
    var Desk = SmartRequire(path.resolve('./Desk/index.js'), this.SecretKey, this.SecretIV);
    for (var i = 0; i < this.DeskCount; i++) {
        var newDesk = Desk.GetDeskByKind(this.GameKindID, this.SecretKey, this.SecretIV, SmartRequire);
        newDesk.Init(this, i + 1);
        this.DeskList.push(newDesk);
    }
};

Main.prototype.FindUserByUserID = function (UserID) {
    try {
        for (var i = 0; i < this.UserClient.length; i++) {
            if (this.UserClient[i].UserModel.UserID == UserID) {
                return this.UserClient[i].UserModel;
            }

        }
    } catch (e) {
        this.Logger.Game().error('Main.prototype.FindUserIndexByUserID - try err:' + e);
    }
    return 0;

};

Main.prototype.UserLoginGameServer = function (isError, Socket, Info) {

    Socket.LangCode = 0;
    if (isError == 1) {
        this.HandleLoginError(Socket, this.Config.LanguageConfig.Login_ParseDataErr.logMsg + Info, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_ParseDataErr, Socket.LangCode));
        return;
    }
    Socket.LangCode = Info.LangCode;
    if (!Utility.CheckVariable(Info, 'AccountID', 'UserID', 'SessionID', 'MasterID', 'ChannelID', 'GameName', 'Time', 'ProviderID', 'PlatformID')) {
        this.HandleLoginError(Socket, this.Config.LanguageConfig.Login_CheckParamFail.logMsg + Info, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_CheckParamFail, Socket.LangCode));
        return;
    }
    if (this.MaintainFlag) {
        this.HandleLoginError(Socket, 'Sys Maintain', 'System Maintain');
        return;
    }
    //khóa ví + insert vào TWrecord
    Socket.UserModel.SessionID = Info.SessionID;
    Socket.UserModel.AccountID = Info.AccountID;
    Socket.UserModel.MasterID = Info.MasterID;
    Socket.UserModel.TimeCheck = Info.Time;
    Socket.UserModel.UserChannelID = Info.ChannelID;
    Socket.UserModel.UserProviderID = Info.ProviderID;
    Socket.UserModel.UserPlatformID = Info.PlatformID;

    if (Socket.IsSentLogin) {
        this.Logger.Game().error('GameServer.prototype.UserLoginGameServer Duplicate Login Command ', Info.UserID);
        return;
    }
    Socket.IsSentLogin = true;
    var isExists = this.FindUserByUserID(Info.UserID);
    if (isExists != 0) {
        this.HandleUserConflict(Socket);
        return;
    }
    this.SQLAdapter.checkLoginGame(Info.UserID, this.GameServerID, this.GameID, function (err, data) {
        try {
            if (err == 0) {
                try {
                    var user = Socket.UserModel;
                    user.IsAddUserLogin = true;
                    user.UserState = this.UserStateDefine.LoginCompleted;
                    user.UserID = Info.UserID;
                    user.Level = data.Lv;
                    user.Exp = data.Exp;
                    user.GameName = Info.GameName;
                    user.StockHandicap = data.StockHandicap;
                    user.TotalRecharge = data.TotalRecharge;
                    user.RechargeGold = data.TotalRecharge;
                    user.UserTrackingID = this.GetNewTrackingID();
                    user.MoneyState = this.MoneyStateDefine.BeginGetting;
                    user.PlayGameTime = 0;
                    if (this.IsRoomTrial()) {
                        user.MoneyState = this.MoneyStateDefine.GettingCompleted;
                        user.BeginWallet = 5000000;
                        user.Wallet = 5000000;
                        this.GetDeskForUser(Socket);
                    } else {
                        this.UserMoneyChargeAll(user, function (errorCode, Money) {
                            if (errorCode == 0) {
                                user.MoneyState = this.MoneyStateDefine.GettingCompleted;
                                user.BeginWallet = Money;
                                user.Wallet = Money;
                                this.OnUserLoginCompleted(user);
                                this.UpdateUserChargeGold(user);
                                if (!Socket.isDestroyed) {
                                    this.GetDeskForUser(Socket);
                                } else {
                                    //Socket đã destroy
                                    this.HandleLoginError(Socket, this.Config.LanguageConfig.Login_GetGoldError, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_GetGoldError, Socket.LangCode));
                                }
                            } else {
                                this.HandleLoginError(Socket, this.Config.LanguageConfig.Login_GetGoldError, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_GetGoldError, Socket.LangCode));

                            }
                        }.bind(this));
                    }


                } catch (e) {
                    this.HandleLoginError(Socket, this.Config.LanguageConfig.Login_TryCatchInsideCheckLogin.logMsg + e.stack, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_TryCatchInsideCheckLogin, Socket.LangCode));
                }

            } else {
                if (err == 'userOnline' && data == 'Online') { //User đang online
                    this.HandleUserConflict(Socket);
                } else {
                    this.HandleLoginError(Socket, this.Config.LanguageConfig.Login_CheckLoginError.logMsg + err, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_CheckLoginError, Socket.LangCode));
                }
            }
        } catch (e) {
            this.HandleLoginError(Socket, this.Config.LanguageConfig.Login_TryCatchOutSideCheckLogin.logMsg + e.stack, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_TryCatchOutSideCheckLogin, Socket.LangCode));
        }
    }.bind(this));
};

Main.prototype.HandleLoginError = function (Socket, ErrorMsg, ShowMsg) {
    try {
        this.ShowPopup(Socket, ShowMsg);
        var UID = -1;
        var AID = 'unknowAid';
        if (Utility.CheckVariable(Socket, 'UserModel') && Utility.CheckVariable(Socket.UserModel, 'UserID', 'AccountID')) {
            UID = Socket.UserModel.UserID;
            AID = Socket.UserModel.AccountID;
        }
        this.Logger.Game().error('GameServer.prototype.HandleLoginError ', ErrorMsg, UID, AID);
        this.HandleRefundMoney(Socket);
        setTimeout(function () {
            this.DestroySocket(Socket);
        }.bind(this), 1000);
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.HandleLoginError Try ', e.stack);
    }

};

Main.prototype.HandleRefundMoney = function (Socket) {
    //Refund theo từng case
    if (this.IsRoomTrial()) return;// ko Refund cho phòng chơi thử
    if (Socket.UserModel.MoneyState = this.MoneyStateDefine.GettingCompleted) { // Chỉ refund cho trường hợp user vừa lấy tiền xong và chưa vào bàn
        Socket.UserModel.MoneyState = this.MoneyStateDefine.BeginRefund;
        //Handle refund
        var moneyRefund = Socket.UserModel.Wallet; // tiền hiện tại của user
        Socket.UserModel.Wallet -= moneyRefund;// Sau khi refund phải trả trừ tiền. tránh 1 số case tào lao
        if (moneyRefund >= 0) {
            this.MoneyRefundWithChanged(Socket.UserModel, moneyRefund);
        } else {
            this.Logger.Game().error('GameServer.prototype.HandleRefundMoney moneyRefund [999] ', Socket.UserModel.UserID, moneyRefund);
        }

    } else {
        this.Logger.Game().error('GameServer.prototype.HandleRefundMoney moneyRefund [MoneyState] ', Socket.UserModel.UserID, Socket.UserModel.MoneyState, Socket.UserModel.Wallet);
    }
};

Main.prototype.CalcAndRefundUserMoney = function (Socket, callback) {
    try {
        if (Socket.UserModel.MoneyState == this.MoneyStateDefine.JoinGameCompleted) {//User đã lấy tiền thành công và vào bàn chơi.
            var moneyRefund = Socket.UserModel.Wallet; // tiền hiện tại của user
            this.MoneyRefundWithChanged(Socket.UserModel, moneyRefund, callback);
        } else {
            this.Logger.Game().debug('GameServer.prototype.CalcAndRefundUserMoney MoneyState Wallet ', Socket.UserModel.MoneyState, Socket.UserModel.Wallet);
        }
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.CalcAndRefundUserMoney try  ', e.stack);
    }

};

Main.prototype.ShowPopup = function (Socket, Msg) {
    try {
        this.SendSocketBinary(Socket, new Packet.ShowMsg(Msg));
    } catch (e) {
        this.Logger.Master().error('Master.prototype.ShowPopup - try err: ' + e);
    }
};

Main.prototype.MoneyRefundWithChanged = function (User, MoneyRefund, callback) {
    if (this.IsRoomTrial()) return;
    this.SQLAdapter.moneyRefundAll(User.UserID,
        this.Config.MoneyReasonConfig.GameOutMoneyRefundAll,
        'Hoàn tiền user ra game',
        MoneyRefund,
        User.UserChannelID,
        User.UserProviderID,
        User.UserPlatformID,
        this.GameServerID,
        User.UserTrackingID,
        this.GameKindID,
        this.GameID,
        function (e, d) {
            if (typeof callback == 'function') {
                callback();
            }
            if (e != 0) {
                this.Logger.Game().error('GameServer.prototype.MoneyRefundWithChanged ', e,
                    this.Config.MoneyReasonConfig.GameOutMoneyRefundAll,
                    'Hoàn tiền user ra game',
                    MoneyRefund,
                    User.UserChannelID,
                    User.UserProviderID,
                    User.UserPlatformID,
                    this.GameServerID,
                    User.UserTrackingID,
                    this.GameKindID
                );
            }
        }.bind(this));

};

Main.prototype.MoneyRefundWinGoldForOfflineUser = function (User, MoneyRefund, callback) {
    if (this.IsRoomTrial()) return;
    this.SQLAdapter.moneyRefundAll(User.UserID,
        this.Config.MoneyReasonConfig.GameOutMoneyRefundAll,
        'Hoàn tiền thắng offline',
        MoneyRefund,
        User.UserChannelID,
        User.UserProviderID,
        User.UserPlatformID,
        this.GameServerID,
        User.UserTrackingID,
        this.GameKindID,
        this.GameID,
        function (e, d) {
            if (typeof callback == 'function') {
                callback();
            }
            if (e != 0) {
                this.Logger.Game().error('GameServer.prototype.MoneyRefundWithChanged ', e,
                    this.Config.MoneyReasonConfig.GameOutMoneyRefundAll,
                    'Hoàn tiền thắng offline',
                    MoneyRefund,
                    User.UserChannelID,
                    User.UserProviderID,
                    User.UserPlatformID,
                    this.GameServerID,
                    User.UserTrackingID,
                    this.GameKindID
                );
            }
        }.bind(this));

};

Main.prototype.UserMoneyChargeAll = function (User, callback) {
    if (this.IsRoomTrial()) return;
    this.SQLAdapter.moneyChargeAll(User.UserID,
        this.Config.MoneyReasonConfig.GameInMoneyChargeAll,
        'Lấy hết tiền user khi vào game',
        User.UserChannelID,
        User.UserProviderID,
        User.UserPlatformID,
        this.GameServerID,
        User.UserTrackingID,
        this.GameKindID,
        this.GameID,
        function (e, d) {
            if (e == 0) {
                if (Utility.CheckVariable(d) && Utility.CheckVariable(d[0], 'Money')) {
                    callback(0, d[0].Money);
                } else {
                    this.Logger.Game().error('GameServer.prototype.UserMoneyChargeAll Call Data Fail : ', User.UserID, User.AccountID, e, d);
                    callback(1, 0);
                }
            } else {
                this.Logger.Game().error('GameServer.prototype.UserMoneyChargeAll Call DB Fail : ', User.UserID, User.AccountID, e, d);
                callback(2, 0);
            }
        }.bind(this));
};

Main.prototype.HandleUserConflict = function (Socket) {
    try {
        this.Logger.Game().error('GameServer.prototype.HandleUserConflict AccountID : ', Socket.UserModel.AccountID);
        this.HandleLoginError(Socket, Config.LanguageConfig.Login_Duplicate.logMsg + Socket.UserModel.AccountID, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_Duplicate, Socket.LangCode));
        this.KickUserAllGameByAccount(Socket.UserModel.AccountID, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_Duplicate, Socket.LangCode));
        this.KickUserAllMasterByAccount(Socket.UserModel.AccountID, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_Duplicate, Socket.LangCode));
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.HandleUserConflict try : ', e.stack);
    }

};

Main.prototype.KickUserAllGameByAccount = function (accountId, msg) {
    this.GMToolAdapter.SendGameCommandAll({
        CMD: this.Config.GMToolConfig.CMD.UserKickByAccountID,
        SID: 0,
        Data: {
            AccountID: accountId,
            Msg: msg
        }
    });
};

Main.prototype.KickUserAllMasterByAccount = function (accountId, msg) {
    this.GMToolAdapter.SendBroadCastMasterCommand({
        CMD: this.Config.GMToolConfig.CMD.UserKickByAccountID,
        SID: 0,
        Data: {
            AccountID: accountId,
            Msg: msg
        }
    });
};

Main.prototype.GetUserMsgByLangCode = function (ErrCfg, LangCode) {
    switch (LangCode) {
        case 0 : // VN
            return ErrCfg.userMsg;
        case 1:
            return ErrCfg.userMsgEn;
    }
    return ErrCfg.userMsg; // default (VN)
};

Main.prototype.GetNewTrackingID = function () {
    if (this.TrackingID > this.MaxTrackingID) {
        this.TrackingID = 1;
    }
    return this.TrackingID++;
};

Main.prototype.GetDeskForUser = function (Socket) {
    try {
        for (var i = 0; i < this.DeskList.length; i++) {
            if (this.DeskList[i].IsAvailable()) {
                this.DeskList[i].UserEnterDesk(Socket);
                Socket.UserModel.MyDesk = this.DeskList[i];
                this.SendSocketBinary(Socket, new Packet.LoginResponse(Socket.UserModel.UserID, Socket.UserModel.Wallet, Socket.UserModel.GameName));
                var msg = new Packet.GetRoomConfigResponse({
                    ListBet: this.ReelConfig.BetList,
                    MaxLine: 25
                });
                this.SendSocketBinary(Socket, msg);

                return;
            }
        }
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetDeskForUser - try err: ' + e.stack);
    }

};

//update infomation in Game
Main.prototype.UpdateGameServer = function () {
    try {
        this.SQLAdapter.serverStatusUpdate(this.GameServerID, this.UserClient.length);
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.UpdateGameServer - try err: ' + e);
    }
};
Main.prototype.OnServerStart = function () {
    try {
        this.SQLAdapter.serverStatusStart(this.GameServerID, this.GameServerIP, this.GameKindID,
            this.UserClient.length, this.UserPortR, this.UserPortWS,
            this.UserPortWSS, this.DeskCount, this.MaxCCU, this.MoneyRequired, this.LevelRequired, this.GameID);
        this.InitDesk();
        this.LoadStockRatioConfig();
        this.EventManager.Init(this);
        this.EventManager.ReloadAllEvent();

    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.initGameServer - try err: ' + e.stack);
    }
};

Main.prototype.FindUserIndexByUserID = function (UserID) {
    try {
        for (var i = 0; i < this.UserClient.length; i++) {
            if (this.UserClient[i].UserModel.UserID == UserID)
                return i;
        }
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.FindUserIndexByUserID - try err:' + e.stack);
    }
    return -1;
};

Main.prototype.FindUserIndexByAccountID = function (AccountID) {
    try {
        for (var i = 0; i < this.UserClient.length; i++) {
            if (this.UserClient[i].UserModel.AccountID == AccountID)
                return this.UserClient[i].UserModel;
        }
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.FindUserIndexByAccountID - try err:' + e.stack);
    }
    return 0;
};

Main.prototype.KickUserByUserID = function (userID, msgText) {
    var UserIndex = this.FindUserIndexByUserID(userID);
    if (UserIndex != -1) {
        var User = this.UserClient[UserIndex];
        //show msg kick user
        setTimeout(function () {
            this.DestroySocket(User);
        }.bind(this), 1000);
    }
};

Main.prototype.KickUserByAccountID = function (accountId, msgText) {
    var User = this.FindUserIndexByAccountID(accountId);
    if (User != 0) {
        //show msg kick user
        setTimeout(function () {
            this.DestroySocket(User.Socket);
        }.bind(this), 1000);
    }
};

Main.prototype.HandleGMTool = function (channel, message) {
    //this.Logger.Game().debug('GameServer.prototype.HandleGMTool Debug ');
    //this.Logger.Game().debug('Channel ' + JSON.stringify(channel));
    //this.Logger.Game().debug('Message ' + JSON.stringify(message));
    switch (channel) {
        case this.Config.GMToolConfig.Channel.GameGM: {
            try {
                var Object = JSON.parse(message);
                this.GMToolExecute(Object.CMD, Object.SID, Object.Data);
            } catch (e) {
                this.Logger.Game().error('GameServer.prototype.HandleGMTool - try err: ' + e);
            }

            break;
        }
        default: {
            break;
        }
    }
};

Main.prototype.GMToolExecute = function (CMD, SID, data) {
    try {
        if (CMD == null || SID == null || data == null) return;
        if (SID == this.GameServerID) return; // Ignore itself command
        switch (CMD) {
            //PUBLISH GameGM "{\"CMD\": 1001, \"Data\": {\"UserID\": 22109}, \"SID\": 0}"
            case this.Config.GMToolConfig.CMD.UserKickByUserID://Tài khoản hiện đang đăng nhập
            {//Check xem GameServer của User Online có chứa User này không. Nếu không Respone cho GameServer kia biết và set trạng thái User về Offline.
                try {
                    this.KickUserByUserID(data.UserID, data.Msg);
                } catch (e) {
                    this.Logger.Game().error('GameServer.prototype.GMToolExecute - Config.GMToolConfig.CMD.UserKick - try 2 err: ' + e.stack);
                }

                break;
            }
            case this.Config.GMToolConfig.CMD.UserKickByAccountID://Tài khoản hiện đang đăng nhập
            {//Check xem GameServer của User Online có chứa User này không. Nếu không Respone cho GameServer kia biết và set trạng thái User về Offline.
                try {
                    this.KickUserByAccountID(data.AccountID, data.Msg);
                } catch (e) {
                    this.Logger.Game().error('GameServer.prototype.GMToolExecute - Config.GMToolConfig.CMD.UserKick - try 2 err: ' + e.stack);
                }

                break;
            }
            case this.Config.GMToolConfig.CMD.ServerMaintain: {
                try {

                } catch (e) {
                    this.Logger.Game().error('GMToolExecute - Config.GMToolConfig.CMD.ServerMaintain - try 2 err: ' + e);
                }

                break;
            }

            default: {
                break;
            }

        }
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.GMToolExecute - try err: ' + e);
    }
};

Main.prototype.MaintainServer = function () {// Main system
    this.Logger.Game().error('GameServer ' + this.GameServerID + ' is maintaining');
    this.MaintainFlag = true;
    this.KickAllUserUntilClear();

};

Main.prototype.KickAllUserUntilClear = function () {
    if (this.UserClient.length > 0) {
        this.DestroyAllSocket();
        setTimeout(this.KickAllUserUntilClear.bind(this), 1000);
    } else {
        this.CheckMaintainDesk();
        this.Logger.Game().error('GameServer ' + this.GameServerID + ' has been clean user');
    }
};

Main.prototype.CheckMaintainDesk = function () {
    if (this.Debug) {
        this.Logger.Game().error('GameServer ' + this.GameServerID + ' maintain (debug mode)');
        process.exit(0);
    }
    var isReadyForMaintain = true;
    var deskId = 0;
    for (var i = 0; i < this.DeskList.length; i++) {
        if (!this.DeskList[i].IsReadyForMaintain) {
            isReadyForMaintain = false;
            deskId = this.DeskList[i].DeskID;
        }
    }
    if (isReadyForMaintain) {
        this.IsReadyForMaintain = isReadyForMaintain;
        process.send({CMD: 'IsReadyForMaintain'});// Gửi cho Master Cluster biết
        this.Logger.Game().error('GameServer ' + this.GameServerID + ' has been ready for maintain');
    } else {
        this.Logger.Game().error('GameServer ' + this.GameServerID + ' CheckMaintainDesk ' + deskId);
        setTimeout(this.CheckMaintainDesk.bind(this), 1000);
    }

};

Main.prototype.DestroyAllSocket = function () {// Use to kick all user with Message
    try {
        var destroyList = [];
        var i;
        for (i = 0; i < this.UserClient.length; i++) {
            destroyList.push(this.UserClient[i]);
        }
        for (i = 0; i < destroyList.length; i++) {
            this.DestroySocket(destroyList[i]);
        }
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.DestroyByUserID - try err: ' + e);
    }
};

Main.prototype.GenMatchID = function (DeskID) {
    //
    return ++this.MatchID;
};

Main.prototype.UserInfoUpdateAll = function (socket) {
    if (this.IsRoomTrial()) {
        var User = socket.UserModel;
        var record = {
            TimeIn: +User.TimeIn,
            TimeOut: +new Date(),
            BeginWallet: User.BeginWallet,
            Wallet: User.Wallet
        };
        this.Logger.Game().info('GameServer.prototype.UserInfoUpdateAll INFO>>', JSON.stringify(record), '<<');
        return;
    }
    if (socket.InfoUpdateAll) {// Chặn code ngu bị gọi nhiều lần.
        return;
    }
    socket.InfoUpdateAll = true;

    this.LogUserOutGame(socket.UserModel, function (errCode, matchId) { // Nếu thành công thì ghi nhận logout game
        if (errCode == 0) {
            this.CalcAndRefundUserMoney(socket, function () {
                //this.OnEndGameAndUpdateCompleted(socket.UserModel);
                this.RecordMission(socket.UserModel);
            }.bind(this));
            this.OnUserEndGame(socket.UserModel, matchId);
        } else {
            this.Logger.Game().error('GameServer.prototype.UserInfoUpdateAll CalcAndRefundUserMoney err ', errCode);
            //Handle Error
        }
    }.bind(this));
};

Main.prototype.LogUserOutGame = function (User, callback) {
    // Gọi hàm this.LogRecorder
    this.LogRecorder.outGameRecord(User.UserID, this.GameServerID, User.DeskID, this.GameKindID, User.BeginWallet, User.Wallet, User.Wallet - User.BeginWallet, User.TimeIn, new Date(), this.GameID, User.UserChannelID, function (e, d) {
        if (!e && Utility.CheckVariable(d, 'insertId')) {
            callback(0, d.insertId)
        } else {
            this.Logger.Game().error('GameServer.prototype.LogUserOutGame Record Error   ', User.UserID, this.GameServerID, User.DeskID, this.GameKindID, User.BeginWallet, User.Wallet, User.Wallet - User.BeginWallet, User.TimeIn, new Date());
            callback(1, e, d);
        }
    }.bind(this))
};

Main.prototype.RecordMission = function (User) {
    this.MissionManager.RecordMissionOnEndGame(User);
    this.AchievementManager.RecordAchievementManagerOnEndGame(User);
    var listIDChange = this.MissionManager.RecordMissionForUser(User);
    this.AchievementManager.RecordAchievementForUser(User, function (achievementChanged) {
        this.OnEndGameAndUpdateCompleted(User, listIDChange, achievementChanged);
    }.bind(this));


};

Main.prototype.OnEndGameAndUpdateCompleted = function (User, ListID, AchievementChanged) {
    this.GMToolAdapter.SendBroadCastMasterCommand({
        CMD: this.GMToolConfig.CMD.UserOutGameCompleted,
        SID: 0,
        Data: {
            UserID: User.UserID,
            ListID: ListID || [],
            AC: AchievementChanged
        }
    });
};

Main.prototype.OnUserEndGame = function (User, MatchID) {
    try {
        //Logging
        this.RecordOnUserOutGame(User, MatchID);
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.OnUserEndGame - try err:' + e.stack);
    }

};

Main.prototype.UpdateDeskTimer2Second = function () {
    for (var i = 0; i < this.DeskList.length; i++) {
        //this.DeskList[i].DeskTimer2Second();
    }
};

//Stock Handle START

Main.prototype.AddStock = function (Stock) {
    if (!isNaN(Stock)) {
        this.Stock += (+Stock);
    }
};

Main.prototype.CheckStockAndMaintain = function () {
    //thêm cờ maintain, check startround.
    if (this.Stock < this.MaintainStock) {
        this.MaintainServer();
    }


};

//Stock Handle END

Main.prototype.ClearUserNotInServer = function () {
    //
    this.SQLAdapter.userOnlineGetAll(this.GameServerID, this.GameID, function (e, d) {
        if (!e) {
            if (Utility.CheckVariable(d)) {
                for (var i = 0; i < d.length; i++) {
                    try {
                        if (Utility.CheckVariable(d[i], 'UserID', 'ServerID', 'UpdateTime')) {
                            var dif = +new Date() - new Date(d[i].UpdateTime);
                            dif = Math.abs(dif);
                            if (dif > 30000) {// thời gian lớn hơn
                                var user = this.FindUserByUserID(d[i].UserID);
                                if (user == 0) {
                                    this.SQLAdapter.userOnlineRemove(d[i].UserID, this.GameServerID, this.GameID);
                                    this.Logger.Game().debug("GameServer.prototype.ClearUserNotInServer Remove ", d[i].UserID, this.GameServerID, this.GameID);
                                }
                            }
                        }
                    } catch (e) {
                        this.Logger.Game().error("GameServer.prototype.ClearUserNotInServer ", e.stack);

                    }
                }
            }
        }
    }.bind(this));
};


//Start Jackpot
Main.prototype.JackpotGetConfigByTotalBet = function (totalBet) {
    for (var i = 0; i < this.JackpotConfig.length; i++) {
        if (this.JackpotConfig[i].ID == totalBet) {
            return this.JackpotConfig[i];
        }
    }
    return 0;
};

Main.prototype.JackpotAdd = function (totalBet) {
    var jackpotConfig = this.JackpotGetConfigByTotalBet(totalBet);
    if (jackpotConfig != 0) {
        var addGold = Math.floor(totalBet * jackpotConfig.Ratio) || 0;
        var addGoldSave = Math.floor(totalBet * jackpotConfig.RatioSave) || 0;
        if (addGold > 0) {
            this.RedisAdapter.incrBy(this.JackpotGetRedisKey(jackpotConfig.ID), addGold);
        }
        if (addGoldSave > 0) {
            this.RedisAdapter.incrBy(this.JackpotSaveGetRedisKey(jackpotConfig.ID), addGoldSave);
        }
    }

};

Main.prototype.JackpotGet = function (totalBet, callback) {
    var jackpotConfig = this.JackpotGetConfigByTotalBet(totalBet);
    if (jackpotConfig != 0) {
        this.RedisAdapter.get(this.JackpotGetRedisKey(jackpotConfig.ID), function (e, d) {
            if (!e) {
                callback(d);
            } else {
                callback(0);
            }
        }.bind(this));
        return;
    }
    callback(0);
};

Main.prototype.JackpotGetAndSet = function (User, totalBet, callback) {
    if (User.RechargeGold <= 0) {
        callback(0);
        return;
    }
    var jackpotConfig = this.JackpotGetConfigByTotalBet(totalBet);
    if (jackpotConfig != 0) {
        this.RedisAdapter.get(this.JackpotSaveGetRedisKey(jackpotConfig.ID), function (es, ds) {
            if (!es) {
                if (+ds >= jackpotConfig.Default) {
                    this.RedisAdapter.getAndSet(this.JackpotGetRedisKey(jackpotConfig.ID), jackpotConfig.Default, function (e, d) {
                        if (!e) {
                            if (!Utility.CheckVariable(d)) d = jackpotConfig.Default; // Lấy thành công nhưng ko có giá trị, thì lấy giá trị default
                            this.RedisAdapter.incrBy(this.JackpotSaveGetRedisKey(jackpotConfig.ID), -jackpotConfig.Default); // Giảm giá trị Save
                            callback(d);
                        } else {
                            callback(0);
                        }
                    }.bind(this));
                } else {
                    callback(0); // ko đủ save
                }
            } else {
                callback(0);
            }
        }.bind(this));
    } else {
        callback(0);
    }

};

Main.prototype.JackpotUpdate = function () {
    //
    for (var i = 0; i < this.JackpotConfig.length; i++) {
        this.JackpotUpdateByIDAll(this.JackpotConfig[i].ID);
    }
};

Main.prototype.JackpotUpdateByIDAll = function (ID) {
    this.JackpotGet(ID, function (value) {
        for (var i = 0; i < this.UserClient.length; i++) {
            var socket = this.UserClient[i];
            if (Utility.CheckVariable(socket, 'UserModel')) {
                if (socket.UserModel.JackpotCurrentID == ID) {
                    this.SendSocketBinary(socket, new Packet.JackpotUpdateResponse(value));
                }
            }
        }
    }.bind(this));
};

Main.prototype.JackpotUpdateByID = function (socket, ID) {
    this.JackpotGet(ID, function (value) {
        this.SendSocketBinary(socket, new Packet.JackpotUpdateResponse(value));
    }.bind(this));
};

Main.prototype.JackpotGetRedisKey = function (TotalBet) {
    return this.Config.RedisConfig.Define.SlotJackpot + this.GameKindID + ":" + TotalBet;
};

Main.prototype.JackpotSaveGetRedisKey = function (TotalBet) {
    return this.Config.RedisConfig.Define.SlotJackpotSave + this.GameKindID + ":" + TotalBet;

};


Main.prototype.JackpotGetConfig = function () {
    var key = this.Config.RedisConfig.Define.SlotJackpotConfig + this.GameKindID;
    this.RedisAdapter.get(key, function (e, d) {
        if (!e) {
            if (!d) {
                this.RedisAdapter.set(key, JSON.stringify(this.JackpotConfigDefault));
            } else {
                try {
                    this.JackpotConfig = JSON.parse(d);
                } catch (e) {
                    this.JackpotConfig = this.JackpotConfigDefault;
                }
            }
        }
    }.bind(this));
};

//End Jackpot
Main.prototype.IsRoomTrial = function () {
    try {
        return this.Config.GameServerConfig.RoomTypeConfig.IsTrial || false; // Beta
    } catch (e) {
        this.Logger.Game().error("GameServer.prototype.IsRoomTrial ", e.stack);
    }
    return false;
};

Main.prototype.GetMatchID = function () {
    return ++this.MatchID;
};

Main.prototype.AddTopBigWin = function (UserID, GameName, WinLabel, WinGold, MatchID) {
    //TopBigWinUser
    try {
        var key = this.Config.RedisConfig.Define.SlotTopWin + ":" + this.GameKindID;
        var time = +new Date();
        var val = UserID + ',' + GameName + ',' + WinLabel + ',' + WinGold + ',' + time;
        var obj = {
            UserID: UserID,
            GameName: GameName,
            WinLabel: WinLabel,
            WinGold: WinGold,
            Time: time
        };
        this.RedisAdapter.zAdd(key, -time, val);
        this.RedisAdapter.zRemByRank(key, 100, -1); // Xóa các phần tử ngoài 100
        this.TopBigWinUser.push(obj);
        if (this.TopBigWinUser.length > 100) { // Xóa phần tử đầu tiên
            this.TopBigWinUser.splice(0, 1);
        }
    } catch (e) {
        this.Logger.Game().error("GameServer.prototype.AddTopBigWin ", e.stack);
    }
};

Main.prototype.UpdateTopBigWinUserPacket = function () {
    try {
        var key = this.Config.RedisConfig.Define.SlotTopWin + ":" + this.GameKindID;
        this.RedisAdapter.zRange(key, 0, 99, function (e, d) {
            if (!e) {
                try {
                    var topWin = [];
                    for (var i = 0; i < d.length; i++) {
                        var data = d[i].split(',');
                        if (data.length > 4) {
                            var UserID = data[0];
                            var GameName = data[1];
                            var WinLabel = data[2];
                            var WinGold = data[3];
                            var time = data[4];
                            topWin.push({
                                UserID: UserID,
                                GameName: GameName,
                                WinLabel: WinLabel,
                                WinGold: WinGold,
                                Time: time
                            })
                        }
                    }
                    this.TopBigWinUser = topWin;
                } catch (e) {
                    this.Logger.Game().error("GameServer.prototype.UpdateTopBigWinUserPacket ", e.stack);
                }

            }
        }.bind(this));
    } catch (e) {
        this.Logger.Game().error("GameServer.prototype.UpdateTopBigWinUserPacket ", e.stack);
    }

};

Main.prototype.AddUserWinHistory = function (User, MatchID, TotalBet, LineCount, WinGold, JackpotValue) {
    try {
        var key = this.Config.RedisConfig.Define.SlotUserHistory + this.GameKindID + ":" + User.UserID;
        var time = +new Date();
        var val = MatchID + ',' + time + ',' + TotalBet + ',' + LineCount + ',' + (+WinGold + JackpotValue);
        this.RedisAdapter.zAdd(key, -time, val);
        this.RedisAdapter.zRemByRank(key, 20, -1); // Xóa các phần tử ngoài 100
    } catch (e) {
        this.Logger.Game().error("GameServer.prototype.AddUserWinHistory ", e.stack);
    }

};

Main.prototype.SendUserHistory = function (User) {
    try {
        var key = this.Config.RedisConfig.Define.SlotUserHistory + this.GameKindID + ":" + User.UserID;
        this.RedisAdapter.zRange(key, 0, 19, function (e, d) {
            if (!e) {
                try {
                    var history = [];
                    for (var i = 0; i < d.length; i++) {
                        var data = d[i].split(',');
                        //var val = MatchID + ',' + time + ',' + TotalBet + ',' + LineCount+','+WinGold;
                        if (data.length > 4) {
                            var MatchID = data[0];
                            var Time = data[1];
                            var TotalBet = data[2];
                            var LineCount = data[3];
                            var WinGold = data[4];
                            history.push({
                                MatchID: MatchID,
                                Time: Time,
                                TotalBet: TotalBet,
                                LineCount: LineCount,
                                WinGold: WinGold
                            })
                        }
                    }
                    this.SendSocketBinary(User.Socket, new Packet.RollHistoryResponse(history));
                } catch (e) {
                    this.Logger.Game().error("GameServer.prototype.SendUserHistory ", e.stack);
                }

            }
        }.bind(this));
    } catch (e) {
        this.Logger.Game().error("GameServer.prototype.SendUserHistory ", e.stack);
    }

};

Main.prototype.GetReelByStock = function () {
    var rand = Math.random();
    var x = (-this.GetStockRatio() + 1.5) / 0.6;
    if (rand < x) {
        return this.ReelConfig.NormalReel;
    } else {
        return this.ReelConfig.EasyReel;
    }
};

Main.prototype.GetStockRatio = function () {
    var currentStock = this.Stock, stockRatio = 0;
    try {
        if (this.StockDetail.StockMin > currentStock)
            currentStock = this.StockDetail.StockMin;
        else if (this.StockDetail.StockMax < currentStock)
            currentStock = this.StockDetail.StockMax;
        for (var i = 0; i < this.StockConfig.length; i++) {
            if (currentStock > this.StockConfig[i].Stock) {
                stockRatio = this.StockConfig[i].Ratio;
                break;
            }
        }

    } catch (e) {
        this.Logger.Game().error('Main.prototype.GetStockRatio - try err: ' + e.stack);
    }
    if (stockRatio < 0.9) stockRatio = 0.9;
    if (stockRatio > 1.5) stockRatio = 1.5;

    return stockRatio;
};
//Lấy cấu hình stock theo gameKind
// Main.prototype.LoadStockRatioConfig = function () {
//     try {
//         this.RedisAdapter.GetStockRatioConfig(this.GameKindID, function (err, data) {
//             if (!err) {
//                 if (Utility.CheckVariable(data, 'StockRatio')) {
//                     this.StockConfig = data.StockRatio;
//                     this.BulletAppear = +data.BulletAppear;
//                     this.StockDetail = {StockMin: +data.StockMin, StockMax: +data.StockMax};
//                     for (var i = 0; i < this.StockConfig.length - 1; i++)
//                         for (var j = i + 1; j < this.StockConfig.length; j++)
//                             if (this.StockConfig[j].Stock > this.StockConfig[i].Stock) {
//                                 var temp = this.StockConfig[i];
//                                 this.StockConfig[i] = this.StockConfig[j];
//                                 this.StockConfig[j] = temp;
//                             }
//                 }
//             }
//         }.bind(this));
//     } catch (e) {
//         this.Logger.Game().error('GameServer.prototype.LoadStockRatioConfig - try err: ' + e.stack);
//     }
// };
//
// //Load stock theo gameID
// Main.prototype.LoadStockConfig = function () {
//     try {
//         this.RedisAdapter.GetStockConfig(this.GameServerID, this.GameServerIP, this.GameServerUserPortR, function (err, data) {
//             if (!err) {
//                 if (!!Utility(data)) {
//                     this.Logger.Game().debug("Server Start load stock " + this.Stock + ': New Stock :' + data.Stock);
//                     this.Stock = +data.Stock;
//                     this.ServerStartStock = +data.Stock;
//                 }
//             }
//         }.bind(this));
//     } catch (e) {
//         this.Logger.Game().error('GameServer.prototype.LoadStockConfig - try err: ' + e);
//     }
// };
//
// Main.prototype.UpdateStock = function () {
//     try {
//         var stockMin = 5000000, stockMax = 10000000;
//
//         if (!Utility(this.Stock)) {
//             this.Stock = 0;
//         }
//         if (!Utility(this.StockDetail)) {
//             this.StockDetail = {StockMin: stockMin, StockMax: stockMax};
//         }
//         if (!Utility(this.StockDetail.StockMin)) {
//             this.StockDetail.StockMin = stockMin;
//         }
//         if (!Utility(this.StockDetail.StockMax)) {
//             this.StockDetail.StockMax = stockMax;
//         }
//
//         if (this.StockDetail.StockMin > this.Stock)
//             this.Stock = this.StockDetail.StockMin;
//         else if (this.StockDetail.StockMax < this.Stock)
//             this.Stock = this.StockDetail.StockMax;
//
//         //cập nhật stock vào redis
//         this.RedisAdapter.SetStockConfig(this.GameServerID, this.GameServerIP, this.GameServerUserPortR, this.Stock, function () {
//         });
//
//         //cập nhật stock vào sql server
//         //this.SQLAdapter.Stock_Insert_Update(this.GameServerID, this.Stock);
//
//     } catch (e) {
//         this.Logger.Game().error('GameServer.prototype.UpdateStock - try err: ' + e);
//     }
// };

Main.prototype.RecordBetting = function (User, TotalBet, MatchID, IsFreeSpin) {
    User.RecordData_Update(TotalBet, TotalBet, 0, IsFreeSpin, 0, 0)
};

Main.prototype.RecordResult = function (User, TotalBet, WinGold, useFreeSpin, bonus, jackpot) {
    // lúc betting đã record totalbet, nên ko record totalbet
    User.RecordData_Update(TotalBet, 0, WinGold, useFreeSpin, bonus, jackpot)
};

Main.prototype.RecordBigWin = function (UserID, GameName, WinLabel, WinGold, MatchID, WinLine, Jackpot) {

};

Main.prototype.RecordWinJackpot = function (UserID, GameName, TotalBet, JackpotValue, MatchID, ChannelID) {
    //
    var jackpotConfig = this.JackpotGetConfigByTotalBet(TotalBet);
    var def = 0;
    if (jackpotConfig != 0 && Utility.CheckVariable(jackpotConfig, 'Default')) {
        def = jackpotConfig.Default;
    }
    this.LogRecorder.logUserJackpot(UserID, GameName, TotalBet, JackpotValue, MatchID, def, this.GameKindID, ChannelID);
};

Main.prototype.RecordOnUserOutGame = function (User, MatchID) {
    for (var i = 0; i < User.RecordData.length; i++) {
        var d = User.RecordData[i];
        this.LogRecorder.logUserBetAndWin(User.UserID, d.BetID, d.TotalBet, d.TotalWin, d.FreeCount, d.FreeBet, d.FreeWin, d.Count, MatchID, d.Bonus, d.Jackpot, this.GameKindID, User.UserChannelID);
    }

    //Emited Event;
    this.EventManager.EvtOnUserOutGame(User);
};

Main.prototype.ReloadLoggerConfig = function () {
    try {
        var LoggerNewConfig = requireUnCached('../Config/SlotTuLongThan/LoggerConfig.js');//Không gán trực tiếp, gán giáng tiếp để tránh bị lổi
        var LogLevel = LoggerNewConfig.LogLevel;
        this.Logger.setLogLevel(LogLevel);
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.ReloadLoggerConfig - try err: ' + e);
    }
};

Main.prototype.ReloadReelConfig = function () {
    try {
        var ReelConfig = requireUnCached('../Config/SlotTuLongThan/ReelConfig');//Không gán trực tiếp, gán giáng tiếp để tránh bị lổi
        this.ReelConfig = ReelConfig;
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.ReloadReelConfig - try err: ' + e.stack);
    }
};

Main.prototype.LoadStockRatioConfig = function () {
    try {
        this.RedisAdapter.GetStockRatioConfig(this.GameKindID, function (err, data) {
            if (!err) {
                if (Utility.CheckVariable(data, 'StockRatio')) {
                    this.StockConfig = data.StockRatio;
                    this.StockDetail = {StockMin: +data.StockMin, StockMax: +data.StockMax};
                    for (var i = 0; i < this.StockConfig.length - 1; i++)
                        for (var j = i + 1; j < this.StockConfig.length; j++)
                            if (this.StockConfig[j].Stock > this.StockConfig[i].Stock) {
                                var temp = this.StockConfig[i];
                                this.StockConfig[i] = this.StockConfig[j];
                                this.StockConfig[j] = temp;
                            }
                }
            }
        }.bind(this));
    } catch (e) {
        this.Logger.Game().error('Main.prototype.LoadStockRatioConfig - try err: ' + e.stack);
    }
};

Main.prototype.GetRuleJackpot5Any = function () {
    return this.GameKindID == 401;
};

Main.prototype.SendBroadcastMsg = function (Text, LangCode) {
    this.GMToolAdapter.SendBroadCastMasterCommand({
        CMD: this.Config.GMToolConfig.CMD.Notification,
        SID: 0,
        Data: {
            Text: Text,
            Url: '',
            LangCode: LangCode || 0,
            Priority: 0,
            GameID: 0
        }
    });

};


function requireUnCached(NameLink) {//Use to re require
    var l = module.children.length;
    for (var i = 0; i < l; i++) {
        if (module.children[i].id === require.resolve(NameLink)) {
            module.children.splice(i, 1);
            break;
        }
    }
    delete require.cache[require.resolve(NameLink)];
    return require(NameLink);
}


Main.prototype.UpdateUserChargeGold = function (User) {
    //getUserCharge
    this.SQLAdapter.getUserCharge(User.UserID, function (e, d) {
        if (e == 0) {
            if (Utility.CheckVariable(d) && Utility.CheckVariable(d[0], 'Money')) {
                User.RechargeGold += +d[0].Money || 0;
            }
        }
    }.bind(this));
};

Main.prototype.OnUserLoginCompleted = function (User) {
    this.MissionManager.LoadMissionForUser(User);
    this.AchievementManager.LoadAchievementMangerForUser(User);
};