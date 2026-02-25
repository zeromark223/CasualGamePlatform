/**
 * Created by ngocnpt on 29-May-17.
 */
var Utility = require('../../../SharedModule/Utility');

function MissionManager(Main) {
    this.Main = Main;
    this.TimeReset = 7 * 60 * 1000; // 7h Sáng
}

module.exports = MissionManager;


MissionManager.prototype.RecordMissionForUser = function (Player) {
    //Player.UserMissionList[i]
    var TimeCheck = new Date();
    TimeCheck = +TimeCheck - this.TimeReset;
    var listIDChange = [];
    for (var i = 0; i < Player.UserMissionList.length; i++) {
        if (Player.UserMissionList[i].IsChanged) {
            listIDChange.push({
                    ID: Player.UserMissionList[i].ID,
                    Completed: Player.UserMissionList[i].Completed
                }
            );
            this.Main.LogRecorder.dailyMissionRecordByGame(TimeCheck, Player.UserMissionList[i].ID, Player.UserMissionList[i].Completed);
        }
    }
    return listIDChange;
};

MissionManager.prototype.LoadMissionForUser = function (Player) {
    //Player.UserMissionList[i]
    var TimeCheck = new Date();
    TimeCheck = +TimeCheck - this.TimeReset;
    Player.UserMissionList = [];
    this.Main.LogRecorder.dailyMissionGetAllByGame(TimeCheck, Player.UserID, function (e, d) {
        if (e == 0) {
            if (d.length > 0) { // có nv
                var ml = d;
                for (var i = 0; i < ml.length; i++) {
                    if (Utility.CheckVariable(ml[i], 'GameList')) {
                        var gl = ml[i].GameList;
                        gl = gl.toString().split(',');
                        if (gl.indexOf(this.Main.GameID + '') > -1) {
                            ml[i].IsChanged = false;
                            Player.UserMissionList.push(ml[i]);
                            ml[i].Condition = ml[i].Param.toString().split(','); // Init condition
                        }

                    }
                }
            }
        }
    }.bind(this));

};

MissionManager.prototype.RecordMissionOnEndGame = function (Player) {
    var MissionType0 = 0;
    for (var i = 0; i < Player.UserMissionList.length; i++) {
        switch (Player.UserMissionList[i].TypeID) {
            case 0:
                MissionType0 = Player.UserMissionList[i];
                break;
            case 1:
                this.RecordMissionType1(Player, Player.UserMissionList[i]);
                break;
            case 2:
                this.RecordMissionType2(Player, Player.UserMissionList[i]);
                break;
            case 3:
                this.RecordMissionType3(Player, Player.UserMissionList[i]);
                break;
            case 4:
                this.RecordMissionType4(Player, Player.UserMissionList[i]);
                break;
            case 10:
                this.RecordMissionType10(Player, Player.UserMissionList[i]);
                break;
            case 11:
                this.RecordMissionType11(Player, Player.UserMissionList[i]);
                break;
            case 12:
                this.RecordMissionType12(Player, Player.UserMissionList[i]);
                break;
            case 13:
                this.RecordMissionType13(Player, Player.UserMissionList[i]);
                break;
            default :
                break;
        }
    }
    if (MissionType0 != 0) {
        this.RecordMissionType19(Player, MissionType0, Player.UserMissionList);
    }
};

MissionManager.prototype.RecordMissionType19 = function (Player, Mission, UserMissionList) {
    var comp = 0;
    for (var i = 0; i < UserMissionList.length; i++) {
        if (UserMissionList[i].Type == 0) {
            continue;//ko count chính nó;
        }
        if (UserMissionList[i].Completed >= UserMissionList[i].Target) {
            comp++;
        }
    }
    if (comp > 0) {
        Mission.IsChanged = true;
    }
    Mission.Completed += comp;
    if (Mission.Completed > Mission.Target) {
        Mission.Completed = Mission.Target;
    }
};

MissionManager.prototype.RecordMissionType1 = function (Player, Mission) {
    var comp = Player.TotalGoldUserPayForSys;
    if (comp > 0) {
        Mission.Completed += comp;
        Mission.IsChanged = true;
    }

    if (Mission.Completed > Mission.Target) {
        Mission.Completed = Mission.Target;
    }
};

MissionManager.prototype.RecordMissionType2 = function (Player, Mission) {
    var comp = Player.MatchPlayed;
    if (comp > 0) {
        Mission.Completed += comp;
        Mission.IsChanged = true;
    }
    if (Mission.Completed > Mission.Target) {
        Mission.Completed = Mission.Target;
    }
};

MissionManager.prototype.RecordMissionType3 = function (Player, Mission) {
    //BC
    var dif = +new Date() - +Player.TimeIn;
    dif = Math.floor(dif / 60000);
    if (dif > 0) {
        Mission.Completed += dif;
        Mission.IsChanged = true;
        if (Mission.Completed > Mission.Target) {
            Mission.Completed = Mission.Target;
        }
    }

};


MissionManager.prototype.RecordMissionType4 = function (Player, Mission) {
    //userMsg: 'Thắng %s gold từ bắn cá',
    var moneyBegin = Player.BeginWallet;
    var moneyCurrent = Player.FishScore || Player.Wallet;

    var comp = moneyCurrent - moneyBegin;
    if (comp > 0) {
        Mission.Completed += comp;
        Mission.IsChanged = true;
    }
    if (Mission.Completed > Mission.Target) {
        Mission.Completed = Mission.Target;
    }
};

MissionManager.prototype.RecordMissionType10 = function (Player, Mission) {
    //userMsg: 'Thắng %s gold từ bắn cá',
    var moneyBegin = Player.BeginWallet;
    var moneyCurrent = Player.FishScore;

    var comp = moneyCurrent - moneyBegin;
    if (comp > 0) {
        Mission.Completed += comp;
        Mission.IsChanged = true;
    }
    if (Mission.Completed > Mission.Target) {
        Mission.Completed = Mission.Target;
    }
};

MissionManager.prototype.RecordMissionOnKillFish = function (Player, FishKind, Bullet, Earn, NumHit, NumFish) {
    if (Player.RecordMissionOnKillFishByPass) return; // By pass thì bỏ qua
    this.RecordMissionOnKillFish11(Player, FishKind, Bullet, Earn, NumHit, NumFish);
    this.RecordMissionOnKillFish12(Player, FishKind, Bullet, Earn, NumHit, NumFish);
    if (Player.RecordMissionType11ByPass && Player.RecordMissionType12ByPass) Player.RecordMissionOnKillFishByPass = true;

};

MissionManager.prototype.RecordMissionOnKillFish11 = function (Player, FishKind, Bullet, Earn, NumHit, NumFish) {
    if (Bullet <= 0) return;//NV này chỉ track khi bắn
    if (Player.RecordMissionType11ByPass) return; // By pass thì bỏ qua
    //userMsg: 'Bắt %s cá bằng súng %s gold trở lên',
    if (!Player.RecordMissionType11Data) { // First Init
        var Mission = this.FindMissionByTypeID(Player, 11);
        if (Mission == 0) {
            Player.RecordMissionType11ByPass = true;
            return;
        }
        var xBullet = 999999;
        if (Utility.CheckVariable(Mission.Condition, 'length')) {
            xBullet = Mission.Condition[1] || 999999;
        }
        Player.RecordMissionType11Data = {
            Target: Mission.Target,
            Completed: Mission.Completed,
            Condition: xBullet
        }
    }
    if (Bullet >= Player.RecordMissionType11Data.Condition) {
        Player.RecordMissionType11Data.Completed++;
        if (Player.RecordMissionType11Data.Completed >= Player.RecordMissionType11Data.Target) {
            Player.RecordMissionType11ByPass = true;
        }
    }

};

MissionManager.prototype.RecordMissionOnKillFish12 = function (Player, FishKind, Bullet, Earn, NumHit, NumFish) {
    if (Earn <= 0) return;//NV này chỉ track khi ăn
    if (Player.RecordMissionType12ByPass) return; // By pass thì bỏ qua
    //userMsg: 'Bắn %s  viên đạn và ăn %s gold trở lên',
    if (!Player.RecordMissionType12Data) { // First Init
        var Mission = this.FindMissionByTypeID(Player, 12);
        if (Mission == 0) {
            Player.RecordMissionType12ByPass = true;
            return;
        }
        var xEarn = 99999999;
        if (Utility.CheckVariable(Mission.Condition, 'length')) {
            xEarn = Mission.Condition[1] || 999999;
        }
        Player.RecordMissionType12Data = {
            Target: Mission.Target,
            Completed: Mission.Completed,
            Condition: xEarn
        }
    }
    if (Earn >= Player.RecordMissionType12Data.Condition) {
        Player.RecordMissionType12Data.Completed++;
        if (Player.RecordMissionType12Data.Completed >= Player.RecordMissionType12Data.Target) {
            Player.RecordMissionType12ByPass = true;
        }
    }
};

MissionManager.prototype.RecordMissionType11 = function (Player, Mission) {
    if (!Player.RecordMissionType11Data) return;
    Mission.IsChanged = true;
    Mission.Completed = Player.RecordMissionType11Data.Completed;
};

MissionManager.prototype.RecordMissionType12 = function (Player, Mission) {
    if (!Player.RecordMissionType12Data) return;
    Mission.IsChanged = true;
    Mission.Completed = Player.RecordMissionType12Data.Completed;
};

MissionManager.prototype.RecordMissionType13 = function (Player, Mission) {
    if (Mission.Target <= Player.FishHistory.length) { // Đủ loại cá
        Mission.IsChanged = true;
        Mission.Completed = Mission.Target;
    }
};

MissionManager.prototype.FindMissionByTypeID = function (Player, TypeID) {
    if (!Utility.CheckVariable(Player, 'UserMissionList')) return 0;
    for (var i = 0; i < Player.UserMissionList.length; i++) {
        if (Player.UserMissionList[i].TypeID == TypeID) {
            return Player.UserMissionList[i];
        }
    }
    return 0;
};