/**
 * Created by quinx on 10/26/2017.
 */
var NormalFish = require('./NormalFish');

function RandomHourFish() {
    NormalFish.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
}

RandomHourFish.prototype = new NormalFish();
module.exports = RandomHourFish;

RandomHourFish.prototype.Init = function (Desk) {
    this.Desk = Desk;
};

RandomHourFish.prototype.PlayEffect = function () {
};

RandomHourFish.prototype.GetHit = function (StockHandicap, StockRatio, UserID, BulletMultiple, IsSkill) {
    try {
        var rand = Math.round((Math.random() * 10000) + 1) / 10000; // 0.001 -> 1
        var Multiple = this.GetFishMultiple();

        if (IsSkill) {
            return 0;
        }

        var Ratio = 0;
        if (Multiple > 0) {
            Ratio = (1 / Multiple) * StockRatio * StockHandicap;
        }

        if (rand <= Ratio) {
            return Multiple;
        }
        return 0;
    }
    catch (e) {
        console.log('GetHit error', e.stack);
    }
};

