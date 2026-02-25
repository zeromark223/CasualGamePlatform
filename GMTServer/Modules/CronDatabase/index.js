function CronDatabase() {
    this.Agent = 0;
    this.IsNewDay = false;
    this.CronTimer = [
        {
            Tick: 0,
            Interval: 10000,
            Wake: this.Timer10seconds.bind(this)
        }
    ];
    this.CronConfig = {
        TableTimeOut:30,// day
        StartDayAt:0,//at 0h
        TableList:[
            'outgame_log',
            'moneytransfer_log',
            'globalboss_spawn_log',
            'listfishdie_log',
            'login_log',
            'dailyaward_log',
            'onlineaward_log'
        ]
    }
}

module.exports = CronDatabase;

CronDatabase.prototype.Init = function (Agent) {
    this.Agent = Agent;
};

CronDatabase.prototype.InitTimer = function () {
    for (var i = 0; i < this.CronTimer.length; i++) {
        this.Agent.MainTimers.push(this.CronTimer[i]);
    }
};

CronDatabase.prototype.Timer10seconds = function () {
    this.CheckDailyStart();
};

CronDatabase.prototype.CheckDailyStart = function () {
    var now = new Date();
    if(now.getHours() == this.CronConfig.StartDayAt){
        if(this.IsNewDay)return;
        this.IsNewDay = true;
        this.OnNewDayTrigger();
    }else{
        //khác 0h thì reset flag này
        this.IsNewDay = false;
    }


};

CronDatabase.prototype.OnNewDayTrigger = function () {
    this.ClearTable();
    this.CreateTable();
};

CronDatabase.prototype.ClearTable = function () {

};

CronDatabase.prototype.CreateTable = function () {
    for(var i = 0 ;i < this.CronConfig.TableList.length;i++){
        this.Agent.SQLAdapter.createTableByNameAndDate();
    }

};