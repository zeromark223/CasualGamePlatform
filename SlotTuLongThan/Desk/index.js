/*{"build":1}*/
var path = require('path');
module.exports.GetDeskByKind = function (roomKind,sk,s4,SmartRequire) {
    var rootFile = __stack[0].getFileName();
    switch (roomKind) {
        case 401: //Tự do
        case 402: //Tự do
        case 403: //Tự do
            var RoomFree = SmartRequire(rootFile.replace(path.basename(rootFile),'DeskFree.js'),sk,s4);
            return RoomFree(SmartRequire(rootFile.replace(path.basename(rootFile),'DeskCore.js'),sk,s4));
        default:
            return 0;
    }
};

