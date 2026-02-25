// var pool = [100, 200, 500, 1000, 5000, 10000, 20000, 50000, 100000, 200000, 500000];
var pool = [100, 200, 500, 1000, 5000, 10000, 20000, 50000, 100000, 200000, 500000];
var bet = 1000;
var stock = 1;
//
// var kq  = 0;
// var count = 1000000;
// var cz = 0;
// for(var i = 0 ; i < count ;i ++){
//     var k =getRandom();
//     kq+=k;
//     if(k == 0 ){
//         cz++;
//     }
// }
// console.log(count,kq,kq/count,cz/count);
// function getRandom() {
//     var ratio = [];
//     for(var i = 0; i < pool.length;i++){
//         ratio.push(bet/pool[i]);
//     }
//     var r2 = [];
//     var sr = 0;
//     for(var i = 0; i < ratio.length;i++){
//         sr += ratio[i];
//     }
//     for(var i = 0; i < ratio.length;i++){
//         r2.push(ratio[i]/sr);
//     }
//     var preR = 0;
//     for(var i = 0; i < r2.length;i++){
//         r2[i] = r2[i]+preR;
//         preR = r2[i];
//     }
//     var rnd = Math.random();
//     var pickRatio = 0;
//     for(var i = 0; i < r2.length;i++){
//         if(rnd < r2[i]){
//             pickRatio = i;
//         }
//     }
//     rnd = Math.random();
//     if(rnd < ratio[pickRatio]){
//         return pool[pickRatio];
//     }
//
//     return 0;
// }

// function leastCommonMultiple(arr) {
//
//
//     function gcd(a, b) {
//         return !b ? a : gcd(b, a % b);
//     }
//
//     function lcm(a, b) {
//         return (a * b) / gcd(a, b);
//     }
//
//     var multiple = arr[0];
//     arr.forEach(function(n) {
//         multiple = lcm(multiple, n);
//     });
//
//     return multiple;
// }
// function sumArray(arr) {
//     var s = 0 ;
//     for(var i = 0 ; i < arr.length;i++){
//         s += arr[i];
//     }
//     return s;
// }
//
// function doIt() {
//     var weight = sumArray(pool);
//     //var wb = leastCommonMultiple(pool.concat(weight));
//     var wb = weight;
//     var ratio = [];
//     var sumR = 0;
//     for(var i = 0 ; i < pool.length;i++){
//         sumR += wb/pool[i];
//        ratio.push(wb/pool[i]);
//     }
//     console.log(ratio);
//     console.log(sumR);
//     return 0 ;
// }
//
// // var count = 1;
// var count = 1;
// var total = 0;
//
// for(var i = 0 ; i < count;i++){
//     total+=doIt();
// }
// var test = pool.concat([sumArray(pool)]);
// console.log(total,count,total/count);
// console.log(leastCommonMultiple(test));

// var lowPool = [];
// var hiPool = [];
// //gen low/hi pool
// for (var i = 0; i < pool.length; i++) {
//     if(pool[i] > bet){
//         hiPool.push(pool[i]);
//     }else{
//         lowPool.push(pool[i]);
//     }
// }
// var lowWe = 0;
// var hiWe = 0;
// for(var i = 0 ;i < lowPool.length;i++){
//     lowWe += lowPool[i];
// }
// for(var i = 0 ;i < hiPool.length;i++){
//     hiWe += hiPool[i];
// }
// var avgLowWe = lowWe/lowPool.length;
// var avgHiWe = hiWe/hiPool.length;
// var lowR  = bet/avgLowWe;
// var hiR  = bet/avgHiWe;
//
// var totalR = lowR+hiR;
// lowR = lowR/totalR;
// hiR = hiR/totalR;
//
//
//
// function doIt() {
//     var rnd = Math.random();
//     if(rnd < lowR){//Low ase
//         return fairPick(lowPool);
//     }else{// High Case
//         console.log("hi");
//         return fairPick(hiPool);
//     }
// }

// function getTotalW() {
//     var total = 0;
//     for (var i = 0; i < pool.length; i++) {
//         total += pool[i];
//     }
//     return total;
//
// }
//
// function getAvgPool() {
//     var total = 0;
//     for (var i = 0; i < pool.length; i++) {
//         total += pool[i];
//     }
//     return total / pool.length;
//
// }
//
// function getRatioPool() {
//     var w = getTotalW();
//     var pr = [];
//     var rr = 0;
//     for (var i = 0; i < pool.length; i++) {
//         var r = w / pool[i];
//         rr += r;
//     }
//     for (var i = 0; i < pool.length; i++) {
//         var r = w / pool[i];
//         pr.push(r / rr);
//     }
//     return pr;
// }
//
// var avgW = getAvgPool();
// var ratio = avgW / bet;
// var estW = getTotalW() * ratio;
// var rt = 0;
// var rr = genRatio();
//
// function genRatio() {
//     var rr = [];
//     var preR = 0;
//     for (var i = 0; i < pool.length; i++) {
//         rt += (+estW / pool[i]);
//     }
//     for (var i = 0; i < pool.length; i++) {
//         var r = estW / pool[i] + preR;
//         rr.push(r);
//         preR = r;
//     }
//     return rr;
// }
//
// function doIt() {
//     var rnd = Math.random() * rt;
//     for (var i = 0; i < pool.length; i++) {
//         if(rnd < rr[i] ){
//            return pool[i];
//         }
//     }
//
//
// }
//
// var count = 1000000;
//
// var rs = worker(count,doIt);
// console.log(count,rs,rs/count);
//
// function worker(count, fn) {
//     var total = 0;
//     for (var i = 0; i < count; i++) {
//         total += fn();
//     }
//     return total;
// }

// function getAvgPool(p) {
//     var total = 0;
//     for (var i = 0; i < p.length; i++) {
//         total += p[i];
//     }
//     return total / p.length;
//
// }
//
// function calcPickItem(newPool,pool,avgTarget) {
//     var i = Math.floor(Math.random()*newPool.length);
//     if(avgTarget < getAvgPool(newPool.concat([newPool[i]]))){
//         newPool.push(newPool[i]);
//     }
// }
//
//
//
// function findPool() {
//     var maxPool = pool[pool.length-1]/pool[0];
//     var avgTarget = bet*stock;
//     var tmp = pool.slice(0,pool.length);
//     var preAvg = 0;
//     for(var i = 0 ; i < maxPool;i++){
//         var avg = getAvgPool(tmp);
//         preAvg = avg;
//         if(avg > avgTarget ){ // cần add thêm
//             calcPickItem(tmp,pool,avgTarget);
//         }else{
//             break;
//         }
//         if(i == maxPool-1){
//             console.log("max pool");
//         }
//     }
//     return tmp;
// }
//
// var newPool = findPool();
//
// // anaPool(newPool);end();
//
// function anaPool(newPool) {
//     var minPool = pool[0];
//     var ratio = [];
//     for(var i = 0 ; i < pool.length;i++){
//         ratio.push(pool[i]/minPool);
//     }
//     console.log(getAvgPool(ratio));
// }
//
// function doIt() {
//     var i = Math.floor(Math.random()*newPool.length);
//     return newPool[i];
// }
//
// var count = 1000000;
//
//
// var rsPool = [];
// for(var i = 0 ; i <  pool.length;i++){
//     rsPool[pool[i]] = 0;
//
// }
// var rs = worker(count,doIt);
// console.log(count,rs,rs/count,getAvgPool(newPool));
//
// function worker(count, fn) {
//     var total = 0;
//     for (var i = 0; i < count; i++) {
//         var kq = fn();
//         total += kq;
//         rsPool[kq]++;
//     }
//     return total;
// }
//
// for(var i = 0 ;i < rsPool.length;i++){
//     if(rsPool[i] >= 0){
//         console.log(i,rsPool[i]);
//     }
// }
//
// function end() {
//     process.exit(0);
// }

function GetChannelID(ChannelID) {
    if(ChannelID == +ChannelID){
        return +ChannelID;
    }
    return 0 ;
}
var av1 = 0;
var av2 = 0;
var low = [];
var hi = [];
var sumLowPool = 0;
var sumHiPool = 0;
var tttt = 0;
for(var i = 0 ; i < pool.length;i++){
    tttt += pool[i];
}
console.log(tttt/pool.length)
var xR = splitPoolByVal(pool, bet);
var est1 = (xR)*av1;
var est2 = (1-xR)*av2;

//# tai sao est1 + est2 ko = 1000 ??????.
console.log(xR,av1,av2,">>",est1,est2,est1+est2);
// console.log("================");
//console.log(sumLowPool,sumHiPool,av1,av2);

function splitPoolByVal(pool, val) {

    var sumLow = 0;
    var sumHi = 0;
    var a = 0;
    for (var i = 0; i < pool.length; i++) {
        a = pool[i];
        if (a <= val) {
            sumLow += a;
            low.push(a);
        } else {
            sumHi += a;
            hi.push(a);
        }
    }
    sumLowPool = sumLow;
    sumHiPool = sumHi;
    av1 = sumLow/low.length;
    av2 = sumHi/hi.length;
    //richPool(hi, sumHi);
    var avgLow = sumLow / low.length;
    var avgHi = sumHi / hi.length;
    var lowRatio = getRatioByPool(avgLow, val);
    var hiRatio = getRatioByPool(avgHi, val);
    return getXRatio(val*stock, avgLow, avgHi)

}

function richPool(p, total) {
    var avg = total / p.length;
    var lowest = getMin(p);
    var ratioList = [];
    var sumMul = 0;
    for (var i = 0; i < p.length; i++) {
        ratioList.push(p[i] / lowest);
        sumMul += p[i] / lowest;
    }
    var newPool = [];
    var c = ratioList.length-1; ;
    for(var i = 0 ; i < ratioList.length;i++){
        for(var j = 0 ; j < ratioList[i];j++){
            newPool.push(p[c]);
        }
        c--;
    }

    return newPool;

}

function getMin(p) {
    return p[0];
}

function getXRatio(stock1, ratioLow, ratioHi) {
    return (stock1-ratioHi)/(ratioLow-ratioHi);
}

function getRatioByPool(avg, val) {
    return val / avg;
}

function doIt() {
    var rnd = Math.random();
    if (rnd < xR) {
        var i =  Math.floor(Math.random()*low.length);
        return +low[i];
    }
    var i =  Math.floor(Math.random()* hi.length);
    return +hi[i];
}

var rsPool = [];

for(var i = 0 ; i <  pool.length;i++){
    rsPool[pool[i]] = 0;

}

var count = 10000000;
hi = richPool(hi, av2);
var rs = worker(count, doIt);
console.log(count, rs, rs / count);

function worker(count, fn) {
    var total = 0;
    for (var i = 0; i < count; i++) {
        var kq = fn();
        total += kq;
        rsPool[kq]++;
    }
    return total;
}

for(var i = 0 ; i < rsPool.length;i++){
    if(typeof rsPool[i] != 'undefined'){
        console.log(i,rsPool[i],rsPool[i]/count);
    }
}