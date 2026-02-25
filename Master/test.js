console.log(require.resolve('../Config/Master'));
var config = require('../Config/Master');
var LogRecorder = require('./Modules/LogRecorder');
var RedisAdapter = require('./Modules/RedisAdapter/RedisAdapter');
config.LogRecorderConfig.connectionLimit = 2;
LogRecorder.Init(config.LogRecorderConfig,console);
RedisAdapter.Init(0,config.RedisConfig,console);
setTimeout(function () {
    doIt();
},1000);


function doIt() {
    var query = 'select UserID,SUM(`UserPayMoney`) as Score from listfishdie_log_2018_10_18 where `UpdateTime` > \'2018-10-18 14:00:00\' and `UpdateTime` < \'2018-10-18 18:00:00\' group by UserID order by Score';
    LogRecorder.queryRaw(query,function (e,d) {
        if(!e){
            for(var i = 0 ; i < d.length;i++){
                var obj = d[i];
                var uid = obj.UserID || 0;
                var score = obj.Score || 0;
                if(uid >0 && score > 0){
                    RedisAdapter.zIncrby('EVL:SeaHunter:Data', score, uid);
                }


            }
        }
    });
}