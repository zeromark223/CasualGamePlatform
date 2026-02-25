/**
 * Created by ngocnpt on 26-May-17.
 */
var AchievementConfig = require('../../../Config/Common/AchievementConfig');
var Packet = require('../../Packet');
var Utility = require('../../../SharedModule/Utility');

function AchievementManger(Master) {
    this.Master = Master;
    this.AchievementConfig = AchievementConfig;
    this.TimeReset = 7 * 60 * 1000; // 7h Sáng
}

module.exports = AchievementManger;

AchievementManger.prototype.GetListAchievementForUser = function (User) {
    var UserID = User.UserID;
    this.Master.LogRecorder.achievementGetAll(UserID, function (e, d) {
        if (e == 0) {
            if (d.length > 0) { // có nv
                User.UserAchievementList = this.ParseAchievementData(d[0].CompletedData, d[0].GetRewardData, User);
                this.CalcFunctionNotifyAchievement(User);
            } else {
                var AchievementList = this.GenListAchievementForUser(User);
                User.UserAchievementList = AchievementList;
                //Insert DB
                try {
                    var alStr = this.BuildAchievementData(AchievementList);
                    //this.CalcFunctionNotifyAchievement(User); // Mới gen nên ko có hoàn thành

                    this.Master.LogRecorder.achievementRecordAll(UserID, alStr.CompletedList, alStr.GotList, function (e, d) {
                    });
                } catch (e) {
                    console.log("AchievementManger.prototype.GetListAchievementForUser Record Fail ", e.stack)
                }

            }

        } else {
            //Handle error
        }
    }.bind(this));
};

AchievementManger.prototype.GenListAchievementForUser = function (User) {
    var ListAchievement = [];
    for (var i = 0; i < this.AchievementConfig.length; i++) {
        this.GenAchievementForUser(ListAchievement, this.AchievementConfig[i], User);
    }
    return ListAchievement;
};

AchievementManger.prototype.GenAchievementForUser = function (ListAchievement, DetailAchievement, User) {
    var Achievement = this.GenAchievementByConfig(DetailAchievement, User);
    if (Achievement != 0) {
        ListAchievement.push(Achievement);
    }
};

AchievementManger.prototype.GenAchievementByConfig = function (Config, User) {
    return this.GenAchievementTypeDefault(Config, User); // hiện gen giống nhau
    // switch (Config.TypeID) {
    //     case 10:
    //         return this.GenAchievementType10(Config);
    //     case 11:
    //         return this.GenAchievementType11(Config);
    //     default:
    //         return this.GenAchievementTypeDefault(Config); // hiện gen giống nhau
    // }
};

AchievementManger.prototype.GenAchievementTypeDefault = function (Config, User) {
    var target = Config.Condition.Target;
    var rewardGold = Config.Reward.GoldValue;
    //var param = target + "," + Config.Condition.FishKind.join(',');
    var completed = 0;
    if (Config.TypeID == 10) {// Type 10
        completed = User.Wallet;
        if (completed > Config.Condition.Target) {
            completed = Config.Condition.Target;
        }
    }
    if (Config.TypeID == 11) {// Type 10
        completed = User.RechargeGold;
        if (completed > Config.Condition.Target) {
            completed = Config.Condition.Target;
        }
    }
    return {
        AchievementID: Config.AchievementID,
        TypeID: Config.TypeID,
        Target: target,
        Completed: completed,
        IsGet: 0,
        GameList: Config.Condition.GameList.join(','),
        //Param: param,
        RewardGold: rewardGold
    };
};

AchievementManger.prototype.GenAchievementListPacket = function (ListAchievement, LangCode, User) {
    try {
        var List = [];
        for (var i = 0; i < ListAchievement.length; i++) {
            if (!Utility.CheckVariable(ListAchievement[i], 'AchievementID', 'Target', 'Completed', 'RewardGold', 'IsGet')) continue;
            var t = this.GetAchievementTitleAndDescByID(ListAchievement[i].AchievementID, LangCode);
            if (t != 0) {
                var desc = t.Desc;//.replace('%s', ListAchievement[i].Target);
                desc = desc.replace('%s', this.FormatMoney(ListAchievement[i].Target));
                var completed = ListAchievement[i].Completed;

                if (ListAchievement[i].TypeID == 10) {// Type 10
                    completed = User.Wallet;
                    if (completed > ListAchievement[i].Target) {
                        completed = ListAchievement[i].Target;
                    }
                }
                if (ListAchievement[i].TypeID == 11) {// Type 10
                    completed = User.RechargeGold;
                    if (completed > ListAchievement[i].Target) {
                        completed = ListAchievement[i].Target;
                    }
                }

                List.push({
                    ID: ListAchievement[i].AchievementID,
                    AchievementID: ListAchievement[i].AchievementID,
                    Title: t.Title,
                    Desc: desc,
                    Target: ListAchievement[i].Target,
                    Completed: completed,
                    IsGet: ListAchievement[i].IsGet,
                    RewardGold: ListAchievement[i].RewardGold
                });
            }

        }
        if (List.length > 0) {
            return new Packet.AchievementListResponse(List);
        }
    } catch (e) {
        console.log("AchievementManger.prototype.GenAchievementListPacket", e.stack)
    }

    return 0;
};

AchievementManger.prototype.GetAchievementTitleAndDescByID = function (AchievementID, LangCode) {
    var mcfg = this.GetAchievementConfigByID(AchievementID);
    if (mcfg != 0) {
        var tit = this.Master.GetUserMsgByLangCode(mcfg.Title, LangCode);
        var desc = this.Master.GetUserMsgByLangCode(mcfg.Desc, LangCode);
        return {
            Title: tit,
            Desc: desc
        }
    }
    console.log("GetAchievementTitleAndDescByID meo tim thay", AchievementID);
    return 0;
};

AchievementManger.prototype.GetAchievementConfigByID = function (AchievementID) {
    try {
        for (var i = 0; i < this.AchievementConfig.length; i++) {
            if (this.AchievementConfig[i].AchievementID == AchievementID) {
                return this.AchievementConfig[i];
            }
        }
    } catch (e) {
        console.log("AchievementManger.prototype.GetAchievementConfigByID", e.stack);
    }
    console.log("GetAchievementConfigByID meo tim thay", AchievementID);
    return 0;
};

AchievementManger.prototype.GetAchievementAward = function (User, ID) {

    if (Utility.CheckVariable(User, 'UserAchievementList')) {
        for (var i = 0; i < User.UserAchievementList.length; i++) {
            if (User.UserAchievementList[i].AchievementID == ID) {

                if (User.UserAchievementList[i].TypeID == 10) {
                    User.UserAchievementList[i].Completed = User.Wallet;
                }

                if (User.UserAchievementList[i].TypeID == 11) {
                    User.UserAchievementList[i].Completed = User.TotalRecharge;
                }

                if (User.UserAchievementList[i].Target <= User.UserAchievementList[i].Completed) {
                    //Update Tiền
                    //Check DB pls
                    var TimeCheck = new Date();
                    TimeCheck = +TimeCheck - this.TimeReset;
                    var MID = User.UserAchievementList[i].AchievementID;
                    var RewardGold = User.UserAchievementList[i].RewardGold;
                    User.UserAchievementList[i].IsGet = 1;
                    //Unsafe

                    var data = this.BuildAchievementData(User.UserAchievementList);
                    this.Master.LogRecorder.achievementGetAndUpdateUnSafe(User.UserID, data.GotList, function (rowCount) {
                        if (rowCount > 0) {
                            this.Master.SendSocketBinary(User.Socket, new Packet.AchievementGetAwardResponse(0, ID));
                            this.Master.AddGoldRewardForUser(User, RewardGold, this.Master.Config.MoneyReasonConfig.OnlineAward, 'Thưởng Thành Tựu ' + MID + '(' + ID + ')');
                        } else {
                            this.Master.SendSocketBinary(User.Socket, new Packet.AchievementGetAwardResponse(1, ID));
                        }
                        this.CalcFunctionNotifyAchievement(User);
                    }.bind(this));


                    return;
                }
            }
        }
    }
    this.Master.SendSocketBinary(User.Socket, new Packet.AchievementGetAwardResponse(1, ID));
};

AchievementManger.prototype.OnAchievementListOfUserChanged = function (User, ListID) {
    for (var i = 0; i < ListID.length; i++) {
        for (var j = 0; j < User.UserAchievementList.length; j++) {
            if (User.UserAchievementList[j].ID == ListID[i].ID) {
                User.UserAchievementList[j].Completed = ListID[i].Completed;
            }
        }
    }
    this.CalcFunctionNotifyAchievement(User);
};

AchievementManger.prototype.BuildAchievementData = function (ListAchievement) {
    var al = [];
    var tmp;
    var l;
    var getList = [];
    for (var i = 0; i < ListAchievement.length; i++) {
        tmp = ListAchievement[i];
        al.push(tmp.AchievementID + '-' + tmp.Completed);
        getList.push(tmp.AchievementID + '-' + tmp.IsGet);
    }
    return {CompletedList: al.join('|'), GotList: getList.join('|')};
};

AchievementManger.prototype.ParseAchievementData = function (CompletedData, GetRewardData, User) {
    if (!Utility.CheckVariable(CompletedData, 'split')) return []; // Data sai ko parse dc
    if (!Utility.CheckVariable(GetRewardData, 'split')) return []; // Data sai ko parse dc
    var clStr = CompletedData.split('|');
    var clArr = [];
    var glStr = GetRewardData.split('|');
    var glArr = [];
    var t;
    var i;
    //parse list đã nhận
    for (i = 0; i < glStr.length; i++) {
        t = glStr[i].split('-');
        if (Utility.CheckVariable(t, '0', '1')) {
            glArr[t[0]] = t[1];
        }
    }
    for (i = 0; i < clStr.length; i++) {
        t = clStr[i].split('-');
        if (Utility.CheckVariable(t, '0', '1')) {
            clArr[t[0]] = t[1];
        }
    }
    var al = [];
    var a;
    var cfg;
    var isGet = 1;
    for (var i = 0; i < clArr.length; i++) {
        if (!Utility.CheckVariable(clArr[i])) continue;//Data sai bỏ qua
        cfg = this.FindConfigByID(i);
        if (cfg != 0) {
            isGet = 1;
            if (glArr[i] == 0) {
                isGet = 0;
            }
            var completed = +clArr[i];
            if (cfg.TypeID == 10) {// Type 10
                completed = User.Wallet;
                if (completed > cfg.Condition.Target) {
                    completed = cfg.Condition.Target;
                }
            }
            if (cfg.TypeID == 11) {// Type 10
                completed = User.TotalRecharge;
                if (completed > cfg.Condition.Target) {
                    completed = cfg.Condition.Target;
                }
            }

            a = {
                AchievementID: i,
                TypeID: cfg.TypeID,
                Target: cfg.Condition.Target,
                Completed: completed,
                IsGet: isGet, //
                RewardGold: cfg.Reward.GoldValue
            };
            al.push(a);
        }

    }
    return al;
};

AchievementManger.prototype.FindConfigByID = function (ID) {
    for (var i = 0; i < this.AchievementConfig.length; i++) {
        if (this.AchievementConfig[i].AchievementID == ID) {
            return this.AchievementConfig[i];
        }
    }
    return 0;
};

AchievementManger.prototype.OnAchievementListOfUserChanged = function (User) {
    this.GetListAchievementForUser(User);
};

AchievementManger.prototype.FormatMoney = function (n) {
    var decPlaces = 0;
    var thouSeparator = '.';
    var decSeparator = ',';
    var sign = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(decPlaces)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return sign + (j ? i.substr(0, j) + thouSeparator : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thouSeparator) + (decPlaces ? decSeparator + Math.abs(n - i).toFixed(decPlaces).slice(2) : "");
};

AchievementManger.prototype.CalcFunctionNotifyAchievement = function (User) {
    var isCompleted = false;
    for (var j = 0; j < User.UserAchievementList.length; j++) {
        if (User.UserAchievementList[j].Completed >= User.UserAchievementList[j].Target && User.UserAchievementList[j].IsGet != 1) {
            //Hoàn thành và chưa nhận
            isCompleted = true;
        }
    }
    if (isCompleted) {
        this.Master.SendSocketBinary(User.Socket, new Packet.FunctionTriggerResponse(this.Master.Config.FunctionTriggerConfig.AchievementFunction.ID, this.Master.Config.FunctionTriggerConfig.AchievementFunction.State.HasAward));
    } else {
        this.Master.SendSocketBinary(User.Socket, new Packet.FunctionTriggerResponse(this.Master.Config.FunctionTriggerConfig.AchievementFunction.ID, this.Master.Config.FunctionTriggerConfig.AchievementFunction.State.NoAward));
    }
};
