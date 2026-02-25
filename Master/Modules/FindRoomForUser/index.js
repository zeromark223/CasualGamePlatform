/**
 * Created by Ngoc on 01-02-2019.
 */
var Helper = require('./dataExchangeHelper');
var url = 'http://127.0.0.1:9999/';
var key = "1234";
var iv = "4321";

exports.prototype.FindRoomForUserEx = function (User, GameID, cb) {
    var obj = {
        UserID: User.UserID,
        GameID: GameID,
        Wallet: User.Wallet,
        Time: +new Date()
    };
    Helper.sendData(url, obj, key, iv, cb);
};