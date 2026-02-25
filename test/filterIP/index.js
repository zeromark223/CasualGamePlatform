var fs = require('fs');
var iplist = fs.readFileSync('./listip.txt').toString();
var ips = iplist.split('\n');
var ipUni = [];
for(var i = 0 ; i < ips.length;i++){
    var ip = ips[i].split(':')[0];
    if(ipUni.indexOf(ip) == -1){
        ipUni.push(ip)
    }
}

console.log(ipUni.length);

