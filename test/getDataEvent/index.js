//207.148.70.234:9998
//TEdidboxWivjon4
const clipboardy = require('clipboardy');
var redis = require('redis');
var mysql = require('mysql');
var Logger = console;
var client = redis.createClient({//sunday 234 ||
    host: '207.148.70.234',
    port: 9998,
    password: 'TEdidboxWivjon4',
    db: 0
});
var pool = mysql.createPool({//sunday 234 ||
    connectionLimit:10,
    host: '207.148.70.234',
    port:9997,
    user: 'root',
    password: 'gclub@231*#',
    database: 'bc68'
});

pool.getConnection(function (err, con) {

});
setTimeout(function () {
    getTopRedis();
},2000);


function getTopRedis() {
    client.zrevrange("EVL:KingOfTheSea:Data",0,49,'withscores',function (e,d) {
        if(!e){
            console.log(d);
            var top = [];
            var uid = 0;
            var ListUserID = [];
            for(var i = 0 ; i < d.length;i++){
                if(i%2 == 0){
                    uid = d[i];
                    ListUserID.push(uid);
                }else{
                    top.push({
                        uid:uid,
                        name:''+uid,
                        score:d[i]
                    });
                }
            }
            getNameByRange(ListUserID,top);
        }
    });
}
function getNameByRange(ListUserID,top) {
    var tableName = 'user';
    var sqlQuery = 'SELECT UserID,GameName FROM ' + tableName +
        ' WHERE UserID in(' +ListUserID.join(',') + ' ) ';
    queryRaw(sqlQuery, function (e, r) {
        if(!e){
            for(var i = 0 ; i < r.length;i++){
                for(var j = 0 ; j < top.length;j++){
                    if(top[j].uid == r[i].UserID){
                        top[j].name = r[i].GameName;
                        break;
                    }
                }
            }
            var str = '';
            for(var i = 0; i< top.length;i++){
                str += top[i].uid+'\t'+top[i].name+'\t'+       top[i].score  +'\r\n';
            }
            console.log(str);
            clipboardy.writeSync(str);
        }
    });
}

function queryRaw(sqlQuery, callback) {
    try {
        pool.getConnection(function (err, con) {
            try {
                if (!err) {
                    con.query({
                        sql: sqlQuery,
                        timeout: 40000 // 40s
                    }, function (error, results, fields) {
                        try {
                            con.release(); // release connection
                            if (!error) {
                                callback(error, results, fields);
                            } else {
                                callback(error);
                                Logger.error(sqlQuery, error, results, fields);
                            }
                        } catch (e3) {
                            callback(e3.stack);
                            Logger.error(sqlQuery, e3.stack);
                        }

                    });
                } else {
                    callback(err);
                    Logger.error(sqlQuery, err);
                }
            } catch (e2) {
                callback(e2.stack);
                Logger.error(sqlQuery, e2.stack);
            }
        });
    } catch (e) {
        callback(e.stack);
        Logger.error(sqlQuery, e.stack);
    }
}