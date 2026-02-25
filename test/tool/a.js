var fs = require('fs');
var name = fs.readFileSync('./fileName').toString();
var win = fs.readFileSync('./fileWin').toString();
var score = fs.readFileSync('./fileSocre').toString();
var aa = fs.readFileSync('./aa').toString();

aa = aa.split('\r\n');
var nameArr = [];
var time = 0;
for(var i = 0 ; i < aa.length;i++){
    if(i%2 == 0){
        time = aa[i];
    }else{
        var obj = aa[i].split(',');
        nameArr.push({
            time:time,
            gold:obj[2]
        })
    }


}

nameArr.sort(function (a,b) {
    if (timeCompare(a.time,b.time))
        return -1;
    else {
       return 1;
    }

});

function timeCompare(a,b) {
   return +new Date('2018-09-17 '+a) < +new Date('2018-09-17 '+b);
}
var str = '';
for(var i = 0 ; i < nameArr.length;i++){
    str += nameArr[i].time+'\t'+nameArr[i].gold+'\r\n';
}
fs.appendFileSync('dt.txt',str);
//console.log(nameArr);