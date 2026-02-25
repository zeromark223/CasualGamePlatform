var fs = require('fs');
var name = fs.readFileSync('./fileName').toString();
var win = fs.readFileSync('./fileWin').toString();
var score = fs.readFileSync('./fileSocre').toString();
 name = name.split('\r\n');
// win = win.split('\r\n');
//
 var nameArr = [];
for(var i = 0 ; i < name.length;i++){
    var obj = name[i].split(',');
    //console.log(obj[0]);
    nameArr.push({
        uid:obj[0],
        name:obj[1],
        acc:obj[2]
    })
}
//
// var winArr = [];
// for(var i = 0 ; i < win.length;i++){
//     var obj = win[i].split(',');
//     winArr.push({
//         uid:obj[0],
//         gold:obj[1]
//     })
// }
// for(var i = 0 ; i < winArr.length;i++){
//     winArr[i].Name = find(winArr[i].uid);
//     console.log(winArr[i].Name,"\t",winArr[i].gold)
// }
//
function find(uid,score) {
    for(var i = 0 ; i < nameArr.length;i++){
        if(nameArr[i].uid == uid)return nameArr[i].uid+'\t'+nameArr[i].name+'\t'+nameArr[i].acc+'\t'+score
    }
    return 0;
}
//
// //console.log(winArr);

score = score.split('\r\n');
var p = [];
var uid = 0;
var s = 0;
var str = '';
for (var i = 0; i < score.length; i++) {
    if (i % 2 == 0) {
        uid = score[i];

    } else {
        s = score[i];
        str+=find(uid,s)+'\r\n';
    }
}

console.log(str);
//console.log(p);