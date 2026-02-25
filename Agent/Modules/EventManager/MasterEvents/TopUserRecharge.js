/**
 * Created by Ngoc on 01-05-2018.
 */
var MasterEvents = require('./MasterEvents');
function TopUserRecharge() {
    MasterEvents.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
}
module.exports = TopUserRecharge;
TopUserRecharge.prototype = new MasterEvents();

TopUserRecharge.prototype.OnUserRechargeEvent = function (UserID, Money) {
    this.Agent.RedisAdapter.zIncrby(this.DataKey,Money,UserID);
};
