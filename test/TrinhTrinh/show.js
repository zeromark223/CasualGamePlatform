var fs = require('fs');
var rs = fs.readFileSync('rs.txt');

rs = JSON.parse(rs.toString());
var rss = [];
for(var i =0 ;i < rs.length;i++){
    if(rs[i].status != 0){
        rss.push(rs[i]);
    }
}
fs.appendFileSync('rs.txt',JSON.stringify(rss));