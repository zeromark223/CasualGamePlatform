/*{"build":1}*/
var path = require('path');
var Config = require('../../Config/Bingo');

module.exports.GetDeskByKind = function (roomKind, sk, s4, SmartRequire) {
    var rootFile = __stack[0].getFileName();
    switch (roomKind) {
        case Config.RoomKindConfig.BingoLobby: // hall
            var RoomLobby = SmartRequire(rootFile.replace(path.basename(rootFile), 'DeskFactory.js'), sk, s4);
            return RoomLobby(SmartRequire(rootFile.replace(path.basename(rootFile), 'DeskLobby.js'), sk, s4));
        case Config.RoomKindConfig.BingoClassical: // mode classical
            var RoomClassical = SmartRequire(rootFile.replace(path.basename(rootFile), 'DeskFactory.js'), sk, s4);
            return RoomClassical(SmartRequire(rootFile.replace(path.basename(rootFile), 'DeskClassical.js'), sk, s4));
        case Config.RoomKindConfig.BingoEasy: // mode easy
            var RoomEasy = SmartRequire(rootFile.replace(path.basename(rootFile), 'DeskFactory.js'), sk, s4);
            return RoomEasy(SmartRequire(rootFile.replace(path.basename(rootFile), 'DeskClassical.js'), sk, s4));
        default:
            return 0;
    }
};
