const path = require('path');
var rl = require('readline');
var encrytion = require('../SharedModule/encrytion');

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
const root = path.dirname(rootFile) + path.sep;

Object.defineProperty(global, '__line', {
    get: function () {
        return __stack[1].getLineNumber();
    }
});

Object.defineProperty(global, '__function', {
    get: function () {
        return __stack[1].getFunctionName();
    }
});
Object.defineProperty(global, '__endian', {
    get: function () {
        return true;//Litte endian
    }
});

Object.defineProperty(global, '__root', {
    get: function () {
        return root;//Litte endian
    }
});
var server = {
    ReelConfig: require('../Config/SlotTuLongThan/ReelConfig'),
    GetMatchID: function () {
        return 1;
    },
    AddStock: function () {
        return 1;
    },
    JackpotAdd: function () {
        return 1;
    },
    RecordBetting: function () {

    },
    GetReelByStock: function () {
        //return require('../Config/SlotTuLongThan/ReelConfig').EasyReel;
        var rand = Math.random();
        var x = (-getStock() + 1.5) / 0.6;
        if (rand < x) {
            return require('../Config/SlotTuLongThan/ReelConfig').NormalReel;
        } else {
            return require('../Config/SlotTuLongThan/ReelConfig').EasyReel;
        }
    },
    Logger: {
        Game: function () {
            return console
        }
    },
    SendSocketBinary: function () {

    },
    RecordResult: function () {

    },
    AddUserWinHistory: function () {

    },
    AddTopBigWin: function () {

    },
    JackpotGetAndSet: function () {
        
    },
    RecordBigWin : function () {

    },
    GetRuleJackpot5Any : function () {
        return 1;
    }
};
var test = require('./Desk/DeskCore');
test = new test();
var line = 25;
//var count = 1;
var count = 1*1000*1000;
// var totalBet = count*line;
test.Init(server, 1);
test.totalwin = 0;
test.freespin = 0;
test.bonus = 0;
var user = {BonusMiniGameTicket: 0};
for (var i = 0; i < count; i++) {
    test.RollForUser(user, line, 0);
}
test.GetReelByStock = function () {
    return require('../Config/SlotTuLongThan/ReelConfig').EasyReel;
};
for (var i = 0; i < test.freespin; i++) {
    test.RollForUser(user, line, 0);
}


function getStock() {
    return 0.965
}
var obj = test.SummaryReel();


for (var i = 0; i < obj.CollectData.length; i++) {
    var kq = "";
    for (var j = 0; j < obj.CollectData[i].length; j++) {
        kq += "\t" + obj.CollectData[i][j];
    }
    console.log(i + kq);
}
console.log("Sum", "\t", count);
console.log("Win", "\t", obj.CollectDataTotalWin);
console.log("Ratio ", "\t", obj.CollectDataTotalWin /count/ 25);
// return this.CollectDataTotalWin;
// console.log(test.totalwin, test.totalwin / (count * line), (test.totalwin + test.bonus) / (count * line));
// console.log();
// var totalWin = test.SummaryReel();
// console.log("Ratio ",totalWin/totalBet);

// var redis = require('../Config/Common/RedisConfig');
// var ra = require('../SlotTuLongThan/Modules/RedisAdapter/RedisAdapter');
// ra.Init(0,redis,console);
// ra.getAndSet("NgocTest",500000,function (e,d) {
//     console.log(e,d);
// });
//
//
// Main.prototype.GetReelByStock = function () {
//     var rand = Math.random();
//     var  x = (-this.GetStockRatio+1.5)/0.6;
//
//     if(rand < x){
//         return this.ReelConfig.NormalReel;
//     }else{
//         return this.ReelConfig.EasyReel;
//     }
// };