/**
 * Created by Ngoc on 01-05-2018.
 */
var MasterEvents = require('./MasterEvents');
var Utility = require('../../../../SharedModule/Utility');

function CreateAccBonus() {
    MasterEvents.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
}

module.exports = CreateAccBonus;
CreateAccBonus.prototype = new MasterEvents();

CreateAccBonus.prototype.OnUserLogin = function (User) {
    //bitwise
    if (User.LoginDayCount != 1) return; // Event chỉ áp dụng cho các acc dk trong ngày hôm nay.
    if (Utility.CheckVariable(User) && Utility.CheckVariable(this.EventConfig, 'Gold', 'DailySpinTicket')) {
        this.Master.LogRecorder.getUserEventInfo(User.UserID, function (e, d) {
            try {
                if (!e) {
                    if (Utility.CheckVariable(d, 'length') && Utility.CheckVariable(d[0], 'UserID', 'CreateAccBonus')) {
                        var EventFlag = d[0].CreateAccBonus;
                        if (EventFlag == 0) {
                            this.AddUserAward(User, this.EventConfig.Gold, this.EventConfig.DailySpinTicket);
                        } else {
                            //Đã nhận
                        }
                    } else {
                        //param error
                    }
                } else {
                    // Handle Error
                }
            } catch (e) {
                this.Master.Logger.Master().error("CreateAccBonus.prototype.OnUserLogin ", e.stack);
            }


        }.bind(this));
    }

};

CreateAccBonus.prototype.AddUserAward = function (User, Gold, DailyTicket) {
    //DailySpinTicket
    User.EventFlag += this.EventConfigCode.CreateAccBonus;
    this.Master.LogRecorder.setUserEventInfoSafe(User.UserID, 'CreateAccBonus', 0, 1, function (rowCount) {
        if (rowCount > 0) {
            try{
                var rid = this.Master.Config.MoneyReasonConfig.CreateAccBonus || 106;
                this.Master.AddGoldRewardForUser(User, Gold, rid, 'Thưởng đăng nhập lần đầu ');
                var hashDaily = User.UserID + ":" + this.Master.Config.RedisConfig.Define.VQMMSpinBonusDaily;
                this.Master.RedisAdapter.hIncrby(this.Master.Config.RedisConfig.Define.VQMMSpinInfo, hashDaily, DailyTicket);
            }catch (e){
                this.Master.Logger.Master().error("CreateAccBonus.prototype.AddUserAward ", e.stack);
            }
            //Add lượt quay

        } else {
            //update fail
        }

    }.bind(this));

};