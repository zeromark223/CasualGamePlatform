/**
 * Created by Ngoc on 01-05-2018.
 */
var MasterEvents = require('./MasterEvents');
var Utility = require('../../../../SharedModule/Utility');
function LuckyTime() {
    MasterEvents.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
}
module.exports = LuckyTime;
LuckyTime.prototype = new MasterEvents();

LuckyTime.prototype.OnUserLogin = function (User) {
    //bitwise
    if(Utility.CheckVariable(User) && Utility.CheckVariable(this.EventConfig,'Gold','TimeStart','TimeEnd')){
        var now = new Date().getHours()*60 + new Date().getMinutes();
        if( now < this.EventConfig.TimeStart && now > this.EventConfig.TimeEnd){ // Ngoài giờ
            return
        }
        this.Master.LogRecorder.getUserEventInfo(User.UserID,function (e,d) {
            try{
                if(!e){
                    if(Utility.CheckVariable(d,'length') && Utility.CheckVariable(d[0],'UserID','LuckyTime')){
                        var EventFlag = d[0].LuckyTime;
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
                this.Master.Logger.Master().error("LuckyTime.prototype.OnUserLogin ",e.stack);
            }
        }.bind(this));
    }

};

LuckyTime.prototype.AddUserAward = function (User,Gold) {
    User.EventFlag += this.EventConfigCode.LuckyTime;
    this.Master.LogRecorder.setUserEventInfoSafe(User.UserID,'LuckyTime',0,1,function (rowCount) {
        if(rowCount>0){
            var rid = this.Master.Config.MoneyReasonConfig.LuckyTime || 108;
            this.Master.AddGoldRewardForUser(User,Gold,rid,'Thưởng đăng nhập lần đầu ');
        }else{
            //update fail
        }

    }.bind(this));

};

LuckyTime.prototype.OnTurnOnTrigger = function () {
    try{
        for(var i = 0 ; i < this.Master.UserClient;i++){
            if(Utility.CheckVariable(this.Master.UserClient[i],'UserModel')){
                var user = this.Master.UserClient[i];
                this.OnUserLogin(user);
            }
        }
    }catch (e){
        this.Master.Logger.Master().error("LuckyTime.prototype.OnTurnOnTrigger ",e.stack);
    }
};