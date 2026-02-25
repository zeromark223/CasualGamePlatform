var Utility = require('../../../SharedModule/Utility');
var Packet = require('../../Packet');

function OnlineAward() {
    this.Master = 0;
    this.OnlineAwardConfig = [
        {
            RechargeGoldRequired: 0,
            AwardList: [
                {
                    AwardID: 1,
                    OnlineTime: 180,
                    GoldAward: 500,
                    LimitedGold: 50000
                },
                {
                    AwardID: 2,
                    OnlineTime: 300,
                    GoldAward: 700,
                    LimitedGold: 50000
                },
                {
                    AwardID: 3,
                    OnlineTime: 600,
                    GoldAward: 1000,
                    LimitedGold: 50000
                },
                {
                    AwardID: 4,
                    OnlineTime: 900,
                    GoldAward: 1200,
                    LimitedGold: 50000
                },
                {
                    AwardID: 5,
                    OnlineTime: 1200,
                    GoldAward: 1600,
                    LimitedGold: 50000
                },
                {
                    AwardID: 6,
                    OnlineTime: 1500,
                    GoldAward: 2000,
                    LimitedGold: 50000
                },
                {
                    AwardID: 7,
                    OnlineTime: 1800,
                    GoldAward: 3000,
                    LimitedGold: 50000
                }
            ]
        }
    ];
}

module.exports = OnlineAward;

OnlineAward.prototype.Init = function (Master) {
    this.Master = Master;
    this.OnlineAwardConfig = Master.DynamicConfig.OnlineAwardConfig;
};

OnlineAward.prototype.ReloadOnlineAwardConfig = function (DynamicConfig) {
    this.OnlineAwardConfig = DynamicConfig.OnlineAwardConfig;
};

OnlineAward.prototype.ResetAtNewDay = function () {
    for (var i = 0; i < this.Master.UserClient.length; i++) {
        if (Utility.CheckVariable(this.Master.UserClient[i], 'UserModel')) {
            //this.Master.UserClient[i].UserModel.
        }
    }
};

OnlineAward.prototype.CheckUserOnlineTimer = function () {
    for (var i = 0; i < this.Master.UserClient.length; i++) {
        if (Utility.CheckVariable(this.Master.UserClient[i], 'UserModel')) {
            var User = this.Master.UserClient[i].UserModel;
            var awardMoney = this.CaclAwardMoney(User.Wallet, User.OnlineAwardData.AwardMoneyCfg, User.OnlineAwardData.LimitedGold);
            var timeLeft = this.CaclTimeLeft(User.OnlineAwardData.TimeLeft, User.OnlineAwardData.UpdateTime);
            if (awardMoney > 0 && timeLeft <= 0 && User.OnlineAwardData.IsOver != 1 && !User.OnlineAwardData.IsSendNotify) {
                User.OnlineAwardData.IsSendNotify = true;
                this.Master.SendSocketBinary(User.Socket, new Packet.FunctionTriggerResponse(this.Master.Config.FunctionTriggerConfig.OnlineAwardFunction.ID, this.Master.Config.FunctionTriggerConfig.OnlineAwardFunction.State.HasAward));
            }
        }
    }
};

OnlineAward.prototype.GetOnlineAwardConfigByRecharge = function (RechargeGold) {
    var find = 0;
    for (var i = 0; i < this.OnlineAwardConfig.length; i++) {
        if (RechargeGold >= this.OnlineAwardConfig[i].RechargeGoldRequired) {// Đủ điều kiện với config này
            if (find == 0) {//first touch
                find = this.OnlineAwardConfig[i];
            } else {
                if (find.RechargeGoldRequired < this.OnlineAwardConfig[i].RechargeGoldRequired) {// Điều kiện tiền mới cao hơn (ưu tiên điều kiện có mức tiền cao hơn)
                    find = this.OnlineAwardConfig[i];
                }
            }

        }
    }
    return find;
};

OnlineAward.prototype.GetOnlineAwardByAwardID = function (AwardConfig, AwardID) {
    for (var i = 0; i < AwardConfig.AwardList.length; i++) {
        if (AwardConfig.AwardList[i].AwardID == AwardID) {
            return AwardConfig.AwardList[i];
        }
    }
    return 0;
};
OnlineAward.prototype.CheckOnlineAwardForUserOnLogin = function (User) {// Xử dụng khi check quà đăng nhập lần đầu
    User.OnlineAwardData.IsInitCompleted = false;
    this.Master.LogRecorder.onlineAwardCheck(User.UserID, function (e, d) {
        if (e == 0) {//Không lỗi (có data)
            if (Utility.CheckVariable(d, 'UserID', 'AwardMoneyCfg', 'IsGet', 'AwardID', 'TimeLeft', 'LimitedGold', 'UpdateTime')) { //Cache
                User.OnlineAwardData.IsInitCompleted = true;
                User.OnlineAwardData.IsGet = d.IsGet;
                User.OnlineAwardData.AwardMoneyCfg = d.AwardMoneyCfg;
                User.OnlineAwardData.AwardID = d.AwardID;
                User.OnlineAwardData.TimeLeft = d.TimeLeft;
                User.OnlineAwardData.UpdateTime = +new Date();
                User.OnlineAwardData.LimitedGold = d.LimitedGold;

                if (d.IsGet == 0) {// Chưa nhận thưởng
                    User.OnlineAwardData.IsOver = 0;
                    if (d.TimeLeft <= 0) {
                        User.OnlineAwardData.TimeLeft = 0;
                        User.OnlineAwardData.IsSendNotify = true;
                        //#3
                        var awardMoney = this.CaclAwardMoney(User.Wallet, User.OnlineAwardData.AwardMoneyCfg, User.OnlineAwardData.LimitedGold);
                        if (awardMoney > 0) {
                            this.Master.SendSocketBinary(User.Socket, new Packet.FunctionTriggerResponse(this.Master.Config.FunctionTriggerConfig.OnlineAwardFunction.ID, this.Master.Config.FunctionTriggerConfig.OnlineAwardFunction.State.HasAward));
                        }

                    } else {
                        User.OnlineAwardData.TimeLeft = d.TimeLeft;
                    }
                } else {
                    //Đã nhận thưởng, tính quà kế tiếp
                    this.CalcOnlineAwardForUserByAwardID(User, ++d.AwardID);
                }
            }
        } else {// Chưa có data //Khởi tạo quà đầu tiên
            this.CalcOnlineAwardForUserByAwardID(User, 1);
        }
    }.bind(this));
};

OnlineAward.prototype.CalcOnlineAwardForUserByAwardID = function (User, AwardID) {

    var onlineAwardCfg = this.GetOnlineAwardConfigByRecharge(User.RechargeGold);
    if (onlineAwardCfg != 0) {
        var awardCfg = this.GetOnlineAwardByAwardID(onlineAwardCfg, AwardID);
        if (awardCfg != 0) {
            var webMoney = User.Diamond;
            var gameMoney = User.Wallet;
            var totalMoney = webMoney + gameMoney;
            var awardMoney = this.CaclAwardMoney(User.Wallet, awardCfg.GoldAward, awardCfg.LimitedGold);
            User.OnlineAwardData.IsInitCompleted = false;
            this.Master.LogRecorder.onlineAwardRecord(User.UserID, AwardID, awardCfg.OnlineTime, new Date(), awardMoney, awardCfg.GoldAward, awardCfg.LimitedGold, new Date(), totalMoney, webMoney, gameMoney, User.UserChannelID, User.UserProviderID, User.UserPlatformID, 0, function (e, d) {
                if (!e) {
                    //Cache
                    User.OnlineAwardData.IsInitCompleted = true;
                    User.OnlineAwardData.IsOver = 0;
                    User.OnlineAwardData.IsGet = 0;
                    User.OnlineAwardData.AwardMoney = awardMoney;
                    User.OnlineAwardData.AwardMoneyCfg = awardCfg.GoldAward;
                    User.OnlineAwardData.LimitedGold = awardCfg.LimitedGold;
                    User.OnlineAwardData.AwardID = AwardID;
                    User.OnlineAwardData.TimeLeft = awardCfg.OnlineTime;
                    User.OnlineAwardData.UpdateTime = +new Date();
                } else {
                    //Handle Error
                }
            }.bind(this));
        } else {
            //Hết quà
            User.OnlineAwardData.IsOver = 1;
        }
    } else {
        User.OnlineAwardData.IsOver = 1;
        //Handle Error Ko có config
    }
};

OnlineAward.prototype.GetOnlineAwardInfoForUser = function (User) {
    // if(User.OnlineAwardData.IsChecking){// Đang Checking Delay lại
    //     setTimeout(function () {
    //         this.GetOnlineAwardInfoForUser(User);
    //     }.bind(this),1000);
    //     return;
    // }
    if (User.OnlineAwardData.IsOver == 1) {
        //User đã nhận hết quà
        //this.Master.ShowPopup(User.Socket, this.Master.GetUserMsgByLangCode(this.Master.Config.LanguageConfig.OnlineAward_NoAward, User.Socket.LangCode));
        this.Master.SendSocketBinary(User.Socket, new Packet.OnlineAward_GetAwardResponse(this.CaclTimeLeft(User.OnlineAwardData.TimeLeft, User.OnlineAwardData.UpdateTime), 0, 2, User.OnlineAwardData.AwardID));//Hết quà
        return;
    }
    if (User.OnlineAwardData.IsGet == 0) {// Chưa nhận thưởng
        var awardMoney = this.CaclAwardMoney(User.Wallet, User.OnlineAwardData.AwardMoneyCfg, User.OnlineAwardData.LimitedGold);//this.CaclTimeLeft(User.OnlineAwardData.TimeLeft,User.OnlineAwardData.UpdateTime)
        if (awardMoney <= 0) {
            //this.Master.ShowPopup(User.Socket, this.Master.GetUserMsgByLangCode(this.Master.Config.LanguageConfig.OnlineAward_LimitGold, User.Socket.LangCode));
            this.Master.SendSocketBinary(User.Socket, new Packet.OnlineAward_GetAwardResponse(this.CaclTimeLeft(User.OnlineAwardData.TimeLeft, User.OnlineAwardData.UpdateTime), User.OnlineAwardData.AwardMoneyCfg, 1, User.OnlineAwardData.AwardID));//Limit Gold
        } else {

            this.Master.SendSocketBinary(User.Socket, new Packet.OnlineAward_GetAwardResponse(this.CaclTimeLeft(User.OnlineAwardData.TimeLeft, User.OnlineAwardData.UpdateTime), this.CaclAwardMoney(User.Wallet, User.OnlineAwardData.AwardMoneyCfg, User.OnlineAwardData.LimitedGold), 0, User.OnlineAwardData.AwardID));//Thành công
        }
    }


};
OnlineAward.prototype.GetOnlineAwardForUser = function (User) {

    if (!Utility.CheckVariable(User.OnlineAwardData, 'IsGet', 'IsOver', 'TimeLeft')) return;//User không có data (Chưa gen quà);
    if (User.OnlineAwardData.IsGet == 1 || User.OnlineAwardData.IsOver || this.CaclTimeLeft(User.OnlineAwardData.TimeLeft, User.OnlineAwardData.UpdateTime) > 0) {
        //User đã nhận. Hoặc chưa đủ DK
        return;
    }
    this.Master.LogRecorder.onlineAwardCheck(User.UserID, function (e, d) {
        if (e == 0) {//Không lỗi
            if (Utility.CheckVariable(d, 'UserID', 'AwardMoneyCfg', 'IsGet', 'AwardID', 'TimeLeft', 'LimitedGold', 'UpdateTime')) {
                if (d.IsGet == 0 && this.CaclTimeLeft(d.TimeLeft, User.OnlineAwardData.UpdateTime) <= 0) { // đủ DK nhận, Ko dùng UpdateTime ở Ram mà Check lại của DB, convert sang UNIX Time
                    var awardMoney = this.CaclAwardMoney(User.Wallet, d.AwardMoneyCfg, d.LimitedGold);
                    this.Master.LogRecorder.onlineAwardCheckAndGetAward(User.UserID, d.AwardID, awardMoney, function (updatedRow) {
                        if (updatedRow > 0) {
                            this.CalcOnlineAwardForUserByAwardID(User, ++d.AwardID); // Tính quà tiếp theo
                            User.OnlineAwardData.IsSendNotify = false;
                            this.Master.SendSocketBinary(User.Socket, new Packet.FunctionTriggerResponse(this.Master.Config.FunctionTriggerConfig.OnlineAwardFunction.ID, this.Master.Config.FunctionTriggerConfig.OnlineAwardFunction.State.NoAward));
                            this.Master.AddGoldRewardForUser(User, awardMoney, this.Master.Config.MoneyReasonConfig.OnlineAward, 'Thưởng đăng quà Online AwardID ' + d.AwardID);
                            // this.Master.SQLAdapter.moneyAddOnly(User, awardMoney, this.Master.Config.MoneyReasonConfig.OnlineAward, 'Thưởng đăng quà Online AwardID ' + d.AwardID, this.Master.MasterID, 0, function (e, d) {
                            //     if (e == 0) {
                            //         if (d.Money > 0) {
                            //             User.Wallet = d.Money;
                            //             this.Master.UpdateUserMoneyForClient(User);
                            //         }
                            //     } else {
                            //         this.Master.Logger.Master().error('OnlineAwardData.prototype.GetOnlineAwardForUser Update Fail ', e, User.UserID, this.Master.Config.MoneyReasonConfig.OnlineAward, 'Thưởng đăng quà Online AwardID ' + d.AwardID, User.UserChannelID, User.UserProviderID, User.PlatformID, this.Master.MasterID, User.SessionID, 0);
                            //         //handle error
                            //     }
                            // }.bind(this));
                        } else {
                            //handle error
                            console.log("this case guy cheat")
                            // Ko support case cheat
                        }
                    }.bind(this));
                } else {
                    //Đã nhận quà
                    console.log("this case guy out case")
                    // Ko support case ngoài luồng
                }
            } else {
                //Data không đúng
                console.log("this case guy out err data")
            }
        } else {
            console.log("this case guy out err chjeck")
            //Xảy ra lổi check
        }
    }.bind(this));

};

OnlineAward.prototype.CaclAwardMoney = function (UserGold, AwardGold, LimitedGold) {
    var tmp = UserGold + AwardGold;
    if (tmp > LimitedGold) { // Lố tiền limit
        return 0;
    } else {
        if (LimitedGold - tmp > AwardGold) {// Tiền thưởng tạm > Tiền thưởng thật
            return AwardGold;
        } else {
            return LimitedGold - tmp;
        }
    }
};

OnlineAward.prototype.CaclTimeLeft = function (TimeLeft, GetDateTime) {
    //TimeLeft Second, GetDateTime MS
    var dif = Math.floor(TimeLeft - (+new Date() - GetDateTime) / 1000);
    if (dif < 0) dif = 0;
    return dif;// Second
};

OnlineAward.prototype.onlineAwardUpdateOnUserLeft = function (User) {
    try {
        if (User.OnlineAwardData.IsInitCompleted) {
            this.Master.LogRecorder.onlineAwardUpdateOnUserLeft(User.UserID, User.OnlineAwardData.AwardID, this.CaclTimeLeft(User.OnlineAwardData.TimeLeft, User.OnlineAwardData.UpdateTime), function (updatedRow) {
            });
        }
    } catch (e) {
        console.log("record error ", e.stack);
    }

};