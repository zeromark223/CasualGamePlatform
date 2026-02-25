Object.defineProperty(global, '__stack', {
    get: function () {
        var orig = Error.prepareStackTrace;
        Error.prepareStackTrace = function (_, stack) {
            return stack;
        };
        var err = new Error;
        Error.captureStackTrace(err, arguments.callee);
        var stack = err.stack;
        Error.prepareStackTrace = orig;
        return stack;
    }
});
var rootFile = __stack[0].getFileName();
var desk = require('./DeskCoreTest');

var deskCore = new desk();
deskCore.GenCardPool();
var count = 1000000;
// var count = 10;
var rs = {};
for (var i = 0; i < count; i++) {
    var t = deskCore.CalcResult();
    if (t == 0) {
        rs[-1] = (rs[-1] || 0) + 1
    } else {
        rs[t.ID] = (rs[t.ID] || 0) + 1
    }

}
var kqText = '';
for (var key in rs) {
    switch (key) {
        case '-1':
            kqText += 'miss' + '\t' + rs[key] + '\r\n' ;
            break;
        case '0':
            kqText += 'TPSJ' + '\t' + rs[key] + '\r\n' ;
            break;
        case '1':
            kqText += 'TPS' + '\t' + rs[key] + '\r\n' ;
            break;
        case '2':
            kqText += 'TuQuy' + '\t' + rs[key] + '\r\n' ;
            break;
        case '3':
            kqText += 'Culu' + '\t' + rs[key] + '\r\n' ;
            break;
        case '4':
            kqText += 'Thung' + '\t' + rs[key] + '\r\n' ;
            break;
        case '5':
            kqText += 'Sanh' + '\t' + rs[key] + '\r\n' ;
            break;
        case '6':
            kqText += 'Sam' + '\t' + rs[key] + '\r\n' ;
            break;
        case '7':
            kqText += 'HaiDoi' + '\t' + rs[key] + '\r\n' ;
            break;
        case '8':
            kqText += 'DoiJ' + '\t' + rs[key] + '\r\n' ;
            break;

    }
}
console.log(rs);
console.log(kqText);
