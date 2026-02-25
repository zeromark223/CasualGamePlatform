/*{"build":1}*/
//Require
var RedisAdapter = require('./Modules/RedisAdapter/RedisAdapter.js');
var SQLAdapter = require('./Modules/SQLAdapter');
var LogRecorder = require('./Modules/LogRecorder');
var UserModel = require('./Model/UserModel.js');
var UserController = require('./Controller/UserController.js');
var LoggerCommon = require('./Modules/Log4JS/Logger.js');
var Config = require('../Config/GameConfig');
var Net = require('net');
var WebSocket = require('../node_modules/ws');
var Packet = require('./Packet');
var GMToolAdapter = require('./Modules/GMToolAdapter');
var https = require('https');
var fs = require('fs');
var path = require('path');
var Utility = require('../SharedModule/Utility');
var GlobalBoss = require('./Modules/GlobalBoss');
var MissionManager = require('./Modules/MissionManager');
var AchievementManager = require('./Modules/AchievementManager');
var SmartRequire = require('../SharedModule/smartRequire');
var GoldenHourManager = require('./Modules/GoldenHourManager');
var EventManager = require('./Modules/EventManager');
var JackpotManager = require('./Modules/JackpotManager');

//End Require

module.exports = GameServer;// Start GameServer

function GameServer() {
    this.GameServerID = 0;
    this.RSocketUser = 0;
    this.WSocketUser = 0;
    this.WSSocketUser = 0;
    this.SSLConfig = Config.GameServerConfig.SSLConfig;
    this.GameServerUserPortR = 0;
    this.GameServerUserPortWS = 0;
    this.GameServerUserPortWSS = 0;
    this.UserClient = [];
    this.RedisConfig = Config.RedisConfig;
    this.RedisAdapter = RedisAdapter;
    this.SQLConfig = Config.SQLConfig;
    this.LogRecorderConfig = Config.LogRecorderConfig;
    this.SQLAdapter = SQLAdapter;
    this.LogRecorder = LogRecorder;
    this.GMToolAdapter = GMToolAdapter;
    this.GMToolConfig = Config.GMToolConfig;
    this.EventManager = new EventManager();
    this.JackpotManager = new JackpotManager();
    this.MaintainFlag = false;
    this.MainTick = 0;
    this.MainTime = +new Date;
    this.GameServerIP = "127.0.0.1"; //Default
    this.LoggerConfig = Config.LoggerConfig;
    this.Logger = LoggerCommon;
    this.DeskList = [];

    //more info gameserver
    this.GameKindID = Config.GameServerConfig.RoomTypeConfig.GameKindID; //cap nhat gamekindid som de init mission manager, fix tam
    this.RoomName = 'RoomName';
    this.DeskCount = 30;
    this.RoomConfig = Config.RoomConfig;

    this.ListMiniBoss = [];
    this.ListSkill = [];
    this.MoneyRequired = 0;

    this.StockConfig = Config.StockConfig;
    this.StockHandicapConfig = Config.StockHandicap;
    this.Stock = 10;
    this.StockDetail = {StockMin: 5000000, StockMax: 100000000};

    this.FishConfig = [];
    this.ParadeFishConfig = [];
    this.BulletAppear = 0;

    this.Run = true;
    this.SecondTimer = {Tick: 0, Interval: 1000};
    this.Second5Timer = {Tick: 0, Interval: 5000};
    this.UpdateItemsTimer = {Tick: 0, Interval: 60000};
    this.Second10Timer = {Tick: 0, Interval: 10000};

    this.USER_TIMED_OUT = 90000;
    this.CheckUserTimedOutTimer = {Tick: 0, Interval: 5000};

    ////////////////////////////////////
    this.ServerEarnMoney = 0;
    this.ServerPayMoney = 0;
    this.ServerStartStock = 0;
    this.UserRefreshBulletPacket = 20;

    //Global Boss
    this.TimeOutAuth = 30000; //30s
    this.ListGlobalBoss = [];
    this.MaxCCU = this.DeskCount * 4;
    this.LOST_PACKET_TO_KICK = 3;

    // Item Manh The
    this.ItemManhTheManager = [];
    this.MissionManager = new MissionManager(this);
    this.AchievementManager = new AchievementManager(this);
    this.Config = Config;
    this.ChannelID = Config.GameServerConfig.Cluster.ChannelID;
    this.TrialMoney = 5000000;
    this.GunConfig = Config.GunConfig;
    this.FishConfig = [];
    this.ParadeFishConfig = Config.ParadeFishConfig;
    this.GoldenHourManager = [];
    this.EventFishConfig = Config.EventFishConfig;

    //Chia 2D 3D
    this.Channel2D = 1;
    this.Channel3D = 2;

    //FishScript
    this.FishScript = [];
    this.TrackingID = 1;
    this.MaxTrackingID = 1000 * 1000 * 1000; // 1 ty
    this.DestroySocketTimeOut = 60 * 1000; //60s

    this.MoneyStateDefine = {
        Default: 0,
        BeginGetting: 1,
        GettingCompleted: 1,
        JoinGameCompleted: 3,
        BeginRefund: 4,
        RefundCompleted: 5
    };
    this.GameID = 1;
    this.PlayGameTimeBlock = 10 * 1000; // mili second
    this.SocketTimeOut = 30 * 1000;
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


Number.prototype.formatMoney = function (decPlaces, thouSeparator, decSeparator) {
    var n = this,
        decPlaces = isNaN(decPlaces = Math.abs(decPlaces)) ? 2 : decPlaces,
        decSeparator = decSeparator == undefined ? "." : decSeparator,
        thouSeparator = thouSeparator == undefined ? "," : thouSeparator,
        sign = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
};

GameServer.prototype.Start = function (GameServerID, PortR, PortWS, PortWSS, GameServerIP, SecretKey, SecretIV) {
    this.SecretKey = SecretKey;
    this.SecretIV = SecretIV;
    this.GameServerID = GameServerID;
    this.GameServerUserPortR = PortR;
    this.GameServerUserPortWS = PortWS;
    this.GameServerUserPortWSS = PortWSS;
    this.GameServerIP = GameServerIP;
    this.GameKindID = Config.GameServerConfig.RoomTypeConfig.GameKindID;
    this.RoomName = Config.GameServerConfig.RoomTypeConfig.RoomName;
    this.MoneyRequired = Config.GameServerConfig.RoomTypeConfig.MoneyRequired;
    this.LevelRequired = Config.GameServerConfig.RoomTypeConfig.LevelRequired;
    this.DeskCount = Config.GameServerConfig.RoomTypeConfig.DeskCount;
    this.MaxCCU = this.DeskCount * 4;
    this.Init();
};

GameServer.prototype.Init = function () {
    this.InitUserListener(); // Init User Listenter
    this.Logger.Init(this.GameServerID, this.LoggerConfig, function () {
        this.RedisAdapter.Init(this.GameServerID, this.RedisConfig, this.Logger.Redis());
        this.SQLAdapter.Init(this.SQLConfig, this.Logger.Sql());
        this.LogRecorder.Init(this.LogRecorderConfig, this.Logger.LogRecorder());
    }.bind(this));
    this.GMToolAdapter.Init(this.GameServerID, this.GMToolConfig, this.HandleGMTool.bind(this));
    setTimeout(this.Initialling.bind(this), 1000);
};

GameServer.prototype.Initialling = function () {
    this.Logger.Game().info("GameServer Initialling !");
    if (this.SQLAdapter.getStatus()
        && this.LogRecorder.getStatus()
        && this.RedisAdapter.getStatus()
        && this.GMToolAdapter.getStatus()
    ) {
        this.InitCompleted();
    } else {
        this.Logger.Game().info("GameServer Init Status : ",
            "\r\nSQLAdapter", this.SQLAdapter.getStatus(),
            "\r\nLogRecorder", this.LogRecorder.getStatus(),
            "\r\nRedisAdapter", this.RedisAdapter.getStatus(),
            "\r\nGMToolAdapter", this.GMToolAdapter.getStatus()
        );
        setTimeout(this.Initialling.bind(this), 1000);
    }
};

GameServer.prototype.InitCompleted = function () {
    this.Logger.Game().info("GameServer InitCompleted !");
    this.initGameServer();
    setInterval(this.Timer.bind(this), 100);
};

GameServer.prototype.InitDesk = function () {
    this.InitListDesk();
};

GameServer.prototype.InitListDesk = function () {
    var Desk = SmartRequire(path.resolve('./Desk/index.js'), this.SecretKey, this.SecretIV);
    for (var i = 0; i < this.DeskCount; i++) {
        try {
            this.DeskList[i] = Desk.GetRoomByKind(this.GameKindID, this.SecretKey, this.SecretIV, SmartRequire);
            this.DeskList[i].Start(this, i + 1);
        } catch (e) {
            this.Logger.Game().error('GameServer.prototype.InitListDesk - try err: ' + e.stack);
        }
    }
};

GameServer.prototype.InitUserListener = function () {
    if (!http) {
        var http = require('http');
    }
    if (this.SocketTimeOut) {
        this.SocketTimeOut = 30 * 1000;//30s
    }
    if (this.GameServerUserPortWS > 0 && this.GameServerUserPortWS < 65000) {

        var webServer = http.createServer(function (req, res) {
            res.writeHead(404);
            res.end('');
        }).listen(this.GameServerUserPortWS, '0.0.0.0', function (err) {
            if (!err) this.Logger.Game().info("GameServerID " + this.GameServerID + " is online listen all on port [WS] : " + this.GameServerUserPortWS);
            else this.Logger.Game().error("GameServer fail to start on port : " + this.GameServerUserPortWS);
        }.bind(this));
        webServer.on('connection', function (socket) {
            socket.setTimeout(this.SocketTimeOut);//Set timeout 30s
            socket.on('timeout', function () {
                socket.destroy();
            })
        }.bind(this));
        this.WSocketUser = new WebSocket.Server({
            server: webServer,
            perMessageDeflate: false
        }, function (err) {
            if (!err) this.Logger.Game().info("GameServerID " + this.GameServerID + " is online listen all on port [WS] : " + this.GameServerUserPortWS);
            else this.Logger.Game().error("GameServer fail to start on port : " + this.GameServerUserPortWS);
        }.bind(this));
        this.WSocketUser.on('connection', this.WebSocketUserConnect.bind(this, false));//Bind This vs IsWSS
        this.WSocketUser.on('error', function (err) {
            this.Logger.Game().error("error W :" + err);
            //Handle Err3or
        }.bind(this));
    } else {
        this.Logger.Game().info("GameServerID " + this.GameServerID + " WebSocket disable ");
    }
    if (this.GameServerUserPortWSS > 0 && this.GameServerUserPortWSS < 65000) {
        if (!fs.existsSync(this.SSLConfig.Key) || !fs.existsSync(this.SSLConfig.Cert)) {
            this.Logger.Game().error("Load SSL File Error \r\n" + this.SSLConfig.Key + "\r\n" + this.SSLConfig.Cert);
        }
        const options = {
            key: fs.readFileSync(this.SSLConfig.Key),
            cert: fs.readFileSync(this.SSLConfig.Cert)
        };

        var webServerSecure = https.createServer(options, function (req, res) {
            res.writeHead(404);
            res.end('');
        }).listen(this.GameServerUserPortWSS, '0.0.0.0', function (err) {
            if (!err) this.Logger.Game().info("GameServerID " + this.GameServerID + " is online listen all on port [WSS] : " + this.GameServerUserPortWSS);
            else this.Logger.Game().error("GameServer fail to start on port : " + this.GameServerUserPortWSS);
        }.bind(this));
        webServerSecure.on('connection', function (socket) {
            socket.setTimeout(this.SocketTimeOut);//Set timeout 30s
            socket.on('timeout', function () {
                socket.destroy();
            })
        }.bind(this));
        this.WSSocketUser = new WebSocket.Server({
            server: webServerSecure,
            perMessageDeflate: false
        }, function (err) {
            if (!err) this.Logger.Game().info("GameServerID " + this.GameServerID + " is online listen all on port [WSS] : " + this.GameServerUserPortWSS);
            else this.Logger.Game().error("GameServer fail to start on port : " + this.GameServerUserPortWSS);
        }.bind(this));
        this.WSSocketUser.on('connection', this.WebSocketUserConnect.bind(this, true));//Bind This vs IsWSS
        this.WSSocketUser.on('error', function (err) {
            this.Logger.Game().error("error W :" + err);
            //Handle Err3or
        }.bind(this));
    } else {
        this.Logger.Game().info("GameServerID " + this.GameServerID + " WebSocket Secure disable ");
    }

    if (this.GameServerUserPortR > 0 && this.GameServerUserPortR < 65000) {
        this.RSocketUser = Net.createServer(this.RawSocketUserConnect.bind(this));
        this.RSocketUser.listen(this.GameServerUserPortR, '0.0.0.0', function () {
            this.Logger.Game().info("GameServerID " + this.GameServerID + " is online listen all on port [Raw] : " + this.GameServerUserPortR);
        }.bind(this));
        this.RSocketUser.on('error', function (err) {
            this.Logger.Game().error("error R :" + err);
            //Handle Error
        }.bind(this));
    } else {
        this.Logger.Game().info("GameServerID " + this.GameServerID + " RawSocket disable");
    }
};

GameServer.prototype.WebSocketUserConnect = function (isWss, socket) {
    this.Logger.Game().debug('WebSocketUserConnect', socket._socket.remoteAddress);
    socket.socketType = 1;
    socket.end = socket.close;
    socket.LastCheckSocketTime = +new Date();
    if (this.MaintainFlag) {
        //Handle Maintain
    } else {
        //send success
        socket.UserController = new UserController(this, socket);
        socket.UserModel = new UserModel(this, socket);
        //start game
        socket.on('message', socket.UserController.HandleMessage.bind(socket.UserController)); // Handle User Message
        var bindObject = {server: this, socket: socket}; // Dùng để bind dữ liệu cho function close
        socket.on('error', close.bind(bindObject)); // Handle Error
        socket.on('close', close.bind(bindObject)); // Handle End
        function close(error) { // Ham handle Error và End
            this.server.OnUserDisconnected(error, this.socket);
        }
    }
};

GameServer.prototype.RawSocketUserConnect = function (socket) {
    this.Logger.Game().debug('RawSocketUserConnect', socket.remoteAddress);
    socket.socketType = 0;
    if (this.MaintainFlag) {
        //Handle Maintain
    } else {
        //send success
        //this.SendSocketBinary(socket, new Packet.LoginSuccess(0).build());//Báo Client kết nối thành công
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

        function close(error) { // Ham handle Error và End
            this.server.OnUserDisconnected(error, this.socket);
        }
    }
};

GameServer.prototype.OnUserDisconnected = function (error, socket) {//Khi User Disconnect thự hiện
    //kiểm tra socket do
    try {
        if (!socket.isDestroyed) {
            this.DestroySocket(socket);
        } else {
            this.Logger.Game().debug('OnUserDisconnected socket.isDestroyed ', socket.isDestroyed);
        }
    }
    catch (e) {
        this.Logger.Game().error("GameServer.prototype.OnUserDisconnected - try err: " + e);
    }
};

GameServer.prototype.DestroySocketOnly = function (socket) {
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

GameServer.prototype.DestroySocket = function (socket) {
    try {
        this.Logger.Game().debug('DestroySocket ' + socket.UserModel.UserID);
        if (!socket.reCheckDestroyTime) {
            socket.reCheckDestroyTime = 0;
        }
        if (!socket.isDestroyed && socket.reCheckDestroyTime < +new Date()) {
            socket.reCheckDestroyTime = +new Date() + this.DestroySocketTimeOut;
            if (Utility.CheckVariable(socket, 'UserModel')) {
                try {
                    if (socket.UserModel.IsAddUserLogin) {
                        socket.UserModel.IsAddUserLogin = false;
                        this.SQLAdapter.userOnlineRemove(socket.UserModel.UserID, this.GameServerID, this.GameID);
                    }
                    if (Utility.CheckVariable(socket.UserModel, 'MyDesk') && this.DeskList.indexOf(socket.UserModel.MyDesk) > -1) {//User có bàn
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
        this.Logger.Game().error("DestroySocket - try err: " + e);
    }
};

GameServer.prototype.DestroySocketNotJoinGame = function (socket) {
    try {
        if (!socket.isDestroyed) {
            if (Utility.CheckVariable(socket, 'UserModel')) {
                //this.SQLAdapter.RefundGoldForUser(socket.UserModel.UserID, this.GameServerID, socket.UserModel.PlatformID, socket.UserModel.ProviderID);
            }
            socket.isDestroyed = true;
        }
        this.DestroySocketOnly(socket);
    }
    catch (e) {
        this.Logger.Game().error("DestroySocket - try err: " + e.stack);
    }
};


GameServer.prototype.SendSocketBinary = function (socket, msg) {
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
        this.Logger.Game().error('GameServer.prototype.SendSocketBinary - try err:' + e);
    }
};

GameServer.prototype.Timer = function () {
    if (this.Run) {
        var now = +new Date();
        var difTime = (now - this.MainTime);
        this.MainTime = now;
        this.SecondTimer.Tick += difTime;
        this.Second5Timer.Tick += difTime;
        this.Second10Timer.Tick += difTime;
        this.UpdateItemsTimer.Tick += difTime;
        this.CheckUserTimedOutTimer.Tick += difTime;

        if (this.CheckUserTimedOutTimer.Tick > this.CheckUserTimedOutTimer.Interval) {
            this.CheckUserTimedOutTimer.Tick = 0;
            this.ClearUserNotInServer(); // Check User in TW but not in Server
            this.KickAFKUser();
        }

        if (this.SecondTimer.Tick > this.SecondTimer.Interval) {//Timer 1 giây
            this.SecondTimer.Tick = 0;
            for (var i = 0; i < this.UserClient.length; i++) {
                this.UserClient[i].UserModel.BulletPacket = this.UserRefreshBulletPacket;
            }
        }

        if (this.Second5Timer.Tick > this.Second5Timer.Interval) {//Timer 5 giây
            this.Second5Timer.Tick = 0;
            this.UpdateGameServer();
            this.LoadStockRatioConfig();//Load Stock from file
            this.UpdateStock();
            this.ReloadConfig();
            this.UpdateServerDetail();
            //Reload module của user
            this.LoadItemConfig();
            this.ReCalcUserStockHandicapAll();
        }

        if (this.Second10Timer.Tick > this.Second10Timer.Interval) {
            this.Second10Timer.Tick = 0;
            this.PingPong();
            this.LoadSkillInfo();
            this.EventManager.ReloadAllEvent();
            this.JackpotManager.SyncData();
            //Stupid code
            this.GameServerAutoCalcPlayTime();// Cấu hình 1 đường xài timer 1 kiểu
        }

        if (this.UpdateItemsTimer.Tick > this.UpdateItemsTimer.Interval) {
            this.UpdateItemsTimer.Tick = 0;
            this.LoadGameInfo(function () {
            });
            //this.SQLAdapter.RecordComputerStatus(this.GameServerIP);
        }
    }
};

GameServer.prototype.GetNewTrackingID = function () {
    if (this.TrackingID > this.MaxTrackingID) {
        this.TrackingID = 1;
    }
    return this.TrackingID++;
};
GameServer.prototype.AddStock = function (stock) {
    try {
        var numStock = parseFloat(stock);
        if (!isNaN(numStock)) {
            if (numStock > 0) this.ServerEarnMoney += +stock;
            else this.ServerPayMoney += (numStock * -1);
            this.Stock = (+this.Stock + +numStock);
            if (this.Stock < this.StockDetail.StockMin) {
                this.Stock = this.StockDetail.StockMin;
            }
            if (this.Stock > this.StockDetail.StockMax) {
                this.Stock = this.StockDetail.StockMax;
            }
        } else {
            this.Logger.Game().warn('warning AddStock, stock is not a number');//debug
        }
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.AddStock - try err: ' + e);
    }
};

//Lấy cấu hình stock theo gameKind
GameServer.prototype.LoadStockRatioConfig = function () {
    try {
        this.RedisAdapter.GetStockRatioConfig(this.GameKindID, function (err, data) {
            if (!err) {
                if (Utility.CheckVariable(data, 'StockRatio')) {
                    this.StockConfig = data.StockRatio;
                    this.BulletAppear = +data.BulletAppear;
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
        this.Logger.Game().error('GameServer.prototype.LoadStockRatioConfig - try err: ' + e.stack);
    }
};

//Load stock theo gameID
GameServer.prototype.LoadStockConfig = function () {
    try {
        this.RedisAdapter.GetStockConfig(this.GameServerID, this.GameServerIP, this.GameServerUserPortR, function (err, data) {
            if (!err) {
                if (!this.IsNullOrUndefined(data)) {
                    this.Logger.Game().debug("Server Start load stock " + this.Stock + ': New Stock :' + data.Stock);
                    this.Stock = +data.Stock;
                    this.ServerStartStock = +data.Stock;
                }
            }
        }.bind(this));
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.LoadStockConfig - try err: ' + e);
    }
};

GameServer.prototype.UpdateStock = function () {
    try {
        var stockMin = 5000000, stockMax = 10000000;

        if (this.IsNullOrUndefined(this.Stock)) {
            this.Stock = 0;
        }
        if (this.IsNullOrUndefined(this.StockDetail)) {
            this.StockDetail = {StockMin: stockMin, StockMax: stockMax};
        }
        if (this.IsNullOrUndefined(this.StockDetail.StockMin)) {
            this.StockDetail.StockMin = stockMin;
        }
        if (this.IsNullOrUndefined(this.StockDetail.StockMax)) {
            this.StockDetail.StockMax = stockMax;
        }

        if (this.StockDetail.StockMin > this.Stock)
            this.Stock = this.StockDetail.StockMin;
        else if (this.StockDetail.StockMax < this.Stock)
            this.Stock = this.StockDetail.StockMax;

        //cập nhật stock vào redis
        this.RedisAdapter.SetStockConfig(this.GameServerID, this.GameServerIP, this.GameServerUserPortR, this.Stock, function () {
        });

        //cập nhật stock vào sql server
        //this.SQLAdapter.Stock_Insert_Update(this.GameServerID, this.Stock);

    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.UpdateStock - try err: ' + e);
    }
};

GameServer.prototype.GetStockRatio = function () {
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
        this.Logger.Game().error('GameServer.prototype.GetStockRatio - try err: ' + e);
    }
    return stockRatio;
};
//end

/*
 * *********************************************
 * **********************************************
 */
//init game
GameServer.prototype.initGameServer = function () {
    try {
        this.SQLAdapter.serverStatusStart(this.GameServerID, this.GameServerIP, this.GameKindID,
            this.UserClient.length, this.GameServerUserPortR, this.GameServerUserPortWS,
            this.GameServerUserPortWSS, this.DeskCount, this.MaxCCU, this.MoneyRequired, this.LevelRequired, this.GameID);
        this.ReloadFishConfig();
        this.ClearTWLoginRecord();
        this.UpdateGameServer();
        this.LoadStockConfig();
        this.InitDesk();
        this.EventManager.Init(this);//Quản lý tất cả event
        this.JackpotManager.Init(this);//Quản lý tất cả event

    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.initGameServer - try err: ' + e);
    }
};

//update infomation in Game
GameServer.prototype.UpdateGameServer = function () {
    try {
        this.SQLAdapter.serverStatusUpdate(this.GameServerID, this.UserClient.length);
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.UpdateGameServer - try err: ' + e);
    }
};

GameServer.prototype.FindUserIndexByUserID = function (UserID) {
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

GameServer.prototype.FindUserIndexByAccountID = function (AccountID) {
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
//xóa user khỏi bàn chơi
GameServer.prototype.RemoveUser = function (userId) {
    try {
        var index = this.FindUserIndexByUserID(userId);
        if (index > -1) {
            this.UserClient.splice(index, 1);
        }

    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.RemoveUser - try err:' + e);
    }
};

//kiểm tra bàn hợp lệ
GameServer.prototype.FindDeskAvailable = function () {
    try {
        var desk = -1;
        var station = -1;
        for (var i = 0; i < this.DeskList.length; i++) {
            desk = i;
            //kiểm tra vào phòng tự do không có ma trận cá xẩy ra
            if (this.IsCheck2D()) {
                //2D, khong cho vao phong co ca tran
                if (this.DeskList[i].IsSpecialScreen) {
                    //dang co ca tran
                    continue;
                }
            }

            station = this.DeskList[i].FindDeskStationForUser();
            if (station >= 0) {
                //không user trong ban choi
                return {Desk: desk, Station: station};
            }

        }

    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.FindDeskAvailable - try err:' + e);
    }

    return {Desk: -1, Station: -1};
};

GameServer.prototype.InsertToRoom = function (Socket) {
    try {
        //kiem tra player da tồn tại chưa
        var Player = this.FindUserIndexByUserID(Socket.UserModel.UserID);
        if (Player >= 0) {
            this.HandleLoginError(Socket, Config.LanguageConfig.Login_Duplicate.logMsg + Socket.UserModel.AccountID, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_Duplicate, Socket.LangCode));
            return;
        }
        else {
            //push vào danh sách desk(chọn bàn phù hợp)
            //kiểm tra phòng available cho đấu trường
            //kiểm tra các trường hợp vào phòng đấu trường với castion mới

            //tìm phòng phù hợp
            var findPosionUser = this.FindDeskAvailable();
            if (findPosionUser.Desk == -1 || findPosionUser.Station == -1) {
                this.HandleLoginError(Socket, Config.LanguageConfig.InsertRoom_RoomFull.logMsg + Socket.UserModel.AccountID, this.GetUserMsgByLangCode(this.Config.LanguageConfig.InsertRoom_RoomFull, Socket.LangCode));
                return;
            }

            if (Socket.UserModel.Wallet < this.MoneyRequired) {
                this.HandleLoginError(Socket, Config.LanguageConfig.InsertRoom_NotEnoughGold.logMsg + Socket.UserModel.AccountID, this.GetUserMsgByLangCode(this.Config.LanguageConfig.InsertRoom_NotEnoughGold, Socket.LangCode));
                return;
            }
            else {
                if (Socket.UserModel.Level < this.LevelRequired) {
                    this.HandleLoginError(Socket, Config.LanguageConfig.InsertRoom_NotEnoughLevel.logMsg + Socket.UserModel.AccountID, this.GetUserMsgByLangCode(this.Config.LanguageConfig.InsertRoom_NotEnoughLevel, Socket.LangCode));
                    return;
                }
            }

            //push position vao
            Socket.UserModel.DeskID = findPosionUser.Desk;
            Socket.UserModel.StationID = findPosionUser.Station;

            //push vào danh sách user Room
            this.UserClient.push(Socket);

            //clone info user
            this.DoubleInfoUser(Socket);

            //tìm vị trí khi vào phòng adventer
            var charID = this.DeskList[findPosionUser.Desk].FindIndexOfUserInDesk(Socket.UserModel.UserID);
            //có phòng
            var msg = new Packet.LoginResponse(Socket.UserModel.UserID, Socket.UserModel.Wallet, Socket.UserModel.GameName,
                Socket.UserModel.Level, Socket.UserModel.Exp, Socket.UserModel.StationID);
            if (msg != 0) {
                this.SendSocketBinary(Socket, msg);
            }

            //push vao tat ca desk cua phong
            this.JoinDesk(this.DeskList[findPosionUser.Desk], Socket.UserModel);

            //send danh sach user dang online
            var listUser = [];
            for (var i = 0; i < this.DeskList[findPosionUser.Desk].ListUserInDesk.length; i++) {
                var userInDesk = this.DeskList[findPosionUser.Desk].ListUserInDesk[i];
                if (!this.IsNullOrUndefined(userInDesk)) {
                    listUser.push({
                        UserID: userInDesk.User.UserID,
                        Gold: userInDesk.User.FishScore,
                        GameName: userInDesk.User.GameName,
                        Level: userInDesk.User.FishLevel,
                        Exp: userInDesk.User.FishExp,
                        StationID: userInDesk.User.StationID,
                        PosX: userInDesk.User.PositionX,
                        PosY: userInDesk.User.PositionY
                    });
                }
            }


            if (!this.IsCheck2D()) {
                msg = new Packet.ListUserInDeskResponse(listUser);
                if (msg != 0) {
                    this.SendSocketBinary(Socket, msg);
                }

                msg = new Packet.UserCome(Socket.UserModel.UserID, Socket.UserModel.Wallet, Socket.UserModel.GameName, Socket.UserModel.Level,
                    Socket.UserModel.StationID, Socket.UserModel.PositionX, Socket.UserModel.PositionY, 0);
            }
            else { //2d
                msg = new Packet.ListUserInDeskResponse_2D(listUser);
                if (msg != 0) {
                    this.SendSocketBinary(Socket, msg);
                }

                msg = new Packet.UserCome_2D(Socket.UserModel.UserID, Socket.UserModel.Wallet, Socket.UserModel.GameName, Socket.UserModel.Level,
                    Socket.UserModel.StationID, Socket.UserModel.PositionX, Socket.UserModel.PositionY, Socket.UserModel.FishExp);
            }

            this.DeskList[findPosionUser.Desk].SendAllPlayerExceptUserID(msg, Socket.UserModel.UserID);

            //send user sit success
            //assId, handleCode, dwUserID, bLock, bDeskIndex, bDeskStation, bUserState, bIsDeskOwner
            //msg = new Packet.ResponseUserSit(2, 50, socket.UserModel.UserID, 0, socket.UserModel.DeskID, socket.UserModel.StationID, 0, 0).build();
            //this.DeskList[findPosionUser.Desk].SendAllPlayer(msg);
            this.ReCalcUserStockHandicap(Socket.UserModel);
            this.UpdateUserChargeGold(Socket.UserModel);
            this.UpdateUserWinLose(Socket.UserModel);
            this.MissionManager.LoadMissionForUser(Socket.UserModel);
            this.AchievementManager.LoadAchievementMangerForUser(Socket.UserModel);
            this.Logger.Game().debug('=================== login complete');
            //các gói tin trả về khi mà vào bàn thành công
            //this.MessageWhenJoinRoom(socket);
        }
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.InsertToRoom - try err: ' + e);
        this.Logger.Game().error('GameServer.prototype.InsertToRoom - try err: ' + e.stack);
    }
};

GameServer.prototype.DoubleInfoUser = function (socket) {
    try {
        //double info
        socket.UserModel.FishExp = socket.UserModel.Exp;
        socket.UserModel.FishLevel = socket.UserModel.Level;
        socket.UserModel.FishScore = socket.UserModel.Wallet;
        socket.UserModel.NextSkill = 0;
        socket.UserModel.ListItemsInDesk = socket.UserModel.ListItems;
        socket.UserModel.NumTicketMiniGameInGame = socket.UserModel.NumTicketMiniGame;
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.DoubleInfoUser - try err: ' + e);
    }
};

GameServer.prototype.LoadSkillInfo = function () {
    // this.SQLAdapter.GetSkillInfo(this.GameKindID, function (err, data) {
    //     try {
    //         if (err == 0) {
    //             if (!this.IsNullOrUndefined(data)) {
    //                 if (!this.CompareListSkill(this.ListSkill, data)) {
    //                     this.ListSkill = [];
    //                     for (var i = 0; i < data.length; i++) {
    //                         if (!this.IsNullOrUndefined(data[i])) {
    //                             this.ListSkill.push({
    //                                 ID: data[i].ID,
    //                                 NameSkill: data[i].NameSkill,
    //                                 RatioGetSkill: data[i].RatioGetSkill,
    //                                 TimeLostSkill: data[i].TimeLostSkill,
    //                                 ScoreGetSkill: data[i].ScoreGetSkill,
    //                                 TimeEffect: data[i].TimeEffect,
    //                                 TimeDelay: data[i].TimeDelay,
    //                                 TimeCooldown: data[i].TimeCooldown,
    //                                 PowerGun: data[i].PowerGun,
    //                                 NumberFishGet: data[i].NumberFishGet,
    //                                 ScoreLostSkill: data[i].ScoreLostSkill,
    //                                 GoldLimit: data[i].GoldLimit
    //                             });
    //                         }
    //                     }
    //                     this.UpdateSkillAllClient();
    //                 }
    //             }
    //         } else {
    //             this.Logger.Game().debug('GameServer.prototype.LoadSkillInfo error code: ' + err);
    //         }
    //     } catch (e) {
    //         this.Logger.Game().error('GameServer.prototype.LoadSkillInfo - try err: ' + e)
    //     }
    // }.bind(this));
};

GameServer.prototype.LoadGameInfo = function (callback) {
    try {

        callback();

    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.LoadGameInfo - try err: ' + e.stack);
    }
};

GameServer.prototype.JoinDesk = function (desk, user) {
    try {
        desk.AddUser(user);
        desk.StartDeskWhenUserJoin();
        user.MyDesk.OnSendSkillInfo(user);

    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.JoinDesk - try err: ' + e);
    }
};

GameServer.prototype.IsNullOrUndefined = function (obj) {
    return obj == null || typeof obj == 'undefined';
};

GameServer.prototype.UpdateListFishDie = function (user, matchId) {
    try {
        var totalBulletGold = user.TotalGoldUserPayForSys;
        var totalFishGold = 0;
        this.EventManager.EvtOnUserOutGame(user);
        for (var i = 0; i < user.FishHistory.length; i++) {
            try {
                totalFishGold += user.FishHistory[i].E;
                this.LogRecorder.listUserFishRecord(user.UserID, this.GameKindID, matchId, user.FishHistory[i].K, user.FishHistory[i].F, user.FishHistory[i].H, user.FishHistory[i].S, user.FishHistory[i].E, new Date(), user.UserChannelID);
            } catch (e) {
                this.Logger.Game().error('GameServer.prototype.UpdateListFishDie - try err: ' + e.stack);
            }

        }
        //this.SQLAdapter.RecordEndGameALL(user.UserID, this.GameKindID, totalBulletGold, totalFishGold, totalBulletGold - totalFishGold, user.UserChannelID, user.PlatformID, user.ProviderID);
    } catch (ex) {
        this.Logger.Game().error('GameServer.prototype.UpdateListFishDie - try err: ' + ex.stack);
    }
};

GameServer.prototype.UserInfoUpdateAll = function (socket) {
    if (this.IsRoomTrial()) {
        return;
    }
    this.LogUserOutGame(socket.UserModel, function (errCode, matchId) { // Nếu thành công thì ghi nhận logout game
        if (errCode == 0) {
            this.CalcAndRefundUserMoney(socket, function () {
                this.RecordMission(socket.UserModel);
            }.bind(this));
            this.OnUserEndGame(socket.UserModel, matchId);
        } else {
            this.Logger.Game().error('GameServer.prototype.UserInfoUpdateAll CalcAndRefundUserMoney err ', errCode);
            //Handle Error
        }
    }.bind(this));
};

GameServer.prototype.ClearTWLoginRecord = function () {
    // this.SQLAdapter.OnClearTWRecord(this.GameServerID, function (err, dataset) {
    // }.bind(this));
};

GameServer.prototype.HandleGMTool = function (channel, message) {
    //this.Logger.Game().debug('GameServer.prototype.HandleGMTool Debug ');
    //this.Logger.Game().debug('Channel ' + JSON.stringify(channel));
    //this.Logger.Game().debug('Message ' + JSON.stringify(message));
    switch (channel) {
        case this.GMToolConfig.Channel.GameGM: {
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

GameServer.prototype.GMToolExecute = function (CMD, SID, data) {
    try {
        if (CMD == null || SID == null || data == null) return;
        if (SID == this.GameServerID) return; // Ignore itself command
        switch (CMD) {
            //PUBLISH GameGM "{\"CMD\": 1001, \"Data\": {\"UserID\": 86333}, \"SID\": 0}"
            case this.GMToolConfig.CMD.UserKickByUserID://Tài khoản hiện đang đăng nhập
            {//Check xem GameServer của User Online có chứa User này không. Nếu không Respone cho GameServer kia biết và set trạng thái User về Offline.
                try {
                    this.KickUserByUserID(data.UserID, data.Msg);
                } catch (e) {
                    this.Logger.Game().error('GameServer.prototype.GMToolExecute - Config.GMToolConfig.CMD.UserKick - try 2 err: ' + e.stack);
                }

                break;
            }
            case this.GMToolConfig.CMD.UserKickByAccountID://Tài khoản hiện đang đăng nhập
            {//Check xem GameServer của User Online có chứa User này không. Nếu không Respone cho GameServer kia biết và set trạng thái User về Offline.
                try {
                    this.KickUserByAccountID(data.AccountID, data.Msg);
                } catch (e) {
                    this.Logger.Game().error('GameServer.prototype.GMToolExecute - Config.GMToolConfig.CMD.UserKick - try 2 err: ' + e.stack);
                }

                break;
            }
            case this.GMToolConfig.CMD.ServerMaintain: {
                try {
                    if (Utility.CheckVariable(data, 'ServerID')) {
                        this.Logger.Game().debug('data.ServerID ' + JSON.stringify(data));
                        if (data.ServerID == this.GameServerID) {//Shutdown One
                            this.MaintainServer();
                        } else {
                            if (data.ServerID == 0) { //Shutdown All
                                this.MaintainServer();
                            }
                        }
                    }
                } catch (e) {
                    this.Logger.Game().error('GMToolExecute - Config.GMToolConfig.CMD.ServerMaintain - try 2 err: ' + e);
                }

                break;
            }
            case this.GMToolConfig.CMD.ForceReloadConfig:
                try {
                    //nothing to do
                } catch (e) {
                    this.Logger.Game().error('GameServer.prototype.GMToolExecute - Config.GMToolConfig.CMD.ForceReloadConfig - try 2 err: ' + e);
                }
                break;
            case this.GMToolConfig.CMD.ReloadStockConfig:
                try {
                    if (Utility.CheckVariable(data, 'ServerID')) {
                        if (data.ServerID == this.GameServerID) {//ReloadStockConfig One
                            this.ReloadStockConfig(data.Stock);
                        } else {
                            if (data.ServerID == 0) { //ReloadStockConfig All
                                this.ReloadStockConfig(data.Stock);
                            }
                        }
                    }
                } catch (e) {
                    this.Logger.Game().error('GameServer.prototype.GMToolExecute - Config.GMToolConfig.CMD.ReloadStockConfig - try 2 err: ' + e);
                }
                break;
            case this.GMToolConfig.CMD.ResetFishTimer:
                try {
                    this.ResetFishTimer(data.Data);
                }
                catch (e) {
                    this.Logger.Game().error('GameServer.prototype.GMToolExecute - Config.GMToolConfig.CMD.ResetFishTimer - try 2 err: ' + e);
                }
                break;
            case this.GMToolConfig.CMD.GlobalBossStartBoss:
                try {
                    if (Utility.CheckVariable(data, 'GameKindID')) {
                        if (data.GameKindID == 0 || data.GameKindID == this.GameKindID) {
                            this.GlobalBossServerSpawn(data);
                        }
                    }
                }
                catch (e) {
                    this.Logger.Game().error('GameServer.prototype.GMToolExecute - Config.GMToolConfig.CMD.GlobalBossServerSpawn - try 2 err: ' + e.stack);
                }
                break;
            case this.GMToolConfig.CMD.GlobalBossUserKill:
                try {
                    this.OnGlobalBossUserKill(data);
                }
                catch (e) {
                    this.Logger.Game().error('GameServer.prototype.GMToolExecute - Config.GMToolConfig.CMD.GlobalBossServerSpawn - try 2 err: ' + e.stack);
                }
                break;
            case this.GMToolConfig.CMD.ResetFishTimer_Group:
                try {
                    this.ResetFishTimer_Group(data.Data);
                }
                catch (e) {
                    this.Logger.Game().error('GameServer.prototype.GMToolExecute - Config.GMToolConfig.CMD.ResetFishTimer - try 2 err: ' + e);
                }
                break;
            case this.GMToolConfig.CMD.SpawnGoldenEventFish:
                try {
                    if (Utility.CheckVariable(data, 'GameKindID')) {
                        if (data.GameKindID == 0 || data.GameKindID == this.GameKindID) {
                            this.GetEventFishInfo(data);
                        }
                    }
                }
                catch (e) {
                    this.Logger.Game().error('GameServer.prototype.GMToolExecute - Config.GMToolConfig.CMD.SpawnGoldenEventFish - try 2 err: ' + e.stack);
                }
                break;
            default: {
                break;
            }

        }
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.GMToolExecute - try err: ' + e);
    }
};

GameServer.prototype.DestroyByUserID = function (userID, msg) {// Use to kick user with Message
    try {
        for (var i = 0; i < this.UserClient.length; i++) {
            var user = this.UserClient[i].UserModel;
            if (user.UserID == userID) {
                this.DestroySocket(user.Socket);
            }
        }
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.DestroyByUserID - try err: ' + e);
    }
};

GameServer.prototype.DestroyAllSocket = function () {// Use to kick all user with Message
    try {
        var destroyList = [];
        for (var i = 0; i < this.UserClient.length; i++) {
            destroyList.push(this.UserClient[i]);
        }
        for (var i = 0; i < destroyList.length; i++) {
            this.DestroySocket(destroyList[i]);
        }
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.DestroyByUserID - try err: ' + e);
    }
};

GameServer.prototype.KickUserByUserID = function (userID, msgText) {
    var UserIndex = this.FindUserIndexByUserID(userID);

    if (UserIndex != -1) {
        var User = this.UserClient[UserIndex];
        var msg = new Packet.KickUserResponse(0, msgText);
        this.SendSocketBinary(User, msg);

        setTimeout(function () {
            this.DestroySocket(User);
        }.bind(this), 1000);
    }
};

GameServer.prototype.KickUserByAccountID = function (accountId, msgText) {
    var User = this.FindUserIndexByAccountID(accountId);
    if (User != 0) {
        var msg = new Packet.KickUserResponse(0, msgText);
        this.SendSocketBinary(User.Socket, msg);
        setTimeout(function () {
            this.DestroySocket(User.Socket);
        }.bind(this), 1000);
    }
};

GameServer.prototype.MaintainServer = function () {// Main system
    this.Logger.Game().error('GameServer ' + this.GameServerID + ' is maintaining');
    this.MaintainFlag = true;
    this.KickAllUserUntilClear();

};

GameServer.prototype.KickAllUserUntilClear = function () {
    if (this.UserClient.length > 0) {
        this.DestroyAllSocket();
        setInterval(this.KickAllUserUntilClear.bind(this), 1000);
    } else {
        this.Logger.Game().error('GameServer ' + this.GameServerID + ' has been clean user');
    }
};

GameServer.prototype.ReloadGunConfig = function () {
    try {
        var GunConfig = requireUnCached('../Config/GameConfig/GunConfig.js');//Không gán trực tiếp, gán giáng tiếp để tránh bị lổi
        this.GunConfig = GunConfig;
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.ReloadOriginalCOnfig - try err: ' + e);
    }
};

GameServer.prototype.ReloadStockConfig = function (stock) {
    try {
        if (!this.IsNullOrUndefined(stock) && stock > 0)
            this.Stock = +stock;
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.ReloadStockConfig - try err: ' + e);
    }
};

GameServer.prototype.ReloadLoggerLevel = function () {
    try {
        var LoggerNewConfig = requireUnCached('../Config/GameConfig/LoggerConfig.js');//Không gán trực tiếp, gán giáng tiếp để tránh bị lổi
        var LogLevel = LoggerNewConfig.LogLevel;
        this.Logger.setLogLevel(LogLevel);
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.ForceReloadConfigStock - try err: ' + e);
    }
};

GameServer.prototype.HotUpdateModule = function (str, module) {
    try {
        var tmp = requireUnCached(str);
        module = tmp;
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.HotUpdateModule - try err: ' + e.stack, str);
    }
    return module;
};

GameServer.prototype.StockHandicapConfigReload = function () {
    try {
        var tmp = requireUnCached('../Config/GameConfig/StockHandicap.js');
        this.StockHandicapConfig = tmp;
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.StockHandicapConfigReload - try err: ' + e.stack);
    }
};

GameServer.prototype.ReloadConfig = function () {
    this.ReloadLoggerLevel();
    this.ReloadGunConfig();
    this.ReloadFishConfig();
    this.ReloadParadeFishConfig();
    this.ReloadEventFishConfig();
    this.DebugRunTime();
    this.ReloadFishScript();
    this.ReloadFishConfig();

};

GameServer.prototype.UpdateServerDetail = function () {
    try {
        var serverDetail = JSON.stringify({
            Earn: this.ServerEarnMoney,
            Pay: this.ServerPayMoney,
            StartStock: this.ServerStartStock,
            Stock: this.Stock
        });
        this.RedisAdapter.RecordDetail(serverDetail);
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.UpdateServerDetail - try err: ' + e);
    }
};

GameServer.prototype.ClearUserNotInServer = function () {    //
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

function randomRange(s, e) {
    return Math.floor(Math.random() * e) + s;
}

GameServer.prototype.UserLoginGameServer = function (isError, Socket, Info) {
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
                    user.UserID = Info.UserID;
                    user.Level = data.Lv;
                    user.Exp = data.Exp;
                    user.GameName = Info.GameName;
                    user.StockHandicap = data.StockHandicap;
                    user.RechargeGold = data.TotalRecharge;
                    user.UserTrackingID = this.GetNewTrackingID();
                    user.MoneyState = this.MoneyStateDefine.BeginGetting;
                    user.PlayGameTime = 0;
                    if (!this.IsRoomTrial()) {
                        this.UserMoneyChargeAll(user, function (errorCode, Money) {
                            if (errorCode == 0) {
                                user.MoneyState = this.MoneyStateDefine.GettingCompleted;
                                user.BeginWallet = Money;
                                user.Wallet = Money;
                                if (!Socket.isDestroyed) {
                                    this.InsertToRoom(Socket);
                                } else {
                                    //Socket đã destroy
                                    this.HandleLoginError(Socket, this.Config.LanguageConfig.Login_GetGoldError, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_GetGoldError, Socket.LangCode));
                                }
                            } else {
                                this.Logger.Master().error('Master.prototype.UserLoginGameServer CheckLogin UserMoneyChargeAll', errorCode, Money);
                                this.HandleLoginError(Socket, this.Config.LanguageConfig.Login_GetGoldError, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_GetGoldError, Socket.LangCode));

                            }
                        }.bind(this));
                    } else {
                        user.MoneyState = this.MoneyStateDefine.Default;
                        user.Wallet = this.TrialMoney;
                        this.InsertToRoom(Socket);
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

GameServer.prototype.ShowPopup = function (Socket, Msg) {
    try {
        this.SendSocketBinary(Socket, new Packet.ShowMsg(Msg));
    } catch (e) {
        this.Logger.Master().error('Master.prototype.ShowPopup - try err: ' + e);
    }
};

GameServer.prototype.KickAFKUser = function () {
    for (var i = 0; i < this.UserClient.length; i++) {
        var user_time = this.UserClient[i].UserModel.LastActivedTime;
        var tmpNow = +new Date();

        var dif = tmpNow - user_time;
        if (dif >= this.USER_TIMED_OUT) {
            var socket = this.UserClient[i];
            var msg = new Packet.KickUserResponse(1, 'Bạn đã bị mời ra khỏi phòng do treo máy quá lâu.');
            this.SendSocketBinary(socket, msg);
            setTimeout(function () {
                this.DestroySocket(socket);
            }.bind(this), 1000);
        }
    }
};

GameServer.prototype.ResetFishTimer = function (data) {
    for (var i = 0; i < this.DeskList.length; i++) {
        if (this.DeskList[i].DEBUG == 1) {
            this.DeskList[i].ResetFishTimer(data);
        }
    }
};

GameServer.prototype.ResetFishTimer_Group = function (data) {
    for (var i = 0; i < this.DeskList.length; i++) {
        if (this.DeskList[i].DEBUG == 1) {
            this.DeskList[i].ResetFishTimer_Group(data);
        }
    }
};

GameServer.prototype.UserPingPong = function (socket) {
    try {
        socket.UserModel.PingPongLost = 0;
        var msg = new Packet.PingPong();
        this.SendSocketBinary(socket, msg);
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.UserPingPong - try err:', e.stack)
    }
};

GameServer.prototype.PingPong = function () {
    var now = +new Date();
    for (var i = 0; i < this.UserClient.length; i++) {
        if (Utility.CheckVariable(this.UserClient[i])) {
            var User = this.UserClient[i].UserModel;
            this.UserClient[i].LastCheckSocketTime = now;

            User.PingPongLost += 1;
            if (User.PingPongLost > this.LOST_PACKET_TO_KICK) {
                this.DestroySocket(this.UserClient[i]);
            }
        }
    }
    this.CheckAllSocketHandled();
};

GameServer.prototype.CheckAllSocketHandled = function () {
    // this.WSocketUser = 0;
    // this.WSSocketUser = 0;
    var timeOut = +new Date() - this.SocketTimeOut; // timeout 30s
    //socket nào ko được làm mới tức là đã bị tiễn lên đường. double check nó
    //socket kết nối websocket thành công, nhưng ko login cũng sẽ bị kick
    if (this.WSocketUser) {
        for (const client of this.WSocketUser.clients) {
            if (client.LastCheckSocketTime < timeOut) {
                client.close();
            }
        }
    }
    if (this.WSSocketUser) {
        for (const client of this.WSSocketUser.clients) {
            if (client.LastCheckSocketTime < timeOut) {
                client.close();
            }
        }
    }


};

GameServer.prototype.LoadItemConfig = function () {

};

GameServer.prototype.FindUserByUserID = function (UserID) {
    try {
        for (var i = 0; i < this.UserClient.length; i++) {
            if (this.UserClient[i].UserModel.UserID == UserID) {
                return this.UserClient[i].UserModel;
            }

        }
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.FindUserIndexByUserID - try err:' + e);
    }
    return 0;

};

GameServer.prototype.OnUserEndGame = function (User, MatchID) {
    try {

        //this.RecordMoneyHistoryForUser(User); Lịch sử 20 thao tác tiền gần nhất (VIN)
        this.UpdateListFishDie(User, MatchID);

    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.OnUserEndGame - try err:' + e.stack);
    }

};

GameServer.prototype.RecordMission = function (User) {
    this.MissionManager.RecordMissionOnEndGame(User);
    this.AchievementManager.RecordAchievementManagerOnEndGame(User);
    var listIDChange = this.MissionManager.RecordMissionForUser(User);
    this.AchievementManager.RecordAchievementForUser(User, function (achievementChanged) {
        this.OnEndGameAndUpdateCompleted(User, listIDChange, achievementChanged);
    }.bind(this));


};

GameServer.prototype.IsRoomTrial = function () {
    return this.GameKindID == Config.RoomKindConfig.FishTrial;
};

GameServer.prototype.ReloadEventFishConfig = function () {
    try {
        var EventFishConfig = requireUnCached('../Config/GameConfig/EventFishConfig.js');//Không gán trực tiếp, gán giáng tiếp để tránh bị lổi
        this.EventFishConfig = EventFishConfig;
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.ReloadEventFishConfig - try err: ' + e);
    }
};

GameServer.prototype.GetEventFishInfo = function (data) {
    try {
        if (Utility.CheckVariable(data, 'EventID', 'FishKind', 'ItemID', 'FishMultiple', 'MaxMultiple', 'CatchRate', 'Count', 'NumberOfFish')) {
            var FishEvent = this.FindEventFishManager(data.EventID);
            if (FishEvent == 0) {
                //chua co event, tao cai moi va push vao
                FishEvent = new GoldenHourManager();
                FishEvent.Init(this, data.Count, data.EventID, data.FishKind, data.ItemID, this.RedisAdapter.GetRedisConnection());
                this.GoldenHourManager.push(FishEvent);
            }
            else {
                //co roi, init lai
                FishEvent.Init(this, data.Count, data.EventID, data.FishKind, data.ItemID, this.RedisAdapter.GetRedisConnection());
            }

            var FishInfo = FishEvent.SpawnEventFish(data.FishKind, data.ItemID, data.FishMultiple, data.MaxMultiple, data.NumberOfFish);
            if (Utility.CheckVariable(FishInfo)) {
                for (var i = 0; i < this.DeskList.length; i++) {
                    this.DeskList[i].SpawnEventFish(FishInfo, data.CatchRate, data.EventID);
                }
            }
        }


        //Remove
        var checkTime = +new Date() - 300000;
        for (i = 0; i < this.GoldenHourManager.length; i++) {
            if (this.GoldenHourManager[i].LastReload < checkTime) {
                this.GoldenHourManager[i].IsDestroy = true;
                this.GoldenHourManager.splice(i, 1);
                i--;
            }
        }
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetEventFishInfo - try err: ' + e.stack);
    }
};

GameServer.prototype.FindEventFishManager = function (EventID) {
    for (var i = 0; i < this.GoldenHourManager.length; i++) {
        if (this.GoldenHourManager[i].EventID == EventID) {
            return this.GoldenHourManager[i];
        }
    }
    return 0;
};

GameServer.prototype.IsCheck2D = function () {
    if (this.GameKindID >= 10 && this.GameKindID < 900) {
        return 0;
    }
    return 1;
};

GameServer.prototype.IsCheckChim = function () {
    if (this.GameKindID >= 900) {
        return 1;
    }
    return 0;
};

GameServer.prototype.OnUserHitEventFish = function (EventID, UserID, Gold) {
    var FishEvent = this.FindEventFishManager(EventID);

    if (FishEvent != 0) {
        FishEvent.AddGoldForListUserHit(UserID, Gold);
    }
};

GameServer.prototype.DebugRunTime = function () {
    try {
        var drt = requireUnCached('./Modules/DebugRunTime/index.js');
        drt.Execute(this);
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.DebugRunTime - try err: ' + e);
    }
};

GameServer.prototype.ReloadParadeFishConfig = function () {
    try {
        var ParadeFishConfig = requireUnCached('../Config/GameConfig/ParadeFishConfig.js');//Không gán trực tiếp, gán giáng tiếp để tránh bị lổi
        this.ParadeFishConfig = ParadeFishConfig;
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.ReloadParadeFishConfig - try err: ' + e);
    }
};

GameServer.prototype.ReloadFishScript = function () {
    if (this.IsCheck2D()) {
        var NewFishScript = requireUnCached('../Config/GameConfig/FishScript_2D.js');//Không gán trực tiếp, gán giáng tiếp để tránh bị lổi
    }
    else {
        var NewFishScript = requireUnCached('../Config/GameConfig/FishScript.js');//Không gán trực tiếp, gán giáng tiếp để tránh bị lổi
    }

    if (JSON.stringify(NewFishScript) != JSON.stringify(this.FishScript)) {
        this.FishScript = NewFishScript;
        this.Logger.Game().debug('RoomCore.prototype.ReloadFishScript changed');
        for (var i = 0; i < this.DeskList.length; i++) {
            this.DeskList[i].ResetFishTimer_Group(this.FishScript);
        }
    }
};

GameServer.prototype.ReloadFishConfig = function () {
    var defVer = 3;
    if (this.IsCheck2D()) {
        defVer = 1;
    }
    if (this.IsCheckChim()) {
        defVer = 4;
    }
    if (Utility.CheckVariable(this.GameServerConfig, "GameServer") && Utility.CheckVariable(this.GameServerConfig.GameServer, "FishVersion")) {
        defVer = this.GameServerConfig.GameServer.FishVersion;
    }
    this.SQLAdapter.listFishGetAllByVer(defVer, function (e, d) {
        if (!e) {
            this.FishConfig = d;
        }
    }.bind(this))
};

GameServer.prototype.SendGameConfigForUser = function (Socket) {
    var GameConfig = {
        ListGun: this.GunConfig.Gun.ListGun,
        ListFish: this.FishConfig
    };
    this.SendSocketBinary(Socket, new Packet.GetRoomConfigResponse(GameConfig));
};

GameServer.prototype.UserMoneyChargeAll = function (User, callback) {
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
                    callback(1, 0);
                }
            } else {
                callback(2, 0);
            }
        }.bind(this));
};

GameServer.prototype.HandleLoginError = function (Socket, ErrorMsg, ShowMsg) {
    this.ShowPopup(Socket, ShowMsg);
    this.Logger.Game().error('GameServer.prototype.HandleLoginError ', ErrorMsg);
    this.HandleRefundMoney(Socket);
    setTimeout(function () {
        this.DestroySocket(Socket);
    }.bind(this), 1000);
};

GameServer.prototype.MoneyRefundWithChanged = function (User, MoneyRefund, callback) {
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

GameServer.prototype.HandleRefundMoney = function (Socket) {
    //Refund theo từng case
    var moneyRefund = Socket.UserModel.Wallet; // tiền hiện tại của user
    if (Socket.UserModel.MoneyState = this.MoneyStateDefine.GettingCompleted) { // Chỉ refund cho trường hợp user vừa lấy tiền xong và chưa vào bàn
        Socket.UserModel.MoneyState = this.MoneyStateDefine.BeginRefund;
        //Handle refund

        this.MoneyRefundWithChanged(Socket.UserModel, moneyRefund);
    } else {
        this.Logger.Game().error('GameServer.prototype.HandleRefundMoney [focus]  Socket.UserModel.MoneyState', Socket.UserModel.MoneyState, moneyRefund);
    }
};


GameServer.prototype.CalcAndRefundUserMoney = function (Socket, callback) {
    try {
        if (Socket.UserModel.MoneyState == this.MoneyStateDefine.JoinGameCompleted) {//User đã lấy tiền thành công và vào bàn chơi.
            var moneyRefund = Socket.UserModel.FishScore; // tiền hiện tại của user
            this.MoneyRefundWithChanged(Socket.UserModel, moneyRefund, callback);

        } else {
            this.Logger.Game().debug('GameServer.prototype.CalcAndRefundUserMoney MoneyState  ', Socket.UserModel.MoneyState);
        }
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.CalcAndRefundUserMoney try  ', e.stack);
    }

};

GameServer.prototype.LogUserOutGame = function (User, callback) {
    // Gọi hàm this.LogRecorder

    //Chú ý , thằng bắn cá đang xài FishScore làm currentwallet
    var moneyBegin = User.BeginWallet;
    var moneyCurrent = User.FishScore;
    var moneyChange = User.FishScore - User.BeginWallet;
    this.RecordWinLoseForUser(User, moneyChange);
    this.LogRecorder.outGameRecord(User.UserID, this.GameServerID, User.DeskID, this.GameKindID, moneyBegin, moneyCurrent, moneyChange, User.TimeIn, new Date(), this.GameID, User.UserChannelID, function (e, d) {
        if (!e && Utility.CheckVariable(d, 'insertId')) {
            callback(0, d.insertId)
        } else {
            this.Logger.Game().error('GameServer.prototype.LogUserOutGame Record Error   ', User.UserID, this.GameServerID, User.DeskID, this.GameKindID, User.BeginWallet, User.Wallet, User.Wallet - User.BeginWallet, User.TimeIn, new Date());
            callback(1, e, d);
        }
    }.bind(this))
};


//======== Boss Thế Giới
GameServer.prototype.GlobalBossFindByID = function (BossAutoID) {
    for (var i = 0; i < this.ListGlobalBoss.length; i++) {
        if (this.ListGlobalBoss[i].BossAutoID == BossAutoID) {
            return this.ListGlobalBoss[i];
        }
    }
    return 0;
};

GameServer.prototype.GlobalBossRemoveByID = function (BossAutoID) {
    for (var i = 0; i < this.ListGlobalBoss.length; i++) {
        if (this.ListGlobalBoss[i].BossAutoID == BossAutoID) {
            this.ListGlobalBoss.splice(i, 1);
            i--;
        }
    }
    return 0;
};

GameServer.prototype.GlobalBossServerSpawn = function (BossInfo) {
    if (Utility.CheckVariable(BossInfo, 'BossAutoID', 'BossID', 'FishKind', 'MaxHp', 'RoundTime', 'RoundCount', 'TotalGoldHit', 'GoldHitRatio')) {
        if (this.GlobalBossFindByID(BossInfo.BossAutoID) == 0) {
            var boss = new GlobalBoss();
            boss.InitGlobalBoss(this, BossInfo);//recordSpawnBoss
            this.ListGlobalBoss.push(boss);
        }
    } else {
        this.Logger.Game().error('GameServer.prototype.GlobalBossCalcAward - GlobalBossServerSpawn BossInfo err ', BossInfo);
    }
};

GameServer.prototype.OnUserHitBoss = function (User, HPValue, BossAutoID, FishID, Desk) {
    var Boss = this.GlobalBossFindByID(BossAutoID);
    if (Boss != 0) {
        Boss.UserHitBoss(User, HPValue, function (UserID, MoneyReward, ItemID, ItemCount) {
            if ((+MoneyReward) > 0) {
                User.FishScore += (+MoneyReward);
                //Chỉ send trong bàn của user
                Desk.SendAllPlayer(new Packet.HitFishEffect(User.StationID, FishID, 0, MoneyReward, User.FishScore));
                Boss.OnUserGetAward(User.UserID, MoneyReward, ItemID, ItemCount)
            }
        }.bind(this));
    }
};

GameServer.prototype.GlobalBossUserEnter = function (User) {
    for (var i = 0; i < this.ListGlobalBoss.length; i++) {
        this.ListGlobalBoss[i].OnUserEnter(User);
    }
};

// GameServer.prototype.GlobalBossUpdateListUserHitBoss = function (FishID, ListUserHitBoss) {
//     for (var i = 0; i < ListUserHitBoss.length; i++) {
//         try {
//             this.RedisAdapter.GlobalBossRecordUserLastHit(FishID, ListUserHitBoss[i].UserID, ListUserHitBoss[i].LastHitTime);
//         } catch (e) {
//             this.Logger.Game().error('GameServer.prototype.GlobalBossUpdateListUserHitBoss - try err:' + e.stack);
//         }
//
//     }
// };

GameServer.prototype.GlobalBossUpdateListUserHitBoss = function (BossAutoID, ListUserHitBoss) {
    this.EventManager.EvtOnBossDie(ListUserHitBoss);
    for (var i = 0; i < ListUserHitBoss.length; i++) {
        try {
            this.LogRecorder.hitBossLogging(ListUserHitBoss[i].UserID,
                BossAutoID,
                ListUserHitBoss[i].TotalHit * -1 || 0,
                ListUserHitBoss[i].AwardMoney || 0,
                ListUserHitBoss[i].LastHitAward || 0,
                new Date(ListUserHitBoss[i].LastHitTime * -1) || new Date(),
                new Date(),
                this.GameKindID,
                this.GameServerID
            );
        } catch (e) {
            this.Logger.Game().error('GameServer.prototype.GlobalBossUpdateListUserHitBoss - try err:' + e.stack);
        }
    }
};

GameServer.prototype.OnGlobalBossUserKill = function (BossInfo) {
    if (Utility.CheckVariable(BossInfo, 'BossAutoID', 'UserID', 'GameName'))
        var boss = this.GlobalBossFindByID(BossInfo.BossAutoID);
    if (boss != 0) { // có tồn tại boss này
        boss.OnBossDieOutside(BossInfo.UserID, BossInfo.GameName);
    }
};
GameServer.prototype.KickUserAllGameByAccount = function (accountId, msg) {
    this.GMToolAdapter.SendGameCommandAll({
        CMD: this.GMToolConfig.CMD.UserKickByAccountID,
        SID: 0,
        Data: {
            AccountID: accountId,
            Msg: msg
        }
    });
};

GameServer.prototype.KickUserAllMasterByAccount = function (accountId, msg) {
    this.GMToolAdapter.SendBroadCastMasterCommand({
        CMD: this.GMToolConfig.CMD.UserKickByAccountID,
        SID: 0,
        Data: {
            AccountID: accountId,
            Msg: msg
        }
    });
};

GameServer.prototype.HandleUserConflict = function (Socket) {
    try {
        this.Logger.Game().error('GameServer.prototype.HandleUserConflict AccountID : ', Socket.UserModel.AccountID);
        this.HandleLoginError(Socket, Config.LanguageConfig.Login_Duplicate.logMsg + Socket.UserModel.AccountID, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_Duplicate, Socket.LangCode));
        this.KickUserAllGameByAccount(Socket.UserModel.AccountID, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_Duplicate, Socket.LangCode));
        this.KickUserAllMasterByAccount(Socket.UserModel.AccountID, this.GetUserMsgByLangCode(this.Config.LanguageConfig.Login_Duplicate, Socket.LangCode));
    } catch (e) {
        this.Logger.Game().error('GameServer.prototype.HandleUserConflict try : ', e.stack);
    }

};
//======== END Boss Thế Giới
GameServer.prototype.GameServerAutoCalcPlayTime = function () {
    for (var i = 0; i < this.UserClient.length; i++) {
        var socket = this.UserClient[i];
        if (Utility.CheckVariable(socket, 'UserModel')) {
            socket.UserModel.UserAutoCalcPlayTime();
        }
    }
};

GameServer.prototype.OnEndGameAndUpdateCompleted = function (User, ListID, AchievementChanged) {
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

GameServer.prototype.GetUserMsgByLangCode = function (ErrCfg, LangCode) {
    switch (LangCode) {
        case 0 : // VN
            return ErrCfg.userMsg;
        case 1:
            return ErrCfg.userMsgEn;
    }
    return ErrCfg.userMsg; // default (VN)
};

GameServer.prototype.ReCalcUserStockHandicapAll = function () {
    this.StockHandicapConfigReload();
    for (var i = 0; i < this.UserClient.length; i++) {
        if (Utility.CheckVariable(this.UserClient[i], 'UserModel')) {
            this.ReCalcUserStockHandicap(this.UserClient[i].UserModel);
        }
    }
};

GameServer.prototype.ReCalcUserStockHandicap = function (User) {
    var moneyChange = User.FishScore - User.Wallet + User.UserWinLose;
    var cfg = this.GetStockHandicapForUser(User, moneyChange);
    if (cfg != 0) {
        User.Handicap = cfg.Handicap;
        User.FishMulLimit = cfg.FishMul;
    }
};

GameServer.prototype.GetStockHandicapForUser = function (User, UserWinLose) {
    var rechargeGold = User.RechargeGold;
    var cfg = this.StockHandicapConfig.StockRangeNormal;
    if (rechargeGold > 0) {
        cfg = this.StockHandicapConfig.StockRangeVIP;
    }
    var pick = 0;

    for (var i = 0; i < cfg.length; i++) {
        if (Utility.CheckVariable(cfg[i], 'Win', 'FishMul', 'Handicap')) {
            if (pick == 0) {
                pick = cfg[i];
            } else {
                if (UserWinLose > cfg[i].Win && cfg[i].Win > pick.Win) { // thỏa dk cfg mới và Cfg mới lớn hơn cfg củ
                    pick = cfg[i];
                }
            }


        }
    }
    return pick;
};

GameServer.prototype.UpdateUserChargeGold = function (User) {
    //getUserCharge
    // this.SQLAdapter.getUserCharge(User.UserID, function (e, d) {
    //     if (e == 0) {
    //         if (Utility.CheckVariable(d) && Utility.CheckVariable(d[0], 'Money')) {
    //             User.RechargeGold = d[0].Money;
    //         }
    //     }
    // }.bind(this));
};

GameServer.prototype.UpdateUserWinLose = function (User) {
    this.SQLAdapter.getUserWinMoney(User.UserID, this.GameID, function (e, d) {
        if (e == 0) {
            if (Utility.CheckVariable(d) && Utility.CheckVariable(d[0], 'Money')) {
                User.UserWinLose = d[0].Money;
            }
        }
    }.bind(this));
};

GameServer.prototype.RecordWinLoseForUser = function (User, MoneyChange) {
    //onUserOutGame
    this.SQLAdapter.onUserOutGame(User.UserID, MoneyChange, this.GameID);
};