var sqlAdapter = require('../GameServer/Modules/LogRecorder');
var config = {
    connectionLimit:10,
    host: 'ngocnpt.ddns.net',
    port:2204,
    user: 'root',
    password: '123456',
    database: 'bc68_log'
};
sqlAdapter.Init(config,console);
setTimeout(start,1000);

function start() {
    if(sqlAdapter.getStatus()){
        var cols = [ 'KindID',
            'MoneyChange',
            'MoneyIn',
            'MoneyOut',
            'ServerId',
            'TimeIn',
            'TimeOut',
            'UserID'];
        var vals = [1,100,200,300,1,new Date(),new Date(),12345];
        sqlAdapter.insertTable('outgame_log',cols,vals,function (e,data) {
           console.log(e,data);
        });
    }else{
        setTimeout(start,1000);
    }
}



// var cols = ['KindID',
//     'MoneyChange',
//     'MoneyIn',
//     'MoneyOut',
//     'ServerId',
//     'TimeIn',
//     'TimeOut',
//     'UserID'];
// var vals = [1, 100, 200, 300, 1, new Date(), new Date(), 12345];
// this.LogRecorder.insertTable('outgame_log', cols, vals, function (e, data) {
//     console.log(e, data);
// });