var requestLib = require('request');
var Utility = require('../../../SharedModule/Utility');
var encrytion = require('../../../SharedModule/encrytion');

function ApiMoney() {
    this.GameServer = 0;
}

module.exports = ApiMoney;
ApiMoney.prototype.Init = function (gameServer) {
    this.GameServer = gameServer;
};

ApiMoney.prototype.BuildApiData = function (data) {
    return encrytion.aesEncryptIV(JSON.stringify(data), this.GameServer.Config.ApiMoneyConfig.ApiMoneyKey, this.GameServer.Config.ApiMoneyConfig.ApiMoneyIV);
};

ApiMoney.prototype.ApiRequest = function (apiUrl, gameId, data, callback) {
    try {
        requestLib.post(
            apiUrl,
            {
                json: {
                    game_id: this.GameServer.Config.ApiMoneyConfig.GameID,
                    sub_game_id: gameId,
                    data: this.BuildApiData(data)
                }
            },
            function (error, response, body) {
                if (!error && Utility.CheckVariable(response) && response.statusCode == 200) {
                    try {
                        //body = JSON.parse(body);
                        if (body.code == 200) {
                            if (Utility.CheckVariable(body, 'data') && Utility.CheckVariable(body.data, 'coins')) {
                                callback(0, body.data.coins);
                            } else {
                                callback(1, body);
                                this.HandleError('bode result param error ', body);
                            }

                        } else {
                            callback(1, body);
                            this.HandleError('body code != 200 ', body);
                        }
                    } catch (e) {
                        this.HandleError('parse json body error ', body, e.stack);
                        callback(1, body, e.stack);
                    }
                } else {
                    if (Utility.CheckVariable(response)) {
                        callback(1, body, error, response.statusCode);
                        this.HandleError('request error ', body, error, response.statusCode);
                    } else {
                        callback(1, body, error, 999);
                        this.HandleError('request error ', body, error, 999);
                    }
                }
            }.bind(this)
        );
    } catch (e) {
        callback(1, e.stack);
        this.HandleError('request try catch ', apiUrl, gameId, data, e.stack);
    }
};

ApiMoney.prototype.GetUserMoney = function (accountId, gameId, callback) {
    this.ApiRequest(this.GameServer.Config.ApiMoneyConfig.GetAllMoneyApi, gameId, {
        uid: accountId
    }, callback);
};

ApiMoney.prototype.UpdateUserMoneyForWeb = function (accountId, gameId, coin, callback) {
    this.ApiRequest(this.GameServer.Config.ApiMoneyConfig.UpdateMoneyApi, gameId, {
        uid: accountId,
        coins: coin
    }, callback);
};

ApiMoney.prototype.EmptyUserMoney = function (accountId, gameId, callback) {
    this.ApiRequest(this.GameServer.Config.ApiMoneyConfig.EmptyMoneyApi, gameId, {
        uid: accountId
    }, callback);
};

ApiMoney.prototype.HandleError = function () {
    this.GameServer.Logger.Master().error("ApiMoney.prototype.HandleError > ", arguments)
};
