/**
 * Created by Ngoc on 24-03-2018.
 */
var Utility = require('../SharedModule/Utility');
var fs = require('fs');
var a = [{
    id: 1,
    data: genVeryLongData()
}, {
    id: 2,
    data: genVeryLongData()
}, {
    id: 3,
    data: genVeryLongData()
}, {
    id: 4,
    data: genVeryLongData()
}];
recordMemory('BFT');
test();
setInterval(function () {
    //console.log(a);
    recordMemory('BGC');
    // console.log('Garbage collection');
    // console.log(a);
    // recordMemory('BGC');
    // if (global.gc) {
    //     global.gc();
    //     recordMemory('AGC');
    // } else {
    //     console.log('Garbage collection unavailable.  Pass --expose-gc '
    //         + 'when launching node to enable forced garbage collection.');
    // }
}, 10000);

function test() {
    recordMemory('BIT');
    requestData(function (data) {
        a.push(data[2]);
    });
    recordMemory('AIT');
}

function requestData(callback) {
    var sampleData = [];
    for (var i = 5; i < 1000; i++) {


        sampleData.push(
            {
                id: i,
                data: genVeryLongData()
            }
        )
    }
    callback(sampleData);
}

function genVeryLongData() {
    var data = Utility.GetUUID();
    for (var i = 0; i < 1000;i++) {
        data += Utility.GetUUID();
    }
    return data;
}

function recordMemory(text) {
    text+='\t\t\t'+JSON.stringify(process.memoryUsage());
    //console.log(text);
    fs.appendFileSync('gc.txt',text+'\r\n');
}