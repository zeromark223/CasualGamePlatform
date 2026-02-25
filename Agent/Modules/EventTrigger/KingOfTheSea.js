function KingOfTheSea() {
    this.EventTrigger = 0;
    this.Agent = 0;
    this.Logger = 0;
    this.EventCode = 'KingOfTheSea';
    this.EventName = {
        userMsg:"Vua Biển Cả",
        userMsgEn:"King Of The Sea"
    };
    this.EventID = 1;
}

module.exports = KingOfTheSea;

KingOfTheSea.prototype.Start = function (EventTrigger) {
    this.EventTrigger = EventTrigger;
    this.Agent = EventTrigger.Agent;
    this.Logger = EventTrigger.Agent.Logger;
    this.LogRecorder = EventTrigger.Agent.LogRecorder;
    this.EventTrigger.EventTrigerTimer.push({
        Tick: 0,
        Interval: 5000,
        Wake: this.Timer5seconds.bind(this)
    });

};

KingOfTheSea.prototype.Timer5seconds = function () {
    //NeedLoad Data.
    var startTime = new Date('2018-04-20 10:00:00');
    var endTime = new Date('2018-04-27 12:00:00');
    this.CollectData(startTime,endTime);
};

KingOfTheSea.prototype.CollectData = function (startTime,endTime) {
    if (this.CollectDataProcessing) return;
    this.CollectDataProcessing = true;
    if (endTime > new Date()) endTime = new Date(); // Kiểm tra đến thời điểm hiện tại
    var dayTime = 3600 * 24 * 1000;
    var dayDiff = Math.floor(endTime / dayTime - startTime / dayTime);
    this.Agent.RedisAdapter.hset(this.Agent.AgentConfig.RedisConfig.Define.EventList+'Active',this.EventCode,JSON.stringify({
        ID:this.EventID,
        EventName:this.EventName,
        StartTime:startTime,
        EndTime:endTime,
        StartDisplayTime:startTime,
        EndDisplayTime:new Date(+endTime+dayTime*2),
        DataKey:this.Agent.AgentConfig.RedisConfig.Define.EventList+this.EventCode+':Data'
    }));
    for (var i = 0; i <= dayDiff; i++) {
        var checkDay = new Date(+startTime + dayTime * i);
        this.LogRecorder.collectDataKingOfTheSeaByDay(checkDay, startTime, endTime, function (e, d) {
            if (e == 0) {
                this.UpdateRedisRecord(d);
            }
        }.bind(this));
    }

};

KingOfTheSea.prototype.UpdateRedisRecord = function (data) {
    this.Agent.RedisAdapter.recordBatchMassZSet(this.Agent.AgentConfig.RedisConfig.Define.EventList+this.EventCode+':Data',data,'UserPayMoney','UserID',0);

};