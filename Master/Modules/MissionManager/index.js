/**
 * Created by ngocnpt on 26-May-17.
 */
var MissionConfig = require('../../../Config/Master/MissionConfig');
var Packet = require('../../Packet');
var Utility = require('../../../SharedModule/Utility');

function MissionManger(Master) {
    this.Master = Master;
    this.MissionConfig = MissionConfig;
    this.TimeReset = 7 * 60 * 1000; // 7h Sáng
}

module.exports = MissionManger;

MissionManger.prototype.GetListMissionForUser = function (User) {
    var TimeCheck = new Date();
    TimeCheck = +TimeCheck - this.TimeReset;

    this.Master.LogRecorder.dailyMissionGetAll(TimeCheck, User.UserID, function (e, d) {
        if (e == 0) {
            if (d.length > 0) { // có nv
                User.UserMissionList = d;
                this.CheckMissionType19(User);
                this.CalcFunctionNotifyMission(User);
            } else {
                var missionList = this.GenListMissionForUser();
                User.UserMissionList = missionList;
                //Insert DB
                var valArr = [];
                try {
                    for (var i = 0; i < missionList.length; i++) {
                        valArr.push([User.UserID, missionList[i].MissionID, missionList[i].TypeID, missionList[i].Target, missionList[i].Completed, missionList[i].IsGet, missionList[i].GameList.toString(), missionList[i].Param.toString(), missionList[i].RewardGold, new Date(), new Date()]);
                    }
                    this.Master.LogRecorder.dailyMissionRecord(TimeCheck, valArr, function (e, d) { //Insert và check
                        //affectedRows: 5,
                        //insertId: 25,
                        //Check xem ID đã insert trả về và sync vs config tự tạo
                        var insertComp = 0; //cờ check
                        var idStart = 0; // ID bắt đầu
                        if (!e) {
                            if (d.affectedRows == valArr.length) { // số dòng thành công = số dòng gửi đi
                                insertComp = 1;
                                idStart = d.insertId;
                            }
                        }
                        if (insertComp) {
                            //Vì ID khi trả về chỉ trả của phần tử đầu tiên, nên phải tự suy
                            for (var i = 0; i < missionList.length; i++) {
                                missionList[i].ID = idStart + i;
                            }
                            this.CheckMissionType19(User);
                        } else {
                            //Các trường hợp ko SYNC dc phải gọi DB load lại
                            if (!e) { // SQL ko lổi
                                if (!User.GetListMissionForUserFlag) {
                                    User.GetListMissionForUserFlag = true; // tránh gọi nhiều lần sập cmn
                                    this.GetListMissionForUser(User);
                                }

                            } else {
                                User.UserMissionList = []; // Các case khác hủy nv này đi
                            }

                        }
                    }.bind(this));
                } catch (e) {
                    console.log("MissionManger.prototype.GetListMissionForUser", e.stack);
                }

            }

        } else {
            //Handle error
        }
    }.bind(this));
};

MissionManger.prototype.GenListMissionForUser = function () {
    var ListMission = [];
    for (var i = 0; i < this.MissionConfig.Detail.length; i++) {
        if (this.MissionConfig.Detail[i].Difficult >= this.MissionConfig.MinDifficult && this.MissionConfig.Detail[i].Difficult <= this.MissionConfig.MaxDifficult) {
            this.GenMissionForUser(ListMission, this.MissionConfig.Detail[i]);
        }
    }
    return ListMission;
};

MissionManger.prototype.GenMissionForUser = function (ListMission, DetailMission) {
    var Mission = this.GenMissionByConfig(DetailMission.MissionList[Math.floor(Math.random() * DetailMission.MissionList.length)], ListMission);
    if (Mission != 0) {
        ListMission.push(Mission);
    }
};

MissionManger.prototype.GenMissionByConfig = function (Config, ListMission) {
    switch (Config.TypeID) {
        case 0:
        case 1:
        case 2:
        case 3:
        case 4:
        case 9:
        case 10:
            return this.GenMissionType0(Config); // hiện gen giống nhau
        case 11:
            return this.GenMissionType11(Config); // hiện gen giống nhau
        case 12:
            return this.GenMissionType12(Config); // hiện gen giống nhau
        case 13:
            return this.GenMissionType13(Config); // hiện gen giống nhau
        case 19:
            return this.GenMissionType19(Config, ListMission); // hiện gen giống nhau
        default:
            return 0;
    }
};

MissionManger.prototype.GenMissionType0 = function (Config) {
    var roundMul = 100;
    var target = Math.random() * (Config.Condition.End - Config.Condition.Start) + Config.Condition.Start;
    if (target < 100) {
        roundMul = 10
    }
    if (target < 10) {
        roundMul = 1
    }
    target = Math.floor(target/roundMul)*roundMul;
    var rewardGold = Config.Reward.GoldValue;
    if(Config.TypeID == 9){
        if(target>100000)target=100000-1;
        if(target>200000)target=200000-1;
        if(target>500000)target=500000-1;
        if(target>1000000)target=1000000-1;
        if(target>2000000)target=2000000-1;
        if(target>3000000)target=3000000-1;
        if(target>5000000)target=5000000-1;

    }
    return {
        ID: Config.MissionID,
        MissionID: Config.MissionID,
        TypeID: Config.TypeID,
        Target: target,
        Completed: 0,
        IsGet: 0,
        GameList: Config.Condition.GameList.join(','),
        Param: target,
        RewardGold: rewardGold
    };
};
MissionManger.prototype.GenMissionType11 = function (Config) {
    var targetFish = Math.floor((Math.random() * (Config.Condition.EndFish - Config.Condition.StartFish) + Config.Condition.StartFish));
    var targetBullet = Math.floor((Math.random() * (Config.Condition.EndBullet - Config.Condition.StartBullet) + Config.Condition.StartBullet) / 100) * 100;
    var rewardGold = Config.Reward.GoldValue;
    return {
        ID: Config.MissionID,
        MissionID: Config.MissionID,
        TypeID: Config.TypeID,
        Target: targetFish,
        Completed: 0,
        IsGet: 0,
        GameList: Config.Condition.GameList.join(','),
        Param: targetFish + ',' + targetBullet,
        RewardGold: rewardGold
    };
};
MissionManger.prototype.GenMissionType12 = function (Config) {
    var targetBulletNum = Math.floor((Math.random() * (Config.Condition.EndBullet - Config.Condition.StartBullet) + Config.Condition.StartBullet));
    var targetEarn = Math.floor((Math.random() * (Config.Condition.EndFishEarn - Config.Condition.StartFishEarn) + Config.Condition.StartFishEarn) / 100) * 100;
    var rewardGold = Config.Reward.GoldValue;
    return {
        ID: Config.MissionID,
        MissionID: Config.MissionID,
        TypeID: Config.TypeID,
        Target: targetBulletNum,
        Completed: 0,
        IsGet: 0,
        GameList: Config.Condition.GameList.join(','),
        Param: targetBulletNum + ',' + targetEarn,
        RewardGold: rewardGold
    };
};
MissionManger.prototype.GenMissionType13 = function (Config) {
    //userMsg: 'Bắt %s loại cá khác nhau trong 1 ván',
    var targetFishType = Math.floor((Math.random() * (Config.Condition.EndFish - Config.Condition.StartFish) + Config.Condition.StartFish));
    var rewardGold = Config.Reward.GoldValue;
    return {
        ID: Config.MissionID,
        MissionID: Config.MissionID,
        TypeID: Config.TypeID,
        Target: targetFishType,
        Completed: 0,
        IsGet: 0,
        GameList: Config.Condition.GameList.join(','),
        Param: targetFishType,
        RewardGold: rewardGold
    };
};
MissionManger.prototype.GenMissionType19 = function (Config, ListMission) {
    var rewardGold = Config.Reward.GoldValue;
    return {
        ID: Config.MissionID,
        MissionID: Config.MissionID,
        TypeID: Config.TypeID,
        Target: ListMission.length,
        Completed: 0,
        IsGet: 0,
        GameList: Config.Condition.GameList.join(','),
        Param: ListMission.length,
        RewardGold: rewardGold
    };
};
MissionManger.prototype.GenMissionListPacket = function (ListMission, LangCode) {
    try {
        var List = [];
        for (var i = 0; i < ListMission.length; i++) {
            if (!Utility.CheckVariable(ListMission[i], 'ID', 'MissionID', 'Target', 'Completed', 'RewardGold', 'Param')) continue;
            var t = this.GetMissionTitleAndDescByID(ListMission[i].MissionID, LangCode);
            if (t != 0) {
                var desc = t.Desc;//.replace('%s', ListMission[i].Target);
                var p = ListMission[i].Param.toString();
                p = p.split(',');
                for (var j = 0; j < p.length; j++) {
                    desc = desc.replace('%s', p[j]);
                }
                List.push({
                    ID: ListMission[i].ID,
                    MissionID: ListMission[i].MissionID,
                    Title: t.Title,
                    Desc: desc,
                    Target: ListMission[i].Target,
                    Completed: ListMission[i].Completed,
                    IsGet: ListMission[i].IsGet,
                    RewardGold: ListMission[i].RewardGold
                });
            }

        }
        if (List.length > 0) {
            return new Packet.MissionListResponse(List);
        }
    } catch (e) {
        console.log("MissionManger.prototype.GenMissionListPacket", e.stack)
    }

    return 0;
};

MissionManger.prototype.GetMissionTitleAndDescByID = function (MissionID, LangCode) {
    var mcfg = this.GetMissionConfigByID(MissionID);
    if (mcfg != 0) {
        var tit = this.Master.GetUserMsgByLangCode(mcfg.Title, LangCode);
        var desc = this.Master.GetUserMsgByLangCode(mcfg.Desc, LangCode);
        return {
            Title: tit,
            Desc: desc
        }
    }
    console.log("GetMissionTitleAndDescByID meo tim thay", MissionID);
    return 0;
};

MissionManger.prototype.GetMissionConfigByID = function (MissionID) {
    try {
        for (var i = 0; i < this.MissionConfig.Detail.length; i++) {
            for (var j = 0; j < this.MissionConfig.Detail[i].MissionList.length; j++) {
                if (this.MissionConfig.Detail[i].MissionList[j].MissionID == MissionID) {
                    return this.MissionConfig.Detail[i].MissionList[j];
                }
            }
        }
    } catch (e) {
        console.log("MissionManger.prototype.GetMissionConfigByID", e.stack);
    }
    console.log("GetMissionConfigByID meo tim thay", MissionID);
    return 0;
};

MissionManger.prototype.GetMissionAward = function (User, ID) {
    if (Utility.CheckVariable(User, 'UserMissionList')) {
        for (var i = 0; i < User.UserMissionList.length; i++) {
            if (User.UserMissionList[i].ID == ID) {
                if (User.UserMissionList[i].Target <= User.UserMissionList[i].Completed) {
                    //Update Tiền
                    //Check DB pls
                    var TimeCheck = new Date();
                    TimeCheck = +TimeCheck - this.TimeReset;
                    var MID = User.UserMissionList[i].MissionID;
                    var RewardGold = User.UserMissionList[i].RewardGold;
                    User.UserMissionList[i].IsGet = 1;
                    this.Master.LogRecorder.dailyMissionGetAndUpdateSafe(TimeCheck, ID, function (rowAffected) {
                        if (rowAffected > 0) {
                            this.Master.SendSocketBinary(User.Socket, new Packet.MissionGetAwardResponse(0, ID));
                            this.Master.AddGoldRewardForUser(User, RewardGold, this.Master.Config.MoneyReasonConfig.OnlineAward, 'Thưởng nhiệm vụ ' + MID + '(' + ID + ')');
                        } else {
                            this.Master.SendSocketBinary(User.Socket, new Packet.MissionGetAwardResponse(2, ID));
                        }
                        this.CalcFunctionNotifyMission(User);
                    }.bind(this));

                    return;
                }
            }
        }
    }
    this.Master.SendSocketBinary(User.Socket, new Packet.MissionGetAwardResponse(1, ID));
};

MissionManger.prototype.OnMissionListOfUserChanged = function (User, ListID) {
    for (var i = 0; i < ListID.length; i++) {
        for (var j = 0; j < User.UserMissionList.length; j++) {
            if (User.UserMissionList[j].ID == ListID[i].ID) {
                User.UserMissionList[j].Completed = ListID[i].Completed;
            }
        }
    }
    this.CheckMissionType19(User);
    this.CalcFunctionNotifyMission(User);
};

MissionManger.prototype.CheckMissionType19 = function (User) {
    var comp = 0;
    var m19 = 0;
    for (var i = 0; i < User.UserMissionList.length; i++) {
        if (User.UserMissionList[i].TypeID == 19) {
            m19 = User.UserMissionList[i];
            continue;
        }
        if (User.UserMissionList[i].Completed >= User.UserMissionList[i].Target) {
            comp++
        }
    }
    if (m19 != 0) {
        m19.Completed = comp;
    }
};

MissionManger.prototype.CalcFunctionNotifyMission = function (User) {
    var isCompleted = false;
    for (var j = 0; j < User.UserMissionList.length; j++) {
        if (User.UserMissionList[j].Completed >= User.UserMissionList[j].Target && User.UserMissionList[j].IsGet != 1) {
            //Hoàn thành và chưa nhận
            isCompleted = true;
        }
    }
    if (isCompleted) {
        this.Master.SendSocketBinary(User.Socket, new Packet.FunctionTriggerResponse(this.Master.Config.FunctionTriggerConfig.MissionFunction.ID, this.Master.Config.FunctionTriggerConfig.MissionFunction.State.HasAward));
    }else{
        this.Master.SendSocketBinary(User.Socket, new Packet.FunctionTriggerResponse(this.Master.Config.FunctionTriggerConfig.MissionFunction.ID, this.Master.Config.FunctionTriggerConfig.MissionFunction.State.NoAward));
    }
};