/**
 * Created by ngocnpt on 08-May-17.
 */
var Utility = require('../../../SharedModule/Utility');
var querystring = require('querystring');
var encrytion = require('../../../SharedModule/encrytion');
var http = require('http');

function GMToolAPI() {
    this.Agent = 0;
    this.ApiServer = 0;
    this.Config = 0;
    this.TrackingData = [];
}

module.exports = GMToolAPI;

GMToolAPI.prototype.Init = function (Agent, Config) {
    this.Agent = Agent;
    this.LogRecorder = this.Agent.LogRecorder;
    this.Config = Config;
    this.ApiServer = http.createServer(this.HandleRequest.bind(this));
    this.ApiServer.listen(this.Config.BindingPort, this.Config.BindingIP);

};

GMToolAPI.prototype.HandleRequest = function (Request, Response) {
    try {
        if (Request.socket.remoteAddress == '123.30.210.205') {
            this.Agent.Logger.Game().error("GMToolAPI.prototype.HandleRequest Unacceptable IP ", Request.socket.remoteAddress);
            Response.end();
            return;
        }
        if (Request.method == 'POST' && Request.url == '/api') {
            var body = '';
            Request.on('data', function (data) {
                body += data;
            });
            Request.on('error', function (error) {

            });
            Request.on('end', function () {
                this.HandlePostCompleted(Request, Response, body);
            }.bind(this));
        }
        else {
            // if (Request.url == 'favicon') {
            //     Response.end();
            //     return;
            // }
            // this.UserInfoGet(Request, Response, {
            //     AccountID: 'R5Rq1P8pymgm50V',
            //     MoneyUpdate: 5000000,
            //     Desc: 'Admin Trừ gold 5tr'
            // });
            Response.end('{"statusCode":404,"message":"Resource not found","name":"Rest Error"}');

        }
    } catch (e) {
        Response.end('{"statusCode":404,"message":"internal error "}');
        this.Agent.Logger.Game().error("GMToolAPI.prototype.HandlePostCompleted ", e.stack);
    }

};

GMToolAPI.prototype.HandlePostCompleted = function (Request, Response, Body) {
    try {
        Body = encrytion.aesDecryptIV(Body, this.Config.GMApiKey, this.Config.GMApiIV, 'hex');
        Body = JSON.parse(Body);
        if (Utility.CheckVariable(Body, 'cmd', 'action')) {
            switch (Body.cmd) {
                case 'event':
                    this.HandleEventController(Request, Response, Body);
                    break;
                case 'gold':
                    this.HandleGoldController(Request, Response, Body);
                    break;
                case 'stock':
                    this.HandleStockController(Request, Response, Body);
                    break;
                case 'userinfo':
                    this.HandleUserInfoController(Request, Response, Body);
                    break;
                default:
                    Response.end('{"statusCode":404,"message":"cmd not found"}');
                    return;
            }
        } else {
            Response.end('{"statusCode":404,"message":"cmd or action null"}');
        }

    } catch (e) {
        Response.end('{"statusCode":404,"message":"internal error "}');
        this.Agent.Logger.Game().error("GMToolAPI.prototype.HandlePostCompleted ", e.stack);
    }
};

GMToolAPI.prototype.HandleGoldController = function (Request, Response, Body) {
    switch (Body.action.toLowerCase()) {
        case 'getall':
            this.GoldGetAll(Request, Response, Body);
            break;
        case 'emptyall':
            this.GoldEmptyAll(Request, Response, Body);
            break;
        case 'update':
            this.GoldUpdate(Request, Response, Body);
            break;

        default :
            Response.end('{"statusCode":404,"message":"action not found"}');
            break;
    }
};

GMToolAPI.prototype.HandleEventController = function (Request, Response, Body) {
    switch (Body.action.toLowerCase()) {
        case 'get':
            if (Body.eventcode == 'FishNameByLang') {
                this.Agent.SQLAdapter.getAllFishName(function (e, d) {
                    if (!e) {
                        if (Utility.CheckVariable(d)) {
                            for (var i = 0; i < d.length; i++) {
                                try {
                                    var fishName = JSON.parse(d[i].FishName);
                                    if (Utility.CheckVariable(fishName, Body.langcode)) {
                                        d[i].FishName = JSON.parse(d[i].FishName)[Body.langcode];
                                    } else {
                                        d[i].FishName = 'fish kind ' + d[i].FishKind;
                                    }
                                } catch (e) {
                                    d[i].FishName = 'fish kind ' + d[i].FishKind;
                                }

                            }

                            Response.end('{"statusCode":200,"message":"Successfully !","data":' + JSON.stringify(d) + '}');
                        } else {
                            Response.end('{"statusCode":403,"message":"no fish data, contact api admin"}');
                        }
                    } else {
                        Response.end('{"statusCode":403,"message":"fail 2!","data":' + e + '}');
                    }
                }.bind(this));
            } else {
                this.Agent.SQLAdapter.getEventConfigByEventCode(Body.eventcode, function (e, d) {
                    if (!e) {
                        if (Utility.CheckVariable(d) && Utility.CheckVariable(d[0])) {
                            d[0].Config = JSON.parse(d[0].Config);
                            Response.end('{"statusCode":200,"message":"Successfully !","data":' + JSON.stringify(d[0]) + '}');
                        } else {
                            Response.end('{"statusCode":404,"message":"Event ' + Body.eventcode + ' is not define"}');
                        }
                    } else {
                        Response.end('{"statusCode":403,"message":"fail 2!","data":' + e + '}');
                    }
                }.bind(this));
            }
            break;
        case 'update':
            this.EventCheckAndUpdateByEventCode(Body.eventcode, Body.data, Response);
            break;
        case 'cleardata':
            this.EventClearData(Request, Response, Body)
            break;
        default :
            Response.end('{"statusCode":404,"message":"action not found"}');
            break;
    }
};

GMToolAPI.prototype.HandleStockController = function (Request, Response, Body) {
    switch (Body.action.toLowerCase()) {
        case 'getstock':
            break;
        case 'updatestock':
            break;
        case 'getstockratio':
            break;
        case 'updatestockratio':
            break;
        default :
            Response.end('{"statusCode":404,"message":"action not found"}');
            break;
    }
};

GMToolAPI.prototype.HandleUserInfoController = function (Request, Response, Body) {
    switch (Body.action.toLowerCase()) {
        case 'get':
            this.UserInfoGet(Request, Response, Body);
            break;
        default :
            Response.end('{"statusCode":404,"message":"action not found"}');
            break;
    }
};

GMToolAPI.prototype.CheckEventConfigByEventCode = function (EventCode, Config) {
    switch (EventCode) {
        case 'HuntAndFun':
            if (!Utility.CheckVariable(Config, 'FishList')) {
                return false;
            }
            for (var i = 0; i < Config.FishList.length; i++) {
                if (!Utility.CheckVariable(Config.FishList[i], 'FishKind', 'Ratio')) {

                    return false;
                }
            }
            return true;
        case 'RandomHour':
            if (!Utility.CheckVariable(Config, 'FishList')) {
                return false;
            }
            for (var i = 0; i < Config.FishList.length; i++) {
                if (!Utility.CheckVariable(Config.FishList[i], 'FishKind', 'FishMultiple', 'MaxFishMultiple', 'Interval', 'FishCount', 'FishMaxCount')) {
                    return false;
                }
            }
            return true;
        default :
            return true;
    }
    return false;
};

GMToolAPI.prototype.EventCheckAndUpdateByEventCode = function (EventCode, Data, Response) {
    //Basic Config
    try {
        if (!Utility.CheckVariable(Data, 'startTime', 'endTime', 'startDisplayTime', 'endDisplayTime', 'config')) {
            Response.end(this.BuildResponseData(403, "missing param "));
            return;
        }
        if (!this.CheckEventConfigByEventCode(EventCode, Data.config)) {
            Response.end(this.BuildResponseData(403, "config error "));
            return;
        }
        Data.config = JSON.stringify(Data.config);
        this.Agent.SQLAdapter.updateEventConfigByEventCode(EventCode, Data, function (e, d) {
            if (!e) {
                Response.end(this.BuildResponseData(200, "Successfully "));
            } else {
                Response.end(this.BuildResponseData(403, "sql error"));
            }
        }.bind(this));
    } catch (e) {
        Response.end(this.BuildResponseData(403, "internal while parsing config error"));
        this.Agent.Logger.Game().error("GMToolAPI.prototype.EventCheckAndUpdateByEventCode ", e.stack);
    }

};

GMToolAPI.prototype.GoldGetAll = function (Request, Response, Body) {
    if (Utility.CheckVariable(Body, 'AccountID')) {
        this.Agent.SQLAdapter.getUserIDByAccId(Body.AccountID, function (e, d) {
            if (!e) {
                if (Utility.CheckVariable(d) && Utility.CheckVariable(d[0], 'UserID')) {
                    this.Agent.SQLAdapter.moneyGetAll(d[0].UserID, function (er, dt) {
                        if (Utility.CheckVariable(dt, 'Money', 'ErrCode')) {
                            Response.end(this.BuildResponseData(200, "Successfully ", {
                                errcode: dt.ErrCode,
                                gold: dt.Money
                            }));
                        } else {
                            Response.end(this.BuildResponseData(403, "Can't Find User Gold"));
                        }
                    }.bind(this));
                } else {
                    Response.end(this.BuildResponseData(403, "Can't Find User"));
                }
            } else {
                Response.end(this.BuildResponseData(403, "Call DB Error While Find User"));
            }

        }.bind(this));

    } else {
        Response.end(this.BuildResponseData(403, "Param Error "));
    }
};

GMToolAPI.prototype.GoldEmptyAll = function (Request, Response, Body) {

};

GMToolAPI.prototype.GoldUpdate = function (Request, Response, Body) {
    if (Utility.CheckVariable(Body, 'AccountID', 'MoneyUpdate', 'Desc')) {
        //WebTransferToGame
        //GameTransferToWeb
        var ReasonID = this.Agent.AgentConfig.MoneyReasonConfig.WebTransferToGame;
        if (Body.MoneyUpdate < 0) {
            ReasonID = this.Agent.AgentConfig.MoneyReasonConfig.GameTransferToWeb;
        }
        this.Agent.SQLAdapter.getUserIDByAccId(Body.AccountID, function (e, d) {
            if (!e) {
                if (Utility.CheckVariable(d) && Utility.CheckVariable(d[0], 'UserID')) {
                    var UserID = d[0].UserID;
                    this.Agent.SQLAdapter.moneyUpdate(UserID, Body.MoneyUpdate, ReasonID, Body.Desc, 0, 0, 0, function (er, dt) {
                        if (er == 0) {
                            if (dt.errCode == 'noErr') {
                                //Thành công
                                Response.end(this.BuildResponseData(200, "Successfully ", {
                                    gold: dt.Money
                                }));
                                this.GoldClientUpdate(UserID);
                            } else {
                                Response.end(this.BuildResponseData(403, "User not enough gold "));
                            }
                        } else {
                            Response.end(this.BuildResponseData(403, "Can not update "));
                            console.log(er, dt);
                        }

                    }.bind(this));
                } else {
                    Response.end(this.BuildResponseData(403, "Can't Find User"));
                }
            } else {
                Response.end(this.BuildResponseData(403, "Call DB Error While Find User"));
            }

        }.bind(this));

    } else {
        Response.end(this.BuildResponseData(403, "Param Error "));
    }

};

GMToolAPI.prototype.GoldClientUpdate = function (UserID) {
    this.Agent.GMToolAdapter.SendBroadCastMasterCommand({
        CMD: this.Agent.AgentConfig.GMToolConfig.CMD.UpdateUserGold,
        SID: 0,
        Data: {
            UserID: UserID
        }
    });
};

GMToolAPI.prototype.StockGetAll = function () {
    this.Agent.RedisAdapter.hgetall(this.Agent.AgentConfig.RedisConfig.Define.StockConfig, function (e, d) {
        console.log(">>>>>>>>> ", d);
    });
};

GMToolAPI.prototype.StockRatioGetAll = function () {
    this.Agent.RedisAdapter.hgetall(this.Agent.AgentConfig.RedisConfig.Define.StockRatioConfig, function (e, d) {
        console.log(">>>>>>>>> ", d);

    });
};

GMToolAPI.prototype.BuildResponseData = function (statusCode, message, data) {
    try {
        return JSON.stringify({
            statusCode: statusCode,
            message: message || {},
            data: data || {}
        });
    } catch (e) {
        return '{"statusCode":500,"message":"Internal Error "}';
    }

};

GMToolAPI.prototype.EventClearData = function (Request, Response, Body) {
    var EventCode = Body.eventcode;
    if (!Utility.CheckVariable(EventCode)) {
        Response.end(this.BuildResponseData(403, "EventCode null "));
        return;
    }
    this.Agent.SQLAdapter.getEventDataKeyByEventCode(EventCode, function (e, d) {
        if (!e) {
            if (Utility.CheckVariable(d)) {
                if (Utility.CheckVariable(d[0], 'DataKey')) {
                    this.Agent.RedisAdapter.del(d[0].DataKey, function (e, d) {
                        if (!e) {
                            Response.end(this.BuildResponseData(200, "Successful"));
                        } else {
                            Response.end(this.BuildResponseData(403, "call redis error "));
                        }
                    }.bind(this));
                } else {
                    Response.end(this.BuildResponseData(403, "DataKey null,Check eventcode"));
                }

            } else {
                Response.end(this.BuildResponseData(403, "data null EventClearData"));
            }
        } else {
            Response.end(this.BuildResponseData(403, "sql error EventClearData"));
        }
    }.bind(this));
};

GMToolAPI.prototype.UserInfoGet = function (Request, Response, Body) {
    if (Utility.CheckVariable(Body, 'AccountID')) {
        this.Agent.SQLAdapter.getUserInfoByAccId(Body.AccountID, function (e, d) {
            if (!e) {
                if (Utility.CheckVariable(d) && Utility.CheckVariable(d[0], 'UserID')) {
                    this.GetGoldInfo(d[0].UserID,function (gold) {
                        d[0].gold = gold;
                        Response.end(this.BuildResponseData(200, "Successfully ", d[0]));
                    }.bind(this));
                }else{
                    d[0].gold = 0;
                    Response.end(this.BuildResponseData(200, "Successfully ", d[0]));
                }

            } else {
                Response.end(this.BuildResponseData(403, "Get Data Error "));
            }

        }.bind(this));
    } else {
        Response.end(this.BuildResponseData(403, "Param Error "));
    }
};

GMToolAPI.prototype.GetGoldInfo = function (UserID,callback) {
    this.Agent.SQLAdapter.moneyGetAll(UserID, function (er, dt) {
        if (Utility.CheckVariable(dt, 'Money', 'ErrCode')) {
           callback(dt.Money);
        } else {
            callback(0);
        }
    }.bind(this));
};