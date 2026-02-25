/**
 * Giết cá đỏ
 * - Client gửi lên id cá đỏ, số lượng cá chết theo
 * - Tính tỉ lệ chết = ratio cá đỏ / số lượng cá chết theo (số lượng càng nhiều tỉ lệ chết càng khó)
 * - Nếu cá đỏ chết thì quét danh sách cá chết theo theo số lượng truyền lên.
 * - Gửi về kết quả cá chết về cho client. Client kiểm tra phải cá đỏ không?
 *      - Nếu đúng: giết tất cả cá cùng loại trên màn hình (tiền hiển thị tại chỗ cá đỏ chết, cá khác hok hiển thị số tiền)
 * */

var NormalFish = require('./NormalFish');

function RedFish() {
    NormalFish.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
};

RedFish.prototype = new NormalFish();
module.exports = RedFish;

RedFish.prototype.Init = function (RedRatio, RedRule) {
    this.RedRatio = RedRatio;
    this.RedRule = RedRule;
};

/**
 * Tính tỉ lệ cá đỏ chết
 * */
RedFish.prototype.GetHit = function (StockHandicap, StockRatio, UserID, BulletMultiple, IsSkill, SumMultiple) {
    try {
        var rand = Math.round((Math.random() * 10000) + 1) / 10000; // 0.001 -> 1\
        if (IsSkill) {
            return 0;
        }
        if (this.RedRule == 1) {
            if (rand <= this.RedRatio * StockRatio * StockHandicap) {
                return SumMultiple;
            }
        } else {
            var Ratio = (1 / SumMultiple) * StockRatio * this.RedRatio * StockHandicap;

            if (rand <= Ratio) {
                return SumMultiple;
            }
        }


    } catch (e) {
        this.Desk.GameServer.Logger.Game().error('RedFish.prototype.GetHit - try err: ' + e.stack);
    }

    return 0;
};

//remove list fish
RedFish.prototype.OnFishDie = function () {
    this.Desk.RemoveFishInDesk(this.FishID);
};
