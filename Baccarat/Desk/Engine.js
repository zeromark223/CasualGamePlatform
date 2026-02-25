var Utility = require('../../SharedModule/Utility');
var maxLen = 0;
exports.SlotRollingByReel = function (reel,row,col) {
    var rs = [];
    for(var i = 0 ;i < col;i++){
        rs = rs.concat(arrayGetCycleRandByCount(reel[i],row));
    }
    return rs;
};

exports.SlotRollingByRulex = function (stockRatio, pool) {
    var rand = Math.random();
    var picked = Math.floor(Math.random() * pool.length - 1) + 1;
    picked = pool[picked];

    var ratio = getRatio(picked);
    if (rand <= ratio * stockRatio) {
        return picked;
    }
    return 0;
};

exports.SlotRollingByRule = function (stockRatio, winConfig) {
    if(winConfig.length <= 0)return;
    var rand = Math.random();
    var picked = winConfig[randomBetween(0, winConfig.length - 1)];
    if(!Utility.CheckVariable(picked)){
        return;
    }
    if(!Utility.CheckVariable(picked.values)){
        return
    }
    if(!Utility.CheckVariable(picked.count)){
        return
    }
    var index = randomBetween(0, picked.values.length - 1);
    var value = picked.values[index] || 0;
    var count = picked.count[index] || 0;
    var ratio = getRatio(value) || 0;
    if (rand <= ratio * stockRatio) {
        return {
            id: picked.id,
            win: value,
            count: count
        };
    }
};

exports.MakeReel3Row5Col = function (WinList, WinConfig) {
    checkMaxLeng(WinList);
    //Tạo mảng KQ
    var rs = [];
    var col = 5;
    var row = 3;
   for(var i =  0 ; i < WinList.length;i++){

   }
};

function arrayGetCycleRandByCount(array,count) {
    var index = randomBetween(0,array.length-1);
    var rs = [];
    for(var i = index;i < index+count;i++){
        if(i >= array.length){
            rs.push(array[i-array.length]);
        }else{
            rs.push(array[i]);
        }
    }
    return rs;
}

function checkMaxLeng(WinList) {
    if(WinList.length > maxLen){
        maxLen =  WinList.length;
        console.log(">>> ",WinList);
    }
}
function checkDup(WinList) {
    for(var i =  0 ; i < WinList.length;i++){
        var count = findIt(WinList, 'id', WinList[i].id);
        if(count>1){
            console.log("dcmm ",WinList);
            process.exit(0);
        }
    }
}
function findIt(array, property, value) {
    var count = 0;
    for (var i = 0; i < array.length; i++) {
        if (array[i][property] == value) {
            count++;
        }
    }
    return count;
}
function randomWild() {
   return Math.random() < 0.2;
}

function getRatio(mul) {
    return (1 / mul);
}

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}