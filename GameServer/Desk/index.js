/*{"build":1}*/
var path = require('path');
module.exports.GetRoomByKind = function (roomKind, sk, s4, SmartRequire) {
    var rootFile = __stack[0].getFileName();
    switch (roomKind) {
        case 1 : //Tự do
        case 11:
        case 901:
            var RoomFree = SmartRequire(rootFile.replace(path.basename(rootFile), 'RoomFree.js'), sk, s4);
            return RoomFree(SmartRequire(rootFile.replace(path.basename(rootFile), 'RoomCore.js'), sk, s4));
        case 2 : //Vip
        case 12:
            var RoomVIP = SmartRequire(rootFile.replace(path.basename(rootFile), 'RoomVIP.js'), sk, s4);
            return RoomVIP(SmartRequire(rootFile.replace(path.basename(rootFile), 'RoomCore.js'), sk, s4));
        case 3 ://Chơi thử
        case 13:
            var RoomTrial = SmartRequire(rootFile.replace(path.basename(rootFile), 'RoomTrial.js'), sk, s4);
            return RoomTrial(SmartRequire(rootFile.replace(path.basename(rootFile), 'RoomCore.js'), sk, s4));
        default:
            return 0;
    }
};

