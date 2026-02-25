var Utility = require('../../../SharedModule/Utility');
var Packet = require('../../Packet');

function DailyAward() {
    this.Master = 0;
    this.DailyLoginConfig = [
        {
            RechargeGoldRequired: 0,
            AwardList: [
                {
                    DayCount: 'default',
                    GoldAward: 0,
                    IsBounding: false
                },
                {
                    DayCount: 1,
                    GoldAward: 3000,
                    IsBounding: false
                },
                {
                    DayCount: 2,
                    GoldAward: 1000,
                    IsBounding: false
                },
                {
                    DayCount: 3,
                    GoldAward: 1000,
                    IsBounding: false
                },
                {
                    DayCount: 4,
                    GoldAward: 1000,
                    IsBounding: false
                },
                {
                    DayCount: 5,
                    GoldAward: 1000,
                    IsBounding: false
                },
                {
                    DayCount: 6,
                    GoldAward: 1000,
                    IsBounding: false
                },
                {
                    DayCount: 7,
                    GoldAward: 2000,
                    IsBounding: false
                }

            ]
        }
    ];
}

module.exports = DailyAward;

DailyAward.prototype.Init = function (Master) {
    this.Master = Master;
    this.DailyLoginConfig = Master.DynamicConfig.DailyLoginConfig;
};

DailyAward.prototype.ReloadDailyAwardConfig = function (DynamicConfig) {
    this.DailyLoginConfig = DynamicConfig.DailyLoginConfig;
};

DailyAward.prototype.ResetAtNewDay = function () {
    for (var i = 0; i < this.Master.UserClient.length; i++) {
        if (Utility.CheckVariable(this.Master.UserClient[i], 'UserModel')) {
            this.Master.UserClient[i].UserModel.CalcAwardForUser = false;
            this.CalcAwardForUser.bind(this, this.Master.UserClient[i].UserModel)();//Check phần thưởng cho user
        }
    }
};

DailyAward.prototype.GetDailyAwardConfigByRecharge = function (RechargeGold) {
    var find = 0;
    for (var i = 0; i < this.DailyLoginConfig.length; i++) {
        if (RechargeGold >= this.DailyLoginConfig[i].RechargeGoldRequired) {// Đủ điều kiện với config này
            if (find == 0) {//first touch
                find = this.DailyLoginConfig[i];
            } else {
                if (find.RechargeGoldRequired < this.DailyLoginConfig[i].RechargeGoldRequired) {// Điều kiện tiền mới cao hơn (ưu tiên điều kiện có mức tiền cao hơn)
                    find = this.DailyLoginConfig[i];
                }
            }

        }
    }
    return find;
};

DailyAward.prototype.GetUserDailyAwardByConfig = function (User, AwardConfig) {
    var find = 0;
    var fdef = 0;
    for (var i = 0; i < AwardConfig.AwardList.length; i++) {
        if (AwardConfig.AwardList[i].DayCount == 'default') {
            fdef = AwardConfig.AwardList[i];
            continue;
        }
        if (AwardConfig.AwardList[i].DayCount == User.LoginDayCount) {
            find = AwardConfig.AwardList[i];
        }
    }

    if (find == 0 && fdef != 0) {
        find = fdef;
    }
    return find;
};

DailyAward.prototype.CheckDailyAwardForUserOnLogin = function (User) {
    this.Master.LogRecorder.dailyAwardCheck(User.UserID, function (e, d) {//Check đã nhận thưởng chưa
        if (e != 0) {//Chưa có record và chưa nhận thưởng
            this.CalcAwardForUser(User);
        } else {//Đã có record hoặc đã nhận thưởng
            //Do nothing
            if (Utility.CheckVariable(d, 'UserID', 'AwardMoney', 'IsGet')) {
                if (d.IsGet == 0) {
                    User.DailyAwardData = {
                        IsGet: 0,
                        UpdateDate: new Date(),
                        AwardID: d.AwardID || 0

                    };
                    if (d.AwardMoney > 0) {
                        this.Master.SendSocketBinary(User.Socket, new Packet.FunctionTriggerResponse(this.Master.Config.FunctionTriggerConfig.DailyAwardFunction.ID, this.Master.Config.FunctionTriggerConfig.DailyAwardFunction.State.HasAward));
                    }

                } else {
                    User.DailyAwardData = {
                        IsGet: 1,
                        UpdateDate: new Date(),
                        AwardID: d.AwardID || 0
                    };
                }
            } else {
                this.Master.Logger.Master().error('DailyAward.prototype.CheckDailyAwardForUserOnLogin ko co thong tin ', d);
                //Ko check đủ thông tin
            }
        }
    }.bind(this));
};

DailyAward.prototype.CalcAwardForUser = function (User) {
    var dailyAwardCfg = this.GetDailyAwardConfigByRecharge(User.RechargeGold);
    if (dailyAwardCfg != 0) {
        var awardCfg = this.GetUserDailyAwardByConfig(User, dailyAwardCfg);
        if (awardCfg != 0) {
            var webMoney = User.Diamond;
            var gameMoney = User.Wallet;
            //Get GameMoney
            //Get Diamond
            var totalMoney = webMoney + gameMoney;
            var awardMoney = awardCfg.GoldAward;
            if (awardCfg.IsBounding) {// Chỉ cộng tiền về tối đa tiền award
                awardMoney = awardCfg.GoldAward - totalMoney;
                if (awardMoney < 0 || awardMoney > awardCfg.GoldAward) {//Check lại tiền
                    awardMoney = 0;
                }
            }
            this.Master.LogRecorder.dailyAwardRecord(User.UserID, new Date(), awardMoney, awardCfg.GoldAward, totalMoney, webMoney, gameMoney, User.UserChannelID, User.UserProviderID, User.UserPlatformID, 0, awardCfg.AwardID || 0, function (e, d) {
                if (!e) {
                    User.DailyAwardData = {
                        IsGet: 0,
                        UpdateDate: new Date(),
                        AwardID: awardCfg.AwardID
                    };
                    if (awardMoney > 0) {
                        this.Master.SendSocketBinary(User.Socket, new Packet.FunctionTriggerResponse(this.Master.Config.FunctionTriggerConfig.DailyAwardFunction.ID, this.Master.Config.FunctionTriggerConfig.DailyAwardFunction.State.HasAward));
                    }

                } else {
                    this.Master.Logger.Master().error('DailyAward.prototype.CalcAwardForUser dailyAwardRecord ', e);
                    //Handle Error
                }
            }.bind(this));
        } else {
            //Handle Error Ko có config
        }
    } else {
        //Handle Error Ko có config
    }
};

DailyAward.prototype.GetAwardInfoForUser = function (User) {
    if (!Utility.CheckVariable(User.DailyAwardData, 'IsGet')) {
        this.Master.SendSocketBinary(User.Socket, new Packet.DailyAward_GetAwardResponse(0, 2, 0));// hết quà
        return;//User không có data (Chưa gen quà);
    }
    if (User.DailyAwardData.IsGet == 1) {
        //User đã nhận.
        //this.Master.ShowPopup(User.Socket, this.Master.GetUserMsgByLangCode(this.Master.Config.LanguageConfig.DailyAward_NoAward, User.Socket.LangCode));
        this.Master.SendSocketBinary(User.Socket, new Packet.DailyAward_GetAwardResponse(0, 2, User.DailyAwardData.AwardID || 0));// hết quà
        return;
    }
    this.Master.LogRecorder.dailyAwardCheck(User.UserID, function (e, d) {
        if (e == 0) {//Không lỗi (có data)
            User.DailyAwardData.AwardID = d.AwardID || 0;
            if (Utility.CheckVariable(d, 'UserID', 'AwardMoney', 'IsGet')) {
                if (d.IsGet == 0 && d.AwardMoney > 0) {// Chưa nhận thưởng
                    this.Master.SendSocketBinary(User.Socket, new Packet.DailyAward_GetAwardResponse(d.AwardMoney, 0, User.DailyAwardData.AwardID));// thành công
                } else {
                    if (d.AwardMoney <= 0) {
                        this.Master.SendSocketBinary(User.Socket, new Packet.DailyAward_GetAwardResponse(0, 1, User.DailyAwardData.AwardID));// limit tiền
                        //this.Master.ShowPopup(User.Socket, this.Master.GetUserMsgByLangCode(this.Master.Config.LanguageConfig.DailyAward_LimitGold, User.Socket.LangCode));
                    } else {
                        this.Master.SendSocketBinary(User.Socket, new Packet.DailyAward_GetAwardResponse(0, 2, User.DailyAwardData.AwardID));// hết quà
                        //this.Master.ShowPopup(User.Socket, this.Master.GetUserMsgByLangCode(this.Master.Config.LanguageConfig.DailyAward_NoAward, User.Socket.LangCode));
                    }

                }
            }
        } else {
            //#3
            this.Master.Logger.Master().error('DailyAward.prototype.GetAwardForUser Update Fail ', e);
        }
    }.bind(this));

};

DailyAward.prototype.GetAwardForUser = function (User) {
    if (!Utility.CheckVariable(User.DailyAwardData, 'IsGet')) return;//User không có data (Chưa gen quà);
    if (User.DailyAwardData.IsGet == 1) {
        //User đã nhận.
        return;
    }
    this.Master.LogRecorder.dailyAwardCheck(User.UserID, function (e, d) {
        if (e == 0) {//Không lỗi
            if (Utility.CheckVariable(d, 'UserID', 'AwardMoney', 'IsGet')) {
                User.DailyAwardData.AwardID = d.AwardID || 0;
                if (d.IsGet == 0 && d.AwardMoney > 0) {

                    this.Master.LogRecorder.dailyAwardCheckAndGetAward(User.UserID, function (updatedRow) {
                        if (updatedRow > 0) {
                            User.DailyAwardData.IsGet = 1;
                            this.Master.SendSocketBinary(User.Socket, new Packet.FunctionTriggerResponse(this.Master.Config.FunctionTriggerConfig.DailyAwardFunction.ID, this.Master.Config.FunctionTriggerConfig.DailyAwardFunction.State.NoAward));
                            this.Master.AddGoldRewardForUser(User, d.AwardMoney, this.Master.Config.MoneyReasonConfig.DailyAward, 'Thưởng đăng nhập mỗi ngày ');
                            // this.Master.SQLAdapter.moneyAddOnly(User, d.AwardMoney, this.Master.Config.MoneyReasonConfig.DailyAward, 'Thưởng đăng nhập mỗi ngày', this.Master.MasterID, 0, function (e, d) {
                            //     if (e == 0) {
                            //         if (d.Money > 0) {
                            //             User.Wallet = d.Money;
                            //             this.Master.UpdateUserMoneyForClient(User);
                            //         }
                            //     } else {
                            //         this.Master.Logger.Master().error('DailyAward.prototype.GetAwardForUser Update Fail ', e, User.UserID, this.Master.Config.MoneyReasonConfig.DailyAward, 'Chuyển tiền web vào game auto', User.UserChannelID, User.UserProviderID, User.PlatformID, this.Master.MasterID, User.SessionID, 0);
                            //         //handle error
                            //     }
                            // }.bind(this));
                        } else {
                            //handle error
                        }
                    }.bind(this));
                } else {
                    if (d.AwardMoney <= 0) {
                        this.Master.SendSocketBinary(User.Socket, new Packet.DailyAward_GetAwardResponse(0, 1, User.DailyAwardData.AwardID));// limit tiền
                        //this.Master.ShowPopup(User.Socket, this.Master.GetUserMsgByLangCode(this.Master.Config.LanguageConfig.DailyAward_LimitGold, User.Socket.LangCode));

                    }

                    //Đã nhận quà
                }
            } else {
                //Data không đúng
            }
        } else {
            //Xảy ra lổi check
        }
    }.bind(this));

};