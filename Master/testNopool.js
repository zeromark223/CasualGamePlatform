var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : '192.168.0.223',
    user     : 'root',
    password : '123456',
    database : 'bc68_log'
});
connection.connect();
var exe = 0;
var complete = 0;
var error = 0;
var countTest = 1000;
var startTime = + new Date();
var max = 10000;
//mysql.Init(config.SQLConfig,console);

setTimeout(function () {
    setInterval(check,1000);
},1000);
setInterval(summary,1000);
function check() {
    if(max < 0)return;
    max--;
    for(var i = 0 ; i < countTest ;i++)
    {
        worker() ;
    }
}
function worker() {
    // mysql.onlineAwardCheck(264445,function (e,d) {
    //    console.log(e,d);
    // })
    exe++;

    connection.query("insert into login_log_2018_10_09(UserID,Token,CreateDate,IP,ServerID,ChannelID,ProviderID,PlatformID)\n" +
        "values(0,\'tokentest\',now(),\'127.0.0.1\',0,0,0,0);", function (e, results, fields) {
            complete++;
            if(e){
                error++;
                console.log(e);
            }
    });



    // mysql.loginLoggingTest(0,'tokentest',new Date(),'127.0.0.1',0,0,0,0,function(e,d){
    //     complete++;
    //     if(e){
    //         error++;
    //         console.log(e);
    //     }
    // });
}

function worker2() {
    //onlineAwardCheck
    exe++;
    var uid = Math.floor(Math.random()*100000);
    mysql.onlineAwardCheckTest(uid,function(e,d){
        complete++;
        if(e){
            error++;
            console.log(e);
        }
    });
}

function summary() {
    var handle = exe-complete;
    var dif =+ new Date() - startTime;
    var pef = dif/complete;
    var pef2 = complete/(dif/1000);
    console.log(exe,complete,error," H :",handle,"pef : ",pef,pef2);
}
