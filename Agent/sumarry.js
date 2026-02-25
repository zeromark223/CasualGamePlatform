var AgentConfig = require('../Config/Agent');
var SQLAdapter = require('./Modules/LogRecorder');
var Utility = require('../SharedModule/Utility');
SQLAdapter.Init(AgentConfig.LogRecorderConfig,console);



GetUntilEnd(0,new Date('2017-06-06'),new Date('2017-07-12'),function (sum) {
    console.log("Completed ",sum);
});

function GetUntilEnd(PreSum,startdate,enddate,callback) {
    console.log("Collecting Date ",startdate);
    if(startdate<enddate){
        SQLAdapter.getTotalFishByTime(new Date(),function (e,d) {
            if(Utility.CheckVariable(d)&&Utility.CheckVariable(d[0],'sum')){
                GetUntilEnd(d[0].sum+PreSum,dateAdd(startdate,1),enddate,callback);
            }
        });
    }else{
        callback(PreSum)
    }

}

function dateAdd(date,addday) {
    var date = +new Date(date) + 24*60*60000;
    return new Date(date);
}