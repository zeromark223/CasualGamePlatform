/**
 * Created by quinx on 5/18/2017.
 */

function NormalFish(FishID, FishKind, TimeCreate, Desk, Multiple, ItemID, MaxMultiple, IsRedFish, Ratio) {
    this.FishID = FishID;
    this.FishKind = FishKind;
    this.BuildTick = TimeCreate;
    this.Desk = Desk;
    this.Multiple = +Multiple || 1;
    this.Ratio = (typeof Ratio == 'undefined') ? 1 / this.Multiple : Ratio;
    this.ItemID = (ItemID != 'undefined' && ItemID != null) ? ItemID : 0;
    this.MaxMultiple = +MaxMultiple || this.Multiple;
    this.IsRedFish = (typeof IsRedFish == 'undefined') ? 0 : IsRedFish;
    this.CalcMultiple = this.Multiple;
}
module.exports = NormalFish;

NormalFish.prototype.GetHit = function (StockHandicap, StockRatio, UserID, BulletMultiple, IsSkill, SumMultiple) {
    var rand = Math.round((Math.random() * 10000) + 1) / 10000; // 0.001 -> 1\
    var Multiple = this.GetFishMultiple();

    if (IsSkill) {
        rand = 0;
    }

    var Ratio = 0;
    if (Multiple > 0) {
        Ratio = (1 / Multiple) * StockRatio * StockHandicap;
    }

    if (rand <= Ratio) {
        return Multiple;
    }
    return 0;
};

NormalFish.prototype.Init = function () {
};

NormalFish.prototype.OnFishDie = function () {
};

NormalFish.prototype.GetFishMultiple = function () {
    if (typeof this.MaxMultiple == 'undefined'
        || this.MaxMultiple <= this.Multiple) {
        return +this.Multiple;
    }
    else {
        return randomBetween(+this.Multiple,+this.MaxMultiple);
    }
};

function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}