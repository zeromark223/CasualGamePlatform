var fs = require('fs');
var logs = fs.readdirSync('./log');
var data = '';
for(var i = 0 ; i < logs.length;i++){
    data += fs.readFileSync('./log/'+logs[i]).toString() +"\r\n";
}
var filter = 'wallet';
var filter2 = 'call';
var f1 = 'wallet_RefundMoneyV2';
var f2 = 'wallet_ChargeAllV2';
data = data.split('\n');

var kq = '';
var kq1 = '';
var kq2 = '';

for(var i = 0 ; i < data.length;i++){
    if(data[i].indexOf(filter) > -1 && data[i].indexOf(filter2) > -1){
        if(data[i].indexOf(f1) > -1){
            kq1 += data[i] + '\r\n';
        }else{
            if(data[i].indexOf(f2) > -1){
                kq2 += data[i] + '\r\n';
            }   else{
                kq += data[i] + '\r\n';
            }
        }

    }
}
// get userid
kq = kq.split('\r\n');
kq1 = kq1.split('\r\n');
kq2 = kq2.split('\r\n');

kq1=getUid(kq1);
kq2=getUid(kq2);
kq=getUid(kq);

function getUid(kq) {
    var start = '(';
    var end = ',';
    var s=0;
    var e=0;
    var k = [];
    for(var i = 0 ;i < kq.length;i++){
        s = kq[i].indexOf(start)+1;
        e = kq[i].indexOf(end);
        var t =  kq[i].slice(s,e);
        if(k.indexOf(t) == -1){
            k.push(t);
        }
    }
    return k.join(',');
}

fs.writeFileSync('kq.txt',kq);
 fs.writeFileSync('kq1.txt',kq1);
 fs.writeFileSync('kq2.txt',kq2);