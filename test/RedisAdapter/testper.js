var config = require('../../Config/GameConfig/DefaultConfig').Redis;
config.DB = 0;
var redisAdapter = require('./RedisAdapter');
var TotalHp = 10*1000*1000; //10tr
var totalUser = 1000;
var minBullet = 10;
var totalHitPerSecond = 20;
var totalExec = 0;
var toltalDelay = 0;
var doingExec = 0;
redisAdapter.Init (0, config, console);

setInterval(function () {
    console.log("doingExec ",doingExec,totalExec,toltalDelay,toltalDelay/totalExec);
    AllUserHit();
},1000);

function AllUserHit() {
    for(var i = 0 ; i < totalUser*totalHitPerSecond ; i ++){
        var beginExc = + new Date();
        doingExec++;
        redisAdapter.CalcHitBoss(minBullet,TotalHp,function (be,e,d) {
            totalExec++;
            doingExec--;
            toltalDelay+= (+new Date())-be;
            if(e==0){
                if(d[0]==1){
                    console.log("User giết boss",d,totalExec,toltalDelay,toltalDelay/totalExec);
                    process.exit(0);
                }


            }
        }.bind(this,beginExc))
    }
}

