/**
 * Created by Ngoc on 01-05-2018.
 */
var GameEvents = require('./GameEvents');
var Utility = require('../../../../SharedModule/Utility');

function RandomHour() {
    GameEvents.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
    this.FishListRunning = [];
    this.ReloadConfigInterval = 10;
}

module.exports = RandomHour;
RandomHour.prototype = new GameEvents();

RandomHour.prototype.OnTurnOnTrigger = function () {
    this.HandleStartEvent();
    setTimeout(this.RandomHourTimer.bind(this), 5000);
};

RandomHour.prototype.HandleStartEvent = function () {
    if(Utility.CheckVariable(this.EventConfig,'FishList')){
        for(var i = 0;i < this.EventConfig.FishList.length;i++){
            if(this.FindFishRunning(this.EventConfig.FishList[i].FishKind) == 0){
                this.FishListRunning.push({
                    FishKind:this.EventConfig.FishList[i].FishKind,
                    SpawnTime:0,
                    IsExpired:false
                });
            }
        }
    }
};

RandomHour.prototype.FindFishRunning = function (FishKind) {
    for(var i = 0;i < this.FishListRunning.length;i++){
        if(this.FishListRunning[i].FishKind == FishKind){
            return this.FishListRunning[i];
        }
    }
    return 0;
};

RandomHour.prototype.EvtOnUserOutGame = function (User) {
    //log
};

RandomHour.prototype.RandomHourTimer = function () {
    if (this.Run && Utility.CheckVariable(this.EventConfig,'FishList')) {
        this.ExpireAllFishRunning(); //Set tất cả cá đã expired
        var nowMin = new Date();
        nowMin = nowMin.getHours()*60+nowMin.getMinutes();
        for(var i = 0;i < this.EventConfig.FishList.length;i++){
            var fish = this.FindFishRunning(this.EventConfig.FishList[i].FishKind);
            fish.IsExpired = false; // Set cá này vẫn còn tồn tại
            if(fish != 0){
                if(this.EventConfig.FishList[i].TimeStart  < nowMin && this.EventConfig.FishList[i].TimeEnd  > nowMin ){
                    if(fish.SpawnTime + (+this.EventConfig.FishList[i].Interval) < +new Date()){  //Spawn
                        this.SpawnFishRandomHour(this.EventConfig.FishList[i]);
                        fish.SpawnTime = +new Date();
                    }
                }
            }else {
                this.FishListRunning.push({
                    FishKind:this.EventConfig.FishList[i].FishKind,
                    SpawnTime:0,
                    IsExpired:false
                });
            }
        }
        this.ClearAllExpiredFishRunning();
        setTimeout(this.RandomHourTimer.bind(this), 1000);//Tái kick hoạt timer
    }
};

RandomHour.prototype.ExpireAllFishRunning = function () {
    for(var i = 0;i < this.FishListRunning.length;i++){
        this.FishListRunning[i].IsExpired = true;
    }
};

RandomHour.prototype.ClearAllExpiredFishRunning = function () {
    for(var i = 0;i < this.FishListRunning.length;i++){
        if(this.FishListRunning[i].IsExpired){
            this.FishListRunning.splice(i,1);
            console.log("clear ",i);
            i--;
        }
    }
};

RandomHour.prototype.SpawnFishRandomHour = function (FishConfig) {
    for(var i = 0 ; i < this.GameServer.DeskList.length;i++){
        this.GameServer.DeskList[i].SpawnRandomHourFish(FishConfig);
    }
};
