/**
 * Created by Ngoc on 01-05-2018.
 */
var MasterEvents = require('./MasterEvents');
var Utility = require('../../../../SharedModule/Utility');
function DailyLoginEvent() {
    MasterEvents.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
}
module.exports = DailyLoginEvent;
DailyLoginEvent.prototype = new MasterEvents();

DailyLoginEvent.prototype.OnUserLogin = function (User) {
    //bitwise
    if(Utility.CheckVariable(User) && Utility.CheckVariable(this.EventConfig,'Gold')){
        this.Master.LogRecorder.getUserEventInfo(User.UserID,function (e,d) {
            try{
                if(!e){
                    if(Utility.CheckVariable(d,'length') && Utility.CheckVariable(d[0],'UserID','DailyLoginEvent')){
                        var EventFlag = d[0].DailyLoginEvent;
                        if(EventFlag == 0 ){
                            this.AddUserAward(User,this.EventConfig.Gold);
                        }else{
                            //Đã nhận
                        }
                    }else{
                        //param error
                    }
                }else{
                    // Handle Error
                }
            }catch (e){
                this.Master.Logger.Master().error("DailyLoginEvent.prototype.OnUserLogin ",e.stack);
            }


        }.bind(this));
    }

};

DailyLoginEvent.prototype.AddUserAward = function (User,Gold) {
    User.EventFlag += this.EventConfigCode.DailyLoginEvent;
    this.Master.LogRecorder.setUserEventInfoSafe(User.UserID,'DailyLoginEvent',0,1,function (rowCount) {
        if(rowCount>0){
            var rid = this.Master.Config.MoneyReasonConfig.DailyLoginEvent || 107;
            this.Master.AddGoldRewardForUser(User,Gold,rid,'Thưởng đăng nhập lần đầu ');
        }else{
            //update fail
        }

    }.bind(this));

};