/*{"build":1}*/
//Require
const fs = require('fs');
var WebSocket = require('../node_modules/ws');
var RedisAdapter = require('./Modules/RedisAdapter/RedisAdapter.js');
var SQLAdapter = require('./Modules/SQLAdapter');
var UserModel = require('./Model/UserModel.js');
var UserController = require('./Controller/UserController.js');
var LoggerCommon = require('./Modules/Log4JS/Logger.js');
var Config = require('../Config/Master');
var Net = require('net');
var Packet = require('./Packet');
var GMToolAdapter = require('./Modules/GMToolAdapter');
var HotUpdateModule = require('./Modules/HotUpdate');
var https = require('https');
var Encryption = require('../SharedModule/encrytion');
var MissionManager = require('./Modules/MissionManager');
var AchievementManager = require('./Modules/AchievementManager');
var LogRecorder = require('./Modules/LogRecorder');
var Utility = require('../SharedModule/Utility');
var ApiMoney = require('./Modules/ApiMoney');
var DailyAwardAdapter = require('./Modules/DailyAward');
var OnlineAwardAdapter = require('./Modules/OnlineAward');
var EventManager = require('./Modules/EventManager');
var AnalyseUserManager = require('./Modules/AnalyseUser');
//End Require

module.exports = Master;// Start GameServer

function Master() {
    this.MasterID = 0;
    this.RSocketUser = 0;
    this.WSocketUser = 0;
    this.WSSocketUser = 0;
    this.SSLConfig = Config.MasterConfig.SSLConfig;
    this.MasterUserPortWS = 0;
    this.MasterUserPortWSS = 0;
    this.MasterUserPortR = 0;
    this.UserClient = [];
    this.Config = Config;
    this.RedisConfig = Config.RedisConfig;
    this.RedisAdapter = RedisAdapter;
    this.SQLConfig = Config.SQLConfig;
    this.SQLAdapter = SQLAdapter;
    this.LogRecorderConfig = Config.LogRecorderConfig;
    this.LogRecorder = LogRecorder;
    this.MaintainFlag = false;
    this.MainTimerInterval = Config.MasterConfig.Master.MainTimerInterval;
    this.MainTime = +new Date;
    this.CheckUserTimerInterval = Config.MasterConfig.Master.CheckUserTimerInterval;
    this.ClientTimerInterval = Config.MasterConfig.Master.ClientTimerInterval;
    this.LanguageConfig = Config.LanguageConfig;
    this.MasterIP = "127.0.0.1"; //Default
    this.LoggerConfig = Config.LoggerConfig;
    this.Logger = LoggerCommon;
    this.PubSubConfig = Config.PubSubConfig;
    this.GMToolAdapter = GMToolAdapter;
    this.GMToolConfig = Config.GMToolConfig;
    this.KeyConfig = Config.KeyConfig;
    this.ApiMoney = new ApiMoney();
    this.DailyAwardAdapter = new DailyAwardAdapter();
    this.OnlineAwardAdapter = new OnlineAwardAdapter();
    this.ListRoomOnline = [];
    this.TimeOutAuth = 600000; //10p
    this.SessionCounter = 0;
    this.GameListConfig = Config.GameListConfig;
    this.RESTART_THRESHOLD = 100; //percent
    this.RESTART_THRESHOLD_DURATION = 5; //minute
    this.RESTART_CURRENT_DURATION = 0; //minute
    this.ComputerStatus = {};

    this.ListOnlineAward = [];
    this.ListSignInAward = [];

    //Timer
    this.MasterTimers = [
        {
            Tick: 0,
            Interval: 5000,
            Wake: this.Timer5seconds.bind(this)
        },
        {
            Tick: 0,
            Interval: 6000,
            Wake: this.Timer6seconds.bind(this)
        },
        {
            Tick: 0,
            Interval: 10000,
            Wake: this.Timer10seconds.bind(this)
        },
        {
            Tick: 0,
            Interval: 60000,
            Wake: this.Timer60seconds.bind(this)
        }
    ];

    //PingPong
    this.LOST_PACKET_TO_KICK = 6;

    this.MissionManager = new MissionManager(this);
    this.AchievementManager = new AchievementManager(this);

    this.ChannelID = Config.MasterConfig.Cluster.ChannelID;
    this.EventTopData = [];
    this.EventManager = new EventManager();
    this.DestroySocketTimeOut = 60 * 1000; //60s
    this.DynamicConfig = Config.DynamicConfig;
    this.BetaConfig = Config.BetaConfig;
    this.JackpotUpdatePacket = {};
    this.ShowStoreConfigData = {
        AwardOnlineCount: 1,
        AwardDailyCount: 1,
        RechargeGold: 1,
        BlackListOS: [],//0,web,
        BlackListVersion: []
    };
}

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

Master.prototype.Start = function (MasterID, MasterIP, MasterPortR, MasterPortWS, MasterPortWSS) {
    this.MasterID = MasterID;
    this.MasterUserPortWS = MasterPortWS;
    this.MasterUserPortWSS = MasterPortWSS;
    this.MasterUserPortR = MasterPortR;
    this.MasterIP = MasterIP;
    this.Init();
};

Master.prototype.Init = function () {
    this.InitUserListener(); // Init User Listenter
    this.Logger.Init(this.MasterID, this.LoggerConfig, function () {
        this.RedisAdapter.Init(this.MasterID, Config.RedisConfig, this.Logger.Redis());
        this.GMToolAdapter.Init(this.MasterID, this.GMToolConfig, this.HandleGMTool.bind(this));
        this.SQLAdapter.Init(this.SQLConfig, this.Logger.Sql());
        this.LogRecorder.Init(this.LogRecorderConfig, this.Logger.LogRecorder());
        this.ApiMoney.Init(this);
        this.DailyAwardAdapter.Init(this);
        this.OnlineAwardAdapter.Init(this);
        setTimeout(this.Initialling.bind(this), 1000);
    }.bind(this));

};

Master.prototype.Initialling = function () {
    this.Logger.Game().info("GameServer Initialling !");
    if (this.SQLAdapter.getStatus()
        && this.RedisAdapter.getStatus()
        && this.GMToolAdapter.getStatus()
        && this.LogRecorder.getStatus()
    ) {
        this.InitCompleted();
    } else {
        this.Logger.Game().info("GameServer Init Status : ",
            "\r\nSQLAdapter", this.SQLAdapter.getStatus(),
            "\r\nRedisAdapter", this.RedisAdapter.getStatus(),
            "\r\nGMToolAdapter", this.GMToolAdapter.getStatus(),
            "\r\nLogRecorder", this.LogRecorder.getStatus()
        );
        setTimeout(this.Initialling.bind(this), 1000);
    }
};

Master.prototype.InitCompleted = function () {
    this.Logger.Game().info("Master InitCompleted !");
    this.SQLAdapter.masterStatusStart(this.MasterID, this.MasterIP, this.UserClient.length, this.MasterUserPortR, this.MasterUserPortWS, this.MasterUserPortWSS);
    setTimeout(this.MainLoop.bind(this), 1000);
    this.LoadEventTopList();
    this.EventManager.Init(this);//Quản lý tất cả event
    this.smoketest();
};


Master.prototype.InitUserListener = function () {
    if (this.MasterUserPortWS > 0 && this.MasterUserPortWS < 65000) {
        this.WSocketUser = new WebSocket.Server({
            port: this.MasterUserPortWS,
            perMessageDeflate: false
        }, function (err) {
            if (!err) this.Logger.Master().info("MasterID " + this.MasterID + " is online listen all on port [WS] : " + this.MasterUserPortWS);
            else this.Logger.Master().error("Master fail to start on port : " + this.MasterUserPortWS);
        }.bind(this));
        this.WSocketUser.on('connection', this.WebSocketUserConnect.bind(this, false));//Bind This vs IsWSS
        this.WSocketUser.on('error', function (err) {
            this.Logger.Master().error("error W :" + err);
            //Handle Err3or
        }.bind(this));
    } else {
        this.Logger.Master().info("MasterID " + this.MasterID + " WebSocket disable ");
    }
    if (this.MasterUserPortWSS > 0 && this.MasterUserPortWSS < 65000) {
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
        }).listen(this.MasterUserPortWSS, '0.0.0.0', function (err) {
            if (!err) this.Logger.Master().info("MasterID " + this.MasterID + " is online listen all on port [WSS] : " + this.MasterUserPortWSS);
            else this.Logger.Master().error("Master fail to start on port : " + this.MasterUserPortWSS);
        }.bind(this));

        this.WSSocketUser = new WebSocket.Server({
            server: webServer,
            perMessageDeflate: false
        }, function (err) {
            if (!err) this.Logger.Master().info("MasterID " + this.MasterID + " is online listen all on port [WSS] : " + this.MasterUserPortWSS);
            else this.Logger.Master().error("Master fail to start on port : " + this.MasterUserPortWSS);
        }.bind(this));
        this.WSSocketUser.on('connection', this.WebSocketUserConnect.bind(this, true));//Bind This vs IsWSS
        this.WSSocketUser.on('error', function (err) {
            this.Logger.Master().error("error W :" + err);
            //Handle Err3or
        }.bind(this));
    } else {
        this.Logger.Master().info("MasterID " + this.MasterID + " WebSocket Secure disable ");
    }

    if (this.MasterUserPortR > 0 && this.MasterUserPortR < 65000) {
        this.RSocketUser = Net.createServer(this.RawSocketUserConnect.bind(this));
        this.RSocketUser.listen(this.MasterUserPortR, '0.0.0.0', function () {
            this.Logger.Master().info("MasterID " + this.MasterID + " is online listen all on port [Raw] : " + this.MasterUserPortR);
        }.bind(this));
        this.RSocketUser.on('error', function (err) {
            this.Logger.Master().error("error R :" + err);
            //Handle Error
        }.bind(this));
    } else {
        this.Logger.Master().info("MasterID " + this.MasterID + " RawSocket disable");
    }
};

Master.prototype.WebSocketUserConnect = function (isWss, socket) {//nhận kết nối của user (đầu tiên)
    try {
        this.Logger.Master().debug('WebSocketUserConnect', socket._socket.remoteAddress);
        socket.socketType = 1;
        socket.isWss = isWss;
        socket.remoteAddress = socket._socket.remoteAddress;
        socket.remotePort = socket._socket.remotePort;
        socket.remoteAddressReal = socket.remoteAddress;
        socket.end = socket.close;
        if (this.MaintainFlag) {
            var msg = new Packet.KickUserResponse(0, 'Hệ thống bảo trì.');
            if (msg != 0)
                this.SendSocketBinary(socket, msg);
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
                socket.UserModel.PingPongLost = 0;
            });

            function close(error) { // Ham handle Error và End
                this.server.OnUserDisconnected(error, this.socket);
            }
        }
    } catch (e) {
        this.Logger.Master().error('WebSocketUserConnect try ', e.stack);
    }

};

Master.prototype.RawSocketUserConnect = function (socket) {//nhận kết nối của user (đầu tiên)
    this.Logger.Master().debug('RawSocketUserConnect', socket.remoteAddress);
    socket.socketType = 0;
    socket.remoteAddressReal = socket.remoteAddress;
    if (this.MaintainFlag) {
        var msg = new Packet.KickUserResponse(0, 'Hệ thống bảo trì.');
        if (msg != 0)
            this.SendSocketBinary(socket, msg);
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
};

Master.prototype.OnUserDisconnected = function (error, socket) {//Khi User Disconnect thự hiện
    this.DestroySocket(socket);
};

//Thêm GetServerGameList để lấy danh sách phòng theo mainloop
Master.prototype.MainLoop = function () {
    var local = new Date();
    var difTime = (local - this.MainTime);
    this.MainTime = local;
    for (var i = 0; i < this.MasterTimers.length; i++) {
        this.MasterTimers[i].Tick += difTime;
        if (this.MasterTimers[i].Tick > this.MasterTimers[i].Interval) {
            this.MasterTimers[i].Tick = 0;
            this.MasterTimers[i].Wake();
        }
    }

    setTimeout(this.MainLoop.bind(this), 100);
};

Master.prototype.Timer5seconds = function () {
    try {
        this.GetServerGameList();
        this.HotUpdateReload();
        this.AnalyseUserManagerReload();
        this.ReloadLoggerLevel();
        this.ReloadGameListConfig();
        this.ReloadDynamicConfig();
        this.ReloadBetaConfig();
        this.ReloadShowStoreConfig();

    } catch (e) {
        this.Logger.Master().error('Master.prototype.Timer5seconds - try err: ' + e.stack);
    }
};

Master.prototype.Timer6seconds = function () {
    try {
        this.OnlineAwardAdapter.CheckUserOnlineTimer();// Check Online Time Cho User
        this.UpdateLobbyJackpotPacket();
        this.UpdateLobbyJackpot();
    } catch (e) {
        this.Logger.Master().error('Master.prototype.Timer6seconds - try err: ' + e.stack);
    }
};

Master.prototype.Timer10seconds = function () {
    try {
        this.ReloadConfigFromRedis(); //Cập nhật config động từ Redis
        this.ClearUserNotInServer();// Check User in TZ but not in Server
        this.GetListOnlineAward();
        this.PingPong();
        this.UpdateServerStatus();
        this.EventManager.ReloadAllEvent();
    } catch (e) {
        this.Logger.Master().error('Master.prototype.Timer10seconds - try err: ' + e.stack);
    }
};

Master.prototype.Timer60seconds = function () {
    try {
        this.LoadEventTopList();
        this.EventTopCheckExpired();
    } catch (e) {
        this.Logger.Master().error('Master.prototype.Timer60seconds - try err: ' + e.stack);
    }
};

/**
 * @returns {int}
 */
Master.prototype.FindUserByUserID = function (userId) {
    for (var i = 0; i < this.UserClient.length; i++) {
        var UserModel = this.UserClient[i].UserModel;
        if (UserModel.UserID == userId) return UserModel;
    }
    return 0;
};

Master.prototype.FindUserByAccountID = function (accountId) {
    for (var i = 0; i < this.UserClient.length; i++) {
        var UserModel = this.UserClient[i].UserModel;
        if (UserModel.AccountID == accountId) return UserModel;
    }
    return 0;
};

Master.prototype.KickUserByUserID = function (userId, msgText) {
    var User = this.FindUserByUserID(userId);
    if (User != 0) {
        var msg = new Packet.KickUserResponse(0, msgText);
        this.SendSocketBinary(User.Socket, msg);
        this.ShowPopup(User.Socket, msgText);
        this.DestroySocket(User.Socket);
    }

};

Master.prototype.KickUserByAccountID = function (accountId, msgText) {
    var User = this.FindUserByAccountID(accountId);
    if (User != 0) {
        var msg = new Packet.KickUserResponse(0, msgText);
        this.SendSocketBinary(User.Socket, msg);
        this.ShowPopup(User.Socket, msgText);
        this.DestroySocket(User.Socket);
    }
};
Master.prototype.SendSocketBinary = function (socket, msg) {
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
        this.Logger.Master().debug("SendSocketBinary err " + e.stack);
    }
};

Master.prototype.SendBroadCast = function (msg, langCode, gameId) {
    for (var i = 0; i < this.UserClient.length; i++) {
        try {
            if (this.UserClient[i].LangCode == langCode) {
                this.SendSocketBinary(this.UserClient[i], msg);
            }
        } catch (e) {
            this.Logger.Master().error("SendBroadCast err " + e);
        }
    }
};

Master.prototype.DestroySocketNoDeleteTZ = function (socket) {
    try {
        if (socket.isDestroyed) {
            return;
        } else {
            socket.isDestroyed = true;
        }
        var index = this.UserClient.indexOf(socket);
        if (index > -1) {
            this.UserClient.splice(index, 1);
        }
        if (socket.socketType == 0) {//Raw Socket
            socket.removeAllListeners('data');
            socket.end();
            socket.destroy();
        } else {//Web Socket
            socket.removeAllListeners('message');
            socket.close();
        }
    }
    catch (e) {
        this.Logger.Master().error("DestroySocketNoDeleteTZ err " + e);
    }
};

Master.prototype.DestroySocket = function (socket) {

    try {
        if (!Utility.CheckVariable(socket)) { // socket lổi
            return;
        }
        if (!socket.reCheckDestroyTime) {
            socket.reCheckDestroyTime = 0;
        }
        if (socket.isDestroyed && socket.reCheckDestroyTime > +new Date()) {
            return;
        } else {
            socket.isDestroyed = true;
            socket.reCheckDestroyTime = +new Date() + this.DestroySocketTimeOut;
        }
        if (Utility.CheckVariable(socket.UserModel) && socket.UserModel.IsAddUserLogin) { //User đã add vào login log
            socket.UserModel.IsAddUserLogin = false;
            this.SQLAdapter.userOnlineRemove(socket.UserModel.UserID, this.MasterID, 0);
            this.OnlineAwardAdapter.onlineAwardUpdateOnUserLeft(socket.UserModel);
            this.TriggerRefundMoneyWeb(socket.UserModel);
            this.UpdateTrackingUserFlagData(socket.UserModel);
        }
        // if (socket.UserModel.UserID <= 2147483647 && socket.UserModel.UserID > 0) {
        //     if (socket.isNeedRemoveTZ) {
        //         //this.SQLAdapter.DeleteTZLoginRecord(socket.UserModel.UserID, this.MasterID);
        //     }
        //     this.RedisAdapter.RemoveToUserOnlineList(socket.UserModel.UserID, this.MasterID);
        // }

        var index = this.UserClient.indexOf(socket);
        if (index > -1) {
            this.UserClient.splice(index, 1);
        }

        if (socket.socketType == 0) {//Raw Socket
            socket.removeAllListeners('data');
            socket.end();
            socket.destroy();
        } else {//Web Socket
            socket.removeAllListeners('message');
            socket.close();
        }
    }
    catch (e) {
        this.Logger.Master().error("DestroySocket err " + e.stack);
    }
};

//Format PUBLISH MasterGM {"CMD": 1001, "Data": {}, "SID": 2}
Master.prototype.HandleGMTool = function (channel, message) {
    switch (channel) {
        case this.GMToolConfig.Channel.MasterGM: {
            try {
                var Object = JSON.parse(message);
                this.GMToolExecute(Object.CMD, Object.SID, Object.Data);
            } catch (e) {
                this.Logger.Master().error('Master.prototype.HandleGMTool - try err: ' + e.stack);
            }
            break;
        }
        default: {
            break;
        }
    }
};

//PUBLISH MasterGM "{\"CMD\": , \"Data\": {}, \"SID\": 0}"
Master.prototype.GMToolExecute = function (CMD, SID, data) {
    this.Logger.Master().debug('Master.prototype.GMToolExecute ', CMD, SID, data);
    try {
        if (CMD == null || SID == null || data == null) return;
        if (SID == this.MasterID) return; // Ignore itself command

        switch (CMD) {
            //PUBLISH MasterGM "{\"CMD\": 1001, \"Data\": {\"UserId\": 1234}, \"SID\": 0}"
            case this.GMToolConfig.CMD.UserKickByUserID://Tài khoản hiện đang đăng nhập
            {//Check xem GameServer của User Online có chứa User này không. Nếu không Respone cho GameServer kia biết và set trạng thái User về Offline.
                try {
                    this.KickUserByUserID(data.UserID, data.Msg);
                } catch (e) {
                    this.Logger.Master().error('Master.prototype.GMToolExecute - Config.GMToolConfig.CMD.UserKick - try 2 err: ' + e.stack);
                }

                break;
            }
            case this.GMToolConfig.CMD.UserKickByAccountID://Tài khoản hiện đang đăng nhập
            {//Check xem GameServer của User Online có chứa User này không. Nếu không Respone cho GameServer kia biết và set trạng thái User về Offline.
                try {
                    this.KickUserByAccountID(data.AccountID, data.Msg);
                } catch (e) {
                    this.Logger.Master().error('Master.prototype.GMToolExecute - Config.GMToolConfig.CMD.UserKick - try 2 err: ' + e.stack);
                }

                break;
            }
            case this.GMToolConfig.CMD.UpdateUserGold: {
                try {
                    var user = this.FindUserByUserID(data.UserID);
                    if (user != 0) {
                        this.UpdateUserMoneyFromDBForClient(user);
                    }
                } catch (e) {
                    this.Logger.Master().error('GMToolExecute - Config.GMToolConfig.CMD.UpdateUserGold - try 2 err: ' + e);
                }
                break;
            }
            case this.GMToolConfig.CMD.UserOutGameCompleted: {
                try {
                    if (Utility.CheckVariable(data, 'UserID', 'ListID')) {
                        this.OnUserOutGameCompleted(data.UserID, data.ListID, data.AC);
                    }
                } catch (e) {
                    this.Logger.Master().error('GMToolExecute - Config.GMToolConfig.CMD.UpdateUserGold - try 2 err: ' + e);
                }

                break;
            }
            case this.GMToolConfig.CMD.Notification:
                if (Utility.CheckVariable(data, 'Text', 'Url', 'LangCode', 'Priority', 'GameID')) {
                    this.SendNotificationAllUser(data.Text, data.Url, data.LangCode, data.Priority, data.GameID);
                }
                break;
            case this.GMToolConfig.CMD.ResetMission: {
                this.ResetAllMissionForUser();
                break;
            }
            default: {
                break;
            }
        }
    } catch (e) {
        this.Logger.Master().error('Master.prototype.GMToolExecute - try err: ' + e.stack);
    }
};

//Gửi notification cho toàn client
Master.prototype.SendNotificationAllUser = function (Text, Url, LangCode, Priority, GameID) {
    try {
        var msg = new Packet.BroadcastResponse(Text, Priority, Url);
        if (msg != 0) {
            this.SendBroadCast(msg, LangCode, GameID);
        }
    } catch (e) {
        this.Logger.Master().error('Master.prototype.SendNotificationAllUser - try err: ' + e.stack);
    }
};

Master.prototype.KickAllClient = function (msg) {
    var buf = new Packet.KickUserResponse(0, msg);
    for (var i = 0; i < this.UserClient.length; i++) {
        if (buf != 0)
            this.SendSocketBinary(this.UserClient[i], buf);
        this.DestroySocket(this.UserClient[i]);
    }

    if (this.UserClient.length > 0) {
        this.KickAllClient(msg);
    } else
        process.exit(0);
};

Master.prototype.PingPong = function () {
    var deadSocket = [];
    var i;
    for (i = 0; i < this.UserClient.length; i++) {
        if (Utility.CheckVariable(this.UserClient[i])) {
            var User = this.UserClient[i].UserModel;
            User.PingPongLost += 1;
            if (User.Socket.socketType != 0 && User.Socket.readyState == WebSocket.OPEN) {
                User.Socket.ping();
            } else {
                //handle ping raw
            }
            if (User.PingPongLost > this.LOST_PACKET_TO_KICK) {
                deadSocket.push(this.UserClient[i]);

            }
        }
    }
    for (i = 0; i < deadSocket.length; i++) {
        this.DestroySocket(deadSocket[i]);
    }
};

//Lấy danh sách phòng online theo mainloop
Master.prototype.GetServerGameList = function () {
    this.SQLAdapter.getAllServerGame(function (err, data) {
        this.ListRoomOnline = [];
        try {
            if (err == 0) {
                // data.sort(function (a, b) {
                //     if (a.CCU < b.CCU)
                //         return -1;
                //     if (a.CCU > b.CCU)
                //         return 1;
                //     return 0;
                // });
                this.ListRoomOnline = data;
            }
        } catch (e) {
            this.Logger.Master().error('GetServerGameList - GetOnlineRoom - try err: ' + e);

        }
    }.bind(this));

};

//param type: 1 - tự do; 2 - đấu trường; 3 - vip
Master.prototype.GetListRoomByKindID = function (KindID) {
    var lst = [];
    try {
        for (var i = 0; i < this.ListRoomOnline.length; i++) {
            var tmp = this.ListRoomOnline[i];
            if (tmp.CCU > tmp.MaxCCU) continue;
            if (tmp.KindID == KindID)
                lst.push(tmp);
        }
    } catch (e) {
        this.Logger.Master().error('Master.prototype.GetListRoomByKindID - try err: ' + e.stack);
    }
    return lst;
};

//cập nhật trạng thái server
Master.prototype.UpdateServerStatus = function () {
    this.SQLAdapter.masterStatusUpdate(this.MasterID, this.UserClient.length);
};

Master.prototype.DestroyByUserID = function (UserID, msg) {
    try {
        for (var i = 0; i < this.UserClient.length; i++) {
            var User = this.UserClient[i].UserModel;
            if (User.UserID == UserID) {
                if (msg != 0)
                    this.SendSocketBinary(User.Socket, msg);
                User.Socket.isNeedRemoveTZ = false;
                setTimeout(function (__Socket) {
                    this.DestroySocketNoDeleteTZ(__Socket);
                }.bind(this, User.Socket), 1000);//Delay close socket
                break;
            }
        }
    } catch (e) {
        this.Logger.Master().error('Master.prototype.DestroyByUserID - try err: ' + e.stack);
    }
};

Master.prototype.IsNullOrUndefined = function (obj) {
    return obj == null || typeof obj == 'undefined';
};

//gọi show popup ở client
Master.prototype.ShowPopup = function (Socket, Msg) {
    try {
        this.SendSocketBinary(Socket, new Packet.ShowMsgResponse(Msg));

    } catch (e) {
        this.Logger.Master().error('Master.prototype.ShowPopup - try err: ' + e.stack);
    }
};

Master.prototype.ReloadConfigFromRedis = function () {
    this.RedisAdapter.ReloadExpiredTime();
};

Master.prototype.HotUpdateReload = function () {
    try {
        var tmpCfg = requireUnCached('./Modules/HotUpdate');
        HotUpdateModule = tmpCfg;
        HotUpdateModule.debugReal(this);


    } catch (e) {
        this.Logger.Master().error('GameServer.prototype.HotUpdateReload - try err: ' + e.stack);
    }
};

Master.prototype.AnalyseUserManagerReload = function () {
    try {
        var tmpCfg = requireUnCached('./Modules/AnalyseUser');
        AnalyseUserManager = tmpCfg;
    } catch (e) {
        this.Logger.Master().error('GameServer.prototype.AnalyseUserManagerReload - try err: ' + e.stack);
    }
};

Master.prototype.ClearUserNotInServer = function () {
    this.SQLAdapter.userOnlineGetListByMasterID(this.MasterID, function (err, data) {
        try {
            if (!err) {
                if (Utility.CheckVariable(data)) {
                    for (var i = 0; i < data.length; i++) {
                        if (!Utility.CheckVariable(data[i], 'UserID')) continue;
                        var UserID = data[i].UserID;
                        var Player = this.FindUserByUserID(UserID);
                        if (Player == 0) {
                            this.SQLAdapter.userOnlineRemove(UserID, this.MasterID, 0);
                        }
                    }
                }

            }

        } catch (e) {
            this.Logger.Master().error('Master.prototype.ClearUserNotInServer - try err: ' + e.stack);
        }
    }.bind(this));
};

Master.prototype.OnCheckUserLoginByToken = function (IsError, Socket, Info) {
    Socket.LangCode = 0;
    if (IsError == 1) {
        this.HandleLoginError(Socket, this.Config.LanguageConfig.Login_ParseDataErr.logMsg + Info, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_ParseDataErr, Socket.LangCode));
        return;
    }
    Socket.LangCode = Info.LangCode;
    //eck param login err 1001 {"Account":"Fgn4aVq5t3ZG6ST","Time":1523946292,"ChannelID":"app1","PlatformID":"IOS","GameName":"B\u1eafn C\u00e1","ProviderID":null}

    if (!Utility.CheckVariable(Info, 'Account', 'Time')) {//todo : thêm DisplayName
        this.HandleLoginError(Socket, this.Config.LanguageConfig.Login_CheckParamFail.logMsg + Info, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_CheckParamFail, Socket.LangCode));
        return;
    }

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

    try {
        var user = Socket.UserModel;
        var Time = Info.Time; //Lấy thời gian để kiểm tra
        var DiffTime = Math.abs(Time - (+new Date())); // Kiểm tra sự chênh lệch thời gian giữa Server và thời gian trong thogn6 tin chứng thực. Thời gian ở đây là Mili Second. (+new Date() dùng để lấy thời gian = ms)
        DiffTime = 0; // TODO : hardcode, online phải gỡ ra
        if (DiffTime > this.TimeOutAuth) {
            this.HandleLoginError(Socket, this.Config.LanguageConfig.Login_TokenTimeOut.logMsg + Info, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_TokenTimeOut, Socket.LangCode));
        }
        //Check token
        //LoginInfo.AppVersion
        user.AccountID = Info.Account;
        user.SessionID = this.GetSessionForUser(); // hiện chưa dùng tới, sau này dùng để tracking
        user.GameName = Info.DisplayName || 'User' + user.AccountID;
        this.GetUserExtendLoginInfo(user, Info.Extend);
        this.SQLAdapter.checkLoginV2(user.AccountID, user.GameName, this.MasterID, 0, user.FBID, Socket.remoteAddressReal, function (err, data) {
            try {
                if (err == 0) {
                    try {
                        user.UserID = data.UserID;
                        user.IsAddUserLogin = true;
                        if (!this.CheckBetaUserAccess(user.UserID)) { // Check khi beta
                            this.HandleLoginError(Socket, this.Config.LanguageConfig.Login_BetaAccessOnly.logMsg + err, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_BetaAccessOnly, Socket.LangCode));
                            return;
                        }
                        user.Level = data.Lv;
                        user.Exp = data.Exp;
                        user.LoginDayCount = this.CalcLoginCountDay(data.CreateDate);
                        user.StockHandicap = data.StockHandicap;
                        user.RechargeGold = data.TotalRecharge;
                        user.UserChannelID = this.GetChannelID(Info.ChannelID);//; user converter
                        user.UserProviderID = 0;//Info.PlatformID;
                        user.UserPlatformID = this.GetPlatformID(Info.PlatformID);//Info.ProviderID;
                        user.Wallet = 0;
                        this.LogRecorder.loginLogging(user.UserID, Info.Token, new Date(), Socket.remoteAddress, this.MasterID, user.UserChannelID, user.UserProviderID, user.UserPlatformID);
                        this.OnUserWebLoginSucceed(Socket);
                    } catch (e) {
                        this.HandleLoginError(Socket, this.Config.LanguageConfig.Login_TryCatchInsideCheckLogin.logMsg + e.stack, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_TryCatchInsideCheckLogin, Socket.LangCode));
                    }

                } else {
                    if (err == 'userOnline' && data == 'Online') { //User đang online
                        this.HandleLoginError(Socket, this.Config.LanguageConfig.Login_Duplicate.logMsg + err, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_Duplicate, Socket.LangCode));
                        this.HandleUserConflict(Socket);
                    } else {
                        this.HandleLoginError(Socket, this.Config.LanguageConfig.Login_CheckLoginError.logMsg + err, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_CheckLoginError, Socket.LangCode));
                    }

                }
            } catch (e) {
                this.HandleLoginError(Socket, this.Config.LanguageConfig.Login_TryCatchOutSideCheckLogin.logMsg + e.stack, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_TryCatchOutSideCheckLogin, Socket.LangCode));
            }
        }.bind(this));

    }
    catch (parseEx) {
        this.HandleLoginError(Socket, this.Config.LanguageConfig.Login_ParseTokenError.logMsg + parseEx.stack, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_ParseTokenError, Socket.LangCode));

    }
};

Master.prototype.HandleUserConflict = function (Socket) {
    this.Logger.Master().error('HandleUserConflict.prototype.HandleUserConflict AccountID : ', Socket.UserModel.AccountID);
    this.HandleLoginError(Socket, Config.LanguageConfig.Login_Duplicate.logMsg + Socket.UserModel.AccountID, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_Duplicate, Socket.LangCode));
    this.KickUserAllGameByAccount(Socket.UserModel.AccountID, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_Duplicate, Socket.LangCode));
    this.KickUserAllMasterByAccount(Socket.UserModel.AccountID, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_Duplicate, Socket.LangCode));
};

Master.prototype.KickUserAllGame = function (userID, msg) {
    this.GMToolAdapter.SendGameCommand({
        CMD: this.GMToolConfig.CMD.UserKickByUserID,
        SID: 0,
        Data: {
            UserID: userID,
            Msg: msg
        }
    });
};

Master.prototype.KickUserAllMaster = function (userID, msg) {
    this.GMToolAdapter.SendBroadCastMasterCommand({
        CMD: this.GMToolConfig.CMD.UserKickByUserID,
        SID: 0,
        Data: {
            UserID: userID,
            Msg: msg
        }
    });
};

Master.prototype.KickUserAllGameByAccount = function (accountId, msg) {
    this.GMToolAdapter.SendGameCommandAll({
        CMD: this.GMToolConfig.CMD.UserKickByAccountID,
        SID: 0,
        Data: {
            AccountID: accountId,
            Msg: msg
        }
    });
};

Master.prototype.KickUserAllMasterByAccount = function (accountId, msg) {
    this.GMToolAdapter.SendBroadCastMasterCommand({
        CMD: this.GMToolConfig.CMD.UserKickByAccountID,
        SID: 0,
        Data: {
            AccountID: accountId,
            Msg: msg
        }
    });
};

Master.prototype.KickUserAllMasterWithTime = function (UserID, timeCheck) {
    this.GMToolAdapter.SendMasterCommand({
        CMD: this.GMToolConfig.CMD.UserEnterMaster,
        Data: {
            UserID: UserID,
            Time: timeCheck
        },
        SID: this.MasterID
    });
};

Master.prototype.KickUserLoginConflict = function (Socket) {
    //Kick User trong Master hiện tại nếu tồn tại.
    var msg2 = new Packet.KickUserResponse(0, 'Tài khoản đã được đăng nhập ở một nơi khác. Bạn đã bị Kick !');
    this.DestroyByUserID(Socket.UserModel.UserID, msg2);
    //Kick User ra khỏi Master ở tất cả Master
    this.KickUserAllMasterWithTime(Socket.UserModel.UserID, Socket.UserModel.LoginTime);
    //Kick User ra khỏi GameServer ở tất cả các GameServer
    this.KickUserAllGame(Socket.UserModel.UserID, Socket.UserModel.LoginTime, Socket.UserModel.SessionID);
};

Master.prototype.GetSessionForUser = function () {
    if (this.SessionCounter > 2000000000) this.SessionCounter = 0; // 2 tỷ
    return this.SessionCounter++;
};

Master.prototype.OnUserWebLoginSucceed = function (Socket) {
    try {
        this.UserClient.push(Socket);
        //Tạo NV cho user
        //this.UserGenListMission(Socket.UserModel.UserID);
        var msgSuccess = new Packet.LoginGameResponse(
            Socket.UserModel.UserID,
            Socket.UserModel.Wallet,
            Socket.UserModel.LevelUser,
            Socket.UserModel.GameName
        );
        if (msgSuccess != 0)
            this.SendSocketBinary(Socket, msgSuccess);
        this.UpdateUserMoneyFromDBForClient(Socket.UserModel);
        this.SQLAdapter.getUserCharge(Socket.UserModel.UserID, function (e, d) {
            if (e == 0) {
                if (Utility.CheckVariable(d) && Utility.CheckVariable(d[0], 'Money')) {
                    Socket.UserModel.RechargeGold = d[0].Money;
                    this.AnalyseUserOnAction(Socket.UserModel);
                }
            }
        }.bind(this));
        this.AnalyseUserOnLogin(Socket.UserModel);
        //RechargeGold

        this.CheckIPUserLoginCount(Socket.UserModel, function () {
            if (Socket.UserModel.UserIPLoginCount < this.DynamicConfig.IPLimitedCount) {
                this.CheckUserAward(Socket.UserModel); // Check Tiền thưởng
                this.EventManager.OnUserLoginHandle(Socket.UserModel);
            }

        }.bind(this));

        this.MissionManager.GetListMissionForUser(Socket.UserModel);
        this.AchievementManager.GetListAchievementForUser(Socket.UserModel);

    } catch (e) {
        this.Logger.Master().error('Master.prototype.OnUserWebLoginSucceed - try err: ' + e.stack);
    }
};

Master.prototype.UpdateGoldForUser = function (socket, IsUserLogin) {
    // this.SQLAdapter.GetGoldForUser(socket.UserModel.UserID, function (err, Gold) {
    //     if (err) {
    //         this.Logger.Master().error("UpdateGoldForUser ", err);
    //     }
    //     else {
    //         if (!IsUserLogin) {
    //             this.SendSocketBinary(socket, new Packet.UpdateGoldForUser(Gold));
    //             this.Logger.Master().debug('UpdateGoldForUser', socket.UserModel.UserID, Gold);
    //         }
    //     }
    // }.bind(this));
};

Master.prototype.UpdateUserMoneyForClient = function (User) {
    if (!Utility.CheckVariable(User, 'Socket')) return;
    try {
        this.SendSocketBinary(User.Socket, new Packet.UpdateGoldForUser(User.Diamond, User.Wallet));
    } catch (e) {
        this.Logger.Master().debug('Master.prototype.UpdateUserMoneyForClient ', User.UserID, User.Wallet, User.Diamond);
    }
};

Master.prototype.UpdateUserMoneyFromDBForClient = function (User) {
    if (!Utility.CheckVariable(User, 'UserID')) return;
    try {
        this.SQLAdapter.moneyGetAll(User.UserID, function (e, d) {
            if (e == 0 && d.Money >= 0) {
                User.Wallet = d.Money;
                User.Diamond = d.Diamond;
                this.UpdateUserMoneyForClient(User);
            }
        }.bind(this));
    } catch (e) {
        this.Logger.Master().debug('Master.prototype.UpdateUserMoneyFromDBForClient ', User.UserID, User.Wallet, User.Diamond);
    }
};

Master.prototype.GetRoomInfoByKindID = function (isError, socket, kindId) { //pickroom
    try {
        if (isError != 0) {
            this.ShowPopup(socket, this.GetUserMsgByLangCode(this.Config.LanguageConfig.FindRoom_CheckParamFail, socket.LangCode));//FindRoom_CheckParamFail3
            this.Logger.Master().error('Master.prototype.GetRoomInfoByKindID isError ' + kindId);
            return;
        }
        this.FindGameServerByRoomKind(kindId, socket.UserModel.CurrentGameID, socket.socketType, socket.isWss, this.SendGameServerInfoForUser.bind(this, socket));
    } catch (e) {
        this.Logger.Master().error('Master.prototype.GetRoomInfoByKindID  ' + e.stack);
        this.ShowPopup(socket, this.GetUserMsgByLangCode(this.Config.LanguageConfig.FindRoom_CheckParamFail, socket.LangCode));//FindRoom_CheckParamFail3
    }


};

Master.prototype.SendGameServerInfoForUser = function (socket, kindId, room) {
    try {
        if (room != 0) {
            var port = room.PortWS; // Default là WS.
            if (socket.isWss) {//WSS
                port = room.PortWSS;
            } else {
                if (socket.socketType == 0) { // Raw socket
                    port = room.PortR;
                }
            }
            var server = room.IP + ":" + port;
            var dataLoginRoom = {
                AccountID: socket.UserModel.AccountID,
                UserID: socket.UserModel.UserID,
                SessionID: socket.UserModel.SessionID,
                MasterID: this.MasterID,
                GameName: socket.UserModel.GameName,
                ChannelID: socket.UserModel.UserChannelID,
                PlatformID: socket.UserModel.UserProviderID,
                ProviderID: socket.UserModel.UserPlatformID,
                RechargeGold: socket.UserModel.RechargeGold,
                LangCode: socket.LangCode,
                Time: +new Date()
            };
            var token = Encryption.aesEncryptIV(JSON.stringify(dataLoginRoom), Config.KeyConfig.RoomKey, Config.KeyConfig.RoomIV);
            room.CCU++; //Tăng CCU của phòng này lên. (chỉ hạn chế, vì phòng sẽ sync over ride)
            this.SendSocketBinary(socket, new Packet.JoinGameByKindIDResponse(0, kindId, room.LevelRequired, room.MoneyRequired, server, token));

        } else {
            this.ShowPopup(socket, this.GetUserMsgByLangCode(this.Config.LanguageConfig.FindRoom_FullRoom, socket.LangCode));//FindRoom_CheckParamFail3
        }
    } catch (e) {
        this.Logger.Master().error('Master.prototype.SendGameServerInfoForUser  ' + e.stack);
        this.ShowPopup(socket, this.GetUserMsgByLangCode(this.Config.LanguageConfig.FindRoom_CheckParamFail, socket.LangCode));//FindRoom_CheckParamFail3
    }
};

/** ------------------------------------------------------------------------------------------------------------------------*/

/** Code mới */

//Lấy danh sách quà online
Master.prototype.GetListOnlineAward = function () {
    try {
        this.ListOnlineAward = [];
        // this.SQLAdapter.OnlineAward_GetList(function (err, data) {
        //     if (err == 0) {
        //         this.ListOnlineAward = data;
        //     }
        // }.bind(this));
    } catch (e) {
        this.Logger.Master().error('Master.prototype.GetListOnlineAward - try err:' + e.stack);
    }
};

Master.prototype.GetUserOnline = function (Socket) {
    var rand = HotUpdateModule.GetUserOnlineCount(this);
    var msg1 = new Packet.GetUserOnlineResponse(rand);
    if (!this.IsNullOrUndefined(Socket)) {
        this.SendSocketBinary(Socket, msg1);
    }
};

Master.prototype.FindRoomWithLessCCU = function (RoomKind, socketType, isWss) {
    var RoomList = this.GetListRoomByKindID(RoomKind);
    var Result = 0;
    var first = 1;

    for (var i = 0; i < RoomList.length; i++) {
        if (socketType == 0) {
            if (RoomList[i].PortR <= 0) continue;
        } else {
            if (isWss) {
                if (RoomList[i].PortWSS <= 0) continue;
            } else {
                if (RoomList[i].PortWS <= 0) continue;
            }
        }
        if (first == 1 || RoomList[i].CCU < Result.CCU) {
            first = 0;
            Result = RoomList[i];
        }
    }
    return Result;
};

Master.prototype.FindGameServerByRoomKind = function (kindId, gameId, socketType, isWss, callback) {
    try {
        var room = 0;
        var first = 1;
        for (var i = 0; i < this.ListRoomOnline.length; i++) {
            var tmp = this.ListRoomOnline[i];
            if (tmp.CCU > tmp.MaxCCU) continue;
            if (tmp.KindID == kindId) {
                if (socketType == 0) {
                    if (this.ListRoomOnline[i].PortR <= 0) continue;
                } else {
                    if (isWss) {
                        if (this.ListRoomOnline[i].PortWSS <= 0) continue;
                    } else {
                        if (this.ListRoomOnline[i].PortWS <= 0) continue;
                    }
                }
                if (first == 1 || this.ListRoomOnline[i].CCU < room.CCU) {
                    first = 0;
                    room = this.ListRoomOnline[i];
                }


            }
        }
    } catch (e) {
        this.Logger.Master().error('Master.prototype.FindGameServerByRoomKind - try err: ' + e);
    }
    callback(kindId, room);

};

Master.prototype.UserGenListMission = function (UserID) {
    // this.SQLAdapter.CheckMission(UserID, this.ChannelID, function (isNeedGenMission) {
    //     if (isNeedGenMission == 1) {
    //         var ListMission = this.MissionManager.GenListMissionForUser();
    //         for (var i = 0; i < ListMission.length; i++) {
    //             try {
    //                 var mission = ListMission[i];
    //                 this.SQLAdapter.MissionInsert(UserID, this.ChannelID, mission.TypeID, mission.Target, mission.Param.toString(), mission.RewardExp, mission.RewardGold, this.ChannelID);
    //             } catch (e) {
    //                 this.Logger.Master().error('UserGenListMission - MissionInsert - try err: ' + e.stack);
    //             }
    //
    //         }
    //     }
    // }.bind(this));
};

Master.prototype.ResetAllMissionForUser = function () {
    try {
        for (var i = 0; i < this.UserClient.length; i++) {
            try {
                if (Utility.CheckVariable(this.UserClient[i]) && Utility.CheckVariable(this.UserClient[i].UserModel, 'UserID')) {
                    this.UserGenListMission(this.UserClient[i].UserModel.UserID);
                }
            } catch (e) {
                this.Logger.Master().error('ResetAllMissionForUser - For try err: ' + e.stack);
            }

        }
    } catch (e) {
        this.Logger.Master().error('ResetAllMissionForUser -  try err: ' + e.stack);
    }
};

Master.prototype.OnUserGetMoneyHistory = function (socket, pageIndex) {
    try {
        this.RedisAdapter.GetRecordMoneyHistory(socket.UserModel.UserID, function (e, d) {
            if (!e) {
                try {
                    if (pageIndex <= 0) {
                        pageIndex = 1;
                    }

                    var history = [];
                    for (var i = 0; i < d.length; i++) {
                        try {
                            history.push(JSON.parse(d[i]))
                        } catch (e) {

                        }
                    }

                    var pageSize = 10;
                    var end = pageIndex * pageSize;
                    var start = end - pageSize;
                    var data = history.slice(start, end);
                    var msg = new Packet.MoneyHistoryResponse(Math.floor(history.length / pageSize), data);
                    this.SendSocketBinary(socket, msg);
                } catch (e) {
                    this.Logger.Master().error('Master.prototype.OnUserGetMoneyHistory -  try err: ' + e.stack);
                }
            }
        }.bind(this));
    } catch (e) {
        this.Logger.Master().error('Master.prototype.OnUserGetMoneyHistory -  try err: ' + e.stack);
    }
};

Master.prototype.ReloadLoggerLevel = function () {
    try {
        var LoggerNewConfig = requireUnCached('../Config/Master/LoggerConfig.js');//Không gán trực tiếp, gán giáng tiếp để tránh bị lổi
        var LogLevel = LoggerNewConfig.LogLevel;
        this.Logger.setLogLevel(LogLevel);
    } catch (e) {
        this.Logger.Master().error('Master.prototype.ForceReloadConfigStock - try err: ' + e.stack);
    }
};

Master.prototype.ReloadGameListConfig = function () {
    try {
        var GameListConfig = requireUnCached('../Config/Common/GameListConfig.js');//Không gán trực tiếp, gán giáng tiếp để tránh bị lổi
        this.GameListConfig = GameListConfig;
    } catch (e) {
        this.Logger.Master().error('Master.prototype.ReloadGameListConfig - try err: ' + e.stack);
    }
};

Master.prototype.ReloadDynamicConfig = function () {
    try {
        var DynamicConfig = requireUnCached('../Config/Common/DynamicConfig.js');//Không gán trực tiếp, gán giáng tiếp để tránh bị lổi
        this.DynamicConfig = DynamicConfig;
        this.DailyAwardAdapter.ReloadDailyAwardConfig(this.DynamicConfig);
        this.OnlineAwardAdapter.ReloadOnlineAwardConfig(this.DynamicConfig);
    } catch (e) {
        this.Logger.Master().error('Master.prototype.ReloadDynamicConfig - try err: ' + e.stack);
    }
};

Master.prototype.ReloadBetaConfig = function () {
    try {
        var BetaConfig = requireUnCached('../Config/Common/BetaConfig.js');//Không gán trực tiếp, gán giáng tiếp để tránh bị lổi
        this.BetaConfig = BetaConfig;
    } catch (e) {
        this.Logger.Master().error('Master.prototype.ReloadDynamicConfig - try err: ' + e.stack);
    }
};

Master.prototype.HandleLoginError = function (Socket, ErrorMsg, ShowMsg) {
    this.ShowPopup(Socket, ShowMsg);
    this.Logger.Master().error('Master.prototype.HandleLoginError ', ErrorMsg);
    this.DestroySocket(Socket);
};

Master.prototype.GetUserMsgByLangCode = function (ErrCfg, LangCode) {
    switch (LangCode) {
        case 0 : // VN
            return ErrCfg.userMsg;
        case 1:
            return ErrCfg.userMsgEn;
        case 2:
            return ErrCfg.userMsgRu;
    }
    return ErrCfg.userMsg; // default (VN)
};

Master.prototype.TransferWebMoneyToGameAuto = function (User, callback) {
    this.ApiMoney.EmptyUserMoney(User.AccountID, 1, function (e, coin) {
        //Chuyển tiền web vào game tự động (auto)
        if (coin > 0) {
            this.SQLAdapter.moneyAddOnly(User, coin, this.Config.MoneyReasonConfig.WebTransferToGame, 'Chuyển tiền web vào game auto', this.MasterID, 0, User.CurrentGameID, function (err, d) {
                if (err == 0) {
                    if (d.Money > 0) {
                        User.Wallet = d.Money;
                    }
                } else {
                    this.Logger.Master().error('Master.prototype.EmptyAllUserWebMoney Update Fail ', err, User.UserID, this.Config.MoneyReasonConfig.WebTransferToGame, 'Chuyển tiền web vào game auto', User.UserChannelID, User.UserProviderID, User.PlatformID, this.MasterID, User.SessionID, 0);
                }
                callback();
            }.bind(this));
        } else {
            this.SQLAdapter.moneyGetAll(User.UserID, function (e, d) {
                if (e == 0 && d.Money > 0) {
                    User.Wallet = d.Money;
                }
                callback();
            }.bind(this));

        }
    }.bind(this));
};

Master.prototype.CheckUserAward = function (User, callback) {
    this.DailyAwardAdapter.CheckDailyAwardForUserOnLogin(User);
    this.OnlineAwardAdapter.CheckOnlineAwardForUserOnLogin(User);
};

Master.prototype.ChangeUserGameByID = function (User, GameID) {
    User.CurrentGameID = GameID;
    try {
        var msg;
        for (var gameCfg in this.GameListConfig) {
            if (this.GameListConfig.hasOwnProperty(gameCfg) && this.GameListConfig[gameCfg].GameID == GameID) {
                if (Utility.CheckVariable(this.GameListConfig[gameCfg].Config)) {
                    msg = new Packet.GetGameConfigByGameIDResponse(GameID, JSON.stringify(
                        this.GameListConfig[gameCfg].Config
                    ));
                }
                if (Utility.CheckVariable(msg)) {
                    this.SendSocketBinary(User.Socket, msg);
                } else {
                    this.ShowPopup(User.Socket, this.GetUserMsgByLangCode(this.Config.LanguageConfig.GetGameConfig_Error, User.Socket.LangCode));//
                    this.Logger.Master().error('Master.prototype.ChangeUserGameByID', GameID);
                }
                break;
            }
        }
    } catch (e) {
        this.ShowPopup(User.Socket, this.GetUserMsgByLangCode(this.Config.LanguageConfig.GetGameConfig_Error, User.Socket.LangCode));//
        this.Logger.Master().error('Master.prototype.ChangeUserGameByID try ', e.stack);
    }

};


Master.prototype.UserOnlineAward_Get = function (User) {
    this.OnlineAwardAdapter.GetOnlineAwardInfoForUser(User);
};

Master.prototype.UserOnlineAward_GetAward = function (User) {
    this.OnlineAwardAdapter.GetOnlineAwardForUser(User);
};


Master.prototype.UserDailyAward_Get = function (User) {
    this.DailyAwardAdapter.GetAwardInfoForUser(User);
};

Master.prototype.UserDailyAward_GetAward = function (User) {
    this.DailyAwardAdapter.GetAwardForUser(User);
};

Master.prototype.OnUserOutGameCompleted = function (UserID, ListID, AchievementChanged) {
    var User = this.FindUserByUserID(UserID);
    if (User != 0) {
        this.UpdateUserMoneyFromDBForClient(User);
        //UserOutGameCompleted
        this.MissionManager.OnMissionListOfUserChanged(User, ListID)
        if(AchievementChanged){
            this.AchievementManager.OnAchievementListOfUserChanged(User);
        }
        //this.OnlineAwardAdapter.CheckOnlineAwardForUserOnLogin(User); // Check lại thời gian Quà Online
    }
};

Master.prototype.GetTopPlayerListAllForUser = function (User) {
    try {
        var listEvt = [];
        for (var i = 0; i < this.EventTopData.length; i++) {
            if (this.EventTopData[i].TopData.length > 0) {
                listEvt.push({
                    ID: this.EventTopData[i].ID,
                    Text: this.GetUserMsgByLangCode(this.EventTopData[i].EventName, User.Socket.LangCode)
                })
            }
        }
        this.SendSocketBinary(User.Socket, new Packet.GetTopPlayerListAllResponse(listEvt));
    }
    catch (e) {
        this.Logger.Master().error('Master.prototype.GetTopPlayerListAllForUser - try err: ' + e.stack);
    }
};

Master.prototype.GetTopPlayerListByIDForUser = function (User, ID) {
    try {
        var event = 0;
        for (var i = 0; i < this.EventTopData.length; i++) {
            if (this.EventTopData[i].ID == ID) {
                event = this.EventTopData[i];
                break;
            }
        }
        if (event != 0) {

            this.RedisAdapter.zlistGetRevRank(event.DataKey, User.UserID, function (rank, score) {
                var msg = new Packet.GetTopPlayerListByIDResponse(rank + 1, score, +new Date(event.StartTime), +new Date(event.EndTime), event.TopData);
                this.SendSocketBinary(User.Socket, msg);
            }.bind(this));
        }

    }
    catch (e) {
        this.Logger.Master().error('Master.prototype.GetUserGetTopPlayerListByIDForUser - try err: ' + e.stack);
    }
};

Master.prototype.GetTopPlayerListWithAvartaByIDForUser = function (User, ID) {
    try {
        var event = 0;
        for (var i = 0; i < this.EventTopData.length; i++) {
            if (this.EventTopData[i].ID == ID) {
                event = this.EventTopData[i];
                break;
            }
        }
        if (event != 0) {

            this.RedisAdapter.zlistGetRevRank(event.DataKey, User.UserID, function (rank, score) {
                var msg = new Packet.GetTopPlayerListWithAvatarByIDResponse(rank + 1, score, +new Date(event.StartTime), +new Date(event.EndTime), event.TopData);
                this.SendSocketBinary(User.Socket, msg);
            }.bind(this));
        }

    }
    catch (e) {
        this.Logger.Master().error('Master.prototype.GetUserGetTopPlayerListByIDForUser - try err: ' + e.stack);
    }
};

Master.prototype.EventTopDataGenID = function () {
    if (this.EventTopDataID) {
        return ++this.EventTopDataID;
    } else {
        this.EventTopDataID = 0;
        return ++this.EventTopDataID;
    }
};

Master.prototype.FindEventTopDataByEventCode = function (EventCode) {
    for (var i = 0; i < this.EventTopData.length; i++) {
        if (this.EventTopData[i].EventCode == EventCode) {
            return this.EventTopData[i];
        }
    }
    return 0;
};

Master.prototype.EventTopDataGenAndUpdate = function (Event) {
    this.RedisAdapter.zlistGetRevRangeWithScore(Event.DataKey, 0, 100, function (data) {
        var top = 1;
        var uid = 0;
        var listUsr = [];
        var TopData = [];
        for (var i = 0; i < data.length; i++) {
            if (i % 2 == 0) {
                uid = data[i];
            } else {
                var usr = {
                    UserID: +uid,
                    GameName: 'NoName' + uid,
                    FID: '',
                    Score: data[i],
                    TopPos: top++
                };
                listUsr.push(+uid);
                TopData.push(usr);
            }
        }
        if (listUsr.length > 0) {
            this.SQLAdapter.getDisplayNameByMultiUserID(listUsr, function (e, d) {// Biên Dịch Tên từ UserID
                if (!e) {
                    for (var i = 0; i < d.length; i++) {
                        if (d[i].GameName == '') continue;
                        for (var j = 0; j < TopData.length; j++) {
                            if (+d[i].UserID == +TopData[j].UserID) {
                                TopData[j].GameName = d[i].GameName;
                                TopData[j].FID = d[i].FBID || '';
                            }
                        }
                    }
                    this.EventTopDataInsertUpdate(TopData, Event);
                }

            }.bind(this));
        } else {
            this.EventTopDataInsertUpdate(TopData, Event);
        }

    }.bind(this));
};

Master.prototype.EventTopDataInsertUpdate = function (TopData, Event) {
    var curTopData = this.FindEventTopDataByEventCode(Event.EventCode);
    if (curTopData == 0) {
        this.EventTopData.push({
            ID: this.EventTopDataGenID(),
            EventCode: Event.EventCode,
            EventName: JSON.parse(Event.EventName),
            TopData: TopData,
            DataKey: Event.DataKey,
            UpdateTime: +new Date()
        });
    } else {
        curTopData.TopData = TopData;
        curTopData.EventName = JSON.parse(Event.EventName);
        curTopData.DataKey = Event.DataKey;
        curTopData.UpdateTime = +new Date();
    }

};

Master.prototype.EventTopCheckExpired = function () {
    for (var i = 0; i < this.EventTopData.length; i++) {
        var diffTime = +new Date() - this.EventTopData[i].UpdateTime;
        if (diffTime > 180000) {// Quá hạn
            this.EventTopData.splice(i); // Xóa
            i--;
        }
    }
};

Master.prototype.LoadEventTopList = function () {
    this.SQLAdapter.getAllEventDisplay(function (e, d) {
        if (!e) {
            if (Utility.CheckVariable(d)) {
                for (var i = 0; i < d.length; i++) {
                    if (Utility.CheckVariable(d[i], 'EventCode', 'DataKey')) {
                        if (d[i].DataKey != '') {
                            this.EventTopDataGenAndUpdate(d[i]);
                        }
                    }
                }
            }

        }
    }.bind(this));
};

Master.prototype.TransferWebMoneyToGameByID = function (User, GameID, Money) {
    GameID = 1;
    if (Money <= 0) {
        //Số tiền chuyển phải dương
        return;
    }
    var moneyTmp = Money * -1; // Tiền trừ bên web
    this.ApiMoney.UpdateUserMoneyForWeb(User.AccountID, GameID, moneyTmp, function (e, coin) {
        if (e == 0) {
            this.OnTransferWebMoneyToGameByIDSuccess(User, Money);// Thành công update tiền = số tiền user muốn
        } else {// lổi ko update dc số tiền mong muốn
            this.ApiMoney.EmptyUserMoney(User.AccountID, GameID, function (e2, coin2) {
                if (e2 == 0) {
                    this.OnTransferWebMoneyToGameByIDSuccess(User, coin2);// Update = số tiền lấy được
                } else {
                    this.SendSocketBinary(User.Socket, new Packet.TransferMoneyToGameResponse(1));
                    this.ShowPopup(User.Socket, this.GetUserMsgByLangCode(this.Config.LanguageConfig.MoneyTransfer_Error, User.Socket.LangCode));//FindRoom_CheckParamFail3
                }
            }.bind(this))
        }
    }.bind(this));

};

Master.prototype.OnTransferWebMoneyToGameByIDSuccess = function (User, Coin) {
    this.SQLAdapter.moneyAddOnly(User, Coin, this.Config.MoneyReasonConfig.WebTransferToGame, 'Chuyển tiền web vào game auto', this.MasterID, 0, User.CurrentGameID, function (err, d) {
        if (err == 0) {
            if (d.Money > 0) {
                try {
                    User.Wallet = d.Money;
                    this.UpdateUserMoneyForClient(User);
                    this.SendSocketBinary(User.Socket, new Packet.TransferMoneyToGameResponse(0));
                } catch (e) {
                    this.Logger.Master().error('Master.prototype.OnTransferWebMoneyToGameByIDSuccess moneyAddOnly', e.stack);
                }

            }
        } else {
            this.Logger.Master().error('Master.prototype.OnTransferWebMoneyToGameByIDSuccess Update Fail ', err, User.UserID, this.Config.MoneyReasonConfig.WebTransferToGame, 'Chuyển tiền web vào game by id', User.UserChannelID, User.UserProviderID, User.PlatformID, this.MasterID, User.SessionID, 0);
        }
    }.bind(this));
};

Master.prototype.smoketest = function () {
    //var p = this.GetMasterConfigForUser();
    //this.AchievementManager.GetListAchievementForUser({UserID: 1});
    // var ml = this.MissionManager.GenListMissionForUser();
    // var nowUtc = new Date();nowUtc = nowUtc - 7*60*1000;
    // for(var i = 0 ; i < ml.length;i++){
    //     this.LogRecorder.dailyMissionRecord(nowUtc,1,ml[i].ID,ml[i].TypeID,ml[i].Target,ml[i].Completed,ml[i].IsGet,ml[i].Param.toString(),ml[i].RewardGold);
    // }
    // var p = this.MissionManager.GenMissionListPacket(ml, 0);
    // console.log(p);
    // p = this.MissionManager.GenMissionListPacket(ml, 1);
    // console.log(p);
    // p = this.MissionManager.GenMissionListPacket(ml, 2);
    // console.log(p);
    // this.EventManager.ReloadAllEvent();
    // //User.UserID, ReasonID, ReasonDesc, User.UserChannelID, User.UserProviderID, User.PlatformID, this.MasterID, User.SessionID
    // //User.UserChannelID, User.UserProviderID, User.UserPlatformID, ServerID, User.SessionID, GameKindID,GameID
    // setTimeout(function () {
    //     this.EventManager.OnUserLoginHandle({
    //         UserID:451,
    //         CheckEventFlagCount:0,
    //         LoginDayCount : Math.floor((new Date() - new Date()) / (24 * 3600 * 1000)) + 1,
    //         UserChannelID:0,
    //         UserProviderID:0,
    //         UserPlatformID:0,
    //         SessionID:0,
    //         CurrentGameID:0
    //     })
    // }.bind(this),3000);

};

Master.prototype.TriggerRefundMoneyWeb = function (User, IsReturnLobby) {
    // this.SQLAdapter.moneyChargeAll(User, this.Config.MoneyReasonConfig.GameTransferToWeb, 'Chuyển tiền game ra web', this.MasterID, User.SessionID, 0, User.CurrentGameID, function (err, d) {
    //     if (err == 0) {
    //         if (Utility.CheckVariable(d) && Utility.CheckVariable(d[0], 'Money')) {// co tiền
    //             var money = d[0].Money;
    //             this.ApiMoney.UpdateUserMoneyForWeb(User.AccountID, 1, money, function (e, coin) {
    //                 if (e != 0) {
    //                     this.Logger.Master().error('Master.prototype.TriggerRefundMoneyWeb UpdateUserMoneyForWeb Fail ', err, e, d, coin);
    //                 } else {
    //                     if (IsReturnLobby) {
    //                         User.Wallet = 0;
    //                         User.Diamond = coin;
    //                         this.UpdateUserMoneyForClient(User)
    //                     }
    //                 }
    //             }.bind(this));
    //         } else {
    //             this.Logger.Master().error('Master.prototype.TriggerRefundMoneyWeb GET Fail ', d);
    //         }
    //     } else {
    //         this.Logger.Master().error('Master.prototype.TriggerRefundMoneyWeb Update Fail ');
    //     }
    // }.bind(this));
};

Master.prototype.AddMoneyWebWithReason = function (User, Money, ReasonID, ReasonDesc) {
    this.SQLAdapter.moneyAddOnly(User, Money, ReasonID, ReasonDesc, this.MasterID, 0, User.CurrentGameID, function (err, d) {
        if (err == 0) {
            if (d.Money > 0) {
                try {
                    User.Wallet = d.Money;
                    this.UpdateUserMoneyForClient(User);
                } catch (e) {
                    this.Logger.Master().error('Master.prototype.OnTransferWebMoneyToGameByIDSuccess moneyAddOnly', e.stack);
                }

            }
        } else {
            this.Logger.Master().error('Master.prototype.AddMoneyWebWithReason Update Fail ', err, User.UserID, ReasonID, ReasonDesc, User.UserChannelID, User.UserProviderID, User.PlatformID, this.MasterID, User.SessionID, 0);
        }
    }.bind(this));
    // this.ApiMoney.UpdateUserMoneyForWeb(User.AccountID, 1, Money, function (e, coin) {
    //     if (e == 0) {
    //         User.Diamond = coin;
    //         this.UpdateUserMoneyForClient(User);
    //     } else {
    //         this.Logger.Master().error('Master.prototype.TriggerRefundMoneyWeb UpdateUserMoneyForWeb Fail ', User.UserID, User.AccountID, e, coin, Money, Reason);
    //     }
    // }.bind(this));
};

Master.prototype.CalcLoginCountDay = function (CreateDate) {
    var loginDay = 99999;
    var dayMiliSecond = (24 * 3600 * 1000);

    try {
        var today = +new Date();
        today = Math.floor(today / dayMiliSecond);
        var check = +new Date(CreateDate);
        check = Math.floor(check / dayMiliSecond);
        loginDay = today - check + 1;
    } catch (e) {
        this.Logger.Master().error('Master.prototype.CalcLoginCountDay', e.stack);
    }
    this.Logger.Master().debug('Master.prototype.CalcLoginCountDay loginDay ', loginDay, CreateDate);
    return loginDay;
};


Master.prototype.UpdateLobbyJackpotPacket = function () {
    for (var i = 0; i < this.DynamicConfig.JackpotUpdateConfig.NeedUpdate.length; i++) {
        this.UpdateLobbyJackpotPacketByKindID(this.DynamicConfig.JackpotUpdateConfig.NeedUpdate[i]);
    }
};

Master.prototype.UpdateLobbyJackpotPacketByKindID = function (Config) {
    var GameID = Config.GameID;
    var KindID = Config.KindID;
    var DataKey = Config.DataKey;
    if (!this.JackpotUpdatePacket['GameID:' + GameID]) {
        this.JackpotUpdatePacket['GameID:' + GameID] = {};
    }
    this.RedisAdapter.getMaxValOfAllKeys(DataKey, function (d) {
        try {
            if (d > 0) {
                this.JackpotUpdatePacket['GameID:' + GameID]['KindID:' + KindID] = new Packet.JackpotUpdateResponse(GameID, KindID, d);
            }
        } catch (e) {
            this.Logger.Master().error('Master.prototype.UpdateLobbyJackpotPacketByKindID try ex ', e.stack);
        }

    }.bind(this));
};

Master.prototype.UpdateLobbyJackpot = function () {
    try {
        for (var Game in this.JackpotUpdatePacket) {
            for (var Kind in this.JackpotUpdatePacket[Game]) {
                if (Utility.CheckVariable(this.JackpotUpdatePacket[Game][Kind], 'length')) {
                    if (this.JackpotUpdatePacket[Game][Kind].length > 0) {
                        this.UpdateJackpotSendAllUser(0, this.JackpotUpdatePacket[Game][Kind]); // chỉ update cho user ngoài sảnh
                    }
                }
            }

        }
    } catch (e) {
        this.Logger.Master().error('Master.prototype.UpdateLobbyJackpot try ex ', e.stack);
    }


};

Master.prototype.UpdateJackpotSendAllUser = function (GameID, Msg) {
    for (var i = 0; i < this.UserClient.length; i++) {
        if (Utility.CheckVariable(this.UserClient[i], 'UserModel')) {
            if (this.UserClient[i].UserModel.CurrentGameID == GameID) {
                this.SendSocketBinary(this.UserClient[i], Msg);
            }
        }
    }
};

Master.prototype.AddGoldRewardForUser = function (User, Money, ReasonID, ReasonDesc) {
    try {
        if (User.UserIPLoginCount < this.DynamicConfig.IPLimitedCount || User.RechargeGold > 0) {
            User.OnUserGetAward(User, this.Config.MoneyReasonConfig, ReasonID);
            this.AddMoneyWebWithReason(User, Money, ReasonID, ReasonDesc);
        }
    } catch (e) {
        this.Logger.Master().error('Master.prototype.AddGoldRewardForUser  ', e.stack);
    }


};

Master.prototype.CheckIPUserLoginCount = function (User, callback) {
    if (Utility.CheckVariable(User, 'Socket')) {
        this.LogRecorder.checkUserIpCount(User.Socket.remoteAddressReal, function (e, d) {
            if (!e) {
                if (Utility.CheckVariable(d) && Utility.CheckVariable(d[0], 'NickCount')) {
                    User.UserIPLoginCount = d[0].NickCount || 9999;
                }
            } else {
                this.Logger.Master().error('Master.prototype.AddGoldRewardForUser call db error ');
            }
            callback();
        }.bind(this));
    } else {
        callback();
        this.Logger.Master().error('Master.prototype.AddGoldRewardForUser User no Socket');
    }
};

Master.prototype.AnalyseUserOnLogin = function (User) {
    try {
        var Key = this.Config.RedisConfig.Define.TrackingUserFlagData;
        var Field = User.UserID;
        this.RedisAdapter.hget(Key, Field, function (e, d) {
            try {
                if (!e) {
                    if (d) {
                        AnalyseUserManager.updateAnalyseUserRule(User, d);
                    }
                    AnalyseUserManager.checkAnalyseUserRule(this, User);
                    if (User.IsPassingRule) {
                        this.SendSocketBinary(User.Socket, new Packet.LocalPaymentShow());
                    }
                }
            } catch (e) {
                this.Logger.Master().error('Master.prototype.AnalyseUserOnAction ', e.stack);
            }
        }.bind(this));
    } catch (e) {
        this.Logger.Master().error('Master.prototype.AnalyseUserOnAction ', e.stack);
    }
};

Master.prototype.AnalyseUserOnAction = function (User) {
    try {
        if (!User.IsPassingRule) {// Chưa pass
            AnalyseUserManager.checkAnalyseUserRule(this, User);
            if (User.IsPassingRule) { // Check lại, nếu pass thì gửi
                this.SendSocketBinary(User.Socket, new Packet.LocalPaymentShow());
            }
        }
    } catch (e) {
        this.Logger.Master().error('Master.prototype.AnalyseUserOnAction ', e.stack);
    }

};

Master.prototype.UpdateTrackingUserFlagData = function (User) {
    try {
        if (User.IsChanged) { // Chi luu khi co thay doi, va co load data
            var Key = this.Config.RedisConfig.Define.TrackingUserFlagData;
            var Field = User.UserID;
            var Val = AnalyseUserManager.recordAnalyseUserRule(User);
            this.RedisAdapter.hset(Key, Field, Val);
        }
    } catch (e) {
        this.Logger.Master().error('Master.prototype.UpdateTrackingUserFlagData ', e.stack);
    }

};

Master.prototype.GetChannelID = function (ChannelID) {
    if (ChannelID == +ChannelID) {
        return +ChannelID;
    }
    return 0;
};

Master.prototype.GetPlatformID = function (Platform) {
    if (Platform == +Platform) {
        return +Platform;
    }
    return 0;
};

Master.prototype.GetUserExtendLoginInfo = function (User, Extend) {
    try {
        User.UserPackageID = '';
        User.UserVersionClient = '';
        User.FBID = '';
        var data = JSON.parse(Extend);
        if (Utility.CheckVariable(data)) {
            User.UserPackageID = data.PackageID || '';
            User.UserVersionClient = data.Version || '';
            User.FBID = data.fbId || '';
        }
    } catch (e) {
        this.Logger.Master().error('Master.prototype.GetUserExtendLoginInfo ', e.stack);
    }
};

Master.prototype.CheckBetaUserAccess = function (UserID) {
    if (this.BetaConfig.IsBeta) { // Server đang beta
        if (this.BetaConfig.UserBetaAccessList.indexOf(+UserID) > -1) {
            return 1;
        } else { //Server beta và ko có trong danh sách
            return 0;
        }
    }
    // Server ko beta ko cần check
    return 1;
};

Master.prototype.ReloadShowStoreConfig = function () {
    this.RedisAdapter.get(this.Config.RedisConfig.Define.ShowStoreConfig, function (e, d) {
        try {
            if (!e && d) {
                d = JSON.parse(d);
                if (Utility.CheckVariable(d, 'AwardOnlineCount', 'AwardDailyCount', 'RechargeGold', 'BlackListOS', 'BlackListVersion')) {
                    this.ShowStoreConfigData = d;
                }
            }
        } catch (e) {
            this.Logger.Master().error('Master.prototype.ReloadShowStoreConfig ', e.stack);
        }

    }.bind(this));
};

Master.prototype.GetMissionListForUser = function (Socket) {
    var p = this.MissionManager.GenMissionListPacket(Socket.UserModel.UserMissionList, Socket.LangCode);
    if (p != 0) {
        this.SendSocketBinary(Socket, p);
    }
};

Master.prototype.MissionGetAwardForUser = function (Socket, ID) {
    this.MissionManager.GetMissionAward(Socket.UserModel, ID);
};

Master.prototype.GeAchievementListForUser = function (Socket) {
    var p = this.AchievementManager.GenAchievementListPacket(Socket.UserModel.UserAchievementList, Socket.LangCode,Socket.UserModel);
    if (p != 0) {
        this.SendSocketBinary(Socket, p);
    }
};

Master.prototype.AchievementGetAwardForUser = function (Socket, ID) {
    this.AchievementManager.GetAchievementAward(Socket.UserModel, ID);
};

Master.prototype.GetMasterConfigForUser = function (Socket) {
    var packet = new Packet.GetMasterConfigResponse(
        this.DynamicConfig.DailyLoginConfig[0].AwardList.slice(1, this.DynamicConfig.DailyLoginConfig[0].AwardList.length),
        this.DynamicConfig.OnlineAwardConfig[0].AwardList
    );
    if (packet != 0) {
        this.SendSocketBinary(Socket, packet);
    }
};
