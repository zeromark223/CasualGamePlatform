//1.Vua Biển Cả ( đã chạy ) FishGold
//2.Sea Hunter - Xả Đạn( đã chạy ) BulletGold
//6.Đua Top Nạp (đã chạy ) // RechargeGold
//7.Săn Cá theo điểm ( đã chạy ) Điểm = Đạn /10 * tỷ lệ cá ( set trong event) // FishGold*Ratio Config
//10.Săn cá theo số lượng giết ( chưa chạy ) // NumberFish
var Utility = require('../../../SharedModule/Utility');
var fs = require('fs');
function EventTrigger() {
    this.Agent = 0;
    this.MainTime = +new Date();
    this.EventTrigerTimer = [];
    this.ModuleList = [];
    this.EventConfig = [
        {
            moduleFile: require.resolve('./KingOfTheSea.js'),
            enable: true
        }
    ]
}

module.exports = EventTrigger;

EventTrigger.prototype.Init = function (Agent) {
    this.Agent = Agent;
    this.HandleAllEvent();
};

EventTrigger.prototype.HandleAllEvent = function () {
    this.InitAllEventModule();
    setTimeout(this.TimerEngine.bind(this), 100); // Start Timer
};

EventTrigger.prototype.InitAllEventModule = function () {
    for (var i = 0; i < this.EventConfig.length; i++) {
      if(Utility.CheckVariable(this.EventConfig[i],'moduleFile','enable')){
          if(fs.existsSync(this.EventConfig[i].moduleFile)){
              var module = require(this.EventConfig[i].moduleFile);
              module = new module();
              module.Start(this);
              this.ModuleList.push(module);
          }
      }
    }
};

EventTrigger.prototype.BuildEvent = function () {

};

EventTrigger.prototype.TimerEngine = function () {
    var local = new Date();
    var difTime = (local - this.MainTime);
    this.MainTime = local;
    for (var i = 0; i < this.EventTrigerTimer.length; i++) {
        this.EventTrigerTimer[i].Tick += difTime;
        if (this.EventTrigerTimer[i].Tick > this.EventTrigerTimer[i].Interval) {
            this.EventTrigerTimer[i].Tick = 0;
            this.EventTrigerTimer[i].Wake();
        }
    }
    setTimeout(this.TimerEngine.bind(this), 100);
};