// // var min = 0.5;
// // var max = 50000;
// // var stockRatio = 1;
// // var ItemCount = 14-1;
// // var line = 3;
// // var col = 5;
// // var fullLine = 25*1000*1000*1000;
// // //var pool = [1,1,3,5,5,5,7,8,8,10,10,10,15,20,20,20,25,25,30,40,40,50,50,75,75,75,100,100,100,120,150,250,500,888,8888];
// //  //var pool = [2,10];
// // var pool = [8888,888,500,250,150,120,100,100,100,75,75,75,50,50,40,40,30,25,25,20,20,20,15,10,10,10,8,8,7,5,5,5,3,1,1];
// // var tracking = [];
// //  // var pool = [10000,1000];
// // var sum = 0;
// // tracking[0] =0;
// // for(var i = 0; i < pool.length;i++){
// //     sum+=pool[i];
// //     tracking[pool[i]] = 0;
// //
// // }
// // var bet = 10;
// // var totalBet = bet*fullLine;
// // var totalWin = 0;
// // var count = 0;
// // for(var i = 0 ; i < fullLine;i++){
// //     totalWin += rolling(bet);
// // }
// // console.log("totalBet",totalBet);
// // console.log("totalWin",totalWin);
// // console.log("rate ",totalWin/totalBet);
// // console.log("count",count);
// // //console.log("tracking",tracking);
// //
// // function rolling(bet) {
// //
// //     var pre = 0;
// //     var rand = Math.random();
// //     var picked = Math.floor(Math.random()*pool.length-1)+1;
// //     var index = picked;
// //     picked = pool[picked];
// //
// //     //tracking[picked]++;
// //     var ratio = getRatio(picked,pre);
// //     if(rand<=ratio*stockRatio){
// //         //console.log(picked);
// //         return picked*bet;
// //     }
// //
// //     return 0;
// // }
// //
// //
// // function getRatio(mul,pre) {
// //     //console.log(pre,mul,(1/mul),(1/mul)*(1-pre));
// //     return (1/mul)*(1-pre);
// // }
// //
// // //3 10
// // //3j
// // //3rd
// var winConfig = [
//     {
//         id: 1,
//         values: [8, 888, 8888]
//
//     },
//     {
//         id: 11,
//         values: [20, 120, 500]
//
//     },
//     {
//         id: 12,
//         values: [15, 100, 250]
//
//     },
//     {
//         id: 13,
//         values: [10, 75, 150]
//
//     },
//     {
//         id: 14,
//         values: [8, 50, 100]
//
//     },
//     {
//         id: 15,
//         values: [5, 40, 75]
//
//     },
//     {
//         id: 16,
//         values: [5, 40, 75]
//
//     },
//     {
//         id: 17,
//         values: [3, 20, 50]
//
//     },
//     {
//         id: 18,
//         values: [1, 10, 30]
//
//     },
//     {
//         id: 19,
//         values: [1, 7, 25]
//
//     }
// ];
// var pool = [];
//
// for (var i = 0; i < winConfig.length; i++) {
//     for (var j = 0; j < winConfig[i].values.length; j++) {
//         pool.push(winConfig[i].values[j]);
//     }
// }
// var engine = require('../../SlotTuLongThan/Desk/Engine');
// //var count = 25 * (1000 * 1000*0)+1 ;
// var count = 1  ;
// var line = 25  ;
// var win = 0;
//
// for(var i = 0 ;i <count;i++ ){
//     demo1shot(winConfig);
// }
// function demo1shot(winCfg) {
//     var testConfig = cloneArray(winCfg);
//     var winList = [];
//     for (var i = 0; i < line; i++) {
//         //var rate = engine.SlotRollingByRule(1, pool);
//         var rate = engine.SlotRollingByRule2(1, testConfig);
//         if(typeof rate != 'undefined'){
//             var find = findAndRemoveArray(testConfig,'id',rate.id);
//
//             win += rate.value;
//             winList.push(find);
//         }
//     }
//     console.log("winList ",winList);
//
// }
//
//
//
// function cloneArray(array) {
//     var newArray = [];
//     for(var i = 0 ; i < array.length;i++ ){
//         newArray.push(array[i]);
//     }
//     return newArray;
// }
//
// function findAndRemoveArray(array,property,value) {
//     for(var i = 0 ; i  < array.length;i++  ){
//         if(array[i][property] == value){
//             var find = array[i];
//             array.splice(i,1);
//             return find;
//         }
//     }
// }
//
// console.log("Win bet 1: ", win, win / count/line);
//
// function findBetMatchingRs(winRate) {
//     for (var i = 0; i < winConfig.length; i++) {
//         for (var j = 0; j < winConfig[i].values.length; j++) {
//             pool.push(winConfig[i].values[j]);
//         }
//     }
// }
var c = [];
var a = c[2] || 0;
console.log(a);
var server = {
    ReelConfig:require('../../Config/SlotTuLongThan/ReelConfig')
};
var test = require('../../SlotTuLongThan/Desk/DeskCore');
test = new test();
test.Init(server,1)
//test.RollForUser({},250,0);