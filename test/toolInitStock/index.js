var redis = require('redis');
var redisConfig = {
    Host: 'login.vuabanca.com',
    Port: 9998,
    Password: 'xbiWivjespryoas4TonEdt'
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
    },5000);

});

client.on('error', function (e) {
    console.log("Redis error", e);
});
client.on('disconnect', function (e) {
    console.log("Redis disconnect");
});

function InitCompleted() {
    InitJackpot();
}

function InitJackpot() {
    // InitJackpotByKey('SLOTJPS:401:');
    // InitJackpotByKey('SLOTJPS:402:');
    // InitJackpotByKey('SLOTJP:402:');
    // InitJackpotByKey('SLOTJP:401:');
}

function InitJackpotByKey(key) {

    var JackpotConfigDefault = [
        {
            ID: 1000,
            Ratio: 0.01,
            RatioSave: 0.01,
            Default: 400000
        },
        {
            ID: 2500,
            Ratio: 0.01,
            RatioSave: 0.01,
            Default: 1000000
        },
        {
            ID: 5000,
            Ratio: 0.01,
            RatioSave: 0.01,
            Default: 2000000
        },
        {
            ID: 10000,
            Ratio: 0.01,
            RatioSave: 0.01,
            Default: 4000000
        },
        {
            ID: 15000,
            Ratio: 0.01,
            RatioSave: 0.01,
            Default: 6000000
        },
        {
            ID: 25000,
            Ratio: 0.01,
            RatioSave: 0.01,
            Default: 10000000
        },
        {
            ID: 50000,
            Ratio: 0.01,
            RatioSave: 0.01,
            Default: 20000000
        }
        ];
    for(var i = 0 ; i < JackpotConfigDefault.length;i++){
        UpdateJackpot(key,JackpotConfigDefault[i])
    }
}

function UpdateJackpot(Key,Cfg) {
    var rk = Key+Cfg.ID;
    var val = +Cfg.Default;
    client.get(rk,function (e,d) {
      if(!e){
            if(+d < val){
                client.incrby(rk,val);
                console.log("Update ",rk,+d,val,(+val+ +d));
            }else{
                console.log("No Update ",rk,+d,val,(+val+ +d));
            }
      }
    })
}