var Config = require('../Config/GMToolServer/index');
var Logger = require('./Modules/Log4JS/index');
var WebSocket = require('ws');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var SQLAdapter = require('./Modules/SQLAdapter');
var AgentConfig = require('../Config/Agent');
var Utility = require('../SharedModule/Utility');
var UserController = require('./Controller/UserController.js');
var LogRecorder = require('./Modules/LogRecorder');
var GMToolServerConfig = require('../Config/GMToolServer');
var PacketConfig = require('./PacketConfig');
var queryString = require('querystring');
var urlLib = require('url');
var Encrytion = require('../SharedModule/encrytion');
var RedisAdapter = require('./Modules/RedisAdapter/RedisAdapter.js');
var GMToolAdapter = require('./Modules/GMToolAdapter');

function AdminPage() {

    this.Run = true;
    this.MainTime = +new Date;
    this.GameListConfig = require('../Config/Common/GameListConfig');
    this.MasterID = 1;
    this.Config = Config;
    this.Logger = Logger;
    this.WebServer = 0;
    this.WSocketUser = 0;
    this.UserPortWS = this.Config.GMToolServerConfig.ListeningPort;
    this.SQLAdapter = SQLAdapter;
    this.LogRecorder = LogRecorder;
    this.GMToolServerConfig = GMToolServerConfig;
    this.GameNameConfig = [];
    this.RedisConfig = Config.RedisConfig;
    this.RedisAdapter = RedisAdapter;

    this.GMToolAdapter = GMToolAdapter;
    this.GMToolConfig = Config.GMToolConfig;

    this.Timer = [
        {
            Tick: 0,
            Interval: 5000,
            Wake: this.GetGameNameConfig.bind(this)
        }
    ];

    this.UserList = [];
    this.APILink = this.Config.GMToolServerConfig.APILink;
    this.GameListOnline = [];
}

module.exports = AdminPage;

AdminPage.prototype.Start = function () {
    this.Init();
};

AdminPage.prototype.test = function (Request, Response) {
    Response.end(fs.readFileSync('./AdminPagesClient/Home.html').toString());
};

AdminPage.prototype.Init = function () {
    this.Logger.Init(0, this.Config.LoggerConfig, function () {
        //this.WebServer = http.createServer(this.HandleRequest.bind(this));
        //this.WebServer.listen(this.Config.GMToolServerConfig.ListeningPort, this.Config.GMToolServerConfig.BindingIP);
        this.RedisAdapter.Init(this.GameServerID, this.RedisConfig, this.Logger.Redis());
        this.SQLAdapter.Init(AgentConfig.SQLConfig, this.Logger.Sql(), AgentConfig.LoggerConfig.database);
        this.LogRecorder.Init(this.Config.LogRecorderConfig, this.Logger.LogRecorder(), AgentConfig.SQLConfig.database);
        this.InitUserListener();
        this.GMToolAdapter.Init(this.GameServerID, this.GMToolConfig, this.HandleGMTool.bind(this));

        setInterval(this.TimerLoop.bind(this), 1000);
    }.bind(this));

};

AdminPage.prototype.InitUserListener = function () {
    this.WSocketUser = new WebSocket.Server({
        port: this.UserPortWS,
        perMessageDeflate: false
    }, function (err) {
        if (!err) this.Logger.Master().info("MasterID " + this.MasterID + " is online listen all on port [WS] : " + this.UserPortWS);
        else this.Logger.Master().error("Master fail to start on port : " + this.UserPortWS);
    }.bind(this));
    this.WSocketUser.on('connection', this.WebSocketUserConnect.bind(this, false));//Bind This vs IsWSS
    this.WSocketUser.on('error', function (err) {
        this.Logger.Master().error("error W :" + err);
        //Handle Error
    }.bind(this));
};

AdminPage.prototype.WebSocketUserConnect = function (isWss, socket) {//nhận kết nối của user (đầu tiên)
    try {
        this.Logger.Master().debug('WebSocketUserConnect', socket._socket.remoteAddress);

        socket.socketType = 1;
        socket.isWss = isWss;
        socket.remoteAddress = socket._socket.remoteAddress;
        socket.remotePort = socket._socket.remotePort;
        socket.remoteAddressReal = socket.remoteAddress;
        socket.end = socket.close;
        socket.IsAdmin = 0;
        socket.Permission = [];
        socket.AccountID = "chưa đăng nhập";

        socket.UserController = new UserController(this, socket);
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

        this.UserList.push(socket);
    } catch (e) {
        this.Logger.Game().error('WebSocketUserConnect try ', e.stack);
    }

};

AdminPage.prototype.OnUserDisconnected = function (err, socket) {
    try {
        this.DestroySocketOnly(socket);
    }
    catch (e) {
        this.Logger.Game().error("GMToolAPI.prototype.OnUserDisconnected ", e.stack);
    }
};


AdminPage.prototype.DestroySocketOnly = function (socket) {
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
        var index = this.UserList.indexOf(socket);
        if (index != -1) {
            this.UserList.splice(index, 1);
        }
    }
    catch (e) {
        this.Logger.Game().error("DestroySocketOnly - try err: " + e.stack);
    }
};

AdminPage.prototype.HandleRequest = function (Request, Response) {
    try {
        // if(Request.socket.remoteAddress != '123.30.210.205'){
        //     this.Logger.Game().error("GMToolAPI.prototype.HandleRequest Unacceptable IP ", Request.socket.remoteAddress);
        //     Response.end();
        //     return;
        // }
        if (Request.method == 'POST') {
            var body = '';
            Request.on('data', function (data) {
                body += data;
            });
            Request.on('error', function (error) {

            });
            Request.on('end', function () {
                this.HandlePostRequest(Request, Response, body);
            }.bind(this));
        } else {
            this.HandleGetRequest(Request, Response);
        }

    } catch (e) {
        Response.end('{"statusCode":404,"message":"internal error "}');
        this.Logger.Game().error("GMToolAPI.prototype.HandlePostCompleted ", e.stack);
    }

};

AdminPage.prototype.HandlePostRequest = function (Request, Response, Body) {

};

AdminPage.prototype.HandleGetRequest = function (Request, Response) {

};

AdminPage.prototype.TimerLoop = function () {
    try {
        if (this.Run) {
            var local = new Date();
            var difTime = (local - this.MainTime);
            this.MainTime = local;

            for (var i = 0; i < this.Timer.length; i++) {
                this.Timer[i].Tick += difTime;

                if (this.Timer[i].Tick >= this.Timer[i].Interval) {
                    this.Timer[i].Tick = 0;
                    this.Timer[i].Wake();
                }
            }
        }
    }
    catch (e) {
        this.Logger.Game().error("GMToolAPI.prototype.TimerLoop ", e.stack);
    }
};

AdminPage.prototype.ShowCCUPage = function (Request, Response) {
    this.SQLAdapter.getCCUAllGame(function (e, d) {
        if (Utility.CheckVariable(d) && Utility.CheckVariable(d[0], 'CCU')) {
            Response.end('CCU hiện tại : ' + d[0].CCU);
        } else {
            Response.end('Error 101 ');
        }

    })
};


//Qui

AdminPage.prototype.ResponseSocket = function (Socket, data) {
    var packetId = Socket.currentPacketId;
    if (packetId != 0) {
        Socket.send(this.BuildData(packetId, data));
        Socket.currentPacketId = 0;
    }
};
AdminPage.prototype.GetGameStatus = function (Socket, DateFrom, DateTo) {
    try {
        var DateArr = GetDateArray(DateFrom, DateTo);
        this.GetChannelName(function (ChannelName) {
            this.GetDAUCallback(DateArr, function (DAUArray) {
                this.GetNAUCallback(DateArr, function (NAUArray) {
                    this.GetNAUDetailCallback(DateArr, function (NAUDetailArray) {
                        var GameStatusArray = [];
                        var GameStatusArray_ForChart = {};

                        for (var i = 0; i < DateArr.length; i++) {
                            var A_Result = [];
                            var NAUDetail = NAUDetailArray[i];

                            for (var j = 0; j < ChannelName.length; j++) {
                                var A_Result_Channel = [];
                                A_Result_Channel = this.GetAArrayByDate(NAUDetail, ChannelName[j].ChannelID);
                                A_Result.push({
                                    ChannelID: ChannelName[j].ChannelID,
                                    A_Result: A_Result_Channel
                                });
                            }

                            GameStatusArray.push({
                                Date: DateArr[i],
                                DAU: DAUArray[i],
                                NAU: NAUArray[i],
                                A_Result: A_Result
                            });

                        }

                        var DataResponse = {
                            ChannelName: ChannelName,
                            GameStatusArray: GameStatusArray
                        };

                        this.ResponseSocket(Socket, DataResponse, PacketConfig.GetGameStatus);
                    }.bind(this));
                }.bind(this));
            }.bind(this));
        }.bind(this))
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.getGameStatus - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetDAUCallback = function (DateArr, callback) {
    try {
        var _DateArr = DateArr.slice();
        var Date = _DateArr.shift();
        var ResultArr = [];

        this.LogRecorder.GetDAU(Date, function (e, r) {
            if (!e) {
                //ResultArr.push(r[0].DAU);
                ResultArr.push(r);

                if (_DateArr.length > 0) {
                    this.GetDAUCallback(_DateArr, function (r1) {
                        ResultArr = ResultArr.concat(r1);
                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().debug('this.SQLAdapter.GetDAU err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetDAUCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetNAUCallback = function (DateArr, callback) {
    try {
        var _DateArr = DateArr.slice();
        var Date = _DateArr.shift();
        var ResultArr = [];

        this.SQLAdapter.GetNAU(Date, function (e, r) {
            if (!e) {
                ResultArr.push(r[0].NAU);
                if (_DateArr.length > 0) {
                    this.GetNAUCallback(_DateArr, function (r1) {
                        ResultArr = ResultArr.concat(r1);

                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().debug('this.SQLAdapter.GetNAU err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetGameStatusWithCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetTopGold = function (Socket, Top) {
    try {
        this.SQLAdapter.GetTopGold(Top, function (e, TopGoldArray) {
            if (!e) {
                this.GetNameArrayCallback(TopGoldArray, function (NameArray) {
                    var TopGoldResponse = [];

                    for (var i = 0; i < TopGoldArray.length; i++) {
                        TopGoldResponse.push({
                            UserID: TopGoldArray[i].UserID,
                            Nick: NameArray[i].GameName || "",
                            Money: TopGoldArray[i].Money,
                            UpdateTime: TopGoldArray[i].UpdateTime
                        });
                    }

                    var DataResponse = {
                        TopGoldResponse: TopGoldResponse
                    };
                    this.ResponseSocket(Socket, DataResponse);

                }.bind(this));
            }
            else {
                this.Logger.Game().debug('this.SQLAdapter.GetTopGold err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetTopGold - try err: ' + e.stack);
        return [];
    }
};

AdminPage.prototype.GetNameArrayCallback = function (UserIDArr, callback) {
    try {
        var ResultArr = [];
        if (UserIDArr.length == 0) {
            callback(ResultArr);
            return;
        }
        var _UserIDArr = UserIDArr.slice();

        var UserID = _UserIDArr.shift().UserID;

        this.SQLAdapter.GetGameNameByUserID(UserID, function (e, r) {
            if (!e) {
                ResultArr.push(r);
                if (_UserIDArr.length > 0) {
                    this.GetNameArrayCallback(_UserIDArr, function (r1) {
                        ResultArr = ResultArr.concat(r1);
                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().debug('this.SQLAdapter.GetNameArrayCallback err: ' + e);
                callback([]);
            }

        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetNameArrayCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetTopWin = function (Socket, DateTimeFrom, DateTimeTo, Top) {
    try {

        var temp = DateTimeFrom.split(" ");
        var DateFrom = temp[0];

        temp = DateTimeTo.split(" ");
        var DateTo = temp[0];

        var DateArr = GetDateArray(DateFrom, DateTo);
        this.GetTopWinLoseSummaryMultiDate(DateArr, DateTimeFrom, DateTimeTo, function (e, d) {
            var SummaryData = {
                UserWinCount: 0,
                UserWinSum: 0,
                UserLoseCount: 0,
                UserLoseSum: 0
            };

            if (!e) {
                for (var i = 0; i < d.length; i++) {
                    SummaryData.UserWinCount += d[i].data.GetUserWinCount.data;
                    SummaryData.UserLoseCount += d[i].data.GetUserLoseCount.data;
                    SummaryData.UserWinSum += d[i].data.GetUserWinSum.data;
                    SummaryData.UserLoseSum += d[i].data.GetUserLoseSum.data;
                }

                this.GetTopWinCallback(DateArr, DateTimeFrom, DateTimeTo, Top, function (TopWinArray) {
                    this.GetTopLoseCallback(DateArr, DateTimeFrom, DateTimeTo, Top, function (TopLoseArray) {
                        var TopWinWithDate = [];
                        var TopLoseWithDate = [];
                        for (var i = 0; i < DateArr.length; i++) {
                            TopWinWithDate.push({
                                Date: DateArr[i],
                                TopWinArray: TopWinArray[i]
                            });
                            TopLoseWithDate.push({
                                Date: DateArr[i],
                                TopLoseArray: TopLoseArray[i]
                            })
                        }

                        var TopWinFinal = [];
                        for (var i = 0; i < TopWinWithDate.length; i++) {
                            var cTopWinArray = TopWinWithDate[i].TopWinArray;

                            for (var j = 0; j < cTopWinArray.length; j++) {
                                var UserID = cTopWinArray[j].UserID;
                                var MoneyWin = cTopWinArray[j].MoneyWin;

                                var findUser = TopWinFinal.find(function (user) {
                                    return user.UserID == UserID;
                                }.bind(this));

                                if (typeof findUser != "undefined") {
                                    findUser.MoneyWin += MoneyWin;
                                }
                                else {
                                    TopWinFinal.push({
                                        UserID: UserID,
                                        MoneyWin: MoneyWin,
                                        Nick: ''
                                    });
                                }
                            }
                        }

                        var TopLoseFinal = [];
                        for (var i = 0; i < TopLoseWithDate.length; i++) {
                            var cTopLoseArray = TopLoseWithDate[i].TopLoseArray;

                            for (var j = 0; j < cTopLoseArray.length; j++) {
                                var UserID = cTopLoseArray[j].UserID;
                                var MoneyWin = cTopLoseArray[j].MoneyWin;

                                var findUser = TopLoseFinal.find(function (user) {
                                    return user.UserID == UserID;
                                }.bind(this));

                                if (typeof findUser != "undefined") {
                                    findUser.MoneyWin += MoneyWin;
                                }
                                else {
                                    TopLoseFinal.push({
                                        UserID: UserID,
                                        MoneyWin: MoneyWin,
                                        Nick: ''
                                    });
                                }
                            }
                        }
                        this.GetNameArrayCallback(TopWinFinal, function (NameWinArray) {
                            this.GetNameArrayCallback(TopLoseFinal, function (NameLoseArray) {

                                for (var i = 0; i < TopWinFinal.length; i++) {
                                    TopWinFinal[i].Nick = NameWinArray[i].GameName;
                                }

                                TopWinFinal.sort(function (a, b) {
                                    return b.MoneyWin - a.MoneyWin;
                                });

                                for (var i = 0; i < TopLoseFinal.length; i++) {
                                    TopLoseFinal[i].Nick = NameLoseArray[i].GameName;
                                }

                                TopLoseFinal.sort(function (a, b) {
                                    return a.MoneyWin - b.MoneyWin;
                                });

                                var DataResponse = {
                                    SummaryData: SummaryData,
                                    TopWinFinal: TopWinFinal,
                                    TopLoseFinal: TopLoseFinal
                                };

                                this.ResponseSocket(Socket, DataResponse);
                            }.bind(this));
                        }.bind(this));
                    }.bind(this));
                }.bind(this));
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetTopWin - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetTopWinCallback = function (DateArr, DateTimeFrom, DateTimeTo, Top, callback) {
    try {
        var _DateArr = DateArr.slice();
        var Date = _DateArr.shift();
        var ResultArr = [];

        this.LogRecorder.GetListMoneyWinByDate(Date, DateTimeFrom, DateTimeTo, Top, function (e, r) {
            if (!e) {
                ResultArr.push(r);
                if (_DateArr.length > 0) {
                    this.GetTopWinCallback(_DateArr, DateTimeFrom, DateTimeTo, Top, function (r1) {
                        ResultArr = ResultArr.concat(r1);

                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().error('this.SQLAdapter.GetListMoneyWinByDate err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetTopWinCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetTopLoseCallback = function (DateArr, DateTimeFrom, DateTimeTo, Top, callback) {
    try {
        var _DateArr = DateArr.slice();
        var Date = _DateArr.shift();
        var ResultArr = [];

        this.LogRecorder.GetListMoneyLoseByDate(Date, DateTimeFrom, DateTimeTo, Top, function (e, r) {
            if (!e) {
                ResultArr.push(r);
                if (_DateArr.length > 0) {
                    this.GetTopLoseCallback(_DateArr, DateTimeFrom, DateTimeTo, Top, function (r1) {
                        ResultArr = ResultArr.concat(r1);

                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().error('this.SQLAdapter.GetListMoneyWinByDate err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetTopLoseCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetTotalSystemGold = function (Socket, DateFrom, DateTo) {
    try {
        this.SQLAdapter.GetTotalSystemGold(function (e, r1) {
            if (!e) {
                var CurrentTotalSystemGold = (r1[0].TotalSystemGold);
                this.LogRecorder.GetTotalSystemGoldByDate(DateFrom, DateTo, function (e, r) {
                    this.LogRecorder.GetTotalSystemGoldInGame(function(e2, r2){
                        var CurrentTotalSystemGold_Ingame = (r2[0].TotalSystemGold);

                        if (!e) {
                            var result = [];
                            var result_forchart = {
                                UpdateTime: [],
                                TotalSystemGold: []
                            };
                            for (var i = 0; i < r.length; i++) {
                                result.push({
                                    UpdateTime: FormatDateTime(r[i].UpdateTime),
                                    TotalSystemGold: FormatNumber(r[i].TotalSystemGold)
                                });

                                var GDate = new Date(r[i].UpdateTime);

                                //result_forchart.UpdateTime.push(pad(GDate.getHours(), 2));
                                result_forchart.UpdateTime.push(FormatDateTime(r[i].UpdateTime));
                                result_forchart.TotalSystemGold.push((r[i].TotalSystemGold));
                            }

                            var DataResponse = {
                                CurrentTotalSystemGold: CurrentTotalSystemGold,
                                CurrentTotalSystemGold_Ingame: CurrentTotalSystemGold_Ingame,
                                Result: result,
                                Result_ForChart: result_forchart
                            };


                            this.ResponseSocket(Socket, DataResponse);
                        }
                        else {
                            this.Logger.Game().error('this.LogRecorder.GetTotalSystemGold err: ' + e);
                        }
                    }.bind(this));
                    //var responseData = {
                    //    TotalSystemGold: result
                    //};
                    //this.ResponseSocket(Socket, responseData);
                    //Socket.send(this.BuildData(1, responseData));
                }.bind(this));
            }
            else {
                this.Logger.Game().error('this.SQLAdapter.GetTotalSystemGold err: ' + e);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetTotalSystemGold - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetLogGoldUser = function (Socket, UserID, DateFrom, DateTo, Nick, TimeFrom, TimeTo) {
    try {
        var DateArr = GetDateArray(DateFrom, DateTo);

        var SQLQueryFunc = this.SQLAdapter.GetUserIDByNick;
        var QueryParam = Nick;

        if (UserID.length != 0) {
            SQLQueryFunc = this.SQLAdapter.GetNickByUserID;
            QueryParam = UserID;
        }

        SQLQueryFunc(QueryParam, function (e, r) {
            var UserID_Nick_Array = r;

            if (UserID_Nick_Array.length == 0) {
                return;
            }

            this.GetLogGoldUserCallback(DateArr, UserID_Nick_Array, TimeFrom, TimeTo, function (LogGoldUserArray) {

                var Result = [];

                for (var i = 0; i < LogGoldUserArray.length; i++) {
                    Result = Result.concat(LogGoldUserArray[i]);
                }

                for (var i = 0; i < Result.length; i++) {
                    Result[i].Nick = '';

                    for (var j = 0; j < UserID_Nick_Array.length; j++) {
                        if (Result[i].UserID == UserID_Nick_Array[j].UserID) {
                            Result[i].Nick = UserID_Nick_Array[j].Nick;
                            break;
                        }
                    }

                    Result[i].UpdateTime = FormatDateTime(Result[i].UpdateTime);
                }

                var Reason_ChargeAllGold = 102;
                var Reason_RefundGold = 103;

                //for (var i = 0; i < Result.length; i++) {
                //    Result[i].UpdateTimeFrom = Result[i].UpdateTime;
                //
                //    if (Result[i].ReasonID == Reason_ChargeAllGold) {
                //        var LogInfo = Result[i];
                //        for (var j = i + 1; j < Result.length; j++) {
                //            if (Result[j].ReasonID == Reason_RefundGold
                //                && Result[j].UserID == LogInfo.UserID
                //                && Result[j].ServerID == LogInfo.ServerID
                //                && Result[j].ServerTrackID == LogInfo.ServerTrackID
                //            ) {
                //                var MoneyAfter = Result[j].MoneyAfter;
                //                var MoneyBefore = LogInfo.MoneyBefore;
                //                var MoneyChange = MoneyAfter - MoneyBefore;
                //                var Description = "User thắng game";
                //                var UpdateTime = Result[j].UpdateTime;
                //
                //                if (MoneyChange < 0) {
                //                    Description = "User thua game"
                //                }
                //
                //                LogInfo.MoneyAfter = MoneyAfter;
                //                LogInfo.MoneyTransfer = MoneyChange;
                //                LogInfo.Description = Description;
                //                LogInfo.UpdateTime = UpdateTime;
                //
                //
                //                Result.splice(j, 1);
                //                break;
                //            }
                //
                //            else if (Result[j].ReasonID == Reason_ChargeAllGold) {
                //                break;
                //            }
                //        }
                //    }
                //}

                var DataResponse = {
                    Result: Result,
                    GameNameConfig: this.GameNameConfig
                };

                this.ResponseSocket(Socket, DataResponse);

            }.bind(this))
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetLogGoldUser - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetLogGoldUserCallback = function (DateArr, UserID_Nick_Array, TimeFrom, TimeTo, callback) {
    try {
        var _DateArr = DateArr.slice();
        var Date = _DateArr.shift();
        var ResultArr = [];

        this.LogRecorder.GetLogGoldUserByArr(UserID_Nick_Array, Date, TimeFrom, TimeTo, function (e, r) {
            if (!e) {
                ResultArr.push(r);
                if (_DateArr.length > 0) {
                    this.GetLogGoldUserCallback(_DateArr, UserID_Nick_Array, TimeFrom, TimeTo, function (r1) {
                        ResultArr = ResultArr.concat(r1);

                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().error('this.SQLAdapter.GetLogGoldUserByArr err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetLogGoldUserCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetMoneyStatus = function (Socket, DateFrom, DateTo, TimeFrom, TimeTo) {
    try {
        var DateArr = GetDateArray(DateFrom, DateTo);
        this.GetChannelName(function (ChannelName) {
            this.GetMoneyStatusMultiDate(DateArr, TimeFrom, TimeTo, function (e, d) {
                if (!e) {
                    var FinalResult = [];
                    var MoneyWinArray = [];
                    var MoneyLoseArray = [];
                    var TotalDailyAwardArray = [];
                    var TotalOnlineAwardArray = [];
                    var SummaryBCInfo = [];
                    var SummaryTXInfo = [];
                    var SummarySlotInfo = [];
                    var SummaryBaccaratInfo = [];
                    var SummaryXocDiaInfo = [];
                    var SummaryVQMMInfo = [];
                    var SummaryTXMiniInfo = [];
                    var SummaryMiniPokerInfo = [];
                    var SummaryBingoInfo = [];
                    var SummaryTransfer = [];

                    for (var i = 0; i < d.length; i++) {
                        var data = d[i].data;
                        MoneyWinArray.push(data.MoneyWin.data);
                        MoneyLoseArray.push(data.MoneyLose.data);
                        TotalDailyAwardArray.push(data.TotalDailyAward.data);
                        TotalOnlineAwardArray.push(data.TotalOnlineAward.data);
                        SummaryBCInfo.push(data.SummaryBCInfo.data);
                        SummaryTXInfo.push(data.SummaryTXInfo.data);
                        SummarySlotInfo.push(data.SummarySlotInfo.data);
                        SummaryBaccaratInfo.push(data.SummaryBaccaratInfo.data);
                        SummaryXocDiaInfo.push(data.SummaryXocDiaInfo.data);
                        SummaryVQMMInfo.push(data.SummaryVQMMInfo.data);
                        SummaryTXMiniInfo.push(data.SummaryTXMiniInfo.data);
                        SummaryBingoInfo.push(data.SummaryBingoInfo.data);
                        SummaryTransfer.push(data.SummaryTransfer.data);
                        SummaryMiniPokerInfo.push(data.SummaryMiniPokerInfo.data);
                    }

                    for (var i = 0; i < DateArr.length; i++) {
                        FinalResult.push({
                            Date: DateArr[i],
                            MoneyWinArray: MoneyWinArray[i],
                            MoneyLoseArray: MoneyLoseArray[i],
                            TotalDailyAward: TotalDailyAwardArray[i],
                            TotalOnlineAward: TotalOnlineAwardArray[i],
                            SummaryBCInfo: SummaryBCInfo[i],
                            SummaryTXInfo: SummaryTXInfo[i],
                            SummarySlotInfo: SummarySlotInfo[i],
                            SummaryBaccaratInfo: SummaryBaccaratInfo[i],
                            SummaryXocDiaInfo: SummaryXocDiaInfo[i],
                            SummaryVQMMInfo: SummaryVQMMInfo[i],
                            SummaryTXMiniInfo: SummaryTXMiniInfo[i],
                            SummaryBingoInfo: SummaryBingoInfo[i],
                            SummaryTransfer: SummaryTransfer[i],
                            SummaryMiniPokerInfo: SummaryMiniPokerInfo[i]
                        })
                    }

                    var DataResponse = {
                        Result: FinalResult,
                        GameNameConfig: this.GameNameConfig,
                        ChannelName: ChannelName
                    };

                    this.ResponseSocket(Socket, DataResponse);
                }
            }.bind(this));
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetMoneyStatus - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetMoneyWinByDateCallback = function (DateArr, callback) {
    try {
        var _DateArr = DateArr.slice();
        var Date = _DateArr.shift();
        var ResultArr = [];

        this.LogRecorder.GetMoneyWinByDate(Date, function (e, r) {
            if (!e) {
                for (var i = 0; i < r.length; i++) {

                    ResultArr.push({
                        TotalMoneyWin: r[i].TotalMoneyWin,
                        GameID: r[i].GameID
                    });
                }

                if (_DateArr.length > 0) {
                    this.GetMoneyWinByDateCallback(_DateArr, function (r1) {
                        ResultArr = ResultArr.concat(r1);

                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().debug('this.SQLAdapter.GetMoneyWinByDate err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetGameStatusWithCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetMoneyLoseByDateCallback = function (DateArr, callback) {
    try {
        var _DateArr = DateArr.slice();
        var Date = _DateArr.shift();
        var ResultArr = [];

        this.LogRecorder.GetMoneyLoseByDate(Date, function (e, r) {
            if (!e) {
                for (var i = 0; i < r.length; i++) {
                    ResultArr.push({
                        TotalMoneyLose: r[i].TotalMoneyLose,
                        GameID: r[i].GameID
                    });
                }

                if (_DateArr.length > 0) {
                    this.GetMoneyLoseByDateCallback(_DateArr, function (r1) {
                        ResultArr = ResultArr.concat(r1);

                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().debug('this.SQLAdapter.GetMoneyLoseByDate err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetMoneyLoseByDateCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetTotalDailyAwardByDateCallback = function (DateArr, callback) {
    try {
        var _DateArr = DateArr.slice();
        var Date = _DateArr.shift();
        var ResultArr = [];

        this.LogRecorder.GetTotalDailyAwardByDate(Date, function (e, r) {
            if (!e) {
                var TotalDailyAward = 0;
                if (r[0].TotalDailyAward != null) {
                    TotalDailyAward = r[0].TotalDailyAward;
                }
                else {

                }

                ResultArr.push(TotalDailyAward);
                if (_DateArr.length > 0) {
                    this.GetTotalDailyAwardByDateCallback(_DateArr, function (r1) {
                        ResultArr = ResultArr.concat(r1);

                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().debug('this.SQLAdapter.GetTotalDailyAwardByDate err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetGameStatusWithCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetTotalOnlineAwardByDateCallback = function (DateArr, callback) {
    try {
        var _DateArr = DateArr.slice();
        var Date = _DateArr.shift();
        var ResultArr = [];

        this.LogRecorder.GetTotalOnlineAwardByDate(Date, function (e, r) {
            if (!e) {
                var TotalOnlineAward = 0;
                if (r[0].TotalOnlineAward != null) {
                    TotalOnlineAward = r[0].TotalOnlineAward;
                }
                else {

                }

                ResultArr.push(TotalOnlineAward);
                if (_DateArr.length > 0) {
                    this.GetTotalOnlineAwardByDateCallback(_DateArr, function (r1) {
                        ResultArr = ResultArr.concat(r1);

                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().debug('this.SQLAdapter.GetTotalOnlineAwardByDate err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetGameStatusWithCallback - try err: ' + e.stack);
    }
}

AdminPage.prototype.GetMoneyFlowStatistics = function (Socket, DateFrom, DateTo) {
    try {
        var DateArr = GetDateArray(DateFrom, DateTo);
        this.GetMoneyFlowStatisticsByDateCallback(DateArr, function (MoneyFlowStatisticsArray) {

            var Result = [];
            var Result_ForChart = {}
            for (var i = 0; i < DateArr.length; i++) {
                Result.push({

                    Date: DateArr[i],
                    MoneyFlowStatistics: MoneyFlowStatisticsArray[i]
                })
            }

            var ParsedResult = [];
            for (var i = 0; i < Result.length; i++) {
                ParsedResult.push(this.ParseMoneyFlowStatistics(Result[i]));
            }

            for (var i = 0; i < ParsedResult.length; i++) {
                for (var property in ParsedResult[i]) {
                    if (i == 0) {
                        Result_ForChart[property] = [];
                    }
                    Result_ForChart[property].push(ParsedResult[i][property]);
                }
            }

            //console.log("Result_ForChart", Result_ForChart);
            //console.log("GetMoneyFlowStatistics Result:");
            //console.log(ParsedResult);

            //Result_ForChart.DateArr = DateArr

            var DataResponse = {
                Result: ParsedResult,
                Result_ForChart: Result_ForChart
            };

            this.ResponseSocket(Socket, DataResponse);
        }.bind(this))
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetGameStatusWithCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.ParseMoneyFlowStatistics = function (MoneyFlowStatisticsByDate) {
    try {
        var MoneyReasonConfig = require('../Config/Common/MoneyReasonConfig');

        var ResultObj = {};
        ResultObj.Date = MoneyFlowStatisticsByDate.Date;

        var MoneyFlowStatistics = MoneyFlowStatisticsByDate.MoneyFlowStatistics;

        for (var property in MoneyReasonConfig) {
            var value = 0;

            for (var i = 0; i < MoneyFlowStatistics.length; i++) {
                if (MoneyReasonConfig[property] == MoneyFlowStatistics[i].ReasonID) {
                    value = MoneyFlowStatistics[i].TotalMoneyTransfer;
                    break;
                }
            }

            ResultObj[property] = value;
        }

        return ResultObj;

    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.ParseMoneyFlowStatistics - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetMoneyFlowStatisticsByDateCallback = function (DateArr, callback) {
    try {
        var _DateArr = DateArr.slice();
        var Date = _DateArr.shift();
        var ResultArr = [];

        this.LogRecorder.GetMoneyFlowStatisticsByDate(Date, function (e, r) {
            if (!e) {
                //if(typeof r[0] != 'undefined') {
                //    ResultArr.push({
                //        ReasonID: r[0].ReasonID,
                //        TotalMoneyTransfer: r[0].TotalMoneyTransfer
                //    });
                //}

                ResultArr.push(r);
                if (_DateArr.length > 0) {
                    this.GetMoneyFlowStatisticsByDateCallback(_DateArr, function (r1) {
                        ResultArr = ResultArr.concat(r1);

                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().debug('this.SQLAdapter.GetMoneyFlowStatisticsByDate err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetMoneyFlowStatisticsByDateCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetGlobalBossList = function (Socket) {
    try {
        this.SQLAdapter.GetGlobalBossList(function (e, r) {
            var result = [];
            if (!e) {
                result = r;
            }
            else {

            }

            for (var i = 0; i < result.length; i++) {
                result[i].DayStart = FormatDate(result[i].DayStart);
                result[i].DayEnd = FormatDate(result[i].DayEnd);
                //result[i].TimeStart = FormatTime(result[i].TimeStart);
                //result[i].TimeEnd = FormatTime(result[i].TimeEnd);
            }

            var DataResponse = {
                Result: result
            };

            this.ResponseSocket(Socket, DataResponse);
        }.bind(this))
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetGlobalBossList - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetGlobalBossName = function (Socket) {
    try {
        var Limit = 30;
        this.SQLAdapter.GetGlobalBossName(Limit, function (e, r) {

            if (!e) {
                var FishNameArray = [];
                for (var i = 0; i < r.length; i++) {
                    try {
                        var FishName = JSON.parse(r[i].FishName);
                        FishNameArray.push({
                            FishKind: r[i].FishKind,
                            FishName: FishName["vn"]
                        });
                    }
                    catch (err) {
                        console.log("SQLAdapter.GetGlobalBossName error", r[i])
                    }
                }

                //console.log("FishNameArray", FishNameArray);

                var DataResponse = {
                    Result: FishNameArray
                };

                this.ResponseSocket(Socket, DataResponse);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetGlobalBossName - try err: ' + e.stack);
    }
};

AdminPage.prototype.UpdateGlobalBoss = function (Socket, GlobalBoss) {
    try {
        GlobalBoss.DayStart += ' 00:00:00';
        GlobalBoss.DayEnd += ' 23:59:59';

        this.SQLAdapter.UpdateGlobalBoss(GlobalBoss, function (e, r) {

        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.UpdateGlobalBoss - try err: ' + e.stack);
    }
};

AdminPage.prototype.AddGlobalBoss = function (Socket, GlobalBoss) {
    try {
        GlobalBoss.DayStart += ' 00:00:00';
        GlobalBoss.DayEnd += ' 23:59:59';

        this.SQLAdapter.AddGlobalBoss(GlobalBoss, function (e, r) {

        }.bind(this));
        //this.SQLAdapter.GetBossID(function (e, r) {
        //    if (!e) {
        //        var BossID = r[0].BossID + 1;
        //
        //    }
        //}.bind(this));

    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.UpdateGlobalBoss - try err: ' + e.stack);
    }
};

AdminPage.prototype.DeleteGlobalBoss = function (Socket, GlobalBoss) {
    try {
        this.SQLAdapter.DeleteGlobalBoss(GlobalBoss, function (e, r) {

        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.DeleteGlobalBoss - try err: ' + e.stack);
    }
};

AdminPage.prototype.CheckLoginByToken = function (Socket, Token) {
    try {
        //{ keyAuth: 'http://123.31.24.16:3000/GMTool' }
        if (Utility.CheckVariable(Token, 'keyAuth')) {
            var keyAuth = Token.keyAuth;
            var url = urlLib.parse(keyAuth);
            var path = url.path;
            path = path.substr(1, path.length - 1);
            var data = queryString.parse(path);
            var decryptData = Encrytion.aesDecryptIV(data.key, Config.KeyConfig.LoginKey, Config.KeyConfig.LoginIV);
            decryptData = JSON.parse(decryptData);
            var now = +new Date();
            var diff = Math.abs(now - decryptData.Time);
            var timeOut = 180 * 1000;

            //hardcode
            diff = 0;
            //hardcode


            if (diff < timeOut) {
                this.GetAccountInfo(decryptData.AccountID, function (RoleConfig) {
                    Socket.IsAdmin = RoleConfig.IsAdmin;
                    Socket.Permission = RoleConfig.Permission;
                    Socket.MenuConfig = RoleConfig.MenuConfig;
                    Socket.AccountID = decryptData.AccountID;
                    Socket.IsLoginCompleted = true;

                    this.ResponseSocket(Socket, {
                        ErrorCode: 0,
                        MenuConfig: RoleConfig.MenuConfig,
                        IsAdmin: RoleConfig.IsAdmin,
                        Permission: RoleConfig.Permission,
                        AccountID: decryptData.AccountID
                    });
                }.bind(this));
            }
        }
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.CheckLoginByToken - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetCCULog = function (Socket, DateFrom, DateTo) {
    try {
        this.SQLAdapter.getCCUDetail(function (e2, CCUDetail) {
            this.LogRecorder.GetCCULog(DateFrom, DateTo, function (e, r) {
                this.SQLAdapter.getCCUAllGame(function (e1, r1) {
                    var CCULog = [];
                    var CurrentCCU = r1[0].CCU;

                    CCUDetail = this.FilterCCUDetail(CCUDetail);

                    if (!e) {
                        for (var i = 0; i < r.length; i++) {
                            CCULog.push({
                                UpdateTime: FormatDateTime(r[i].UpdateTime),
                                CCU: r[i].CCU,
                                CCU_MAX: r[i].CCU_MAX,
                                CCU_MIN: r[i].CCU_MIN,
                                GameID: r[i].GameID
                            })
                        }
                    }

                    var DataResponse = {
                        CurrentCCU: CurrentCCU,
                        CCULog: CCULog,
                        CCUDetail: CCUDetail
                    };

                    this.ResponseSocket(Socket, DataResponse);
                }.bind(this));
            }.bind(this))
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetCCULog - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetGameNameConfig = function () {
    try {
        this.SQLAdapter.GetGameNameConfig(function (e, r) {
            if (!e) {
                this.GameNameConfig = [];
                for (var i = 0; i < r.length; i++) {
                    this.GameNameConfig.push({
                        GameName: r[i].GameName,
                        GameID: r[i].GameID
                    })
                }
            }
            else {
                this.GameNameConfig = [];
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetGameNameConfig - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetBroadcast = function (Socket) {
    try {
        this.SQLAdapter.GetBroadcast(function (e, r) {
            if (!e) {
                var Result = [];

                for (var i = 0; i < r.length; i++) {
                    Result.push({
                        ID: r[i].ID,
                        Text: r[i].Text,
                        URL: r[i].Url,
                        LangCode: r[i].LangCode,
                        Priority: r[i].Priority,
                        Interval: r[i].Interval,
                        StartTime: FormatDateTime(r[i].StartTime),
                        EndTime: FormatDateTime(r[i].EndTime)
                    })
                }

                var DataResponse = {
                    Result: Result
                };

                this.ResponseSocket(Socket, DataResponse);
            }
            else {
                this.Logger.Game().debug('this.SQLAdapter.GetBroadcast err: ' + e);
            }
        }.bind(this))
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetBroadcast - try err: ' + e.stack);
    }
};

AdminPage.prototype.UpdateBroadcast = function (Socket, Broadcast) {
    try {
        this.SQLAdapter.UpdateBroadcast(Broadcast, function (e, r) {

        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.UpdateBroadcast - try err: ' + e.stack);
    }
};

AdminPage.prototype.DeleteBroadcast = function (Socket, ID) {
    try {
        this.SQLAdapter.DeleteBroadcast(ID, function (e, r) {

        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.UpdateBroadcast - try err: ' + e.stack);
    }
};

AdminPage.prototype.AddBroadcast = function (Socket, Broadcast) {
    try {
        this.SQLAdapter.AddBroadcast(Broadcast, function (e, r) {

        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.AddBroadcast - try err: ' + e.stack);
    }
}

AdminPage.prototype.BuildData = function (packetId, data) {
    var ResponseObject = {
        packetId: packetId,
        data: data
    };

    return JSON.stringify(ResponseObject);
};

AdminPage.prototype.GetGameNameByGameID = function (GameID) {
    var GameName = GameID;
    for (var i = 0; i < this.GameNameConfig.length; i++) {
        if (this.GameNameConfig[i].GameID == GameID) {
            GameName = this.GameNameConfig[i].GameName;
            break;
        }
    }

    return GameName;
};

AdminPage.prototype.GetRoomNameByRoomKind = function (RoomKind) {

    var RoomConfig = [
        {
            RoomKind: 1,
            RoomName: 'BC Thường'
        },
        {
            RoomKind: 2,
            RoomName: 'BC VIP'
        },
        {
            RoomKind: 3,
            RoomName: 'BC Chơi Thử'
        },
        {
            RoomKind: 101,
            RoomName: 'TX'
        },
        {
            RoomKind: 301,
            RoomName: 'Poker'
        },
        {
            RoomKind: 401,
            RoomName: 'Slot'
        }
    ];

    var RoomName = RoomKind;

    for (var i = 0; i < RoomConfig.length; i++) {
        if (RoomKind == RoomConfig[i].RoomKind) {
            RoomName = RoomConfig[i].RoomName;
            break;
        }
    }

    return RoomName;
}

function FormatNumber(x) {
    var result = '';

    result = x.toLocaleString(undefined, {maximumFractionDigits: 2});
    return result;
}

function GetDateArray(DateFrom, DateTo) {
    try {
        var result = [];
        var OneDay = 24 * 60 * 60 * 1000; //ms

        var DateFrom_Stamp = new Date(DateFrom);
        var DateTo_Stamp = new Date(DateTo);

        if (DateFrom_Stamp > DateTo_Stamp) {
            this.Logger.Game().error('GameServer.prototype.getDateArray wrong format: ', DateFrom, DateTo);
        }
        else {
            var DayDiff = Math.floor((DateTo_Stamp - DateFrom_Stamp) / OneDay) + 1;
            var Day = new Date(DateFrom_Stamp);

            for (var i = 0; i < DayDiff; i++) {
                var now = Day;
                var yyyy = now.getFullYear();
                var mm = pad(now.getMonth() + 1, 2);
                var dd = pad(now.getDate(), 2);

                result.push(yyyy + '-' + mm + '-' + dd);
                Day.setTime(Day.getTime() + (24 * 60 * 60 * 1000));
            }
        }

        return result;
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.getDateArray - try err: ' + e.stack);
        return [];
    }
}

function FormatDate(ISODate) {
    try {
        var Result = "";
        var GDate = new Date(ISODate);

        var yyyy = GDate.getFullYear();
        var mm = pad(GDate.getMonth() + 1, 2);
        var dd = pad(GDate.getDate(), 2);

        Result = yyyy + '-' + mm + '-' + dd;
        return Result;
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.FormatDate - try err: ' + e.stack);

        return "";
    }
}

function FormatDateTime(ISODate) {
    try {
        var Result = "";
        var GDate = new Date(ISODate);

        var yyyy = GDate.getFullYear();
        var mm = pad(GDate.getMonth() + 1, 2);
        var dd = pad(GDate.getDate(), 2);
        var hour = pad(GDate.getHours(), 2);
        var min = pad(GDate.getMinutes(), 2);
        var sec = pad(GDate.getSeconds(), 2);

        Result = yyyy + '-' + mm + '-' + dd + ' ' + hour + ':' + min + ':' + sec;
        return Result;
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.FormatDate - try err: ' + e.stack);

        return "";
    }
}

function FormatTime(time) {
    var Result = "";
    var AM = "AM";

    var minute = pad(time % 60, 2);
    var hour = Math.floor(time / 60) % 24;

    if (hour > 12) {
        hour = hour - 12;
        AM = "PM";
    }

    hour = pad(hour, 2);

    Result = hour + ":" + minute + " " + AM;
    return Result;
}

function pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
}

function RenameKeyInObject(Obj, OldName, NewName) {
    var newObj = Obj;
    // Do nothing if the names are the same
    if (OldName == NewName) {
        return newObj;
    }
    // Check for the old property name to avoid a ReferenceError in strict mode.
    if (this.hasOwnProperty(OldName)) {
        newObj[NewName] = newObj[OldName];
        delete newObj[OldName];
    }

    return newObj;
}

AdminPage.prototype.GetTopWinLoseSummaryMultiDate = function (dateArray, DateTimeFrom, DateTimeTo, callback) {
    //Lấy thông tin cơ bản nhiều ngày xem GetTopWinLoseSummary

    var renderObj = [];
    for (var i = 0; i < dateArray.length; i++) {
        renderObj[i] = {
            state: 0,
            data: 0
        };
        this.GetTopWinLoseSummary(dateArray[i], i, DateTimeFrom, DateTimeTo, function (e, track, data) {
            renderObj[track].state = 1;
            if (e == 0) {
                renderObj[track].data = data;
            } else {
                //handle data miss
            }
        }.bind(this))
    }
    var timeOut = 60000;
    var delay = 1000;
    var checker = setInterval(function () {
        timeOut -= delay;
        var completed = 1;// Đã hoàn thành (giả sử)
        for (var i = 0; i < renderObj.length; i++) {
            if (renderObj[i].state == 0) {
                completed = 0; // ê tao chưa xong con bích.
            }
        }
        if (completed) {
            callback(0, renderObj);
            clearInterval(checker);
        } else {
            if (timeOut < 0) {
                callback(1, 'timeout');
                clearInterval(checker);
            }
        }

    }, delay);
};

AdminPage.prototype.GetTopWinLoseSummary = function (singleDate, trackid, DateTimeFrom, DateTimeTo, callback) {
    //Đi lấy các thông tin cơ bản, Số lượng TK thắng, SL TK Thua, Tổng tiền user thắng, tổng tiền user thua.
    var renderObj = {
        GetUserWinCount: {
            state: 0,
            data: 0
        },
        GetUserLoseCount: {
            state: 0,
            data: 0
        },
        GetUserWinSum: {
            state: 0,
            data: 0
        },
        GetUserLoseSum: {
            state: 0,
            data: 0
        }
    };
    this.LogRecorder.GetUserWinCount(singleDate, DateTimeFrom, DateTimeTo, function (e, d) {
        renderObj.GetUserWinCount.state = 1;
        if (!e) {
            renderObj.GetUserWinCount.data = d[0].Count;
            // console.log("GetUserWinCount", d);
        }
    }.bind(this));
    this.LogRecorder.GetUserLoseCount(singleDate, DateTimeFrom, DateTimeTo, function (e, d) {
        renderObj.GetUserLoseCount.state = 1;
        if (!e) {
            renderObj.GetUserLoseCount.data = d[0].Count;
            // console.log("GetUserLoseCount", d);
        }
    }.bind(this));
    this.LogRecorder.GetUserWinSum(singleDate, DateTimeFrom, DateTimeTo, function (e, d) {
        renderObj.GetUserWinSum.state = 1;
        if (!e) {
            //d[0].MoneyWin
            if (d[0].MoneyWin != null) {
                renderObj.GetUserWinSum.data = d[0].MoneyWin;
                // console.log("GetUserWinSum", d);
            }
        }
    }.bind(this));
    this.LogRecorder.GetUserLoseSum(singleDate, DateTimeFrom, DateTimeTo, function (e, d) {
        renderObj.GetUserLoseSum.state = 1;
        if (!e) {
            if (d[0].MoneyWin != null) {
                renderObj.GetUserLoseSum.data = d[0].MoneyWin;
                // console.log("GetUserLoseSum", d);
            }
        }
    }.bind(this));
    var timeOut = 60000;
    var delay = 1000;
    var checker = setInterval(function () {
        timeOut -= delay;
        var completed = 1;// Đã hoàn thành (giả sử)
        for (var key in renderObj) {
            if (renderObj[key].state == 0) {
                completed = 0; // ê tao chưa xong con bích.
            }
        }
        if (completed) {
            callback(0, trackid, renderObj);
            clearInterval(checker);
        } else {
            if (timeOut < 0) {
                callback(1, trackid, 'timeout');
                clearInterval(checker);
            }
        }

    }, delay);
};

AdminPage.prototype.GetMoneyStatusMultiDate = function (DateArr, TimeFrom, TimeTo, callback) {
    try {
        var renderObj = [];

        for (var i = 0; i < DateArr.length; i++) {
            renderObj[i] = {
                state: 0,
                data: 0
            };
            this.GetMoneyStatusByDate(DateArr[i], i, TimeFrom, TimeTo, function (e, track, data) {
                renderObj[track].state = 1;
                if (e == 0) {
                    renderObj[track].data = data;
                } else {
                    //handle data miss
                }
            }.bind(this))
        }

        var timeOut = 60000;
        var delay = 1000;
        var checker = setInterval(function () {
            timeOut -= delay;
            var completed = 1;// Đã hoàn thành (giả sử)
            for (var i = 0; i < renderObj.length; i++) {
                if (renderObj[i].state == 0) {
                    completed = 0; // ê tao chưa xong con bích.
                }
            }
            if (completed) {
                callback(0, renderObj);
                clearInterval(checker);
            } else {
                if (timeOut < 0) {
                    callback(1, 'timeout');
                    clearInterval(checker);
                }
            }

        }, delay);
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetGameStatusWithCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetMoneyStatusByDate = function (singleDate, trackid, TimeFrom, TimeTo, callback) {

    var renderObj = {
        MoneyWin: {
            state: 0,
            data: []
        },
        MoneyLose: {
            state: 0,
            data: []
        },
        TotalDailyAward: {
            state: 0,
            data: []
        },
        TotalOnlineAward: {
            state: 0,
            data: []
        },
        SummaryBCInfo: {
            state: 0,
            data: []
        },
        SummaryTXInfo: {
            state: 0,
            data: []
        },
        SummarySlotInfo: {
            state: 0,
            data: []
        },
        SummaryBaccaratInfo: {
            state: 0,
            data: []
        },
        SummaryXocDiaInfo: {
            state: 0,
            data: []
        },
        SummaryVQMMInfo: {
            state: 0,
            data: []
        },
        SummaryTXMiniInfo: {
            state: 0,
            data: []
        },
        SummaryBingoInfo: {
            state: 0,
            data: []
        },
        SummaryTransfer: {
            state: 0,
            data: []
        },
        SummaryMiniPokerInfo: {
            state: 0,
            data: []
        }
    };


    this.LogRecorder.GetMoneyWinByDate(singleDate, TimeFrom, TimeTo, function (e, d) {
        renderObj.MoneyWin.state = 1;
        if (!e) {
            renderObj.MoneyWin.data = d;
        }
    }.bind(this));

    this.LogRecorder.GetMoneyLoseByDate(singleDate, TimeFrom, TimeTo, function (e, d) {
        renderObj.MoneyLose.state = 1;
        if (!e) {
            renderObj.MoneyLose.data = d;
            // console.log("GetUserWinCount", d);
        }
    }.bind(this));

    this.LogRecorder.GetTotalDailyAwardByDate(singleDate, TimeFrom, TimeTo, function (e, d) {
        renderObj.TotalDailyAward.state = 1;
        if (!e) {
            if (d.length > 0) {
                renderObj.TotalDailyAward.data = d;//[0].TotalDailyAward;
                // console.log("GetUserWinCount", d);
            }
        }
    }.bind(this));

    this.LogRecorder.GetTotalOnlineAwardByDate(singleDate, TimeFrom, TimeTo, function (e, d) {
        renderObj.TotalOnlineAward.state = 1;
        if (!e) {
            if (d.length > 0) {
                renderObj.TotalOnlineAward.data = d;//[0].TotalOnlineAward;
            }
        }
    }.bind(this));

    if(this.IsGameOnline(this.GameListConfig.Fish.GameID)){
        this.LogRecorder.GetSummaryBCInfo(singleDate, TimeFrom, TimeTo, function (e, d) {
            renderObj.SummaryBCInfo.state = 1;
            if (!e) {
                //console.log("GetSummaryBCInfo", d);
                if (d.length == 0) {
                    renderObj.SummaryBCInfo.data = [];
                }
                else {
                    renderObj.SummaryBCInfo.data = d;
                }
                //if (d[0].SummaryBCInfo != null) {
                //    renderObj.SummaryBCInfo.data = d;
                //}
            }
        });
    }else{
        renderObj.SummaryBCInfo.state = 1;
    }

    if(this.IsGameOnline(this.GameListConfig.TaiXiu.GameID)){
        this.LogRecorder.GetSummaryTXInfo(singleDate, TimeFrom, TimeTo, function (e, d) {
            renderObj.SummaryTXInfo.state = 1;
            if (!e) {
                if (d.length == 0) {
                    renderObj.SummaryTXInfo.data = [];
                }
                else {
                    for (var i = 0; i < d.length; i++) {

                        for (var prop in d[i]) {
                            if (Utility.CheckVariable(d[i][prop])) {

                            }
                            else {
                                d[i][prop] = 0;
                            }
                        }

                        renderObj.SummaryTXInfo.data.push(d[i]);
                    }
                }
            }
        });
    }else{
        renderObj.SummaryTXInfo.state = 1;
    }

    if(this.IsGameOnline(this.GameListConfig.SlotTuLongThan.GameID)){
        this.LogRecorder.GetSummarySlotInfo(singleDate, TimeFrom, TimeTo, function (e, d) {
            renderObj.SummarySlotInfo.state = 1;
            if (!e) {
                if (d.length == 0) {
                    renderObj.SummarySlotInfo.data = [];
                }
                else {

                    for (var i = 0; i < d.length; i++) {

                        for (var prop in d[i]) {
                            if (Utility.CheckVariable(d[i][prop])) {

                            }
                            else {
                                d[i][prop] = 0;
                            }
                        }

                        renderObj.SummarySlotInfo.data.push(d[i]);
                    }
                }
            }
        });
    }else{
        renderObj.SummarySlotInfo.state = 1;
    }

    if(this.IsGameOnline(this.GameListConfig.Baccarat.GameID)){
        this.LogRecorder.GetSummaryBaccaratInfo(singleDate, TimeFrom, TimeTo, function (e, d) {
            renderObj.SummaryBaccaratInfo.state = 1;
            if (!e) {
                if (d.length == 0) {
                    renderObj.SummaryBaccaratInfo.data = [];
                }
                else {
                    for (var i = 0; i < d.length; i++) {

                        for (var prop in d[i]) {
                            if (Utility.CheckVariable(d[i][prop])) {

                            }
                            else {
                                d[i][prop] = 0;
                            }
                        }

                        renderObj.SummaryBaccaratInfo.data.push(d[i]);
                    }
                }
            }
        });

    }else{
        renderObj.SummaryBaccaratInfo.state = 1;
    }

    if(this.IsGameOnline(this.GameListConfig.XocDia.GameID)){
        this.LogRecorder.GetSummaryXocDiaInfo(singleDate, TimeFrom, TimeTo, function (e, d) {
            renderObj.SummaryXocDiaInfo.state = 1;
            if (!e) {
                if (d.length == 0) {
                    renderObj.SummaryXocDiaInfo.data = [];
                }
                else {
                    for (var i = 0; i < d.length; i++) {

                        for (var prop in d[i]) {
                            if (Utility.CheckVariable(d[i][prop])) {

                            }
                            else {
                                d[i][prop] = 0;
                            }
                        }

                        renderObj.SummaryXocDiaInfo.data.push(d[i]);
                    }
                }
            }
        });
    }else{
        renderObj.SummaryXocDiaInfo.state = 1;
    }

    if(this.IsGameOnline(this.GameListConfig.VQMM.GameID)){
        this.LogRecorder.GetSummaryVQMMInfo(singleDate, TimeFrom, TimeTo, function (e, d) {
            renderObj.SummaryVQMMInfo.state = 1;
            if (!e) {
                if (d.length == 0) {
                    renderObj.SummaryVQMMInfo.data = [];
                }
                else {
                    for (var i = 0; i < d.length; i++) {

                        for (var prop in d[i]) {
                            if (Utility.CheckVariable(d[i][prop])) {

                            }
                            else {
                                d[i][prop] = 0;
                            }
                        }

                        renderObj.SummaryVQMMInfo.data.push(d[i]);
                    }
                }
            }
        });
    }else{
        renderObj.SummaryVQMMInfo.state = 1;
    }

    if(this.IsGameOnline(this.GameListConfig.TaiXiuMini.GameID)){
        this.LogRecorder.GetSummaryTXMiniInfo(singleDate, TimeFrom, TimeTo, function (e, d) {
            renderObj.SummaryTXMiniInfo.state = 1;
            if (!e) {
                if (d.length == 0) {
                    renderObj.SummaryTXMiniInfo.data = [];
                }
                else {
                    for (var i = 0; i < d.length; i++) {

                        for (var prop in d[i]) {
                            if (Utility.CheckVariable(d[i][prop])) {

                            }
                            else {
                                d[i][prop] = 0;
                            }
                        }

                        renderObj.SummaryTXMiniInfo.data.push(d[i]);
                    }
                }
            }
        });
    }else{
        renderObj.SummaryTXMiniInfo.state = 1;
    }

    if(this.IsGameOnline(this.GameListConfig.Bingo.GameID)){
        this.LogRecorder.GetSummaryBingoInfo(singleDate, TimeFrom, TimeTo, function (e, d) {
            renderObj.SummaryBingoInfo.state = 1;
            if (!e) {
                if (d.length == 0) {
                    renderObj.SummaryBingoInfo.data = [];
                }
                else {
                    for (var i = 0; i < d.length; i++) {

                        for (var prop in d[i]) {
                            if (Utility.CheckVariable(d[i][prop])) {

                            }
                            else {
                                d[i][prop] = 0;
                            }
                        }

                        renderObj.SummaryBingoInfo.data.push(d[i]);
                    }
                }
            }
        });
    }else{
        renderObj.SummaryBingoInfo.state = 1;
    }


    this.LogRecorder.GetMoneyTransferSummryByDate(singleDate, TimeFrom, TimeTo, function (e, d) {
        renderObj.SummaryTransfer.state = 1;
        if (!e) {
            if (d.length == 0) {
                renderObj.SummaryTransfer.data = [];
            }
            else {
                for (var i = 0; i < d.length; i++) {

                    for (var prop in d[i]) {
                        if (Utility.CheckVariable(d[i][prop])) {

                        }
                        else {
                            d[i][prop] = 0;
                        }
                    }

                    renderObj.SummaryTransfer.data.push(d[i]);
                }
            }
        }
    });
    if(this.IsGameOnline(this.GameListConfig.PokerMini.GameID)){
        this.LogRecorder.GetSummaryMiniPokerInfo(singleDate, TimeFrom, TimeTo, function (e, d) {
            renderObj.SummaryMiniPokerInfo.state = 1;
            if (!e) {
                if (d.length == 0) {
                    renderObj.SummaryMiniPokerInfo.data = [];
                }
                else {
                    for (var i = 0; i < d.length; i++) {

                        for (var prop in d[i]) {
                            if (Utility.CheckVariable(d[i][prop])) {

                            }
                            else {
                                d[i][prop] = 0;
                            }
                        }

                        renderObj.SummaryMiniPokerInfo.data.push(d[i]);
                    }
                }
            }
        });
    }else{
        renderObj.SummaryMiniPokerInfo.state = 1;
    }


    var timeOut = 60000;
    var delay = 1000;
    var checker = setInterval(function () {
        timeOut -= delay;
        var completed = 1;// Đã hoàn thành (giả sử)
        for (var key in renderObj) {
            if (renderObj[key].state == 0) {
                completed = 0; // ê tao chưa xong con bích.
            }
        }
        if (completed) {
            callback(0, trackid, renderObj);
            clearInterval(checker);
        } else {
            if (timeOut < 0) {
                callback(1, trackid, 'timeout');
                clearInterval(checker);
            }
        }
    }, delay);
};

AdminPage.prototype.IsGameOnline = function (GameID) {
    for(var i = 0 ; i < this.GameNameConfig.length;i++){

        if(this.GameNameConfig[i].GameID == GameID){
            return 1;
        }
    }
    return 0;
};

AdminPage.prototype.GetLogGoldUser_Redis = function (Socket, UserID, date) {
    try {
        //yyyy:mm:dd:userid

        var GDate = new Date(date);
        var yyyy = GDate.getFullYear();
        var mm = pad(GDate.getMonth() + 1, 2);
        var dd = pad(GDate.getDate(), 2);

        var path = yyyy + ":" + mm + ":" + dd + ":" + UserID;
        var key = this.RedisConfig.Define.LogGold + path;

        this.RedisAdapter.hgetall(key, function (e, d) {
            if (!e) {
                var Result = [];
                for (var property in d) {
                    //serverid,deskid,gold,lv,exp
                    var valueArray = d[property].split(',');
                    Result.push({
                        Time: property,
                        ServerID: parseInt(valueArray[0]),
                        DeskID: parseInt(valueArray[1]),
                        Gold: parseInt(valueArray[2]),
                        Level: parseInt(valueArray[3]),
                        Exp: parseInt(valueArray[4])
                    })
                }

                Result = Result.sort(function (a, b) {
                    var GDate_a = new Date("2018-01-01 " + a.Time);
                    var GDate_b = new Date("2018-01-01 " + b.Time);

                    return GDate_a - GDate_b;
                }.bind(this));

                var DataResponse = {
                    Result: Result
                };

                this.ResponseSocket(Socket, DataResponse);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetLogGoldRedis - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetStock = function (Socket) {
    try {
        var key = this.RedisConfig.Define.StockRatioConfig;

        var RoomConfig = [
            {
                RoomKind: 1,
                RoomName: 'BC Thường'
            },
            {
                RoomKind: 2,
                RoomName: 'BC VIP'
            },
            {
                RoomKind: 3,
                RoomName: 'BC Chơi Thử'
            },
            {
                RoomKind: 11,
                RoomName: 'BC3D Thường'
            },
            {
                RoomKind: 12,
                RoomName: 'BC3D VIP'
            },
            {
                RoomKind: 13,
                RoomName: 'BC3D Chơi Thử'
            },
            {
                RoomKind: 101,
                RoomName: 'TX'
            },
            {
                RoomKind: 301,
                RoomName: 'Poker'
            },
            {
                RoomKind: 401,
                RoomName: 'Slot Tứ Long'
            },
            {
                RoomKind: 402,
                RoomName: 'Slot Hoa Quả'
            },
            {
                RoomKind: 403,
                RoomName: 'Slot Hawaii'
            },
            {
                RoomKind: 100001,
                RoomName: 'VQMM'
            },
            {
                RoomKind: 101001,
                RoomName: 'TX Mini'
            },
            {
                RoomKind: 102001,
                RoomName: 'Bingo'
            },
            {
                RoomKind: 901,
                RoomName: 'Bắn chim thường'
            }
        ];

        this.RedisAdapter.hgetall(key, function (e, d) {
            if (!e) {
                var Result = [];
                for (var property in d) {
                    var value = d[property];
                    Result.push({
                        Key: property,
                        Value: value
                    })
                }

                var DataResponse = {
                    Result: Result,
                    RoomConfig: RoomConfig
                };

                this.ResponseSocket(Socket, DataResponse);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetStock - try err: ' + e.stack);
    }
};

AdminPage.prototype.UpdateStock = function (Socket, Key, Value) {
    try {
        var key = this.RedisConfig.Define.StockRatioConfig;
        var hkey = Key;

        this.RedisAdapter.hset(key, hkey, Value);
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.UpdateStock - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetEventList = function (Socket) {
    try {
        this.SQLAdapter.GetEventList(function (e, r) {
            if (!e) {
                var Result = [];
                for (var i = 0; i < r.length; i++) {
                    var EventName = JSON.parse(r[i].EventName).userMsg;
                    var EventName_En = JSON.parse(r[i].EventName).userMsgEn;

                    Result.push({
                        EventCode: r[i].EventCode,
                        StartTime: r[i].StartTime,
                        EndTime: r[i].EndTime,
                        StartDisplayTime: r[i].StartDisplayTime,
                        EndDisplayTime: r[i].EndDisplayTime,
                        EventName: EventName,
                        EventName_En: EventName_En,
                        IsMaster: r[i].IsMaster,
                        DataKey: r[i].DataKey != "",
                        Config: r[i].Config
                    });
                }

                var DataResponse = {
                    Result: Result
                };

                this.ResponseSocket(Socket, DataResponse);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetEventList - try err: ' + e.stack);
    }
};

AdminPage.prototype.UpdateEvent = function (Socket, Data) {
    try {
        this.SQLAdapter.UpdateEvent(Data, function (e, r) {

        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.UpdateEvent - try err: ' + e.stack);
    }
};

AdminPage.prototype.ShowEventData = function (Socket, EventCode, Top) {
    try {
        this.SQLAdapter.GetEventDataKey(EventCode, function (e, r) {
            if (!e) {
                if (r.length == 0) {
                    return;
                }

                var DataKey = r[0].DataKey;
                var From = 0;
                var To = Top - 1;

                this.RedisAdapter.zrevrange(DataKey, From, To, 1, function (e, d) {
                    if (!e) {
                        var top = [];
                        var uid = 0;
                        var ListUserID = [];
                        for (var i = 0; i < d.length; i++) {
                            if (i % 2 == 0) {
                                uid = d[i];
                                ListUserID.push(uid);
                            } else {
                                top.push({
                                    UserID: uid,
                                    GameName: '' + uid,
                                    Score: d[i]
                                });
                            }
                        }

                        if (ListUserID.length == 0) {
                            var DataResponse = {
                                Result: []
                            };

                            this.ResponseSocket(Socket, DataResponse);
                        }
                        else {
                            this.SQLAdapter.GetNameByRange(ListUserID, function (e1, r1) {
                                if (!e1) {
                                    for (var i = 0; i < r1.length; i++) {
                                        for (var j = 0; j < top.length; j++) {
                                            if (top[j].UserID == r1[i].UserID) {
                                                top[j].GameName = r1[i].GameName;
                                                top[j].AccountID = r1[i].AccountID;
                                                break;
                                            }
                                        }
                                    }

                                    var DataResponse = {
                                        Result: top
                                    };

                                    this.ResponseSocket(Socket, DataResponse);
                                }
                            }.bind(this))
                        }
                    }
                }.bind(this));
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.ShowEventData - try err: ' + e.stack);
    }
};

AdminPage.prototype.DeleteEventData = function (Socket, EventCode) {
    try {
        this.SQLAdapter.GetEventDataKey(EventCode, function (e, r) {
            if (!e) {
                if (r.length == 0) {
                    return;
                }

                var DataKey = r[0].DataKey;
                this.RedisAdapter.del(DataKey, function (e, r) {
                }.bind(this))
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.ClearEventData - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetUserList = function (Socket, RequestInfo, OptionID) {
    try {
        // 0: UserID, 1: Nick
        var UserID = 0;
        var Nick = ' ';

        if (OptionID == 1) {
            Nick = RequestInfo;
        }
        else {
            UserID = RequestInfo;
        }

        this.SQLAdapter.GetUserList(UserID, Nick, function (e, UserArray) {
            if (!e) {
                if (UserArray.length == 0) {
                    return;
                }

                this.SQLAdapter.GetMoneyForUser(UserArray, function (e1, UserWithMoney) {
                    if (!e1) {
                        for (var i = 0; i < UserArray.length; i++) {
                            UserArray[i].Money = UserWithMoney[i].Money;
                        }

                        var DataResponse = {
                            Result: UserArray
                        };

                        this.ResponseSocket(Socket, DataResponse);
                    }
                }.bind(this));

            }
        }.bind(this))

    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetUserList - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetUserInfo = function (Socket, UserID) {
    try {
        this.SQLAdapter.GetUserCharge(UserID, function (e, UserCharge) {
            if (!e) {
                this.SQLAdapter.GetUserWin(UserID, function (e1, UserWin) {
                    if (!e1) {
                        this.SQLAdapter.GetUserOnline(UserID, function (e2, UserOnline) {
                            if (!e2) {
                                var UserWinInfo = [];
                                var UserOnlineInfo = [];
                                for (var i = 0; i < UserWin.length; i++) {
                                    var PushInfo = {
                                        Money: UserWin[i].SumMoney,
                                        GameID: UserWin[i].GameID,
                                        GameName: ''
                                    };

                                    for (var j = 0; j < this.GameNameConfig.length; j++) {
                                        if (this.GameNameConfig[j].GameID == PushInfo.GameID) {
                                            PushInfo.GameName = this.GameNameConfig[j].GameName;
                                            break;
                                        }
                                    }

                                    UserWinInfo.push(PushInfo);
                                }

                                for (var i = 0; i < this.GameNameConfig.length; i++) {
                                    if (this.GameNameConfig[i].GameID == 0) {
                                        continue;
                                    }

                                    var found = 0;
                                    for (var j = 0; j < UserWinInfo.length; j++) {
                                        if (UserWinInfo[j].GameID == this.GameNameConfig[i].GameID) {
                                            found = 1;
                                        }
                                    }

                                    if (!found) {
                                        UserWinInfo.push({
                                            Money: 0,
                                            GameID: this.GameNameConfig[i].GameID,
                                            GameName: this.GameNameConfig[i].GameName
                                        })
                                    }
                                }

                                for (var i = 0; i < UserOnline.length; i++) {
                                    var GameName = "";
                                    if (UserOnline[i].GameID == 0) {
                                        GameName = "Sảnh";
                                    }
                                    else {
                                        for (var j = 0; j < this.GameNameConfig.length; j++) {
                                            if (this.GameNameConfig[j].GameID == UserOnline[i].GameID) {
                                                GameName = this.GameNameConfig[j].GameName;
                                                break;
                                            }
                                        }
                                    }

                                    UserOnlineInfo.push({
                                        GameID: UserOnline[i].GameID,
                                        ServerID: UserOnline[i].ServerID,
                                        UpdateTime: UserOnline[i].UpdateTime,
                                        GameName: GameName
                                    })
                                }

                                var UserChargeInfo = {
                                    Money: -1,
                                    CreateDate: new Date(),
                                    UpdateDate: new Date()
                                };

                                if (UserCharge.length > 0) {
                                    UserChargeInfo.Money = UserCharge[0].Money;
                                    UserChargeInfo.CreateDate = UserCharge[0].CreateDate;
                                    UserChargeInfo.UpdateDate = UserCharge[0].UpdateDate;
                                }

                                var DataResponse = {
                                    UserChargeInfo: UserChargeInfo,
                                    UserWinInfo: UserWinInfo,
                                    UserOnlineInfo: UserOnlineInfo,
                                };

                                this.ResponseSocket(Socket, DataResponse);
                            }
                        }.bind(this));
                    }
                }.bind(this))
            }
        }.bind(this))
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetUserInfo - try err: ' + e.stack);
    }
};

AdminPage.prototype.HandleGMTool = function (channel, message) {
    switch (channel) {
        case this.GMToolConfig.Channel.GameGM: {
            try {
                var Object = JSON.parse(message);
                //this.GMToolExecute(Object.CMD, Object.SID, Object.Data);
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

AdminPage.prototype.KickUserAllGame = function (userID, msg) {
    this.GMToolAdapter.SendGameCommand({
        CMD: this.GMToolConfig.CMD.UserKickByUserID,
        SID: 0,
        Data: {
            UserID: userID,
            Msg: msg
        }
    });
};

AdminPage.prototype.KickUserAllMaster = function (userID, msg) {
    this.GMToolAdapter.SendBroadCastMasterCommand({
        CMD: this.GMToolConfig.CMD.UserKickByUserID,
        SID: 0,
        Data: {
            UserID: userID,
            Msg: msg
        }
    });
};

AdminPage.prototype.KickUser = function (Socket, UserID) {
    try {
        var message = "Bạn đã bị ngắt kết nối từ hệ thống!";
        this.KickUserAllMaster(UserID, message);
        this.KickUserAllGame(UserID, message);
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.KickUser - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetLogUserKillBoss = function (Socket, DateTimeFrom, DateTimeTo, UserID, Nick) {
    try {
        var temp = DateTimeFrom.split(" ");
        var DateFrom = temp[0];

        temp = DateTimeTo.split(" ");
        var DateTo = temp[0];

        var DateArr = GetDateArray(DateFrom, DateTo);
        var Result = [];

        var SQLQueryFunc = this.SQLAdapter.GetUserIDByNick;
        var QueryParam = Nick;

        if (UserID.length != 0) {
            SQLQueryFunc = this.SQLAdapter.GetNickByUserID;
            QueryParam = UserID;
        }

        SQLQueryFunc(QueryParam, function (e, r) {
            var UserID_Nick_Array = r;
            //console.log("UserID_Nick_Array", UserID_Nick_Array);

            this.GetLogUserHitBossMultiDate(DateArr, DateTimeFrom, DateTimeTo, UserID_Nick_Array, function (e, r) {
                //Get UserID List
                var UserIDList = [];

                for (var i = 0; i < DateArr.length; i++) {
                    Result = Result.concat(r[i].data.LogUserHitBoss.data);
                }

                //Add GameName
                for (var i = 0; i < Result.length; i++) {
                    var GameName = this.GetRoomNameByRoomKind(Result[i].KindID);

                    Result[i].GameName = GameName;

                    var FindUserID = UserIDList.find(function (UserID) {
                        return UserID == Result[i].UserID;
                    });

                    if (typeof FindUserID == 'undefined') {
                        UserIDList.push(Result[i].UserID);
                    }
                }

                this.SQLAdapter.GetGameNameByUserIDArray(UserIDList, function (e, r) {
                    for (var i = 0; i < Result.length; i++) {
                        var Nick = '';

                        for (var j = 0; j < r.length; j++) {
                            if (r[j].UserID == Result[i].UserID) {
                                Nick = r[j].GameName;
                                break;
                            }
                        }

                        Result[i].Nick = Nick;
                    }

                    var DataResponse = {
                        Result: Result
                    };

                    this.ResponseSocket(Socket, DataResponse);
                }.bind(this));
            }.bind(this))
        }.bind(this));
    }
    catch (e) {
        this.ResponseSocket(Socket, {Result: []});
        this.Logger.Game().error('GameServer.prototype.GetLogUserHitBoss - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetLogUserHitBossMultiDate = function (dateArray, datetimefrom, datetimeto, UserID_Nick_Array, callback) {
    //Lấy thông tin cơ bản nhiều ngày xem GetTopWinLoseSummary

    var renderObj = [];
    for (var i = 0; i < dateArray.length; i++) {
        renderObj[i] = {
            state: 0,
            data: 0
        };
        this.GetLogUserHitBossByDate(dateArray[i], i, datetimefrom, datetimeto, UserID_Nick_Array, function (e, track, data) {
            renderObj[track].state = 1;
            if (e == 0) {
                renderObj[track].data = data;
            } else {
                //handle data miss
            }
        }.bind(this))
    }
    var timeOut = 60000;
    var delay = 1000;
    var checker = setInterval(function () {
        timeOut -= delay;
        var completed = 1;// Đã hoàn thành (giả sử)
        for (var i = 0; i < renderObj.length; i++) {
            if (renderObj[i].state == 0) {
                completed = 0; // ê tao chưa xong con bích.
            }
        }
        if (completed) {
            callback(0, renderObj);
            clearInterval(checker);
        } else {
            if (timeOut < 0) {
                callback(1, 'timeout');
                clearInterval(checker);
            }
        }

    }, delay);
};

AdminPage.prototype.GetLogUserHitBossByDate = function (singleDate, trackid, datetimefrom, datetimeto, UserID_Nick_Array, callback) {
    var renderObj = {
        LogUserHitBoss: {
            state: 0,
            data: [],
        }
    };

    this.LogRecorder.GetLogUserHitBoss(singleDate, datetimefrom, datetimeto, UserID_Nick_Array, function (e, d) {
        renderObj.LogUserHitBoss.state = 1;
        if (!e) {
            renderObj.LogUserHitBoss.data = d;
        }
    }.bind(this));

    var timeOut = 60000;
    var delay = 1000;
    var checker = setInterval(function () {
        timeOut -= delay;
        var completed = 1;// Đã hoàn thành (giả sử)
        for (var key in renderObj) {
            if (renderObj[key].state == 0) {
                completed = 0; // ê tao chưa xong con bích.
            }
        }
        if (completed) {
            callback(0, trackid, renderObj);
            clearInterval(checker);
        } else {
            if (timeOut < 0) {
                callback(1, trackid, 'timeout');
                clearInterval(checker);
            }
        }
    }, delay);
};

AdminPage.prototype.Slot_GetInfo = function (Socket, date) {
    try {
        this.LogRecorder.Slot_GetBetAndWinSummary(date, function (e, Summary) {
            var SlotGameID = 4;
            this.LogRecorder.GetSumMoneyChange(date, SlotGameID, function (e2, SumMoneyChange) {
                if (!e2) {
                    this.LogRecorder.Slot_GetJackpotWin(date, function (e1, JackpotWin) {
                        this.Slot_GetJackpotsValue(function (JackpotValueArray) {
                            this.Slot_GetJackpotsConfig(function (JackpotConfigArray) {
                                this.Slot_GetJackpotsSave(function (JackpotSaveArray) {
                                    if (!e1) {
                                        var DiffMoney = 0;

                                        if (SumMoneyChange[0].MoneyChange > 0) {
                                            DiffMoney = SumMoneyChange[0].MoneyChange;
                                        }

                                        var SlotNameArr = [
                                            {
                                                KindID: 401,
                                                Name: "Slot Tứ Long"
                                            },
                                            {
                                                KindID: 402,
                                                Name: "Slot Hoa Quả"
                                            }
                                        ];

                                        var JackpotRatio = {
                                            Jackpot: 0.01,
                                            PiggyBank: 0.01
                                        };

                                        for (var i = 0; i < JackpotValueArray.length; i++) {
                                            var KindID = JackpotValueArray[i].Key.split(':')[1];
                                            var Key = JackpotValueArray[i].Key.split(':')[2];

                                            JackpotValueArray[i].Key = parseInt(Key);
                                            JackpotValueArray[i].KindID = parseInt(KindID);

                                            var DefaultValue = 0;

                                            for (var j = 0; j < JackpotConfigArray.length; j++) {
                                                var ConfigKey = parseInt(JackpotConfigArray[j].Key.split(':')[1]);
                                                if (JackpotValueArray[i].KindID == ConfigKey) {
                                                    var Value = JSON.parse(JackpotConfigArray[j].Value);

                                                    for (var k = 0; k < Value.length; k++) {
                                                        if (JackpotValueArray[i].Key == Value[k].ID) {
                                                            DefaultValue = Value[k].Default;

                                                            break;
                                                        }
                                                    }

                                                    break;
                                                }
                                            }

                                            JackpotValueArray[i].DefaultValue = parseInt(DefaultValue);

                                            //JackpotSaveArray
                                            var JackpotSave = 0;

                                            for (var j = 0; j < JackpotSaveArray.length; j++) {
                                                var t_KindID = parseInt(JackpotSaveArray[j].Key.split(":")[1]);
                                                var t_Key = parseInt(JackpotSaveArray[j].Key.split(":")[2]);

                                                if (t_KindID == JackpotValueArray[i].KindID && t_Key == JackpotValueArray[i].Key) {
                                                    JackpotSave = parseInt(JackpotSaveArray[j].Value);
                                                    break;
                                                }
                                            }

                                            JackpotValueArray[i].JackpotSave = JackpotSave;
                                        }

                                        JackpotValueArray.sort(function (a, b) {
                                            return a.Key - b.Key;
                                        });

                                        var DataResponse = {
                                            Summary: Summary,
                                            JackpotWin: JackpotWin,
                                            JackpotValueArray: JackpotValueArray,
                                            JackpotRatio: JackpotRatio,
                                            DiffMoney: DiffMoney,
                                            SlotNameArr: SlotNameArr
                                        };

                                        this.ResponseSocket(Socket, DataResponse);
                                    }
                                }.bind(this))
                            }.bind(this));
                        }.bind(this));
                    }.bind(this));
                }
            }.bind(this))
        }.bind(this))
    }
    catch (e) {
        var DataResponse = {
            Summary: [],
            JackpotWin: [],
            JackpotValueArray: [],
            JackpotRatio: {},
            DiffMoney: 0
        };
        this.ResponseSocket(Socket, DataResponse);

        this.Logger.Game().error('GameServer.prototype.Slot_GetInfo - try err: ' + e.stack);
    }
};

AdminPage.prototype.Slot_GetJackpotsValue = function (callback) {
    try {
        var key = "SLOTJP:*";
        this.RedisAdapter.keys(key, function (e, KeyArray) {
            if (!e) {
                if (KeyArray.length == 0) {
                    return [];
                }

                this.RedisAdapter.mget(KeyArray, function (e1, ValueArray) {
                    if (!e1) {
                        var Result = [];

                        for (var i = 0; i < KeyArray.length; i++) {
                            Result.push({
                                Key: KeyArray[i],
                                Value: ValueArray[i]
                            })
                        }

                        callback(Result);
                    }
                    else {
                        callback([]);
                    }
                }.bind(this))
            }
            else {
                callback([]);
            }
        }.bind(this))
    }
    catch (e) {
        callback([]);
        this.Logger.Game().error('GameServer.prototype.GetJackpotsValue - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetAccountInfo = function (AccountID, callback) {
    var RoleConfig = {
        IsAdmin: 0,
        MenuConfig: [],
        Permission: []
    };

    try {
        this.SQLAdapter.GetAccountInfo(AccountID, function (e, r) {
            if (!e) {
                if (r.length == 0) {
                    var DefaultPermission = [2, 19, 5, 25, 3, 4, 7, 8, 28, 29];
                    var IsAdmin = 0;
                    RoleConfig.IsAdmin = IsAdmin;
                    RoleConfig.MenuConfig = DefaultPermission;
                    var Permission = this.GetPermissionFromRoleConfig(RoleConfig);
                    RoleConfig.Permission = Permission;

                    this.SQLAdapter.CreateAdminAccount(AccountID, JSON.stringify(RoleConfig));
                    callback(RoleConfig);
                }
                else {
                    RoleConfig = JSON.parse(r[0].RoleConfig);

                    var Permission = this.GetPermissionFromRoleConfig(RoleConfig);

                    RoleConfig.Permission = Permission;

                    callback(RoleConfig);
                }
            }
            else {
                callback(RoleConfig);
            }
        }.bind(this))
    }
    catch (e) {
        callback(RoleConfig);
        this.Logger.Game().error('GameServer.prototype.GetAccountInfo - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetPermissionFromRoleConfig = function (RoleConfig) {
    try {
        var Permission = [];

        for (var i = 0; i < RoleConfig.MenuConfig.length; i++) {
            var MenuComponent = RoleConfig.MenuConfig[i];

            if (typeof MenuComponent == 'number') {
                Permission.push(MenuComponent);
            }
            else if (typeof MenuComponent == 'object') {
                for (var element in MenuComponent) {
                    //console.log("element", MenuComponent[element]);
                    Permission = Permission.concat(MenuComponent[element]);
                }
            }
        }

        return Permission;
    }
    catch (e) {
        return [];
        this.Logger.Game().error('GameServer.prototype.GetPermissionFromRoleConfig - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetAdminList = function (Socket, AccountID) {
    var Result = [];

    if (!Socket.IsAdmin) {
        return;
    }

    try {
        this.SQLAdapter.GetAdminList(AccountID, function (e, r) {
            if (!e) {
                for (var i = 0; i < r.length; i++) {
                    var RoleConfig = JSON.parse(r[i].RoleConfig)
                    var IsAdmin = RoleConfig.IsAdmin;
                    var MenuConfig = RoleConfig.MenuConfig;
                    var Permission = this.GetPermissionFromRoleConfig(RoleConfig);

                    Result.push({
                        AccountID: r[i].AccountID,
                        RoleConfig: r[i].RoleConfig,
                        Permission: Permission,
                        IsAdmin: IsAdmin
                    });
                }

                var DataResponse = {
                    Result: Result
                };

                this.ResponseSocket(Socket, DataResponse);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetAdminList - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetAdminInfo = function (Socket, AccountID) {
    try {
        this.SQLAdapter.GetAccountInfo(AccountID, function (e, r) {
            //console.log("GetAccountInfo", e, r);
            if (!e) {
                var RoleConfig = JSON.parse(r[0].RoleConfig);
                var IsAdmin = RoleConfig.IsAdmin;
                var MenuConfig = RoleConfig.MenuConfig;
                var Permission = this.GetPermissionFromRoleConfig(RoleConfig);
                var Token = this.GenerateToken(AccountID);

                var Result = {
                    AccountID: AccountID,
                    IsAdmin: IsAdmin,
                    MenuConfig: MenuConfig,
                    Permission: Permission,
                    Token: Token
                };

                var DataResponse = {
                    Result: Result
                };

                this.ResponseSocket(Socket, DataResponse);
            }
        }.bind(this))
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetAdminInfo - try err: ' + e.stack);
    }
};

AdminPage.prototype.GenerateToken = function (AccountID) {
    try {
        var data = {
            AccountID: AccountID,
            Time: +new Date()
        };

        var token = Encrytion.aesEncryptIV(JSON.stringify(data), Config.KeyConfig.LoginKey, Config.KeyConfig.LoginIV);

        return token;
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GenerateToken - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetNAUDetailCallback = function (DateArr, callback) {
    try {
        var _DateArr = DateArr.slice();
        var Date = _DateArr.shift();
        var ResultArr = [];

        this.LogRecorder.GetNAUDetail(Date, function (e, r) {
            if (!e) {
                ResultArr.push(r);
                if (_DateArr.length > 0) {
                    this.GetNAUDetailCallback(_DateArr, function (r1) {
                        ResultArr = ResultArr.concat(r1);

                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().debug('this.SQLAdapter.GetNAUDetail err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetNAUDetailCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetAArrayByDate = function (NAUDetail, ChannelID) {
    try {
        var Result = {
            1: 0,
            3: 0,
            7: 0,
            15: 0,
            30: 0
        };

        for (var i = 0; i < NAUDetail.length; i++) {
            if (Utility.CheckVariable(NAUDetail[i].UserID)) {
                if (NAUDetail[i].ChannelID != ChannelID && ChannelID != 0) {
                    continue;
                }

                for (var prop in Result) {
                    if (NAUDetail[i].Dif >= parseInt(prop)) {
                        Result[prop]++;
                    }
                }
            }
        }

        return Result;
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetAArrayByDate - try err: ' + e.stack);
    }
};

AdminPage.prototype.UpdateAdminInfo = function (Socket, AccountID, IsAdmin, MenuConfig) {
    try {
        var RoleConfig = {
            IsAdmin: IsAdmin,
            MenuConfig: MenuConfig
        };

        this.SQLAdapter.UpdateAdminInfo(AccountID, JSON.stringify(RoleConfig), function (e, r) {

        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.UpdateAdminRole - try err: ' + e.stack);
    }
};

AdminPage.prototype.Slot_GetJackpotsConfig = function (callback) {
    try {
        var key = "SLOTJPC:*";
        this.RedisAdapter.keys(key, function (e, KeyArray) {
            if (!e) {
                if (KeyArray.length == 0) {
                    return [];
                }

                this.RedisAdapter.mget(KeyArray, function (e1, ValueArray) {
                    if (!e1) {
                        var Result = [];

                        for (var i = 0; i < KeyArray.length; i++) {
                            Result.push({
                                Key: KeyArray[i],
                                Value: ValueArray[i]
                            })
                        }

                        callback(Result);
                    }
                    else {
                        callback([]);
                    }
                }.bind(this))
            }
            else {
                callback([]);
            }
        }.bind(this))
    }
    catch (e) {
        callback([]);
        this.Logger.Game().error('GameServer.prototype.GetJackpotsValue - try err: ' + e.stack);
    }
};

AdminPage.prototype.Slot_GetJackpotsSave = function (callback) {
    try {
        var key = "SLOTJPS:*";
        this.RedisAdapter.keys(key, function (e, KeyArray) {
            if (!e) {
                if (KeyArray.length == 0) {
                    return [];
                }

                this.RedisAdapter.mget(KeyArray, function (e1, ValueArray) {
                    if (!e1) {
                        var Result = [];

                        for (var i = 0; i < KeyArray.length; i++) {
                            Result.push({
                                Key: KeyArray[i],
                                Value: ValueArray[i]
                            })
                        }

                        callback(Result);
                    }
                    else {
                        callback([]);
                    }
                }.bind(this))
            }
            else {
                callback([]);
            }
        }.bind(this))
    }
    catch (e) {
        callback([]);
        this.Logger.Game().error('GameServer.prototype.GetJackpotsValue - try err: ' + e.stack);
    }
};


AdminPage.prototype.TX_GetInfo = function (Socket, Date, RequestInfo, Filter) {
    try {
        var TimeFrom = "00:00:00";
        var TimeTo = "23:59:59";

        //this.LogRecorder.TX_GetLogEndMatch(Date, TimeFrom, TimeTo, function (e, LogEndMatch) {
        //    this.LogRecorder.TX_GetLogStartMatch(Date, TimeFrom, TimeTo, function (e1, LogStartMatch) {
        this.LogRecorder.TX_GetBetLogWithWin(Date, TimeFrom, TimeTo, RequestInfo, Filter, function (e2, BetLogWithWin) {
            //var MatchInfo = [];
            //
            //for(var i = 0; i < LogStartMatch.length; i++){
            //    var MatchID = LogStartMatch[i].MatchID;
            //    var StartTime = FormatDateTime(LogStartMatch[i].CreateTime);
            //
            //}

            //console.log("TX_GetLogEndMatch", e, LogEndMatch);
            //console.log("TX_GetLogStartMatch", e, LogStartMatch);
            //console.log("TX_GetBetLogWithWin", e, BetLogWithWin);

            for (var i = 0; i < BetLogWithWin.length; i++) {
                BetLogWithWin[i].CreateDate = FormatDateTime(BetLogWithWin[i].CreateDate);
            }

            var DataResponse = {
                BetLogWithWin: BetLogWithWin
            };

            this.ResponseSocket(Socket, DataResponse);
        }.bind(this));
        //}.bind(this));
        //}.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.TX_GetInfo - try err: ' + e.stack);
    }
};

AdminPage.prototype.Baccarat_GetInfo = function (Socket, Date, RequestInfo, Filter) {
    try {
        var TimeFrom = "00:00:00";
        var TimeTo = "23:59:59";

        this.LogRecorder.Baccarat_GetBetLogWithWin(Date, TimeFrom, TimeTo, RequestInfo, Filter, function (e2, BetLogWithWin) {
            for (var i = 0; i < BetLogWithWin.length; i++) {
                BetLogWithWin[i].CreateDate = FormatDateTime(BetLogWithWin[i].CreateDate);
            }

            var DataResponse = {
                BetLogWithWin: BetLogWithWin
            };

            this.ResponseSocket(Socket, DataResponse);
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.Baccarat_GetInfo - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetLogUserPlay = function (Socket, UserID, DateFrom, DateTo, Nick, TimeFrom, TimeTo) {
    try {
        var DateArr = GetDateArray(DateFrom, DateTo);

        var SQLQueryFunc = this.SQLAdapter.GetUserIDByNick;
        var QueryParam = Nick;

        if (UserID.length != 0) {
            SQLQueryFunc = this.SQLAdapter.GetNickByUserID;
            QueryParam = UserID;
        }

        SQLQueryFunc(QueryParam, function (e, r) {
            var UserID_Nick_Array = r;

            if (UserID_Nick_Array.length == 0) {
                return;
            }

            this.GetLogUserPlayCallback(DateArr, UserID_Nick_Array, TimeFrom, TimeTo, function (LogUserPlayArray) {
                this.GetLoginLogCallback(DateArr, UserID_Nick_Array, TimeFrom, TimeTo, function (LoginLogArray) {
                    var LoginLogResult = [];
                    var Result = [];

                    for (var i = 0; i < LogUserPlayArray.length; i++) {
                        Result = Result.concat(LogUserPlayArray[i]);
                    }

                    for (var i = 0; i < Result.length; i++) {
                        Result[i].Nick = '';

                        for (var j = 0; j < UserID_Nick_Array.length; j++) {
                            if (Result[i].UserID == UserID_Nick_Array[j].UserID) {
                                Result[i].Nick = UserID_Nick_Array[j].Nick;
                                break;
                            }
                        }

                        Result[i].TimeIn = FormatDateTime(Result[i].TimeIn);
                        Result[i].TimeOut = FormatDateTime(Result[i].TimeOut);
                    }

                    //LoginLog
                    for (var i = 0; i < LoginLogArray.length; i++) {
                        LoginLogResult = LoginLogResult.concat(LoginLogArray[i]);
                    }

                    for (var i = 0; i < LoginLogResult.length; i++) {
                        LoginLogResult[i].Nick = '';

                        for (var j = 0; j < UserID_Nick_Array.length; j++) {
                            if (LoginLogResult[i].UserID == UserID_Nick_Array[j].UserID) {
                                LoginLogResult[i].Nick = UserID_Nick_Array[j].Nick;
                                break;
                            }
                        }

                        LoginLogResult[i].CreateDate = FormatDateTime(LoginLogResult[i].CreateDate);
                    }

                    var DataResponse = {
                        LogUserPlayArray: Result,
                        LoginLogArray: LoginLogResult,
                        GameNameConfig: this.GameNameConfig
                    };

                    this.ResponseSocket(Socket, DataResponse);

                }.bind(this))
            }.bind(this))
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetLogUserPlay - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetLogUserPlayCallback = function (DateArr, UserID_Nick_Array, TimeFrom, TimeTo, callback) {
    try {
        var _DateArr = DateArr.slice();
        var Date = _DateArr.shift();
        var ResultArr = [];
        this.LogRecorder.GetLogUserPlayArray(UserID_Nick_Array, Date, TimeFrom, TimeTo, function (e, r) {
            if (!e) {
                ResultArr.push(r);
                if (_DateArr.length > 0) {
                    this.GetLogUserPlayCallback(_DateArr, UserID_Nick_Array, TimeFrom, TimeTo, function (r1) {
                        ResultArr = ResultArr.concat(r1);

                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().error('this.SQLAdapter.GetLogUserPlayArray err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetLogUserPlayCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetLoginLogCallback = function (DateArr, UserID_Nick_Array, TimeFrom, TimeTo, callback) {
    try {
        var _DateArr = DateArr.slice();
        var Date = _DateArr.shift();
        var ResultArr = [];
        this.LogRecorder.GetLoginLogArray(UserID_Nick_Array, Date, TimeFrom, TimeTo, function (e, r) {
            if (!e) {
                ResultArr.push(r);
                if (_DateArr.length > 0) {
                    this.GetLoginLogCallback(_DateArr, UserID_Nick_Array, TimeFrom, TimeTo, function (r1) {
                        ResultArr = ResultArr.concat(r1);

                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().error('this.SQLAdapter.GetLoginLogArray err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetLoginLogCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.XocDia_GetInfo = function (Socket, Date, RequestInfo, Filter) {
    try {
        var TimeFrom = "00:00:00";
        var TimeTo = "23:59:59";

        this.LogRecorder.XocDia_GetBetLogWithWin(Date, TimeFrom, TimeTo, RequestInfo, Filter, function (e2, BetLogWithWin) {
            for (var i = 0; i < BetLogWithWin.length; i++) {
                BetLogWithWin[i].CreateDate = FormatDateTime(BetLogWithWin[i].CreateDate);
            }

            var DataResponse = {
                BetLogWithWin: BetLogWithWin
            };

            this.ResponseSocket(Socket, DataResponse);
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.Baccarat_GetInfo - try err: ' + e.stack);
    }
};

AdminPage.prototype.TLMN_GetInfo = function (Socket, Date, RequestInfo, Filter) {
    try {
        var TimeFrom = "00:00:00";
        var TimeTo = "23:59:59";

        this.LogRecorder.TLMN_GetStartMatchLog(Date, TimeFrom, TimeTo, RequestInfo, Filter, function (e2, StartMatch) {
            this.LogRecorder.TLMN_GetEndMatchLog(Date, TimeFrom, TimeTo, RequestInfo, Filter, function (e2, EndMatch) {
                for (var i = 0; i < StartMatch.length; i++) {
                    for (var j = 0; j < EndMatch.length; j++) {
                        if (StartMatch[i].MatchID == EndMatch[j].MatchID) {

                        }
                    }
                }


                var DataResponse = {
                    BetLogWithWin: BetLogWithWin
                };

                this.ResponseSocket(Socket, DataResponse);
            }.bind(this));
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.TLMN_GetInfo - try err: ' + e.stack);
    }
};

AdminPage.prototype.VQMM_GetInfo = function (Socket, Date, RequestInfo, Filter) {
    try {
        var TimeFrom = "00:00:00";
        var TimeTo = "23:59:59";

        this.LogRecorder.VQMM_GetBetLogWithWin(Date, TimeFrom, TimeTo, RequestInfo, Filter, function (e2, BetLogWithWin) {
            for (var i = 0; i < BetLogWithWin.length; i++) {
                BetLogWithWin[i].CreateDate = FormatDateTime(BetLogWithWin[i].CreateDate);
            }

            var DataResponse = {
                BetLogWithWin: BetLogWithWin
            };

            this.ResponseSocket(Socket, DataResponse);
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.Baccarat_GetInfo - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetChannelName = function (callback) {
    this.SQLAdapter.GetChannelName(function (e, ChannelName) {
        if (!e) {
            callback(ChannelName);
        }
    }.bind(this))
};

AdminPage.prototype.FilterCCUDetail = function (CCUDetail) {
    var SanhIndex = -1;
    for (var i = 0; i < CCUDetail.length; i++) {
        if (CCUDetail[i].GameID == 0) {
            SanhIndex = i;
            break;
        }
    }

    if (SanhIndex > -1) {
        var SumOther = 0;
        for (var i = 0; i < CCUDetail.length; i++) {
            CCUDetail[i].GameName = "Chưa load xong :) ";
            if (CCUDetail[i].GameID != 0) {
                SumOther += CCUDetail[i].CCU;
            }
        }

        var AlterCCU = CCUDetail[SanhIndex].CCU - SumOther;
        if (AlterCCU < 0) {
            AlterCCU = 0;
        }

        CCUDetail.push({
            CCU: AlterCCU,
            GameID: -1
        });
    }

    for (var i = 0; i < CCUDetail.length; i++) {
        if (CCUDetail[i].GameID == -1) {
            CCUDetail[i].GameName = "Sảnh"
        }
        else {
            for (var j = 0; j < this.GameNameConfig.length; j++) {
                if (this.GameNameConfig[j].GameID == CCUDetail[i].GameID) {
                    CCUDetail[i].GameName = this.GameNameConfig[j].GameName;
                    break;
                }
            }
        }
    }

    //thêm mấy game k có

    return CCUDetail;
};

AdminPage.prototype.ShowStoreConfig = function (Socket) {
    try {
        var Key = "ShowStoreConfig";

        var defaultValue = {
            AwardOnlineCount: 2,
            AwardDailyCount: 0,
            RechargeGold: 90000,
            BlackListOS: [],
            BlackListVersion: [],
            BlackListPackage: []
        };
        this.RedisAdapter.get(Key, function (e, d) {
            if (!e) {
                var data = defaultValue;
                if (!d) {
                    //using defaultValue
                }
                else {
                    data = JSON.parse(d);
                }

                var DataResponse = data;

                this.ResponseSocket(Socket, DataResponse);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.ShowStoreConfig - try err: ' + e.stack);
    }
};

AdminPage.prototype.UpdateStoreConfig = function (Socket, data) {
    try {
        var dataStr = JSON.stringify(data);
        var checkingData = JSON.parse(dataStr);
        var Key = "ShowStoreConfig";

        this.RedisAdapter.set(Key, dataStr);
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.UpdateStoreConfig - try err: ' + e.stack);
    }
};

AdminPage.prototype.TXMN_GetInfo = function (Socket, Date, RequestInfo, Filter) {
    try {
        var TimeFrom = "00:00:00";
        var TimeTo = "23:59:59";

        this.LogRecorder.TXMini_GetBetLogWithWin(Date, TimeFrom, TimeTo, RequestInfo, Filter, function (e2, BetLogWithWin) {
            for (var i = 0; i < BetLogWithWin.length; i++) {
                BetLogWithWin[i].CreateDate = FormatDateTime(BetLogWithWin[i].CreateDate);
            }

            var DataResponse = {
                BetLogWithWin: BetLogWithWin
            };

            this.ResponseSocket(Socket, DataResponse);
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.TXMN_GetInfo - try err: ' + e.stack);
    }
};

AdminPage.prototype.VQMM_AddFreeTicket = function (Socket, UserID, DailyTicket, FreeTicket) {
    try {
        var hashDaily = UserID + ":" + "VBD";
        var hashFree = UserID + ":" + "VBF";
        var VQMMSpinInfo = "VSI";

        this.RedisAdapter.hIncrby(VQMMSpinInfo, hashDaily, DailyTicket, function (e, DailyData) {
            this.RedisAdapter.hIncrby(VQMMSpinInfo, hashFree, FreeTicket, function (e1, FreeData) {
                if (!e && !e1) {
                    var DataResponse = {
                        UserID: UserID,
                        DailyData: DailyData,
                        FreeData: FreeData
                    };

                    this.ResponseSocket(Socket, DataResponse);
                }
            }.bind(this));
        }.bind(this));
        //this.GameServer.RedisAdapter.hIncrby(this.GameServer.Config.RedisConfig.Define.VQMMSpinInfo, hashFree, FreeTicket);
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.VQMM_AddFreeTicket - try err: ' + e.stack);
    }
};

AdminPage.prototype.Tracking_GameStatus = function (Socket, DateFrom, DateTo, Filter) {
    try {
        var DateArr = GetDateArray(DateFrom, DateTo);
        this.Tracking_GetNAUCallback(DateArr, Filter, function (NAUArray) {
            this.Tracking_GetDAUCallback(DateArr, Filter, function (DAUArray) {
                this.Tracking_GetNAUDetailCallback(DateArr, Filter, function (NAUDetailArray) {
                    this.SQLAdapter.Tracking_GetUTMConfig(function (e, UTMConfig_Raw) {
                        var UTMConfig = this.Tracking_SortConfig(UTMConfig_Raw);
                        var GameStatusArray = [];
                        for (var i = 0; i < DateArr.length; i++) {
                            var A_Result = [];
                            var NAUDetail = NAUDetailArray[i];

                            var A_Result_Channel = [];
                            A_Result_Channel = this.Tracking_GetAArrayByDate(NAUDetail);
                            A_Result.push({
                                A_Result: A_Result_Channel
                            });

                            GameStatusArray.push({
                                Date: DateArr[i],
                                DAU: DAUArray[i],
                                NAU: NAUArray[i],
                                A_Result: A_Result
                            });

                        }

                        var DataResponse = {
                            GameStatusArray: GameStatusArray,
                            UTMConfig: UTMConfig
                        };

                        this.ResponseSocket(Socket, DataResponse, PacketConfig.Tracking_GameStatus);
                    }.bind(this))
                }.bind(this))
            }.bind(this))
        }.bind(this))
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.Tracking_GameStatus - try err: ' + e.stack);
    }
};

AdminPage.prototype.Tracking_GetNAUCallback = function (DateArr, Filter, callback) {
    try {
        var _DateArr = DateArr.slice();
        var Date = _DateArr.shift();
        var ResultArr = [];

        this.SQLAdapter.Tracking_GetNAU(Date, Filter, function (e, r) {
            if (!e) {
                ResultArr.push(r[0].NAU);
                if (_DateArr.length > 0) {
                    this.Tracking_GetNAUCallback(_DateArr, Filter, function (r1) {
                        ResultArr = ResultArr.concat(r1);

                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().debug('this.SQLAdapter.Tracking_GetNAUCallback err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.Tracking_GetNAUCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.Tracking_GetDAUCallback = function (DateArr, Filter, callback) {
    try {
        var _DateArr = DateArr.slice();
        var Date = _DateArr.shift();
        var ResultArr = [];

        this.LogRecorder.Tracking_GetDAU(Date, Filter, function (e, r) {
            if (!e) {
                //ResultArr.push(r[0].DAU);
                ResultArr.push(r);

                if (_DateArr.length > 0) {
                    this.Tracking_GetDAUCallback(_DateArr, Filter, function (r1) {
                        ResultArr = ResultArr.concat(r1);
                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().debug('this.SQLAdapter.Tracking_GetDAUCallback err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.Tracking_GetDAUCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.Tracking_GetNAUDetailCallback = function (DateArr, Filter, callback) {
    try {
        var _DateArr = DateArr.slice();
        var Date = _DateArr.shift();
        var ResultArr = [];

        this.LogRecorder.Tracking_GetNAUDetail(Date, Filter, function (e, r) {
            if (!e) {
                //ResultArr.push(r[0].DAU);
                ResultArr.push(r);

                if (_DateArr.length > 0) {
                    this.Tracking_GetNAUDetailCallback(_DateArr, Filter, function (r1) {
                        ResultArr = ResultArr.concat(r1);
                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().debug('this.SQLAdapter.Tracking_GetDAUDetailCallback err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.Tracking_GetDAUDetailCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.Tracking_GetAArrayByDate = function (NAUDetail) {
    try {
        var Result = {
            1: 0,
            3: 0,
            7: 0,
            15: 0,
            30: 0
        };

        for (var i = 0; i < NAUDetail.length; i++) {
            if (Utility.CheckVariable(NAUDetail[i].UserID)) {

                for (var prop in Result) {
                    if (NAUDetail[i].Dif >= parseInt(prop)) {
                        Result[prop]++;
                    }
                }
            }
        }

        return Result;
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetAArrayByDate - try err: ' + e.stack);
    }
};

AdminPage.prototype.Tracking_SortConfig = function (UTMConfig_Raw) {
    var UTMConfig = {
        Source: [],
        Medium: [],
        Content: [],
        Campaign: []
    };

    for (var i = 0; i < UTMConfig_Raw.length; i++) {
        var found = 0;
        var val = "";

        //Source
        for (var j = 0; j < UTMConfig.Source.length; j++) {
            if (UTMConfig_Raw[i].Source == UTMConfig.Source[j]) {
                found = 1;
                break;
            }
        }
        val = UTMConfig_Raw[i].Source;

        if (found == 0 && val != "") {
            UTMConfig.Source.push(val);
        }

        found = 0;
        val = "";

        //Medium
        for (var j = 0; j < UTMConfig.Source.length; j++) {
            if (UTMConfig_Raw[i].Medium == UTMConfig.Medium[j]) {
                found = 1;
                break;
            }
        }
        val = UTMConfig_Raw[i].Medium;

        if (found == 0 && val != "") {
            UTMConfig.Medium.push(val);
        }

        found = 0;
        val = "";

        //Content
        for (var j = 0; j < UTMConfig.Content.length; j++) {
            if (UTMConfig_Raw[i].Content == UTMConfig.Content[j]) {
                found = 1;
                break;
            }
        }
        val = UTMConfig_Raw[i].Content;

        if (found == 0 && val != "") {
            UTMConfig.Content.push(val);
        }

        found = 0;
        val = "";

        //Campaign
        for (var j = 0; j < UTMConfig.Campaign.length; j++) {
            if (UTMConfig_Raw[i].Campaign == UTMConfig.Campaign[j]) {
                found = 1;
                break;
            }
        }
        val = UTMConfig_Raw[i].Campaign;

        if (found == 0 && val != "") {
            UTMConfig.Campaign.push(val);
        }
    }

    return UTMConfig;
};

AdminPage.prototype.Tracking_GetTotalReCharge = function (Socket, DateFrom, DateTo, Filter) {
    try {
        this.SQLAdapter.Tracking_GetTotalReCharge(DateFrom, DateTo, Filter, function (e, r) {
            this.SQLAdapter.Tracking_GetUTMConfig(function (e, UTMConfig_Raw) {
                if (!e) {
                    var UTMConfig = this.Tracking_SortConfig(UTMConfig_Raw);
                    var DataResponse = {
                        UserTotalReCharge: r,
                        UTMConfig: UTMConfig
                    };

                    this.ResponseSocket(Socket, DataResponse, PacketConfig.Tracking_GetTotalReCharge);
                }
            }.bind(this));
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.Tracking_GetTotalReCharge - try err: ' + e.stack);
    }
}

AdminPage.prototype.GetTopDoiNap = function (Socket, DateFrom, DateTo, Top) {
    try {
        var DateArr = GetDateArray(DateFrom, DateTo);
        this.GetTopDoiCallback(DateArr, Top, function (TopDoiArr) {
            this.GetTopNapCallback(DateArr, Top, function (TopNapArr) {
                var Result = {
                    TopDoi: [],
                    TopNap: []
                };

                for (var i = 0; i < TopDoiArr.length; i++) {
                    var TopDoiByDate = TopDoiArr[i];

                    for (var j = 0; j < TopDoiByDate.length; j++) {
                        var TopDoiInfo = TopDoiByDate[j];
                        var found = 0;

                        for (var k = 0; k < Result.TopDoi.length; k++) {
                            if (Result.TopDoi[k].UserID == TopDoiInfo.UserID) {
                                Result.TopDoi[k].SumMoney += TopDoiInfo.SumMoney;
                                found = 1;
                                break;
                            }
                        }

                        if (found == 0) {
                            Result.TopDoi.push({
                                UserID: TopDoiInfo.UserID,
                                SumMoney: TopDoiInfo.SumMoney,
                                Name: '',
                                AccountID: ''
                            })
                        }
                    }
                }

                for (var i = 0; i < TopNapArr.length; i++) {
                    var TopNapByDate = TopNapArr[i];

                    for (var j = 0; j < TopNapByDate.length; j++) {
                        var TopNapInfo = TopNapByDate[j];
                        var found = 0;

                        for (var k = 0; k < Result.TopNap.length; k++) {
                            if (Result.TopNap[k].UserID == TopNapInfo.UserID) {
                                Result.TopNap[k].SumMoney += TopNapInfo.SumMoney;
                                found = 1;
                                break;
                            }
                        }

                        if (found == 0) {
                            Result.TopNap.push({
                                UserID: TopNapInfo.UserID,
                                SumMoney: TopNapInfo.SumMoney,
                                Name: '',
                                AccountID: ''
                            })
                        }
                    }
                }
                this.GetNameArrayCallback(Result.TopDoi, function (TopDoiName) {
                    this.GetNameArrayCallback(Result.TopNap, function (TopNapName) {

                        for (var i = 0; i < TopDoiName.length; i++) {
                            Result.TopDoi[i].Name = TopDoiName[i].GameName;
                            Result.TopDoi[i].AccountID = TopDoiName[i].AccountID;
                        }

                        for (var i = 0; i < TopNapName.length; i++) {
                            Result.TopNap[i].Name = TopNapName[i].GameName;
                            Result.TopNap[i].AccountID = TopNapName[i].AccountID;
                        }

                        var DataResponse = {
                            TopDoi: Result.TopDoi,
                            TopNap: Result.TopNap
                        };

                        this.ResponseSocket(Socket, DataResponse, PacketConfig.TopDoiNap);
                    }.bind(this))
                }.bind(this));
            }.bind(this))
        }.bind(this))
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetTopDoiNap - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetTopDoiCallback = function (DateArr, Top, callback) {
    try {
        var _DateArr = DateArr.slice();
        var Date = _DateArr.shift();
        var ResultArr = [];

        this.LogRecorder.GetTopDoi(Date, Top, function (e, r) {
            if (!e) {
                ResultArr.push(r);
                if (_DateArr.length > 0) {
                    this.GetTopDoiCallback(_DateArr, Top, function (r1) {
                        ResultArr = ResultArr.concat(r1);

                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().debug('this.SQLAdapter.GetTopDoiNapCallback err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetTopDoiNapCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetTopNapCallback = function (DateArr, Top, callback) {
    try {
        var _DateArr = DateArr.slice();
        var Date = _DateArr.shift();
        var ResultArr = [];

        this.LogRecorder.GetTopNap(Date, Top, function (e, r) {
            if (!e) {
                ResultArr.push(r);
                if (_DateArr.length > 0) {
                    this.GetTopNapCallback(_DateArr, Top, function (r1) {
                        ResultArr = ResultArr.concat(r1);

                        callback(ResultArr);
                    }.bind(this));
                }
                else {
                    callback(ResultArr);
                }
            }
            else {
                this.Logger.Game().debug('this.SQLAdapter.GetTopDoiNapCallback err: ' + e);
                callback([]);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetTopDoiNapCallback - try err: ' + e.stack);
    }
};

AdminPage.prototype.GetArticleList = function(Socket){
    try{
        this.SQLAdapter.GetArticleList(function(e, r){
            if(!e){
                var DataResponse = {
                    Result: r
                };

                this.ResponseSocket(Socket, DataResponse, PacketConfig.GetArticleList);
            }
        }.bind(this))
    }
    catch(e){
        this.Logger.Game().error('GameServer.prototype.GetArticleList - try err: ' + e.stack);
    }
};

AdminPage.prototype.UpdateArticle = function(Socket, Data){
    try{
        Data.RedirectURL = '';
        this.SQLAdapter.UpdateArticle(Data, function(e, r){

        }.bind(this));
    }
    catch(e){
        this.Logger.Game().error('GameServer.prototype.UpdateArticle - try err: ' + e.stack);
    }
};

AdminPage.prototype.AddArticle = function(Socket, Data){
    try{
        Data.RedirectURL = '';
        this.SQLAdapter.AddArticle(Data, function(e, r){

        }.bind(this));
    }
    catch(e){
        this.Logger.Game().error('GameServer.prototype.AddArticle - try err: ' + e.stack);
    }
};

AdminPage.prototype.DeleteArticle = function(Socket, Data){
    try{
        this.SQLAdapter.DeleteArticle(Data, function(e, r){

        }.bind(this))
    }
    catch(e){
        this.Logger.Game().error('GameServer.prototype.DeleteArticle - try err: ' + e.stack);
    }
}



//API ngoài
AdminPage.prototype.GetChargeInfo = function (Socket, AccountID) {
    try {
        var url = "http://" + this.APILink + "/api/users/get-charge-info?uid=" + AccountID;

        this.httpGet(url, function (data) {
            if (data != 'Error') {
                var dataObj = JSON.parse(data);
                var Result = {
                    charge: 0,
                    reward: 0
                };

                if (dataObj.code == 200) {
                    Result = dataObj.data;
                }

                var DataResponse = {
                    Result: Result
                };

                this.ResponseSocket(Socket, DataResponse, PacketConfig.GetChargeInfo);
            }
        }.bind(this));
    }
    catch (e) {
        this.Logger.Game().error('GameServer.prototype.GetChargeInfo - try err: ' + e.stack);
    }
};

AdminPage.prototype.httpGet = function (url, cb) {
    var httpLib = http;
    if (url.indexOf('https://') == 0) {
        httpLib = https;
    }
    httpLib.get(url, function (res) {
        var rawData = '';
        if (res.statusCode == 200) {
            res.on('data', function (chunk) {
                rawData += chunk;
            });
            res.on('end', function () {
                cb(rawData);
            });
        } else {
            cb('Error');
        }

    })

};