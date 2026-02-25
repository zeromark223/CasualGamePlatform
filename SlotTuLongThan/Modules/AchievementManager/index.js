/**
 * Created by ngocnpt on 26-May-17.
 */
var AchievementConfig = require('../../../Config/Common/AchievementConfig');
var Utility = require('../../../SharedModule/Utility');

function AchievementManger(Main) {
    this.Main = Main;
    this.AchievementConfig = AchievementConfig;
    this.TimeReset = 7 * 60 * 1000; // 7h Sáng
    this.ModuleForceTurnOff = false;
}

module.exports = AchievementManger;

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

AchievementManger.prototype.FindConfigByID = function (ID) {
    for (var i = 0; i < this.AchievementConfig.length; i++) {
        if (this.AchievementConfig[i].AchievementID == ID) {
            return this.AchievementConfig[i];
        }
    }
    return 0;
};

AchievementManger.prototype.LoadAchievementMangerForUser = function (Player) {
    if(this.ModuleForceTurnOff)return;
    Player.UserAchievementList = [];
    this.Main.LogRecorder.achievementGetAllByGame(Player.UserID, function (e, d) {
        if (e == 0) {
            if (d.length > 0) { // có nv
                Player.UserAchievementList = this.ParseAchievementData(d[0].CompletedData, d[0].GetRewardData);
            }
        }
    }.bind(this));
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

AchievementManger.prototype.ParseAchievementData = function (CompletedData, GetRewardData) {
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
    for (var i = 0; i < clArr.length; i++) {
        if (!Utility.CheckVariable(clArr[i])) continue;//Data sai bỏ qua
        cfg = this.FindConfigByID(i);
        if (cfg != 0) {
            a = {
                AchievementID: i,
                Target: cfg.Condition.Target,
                Completed: +clArr[i],
                IsGet: +glArr[i] || 1, //
                RewardGold: cfg.Reward.GoldValue,
                GameList: cfg.Condition.GameList,
                TypeID: cfg.TypeID
            };
            al.push(a);
        }

    }
    return al;
};

AchievementManger.prototype.RecordAchievementManagerOnEndGame = function (Player) {
    if(this.ModuleForceTurnOff)return;
    for (var i = 0; i < Player.UserAchievementList.length; i++) {
        if(Player.UserAchievementList[i].GameList.indexOf(this.Main.GameID) == -1 && Player.UserAchievementList[i].GameList.indexOf(-1) == -1)continue;//Chỉ record achi của mình bớt hàng sáo
        switch (Player.UserAchievementList[i].TypeID) {
            case 1:
                this.RecordAchievementType1(Player, Player.UserAchievementList[i]);
                break;
            case 2:
                this.RecordAchievementType2(Player, Player.UserAchievementList[i]);
                break;
            case 3:
                this.RecordAchievementType3(Player, Player.UserAchievementList[i]);
                break;
            case 4:
                this.RecordAchievementType4(Player, Player.UserAchievementList[i]);
                break;
            case 5:
                this.RecordAchievementType5(Player, Player.UserAchievementList[i]);
                break;
            case 6:
                this.RecordAchievementType6(Player, Player.UserAchievementList[i]);
                break;
        }

    }

};

AchievementManger.prototype.RecordAchievementType1 = function (Player, Achievement) {
    var cfg = this.FindConfigByID(Achievement.AchievementID);
    var FishKind = cfg.Condition.FishKind;
    var comp = this.CalcFishCountByFishKind(Player.FishHistory, FishKind);

    if (comp > 0) {
        Achievement.Completed += comp;
        Player.UserAchievementListChangeFlag = 1;
        if (Achievement.Completed > Achievement.Target) Achievement.Completed = Achievement.Target;
    }

};

AchievementManger.prototype.RecordAchievementType2 = function (Player, Achievement) {
    var cfg = this.FindConfigByID(Achievement.AchievementID);
    if (!Utility.CheckVariable(Player, 'MaxComboWin')) {
        Player.MaxComboWin = 0;
    }
    if (Player.MaxComboWin > Achievement.Completed) {
        Achievement.Completed = Player.MaxComboWin;
        Player.UserAchievementListChangeFlag = 1;
        if (Achievement.Completed > Achievement.Target) Achievement.Completed = Achievement.Target;
    }

};

AchievementManger.prototype.RecordAchievementType3 = function (Player, Achievement) {
    var cfg = this.FindConfigByID(Achievement.AchievementID);
    if (!Utility.CheckVariable(Player, 'VQMMRoll')) {
        Player.VQMMRoll = 0;
    }
    if (Player.VQMMRoll > 0) {
        Achievement.Completed += Player.MaxComboWin;
        Player.UserAchievementListChangeFlag = 1;
        if (Achievement.Completed > Achievement.Target) Achievement.Completed = Achievement.Target;
    }

};

AchievementManger.prototype.RecordAchievementType4 = function (Player, Achievement) {
    var cfg = this.FindConfigByID(Achievement.AchievementID);
    if (!Utility.CheckVariable(Player, 'MaxComboLose')) {
        Player.MaxComboLose = 0;
    }
    if (Player.MaxComboLose > Achievement.Completed) {
        Achievement.Completed = Player.MaxComboLose;
        Player.UserAchievementListChangeFlag = 1;
        if (Achievement.Completed > Achievement.Target) Achievement.Completed = Achievement.Target;
    }
};

AchievementManger.prototype.RecordAchievementType5 = function (Player, Achievement) {
    var cfg = this.FindConfigByID(Achievement.AchievementID);
    if (!Utility.CheckVariable(Player, 'SlotRollCount')) {
        Player.SlotRollCount = 0;
    }
    if (Player.SlotRollCount > 0) {
        Achievement.Completed += Player.SlotRollCount;
        Player.UserAchievementListChangeFlag = 1;
        if (Achievement.Completed > Achievement.Target) Achievement.Completed = Achievement.Target;
    }
};

AchievementManger.prototype.RecordAchievementType6 = function (Player, Achievement) {
    var cfg = this.FindConfigByID(Achievement.AchievementID);
    if (!Utility.CheckVariable(Player, 'MaxComboLose')) {
        Player.MaxComboLose = 0;
    }
    if (Player.MaxComboLose > Achievement.Completed) {
        Achievement.Completed = Player.MaxComboLose;
        Player.UserAchievementListChangeFlag = 1;
        if (Achievement.Completed > Achievement.Target) Achievement.Completed = Achievement.Target;
    }

};

AchievementManger.prototype.CalcFishCountByFishKind = function (FishHistory, FishKindList) {
    var comp = 0;
    for (var i = 0; i < FishHistory.length; i++) {
        if (FishKindList.indexOf(FishHistory[i].K) > -1 || FishKindList[0] == -1) { // Coi FishKind này có cá này ko, or -1 là check all
            comp += FishHistory[i].F;
        }
    }
    return comp;
};

AchievementManger.prototype.RecordAchievementForUser = function (Player, callback) {
    if(this.ModuleForceTurnOff)return;
    var Data = this.BuildAchievementData(Player.UserAchievementList);
    var IsChanged = Player.UserAchievementListChangeFlag;
    if (IsChanged) {
        this.Main.LogRecorder.achievementRecordByGameUnSafe(Player.UserID, Data.CompletedList, function (e) {
            callback(IsChanged);
        });
        return;
    }
    callback(IsChanged);
};