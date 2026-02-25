var redis = require('redis');
var redisConfig = {
    Host: 'login.ifish.online',
    Port: 9998,
    //Password: 'xWiediEdidrsbojon4T'
};
var isConnected = false;
var client = redis.createClient({
    host: redisConfig.Host,
    port: redisConfig.Port,
    password: redisConfig.Password,
    db: redisConfig.DB
});

client.on("connect", function () {
    console.log("Redis is ready, task delay 5000 ms");
    isConnected = true;
    setTimeout(function () {
        InitCompleted();
    }, 5000);

});

client.on('error', function (e) {
    console.log("Redis error", e);
});
client.on('disconnect', function (e) {
    console.log("Redis disconnect");
});


function InitCompleted() {
    var data = "13035,800000\n" +
        "34813,200000\n" +
        "81119,200000\n" +
        "107599,500000\n" +
        "117752,200000\n" +
        "171189,400000\n" +
        "178974,500000\n" +
        "213476,1000000\n" +
        "217758,200000\n" +
        "254466,500000\n" +
        "289737,200000\n" +
        "298473,700000\n" +
        "397968,200000\n" +
        "429312,200000\n" +
        "482388,500000\n" +
        "513780,200000\n" +
        "562712,200000\n" +
        "737315,2000000\n" +
        "768527,200000\n" +
        "778171,200000\n" +
        "796490,400000\n" +
        "832546,200000\n" +
        "839119,200000\n" +
        "857676,1500000\n" +
        "886367,200000\n" +
        "972491,200000\n" +
        "985926,200000\n" +
        "986960,2200000\n" +
        "990971,200000\n" +
        "1035440,1000000\n" +
        "1152401,200000\n" +
        "1185539,200000\n" +
        "1454268,200000\n" +
        "1476353,700000\n" +
        "1489914,200000\n" +
        "1523875,200000\n" +
        "1525150,500000\n" +
        "1528336,500000\n" +
        "1544187,400000\n" +
        "1544605,200000\n" +
        "1583590,200000\n" +
        "1642782,700000\n" +
        "1671308,400000\n" +
        "1686971,1000000\n" +
        "1690948,500000\n" +
        "1710965,400000\n" +
        "1716577,200000\n" +
        "1759713,200000\n" +
        "1761059,200000\n" +
        "1790122,200000\n" +
        "1819684,200000\n" +
        "1849098,500000\n" +
        "1870181,500000\n" +
        "1870548,200000\n" +
        "1882206,200000\n" +
        "1905261,200000\n" +
        "1919715,400000\n" +
        "1977260,200000\n" +
        "1997118,200000\n" +
        "1997381,1000000\n" +
        "2000039,600000\n" +
        "2001115,400000\n" +
        "2007929,200000\n" +
        "2010580,200000\n" +
        "2012014,400000\n" +
        "2017948,400000\n" +
        "2021440,500000\n" +
        "2030800,200000\n" +
        "2030878,500000\n" +
        "2032012,200000\n" +
        "2032049,200000\n" +
        "2033727,500000\n" +
        "2033755,200000\n" +
        "2033927,200000\n" +
        "2034039,200000\n" +
        "2034226,200000";
    var data = data.split("\n");
    for (var i = 0; i < data.length; i++) {
        var tmp = data[i].split(",");
        var uid = tmp[0];
        var gold = tmp[1];
        UpdateEvent("EVL:TopUserRecharge:Data", uid, gold);
    }
    //UpdateEvent("EVL:TopUserRecharge:Data");
}

function UpdateEvent(key, userid, gold) {
    if(+userid != userid || gold != +gold)return;
    client.zincrby(key,gold,userid);
    console.log("completed ",userid, gold)
}
