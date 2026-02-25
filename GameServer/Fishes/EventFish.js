/**
 * Created by quinx on 10/26/2017.
 */
var NormalFish = require('./NormalFish');
var Packet = require('../Packet');

function EventFish(){
    NormalFish.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
    //NormalFish.call(this);
    this.CatchRate = 0;
}

module.exports = EventFish;
EventFish.prototype = new NormalFish();

EventFish.prototype.Init = function(Desk, CatchRate, FishID, EventID){
    this.Desk = Desk;
    this.CatchRate = CatchRate;
    this.FishID = FishID;
    this.EventID = EventID;
};

EventFish.prototype.PlayEffect = function(){
};

EventFish.prototype.GetHit = function(StockHandicap, StockRatio, UserID, BulletMultiple,IsSkill){
    try {
        var rand = Math.round((Math.random() * 10000) + 1) / 10000; // 0.001 -> 1
        var Multiple = this.GetFishMultiple();
        var Ratio = 0;

        if(IsSkill){
            return 0;
        }

        this.Desk.GameServer.OnUserHitEventFish(this.EventID, UserID, BulletMultiple);

        if(this.CatchRate <= 0) {
            if (Multiple > 0) {
                Ratio = (1 / Multiple) * StockRatio * StockHandicap;
            }
        }
        else{
            Ratio = this.CatchRate;
        }

        if (rand <= Ratio) {
            return Multiple;

            //ca chet, check xem con item khong
            // this.Desk.GameServer.OnUserKillEventFish(this.FishKind, this.ItemID, function(isDrop){
            //     if(isDrop){
            //         return Multiple;
            //     }
            //     else{
            //         return 0;
            //     }
            // }.bind(this));

        }
        else {
            return 0;
        }
    }
    catch(e){
        console.log('GetHit error', e.stack);
    }
};
