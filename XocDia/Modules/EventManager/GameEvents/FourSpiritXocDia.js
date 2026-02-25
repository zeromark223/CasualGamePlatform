/**
 * Created by Ngoc on 01-05-2018.
 */
var GameEvents = require('./GameEvents');
var Utility = require('../../../../SharedModule/Utility');
var Packet = require('../../../Packet');

function FourSpiritXocDia() {
    GameEvents.apply(this, Array.prototype.slice.call(arguments)); // Câu thần chú. Bỏ là ăn cám.
}

module.exports = FourSpiritXocDia;
FourSpiritXocDia.prototype = new GameEvents();

FourSpiritXocDia.prototype.EvtOnUserEndMatch = function (User, BetList, WinList) {
    try {
        if (!this.Run) return; // Event Kết thúc
        var isCheat = this.CheckRuleAntiCheat(BetList);
        if (!User.FourSpiritData) {
            this.ResetUserData(User,0)
        }
        if (BetList.length <= 0) return;//Thằng này offline và đã transfer, next nó đi.
        if (!Utility.CheckVariable(this.EventConfig, 'ListCheck', 'Reward')) return;// ko đủ param
        if (!isCheat) {//ko Cheat mới record Event
            var win = 0;
            var lose = 0;
            var i;
            var maxBet = 0;
            for (i = 0; i < BetList.length; i++) {
                if (this.EventConfig.ListCheck.indexOf(BetList[i].ID) > -1) {
                    if (BetList[i].Money > maxBet) {
                        maxBet = BetList[i].Money;
                    }
                    lose += BetList[i].Money;
                }
            }
            for (i = 0; i < WinList.length; i++) {
                if (this.EventConfig.ListCheck.indexOf(WinList[i].ID) > -1) {
                    win += WinList[i].WinGoldNoTax;
                }
            }
            if (win == lose) {
                return
            }
            if (maxBet > User.FourSpiritData.MaxMoneyBet) {
                User.FourSpiritData.MaxMoneyBet = maxBet;
            }
            if (win > lose) {//win
                if (User.FourSpiritData.Win < 0) {
                    this.ResetUserData(User, maxBet);
                }
                User.FourSpiritData.Win++;
            } else {// lose
                if (User.FourSpiritData.Win > 0) {
                    this.ResetUserData(User, maxBet);
                }
                User.FourSpiritData.Win--;
            }
            this.CheckAndGetReward(User);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('FourSpirit.prototype.EvtOnUserEndMatch - try err: ' + e.stack);
    }

};

FourSpiritXocDia.prototype.EvtOnUserEnter = function (User, DisConnectedUser) {
    if (!this.Run) return; // Event Kết thúc
    if (DisConnectedUser != 0) {
        User.FourSpiritData = DisConnectedUser.FourSpiritData;
    } else {
        this.GameServer.RedisAdapter.hget(this.DataKey, User.UserID + '', function (e, d) {
            this.EvtInitUserDataEvent(User);
            if (!e) {

                try {
                    var data = JSON.parse(d);
                    User.FourSpiritData.Win = data.Win;
                    User.FourSpiritData.MaxMoneyBet = data.MaxMoneyBet;
                    User.FourSpiritData.Track = data.Track;
                } catch (e) {
                    this.GameServer.Logger.Game().error('FourSpirit.prototype.EvtOnUserEnter - try err: ' + e.stack);
                }
            }
        }.bind(this));
    }

};

FourSpiritXocDia.prototype.EvtInitUserDataEvent = function (User) {
    this.ResetUserData(User, 0);
};

FourSpiritXocDia.prototype.CheckRuleAntiCheat = function (BetList) {
    var isCheat = 0;
    if (this.FindBetID(1, BetList) != 0 && this.FindBetID(2, BetList) != 0) {
        isCheat = 1;
    }
    return isCheat;
};

FourSpiritXocDia.prototype.FindBetID = function (ID, BetList) {
    for (var i = 0; i < BetList.length; i++) {
        if (BetList[i].ID == ID) {
            return BetList[i];
        }
    }
    return 0;
};

FourSpiritXocDia.prototype.CheckAndGetReward = function (User) {
    try {//Record
        var WinTrack = [];
        var i;
        for (i = 0; i < this.EventConfig.Reward.length; i++) {
            var reward = this.EventConfig.Reward[i];
            if (reward.Win > 0) {
                if (User.FourSpiritData.Win >= reward.Win) {
                    //check
                    if (User.FourSpiritData.MaxMoneyBet >= reward.BetRequireGold) {
                        WinTrack.push(reward);
                    }
                }
            } else {
                if (User.FourSpiritData.Win <= reward.Win) {
                    if (User.FourSpiritData.MaxMoneyBet >= reward.BetRequireGold) {
                        WinTrack.push(reward);
                    }
                }
            }

        }
        var winMax = 0;
        var pick = 0;
        if (WinTrack.length > 0) {
            for (i = 0; i < WinTrack.length; i++) {
                WinTrack[i].Win = Math.abs(WinTrack[i].Win);
                if (WinTrack[i].Win > winMax) {
                    winMax = WinTrack[i].Win;
                    pick = WinTrack[i];
                }
            }

        }
        if (pick != 0) {
            var find = 0;
            for (var i = 0; i < User.FourSpiritData.Track.length; i++) {
                if (pick.Win == User.FourSpiritData.Track[i].Win) {
                    find = 1;
                }
            }
            if (find == 0) {
                User.FourSpiritData.Track.push(pick);
                if (pick.IsEndLine == 1) {
                    this.ResetUserData(User, 0);
                }
                this.AddRewardForUser(User, pick.Gold, pick.Name, pick);
            }


        }
        if (!this.Run) return; // Event Kết thúc
        User.FourSpiritData.UpdateTime = +new Date();//Set Time
        this.GameServer.RedisAdapter.hset(this.DataKey, User.UserID + '', JSON.stringify(User.FourSpiritData));

    } catch (e) {
        this.GameServer.Logger.Game().error('SlotCollectItem.prototype.EvtOnUserOutGame - try err: ' + e.stack);
    }

};

FourSpiritXocDia.prototype.ResetUserData = function (User, maxBet) {
    if (!User.FourSpiritData) {
        User.FourSpiritData = {};
    }

    User.FourSpiritData.UpdateTime = +new Date();
    User.FourSpiritData.Win = 0;
    User.FourSpiritData.MaxMoneyBet = maxBet;
    User.FourSpiritData.Track = [];
};

FourSpiritXocDia.prototype.AddRewardForUser = function (User, Reward, SpiritName, Config) {
    var isGet = 0;
    if (User.UserState == this.GameServer.UserStateDefine.JoinRoomCompleted) {//User đang ko ở trạng thái khác
        User.Wallet += +(Reward || 0);
        isGet = 1;
        this.GameServer.SendSocketBinary(User.Socket, new Packet.UpdateUserGoldResponse(User.Wallet));
        this.GameServer.ShowPopup(User.Socket, "Triệu hồi " + SpiritName + " thành công nhận được " + numberWithCommas(Reward) + " gold ");
    } else {
        if (User.UserState == this.GameServer.UserStateDefine.LogOut) {
            this.GameServer.MoneyRefundWinGoldForOfflineUser(User, Reward);
            isGet = 1;
        } else {
            this.GameServer.Logger.Game().error('DeskCore.prototype.HandleUserWin - Trạng thái refund bất thường', User.UserState, "TotalWin Gold", Reward);
        }
    }
    this.RecordEvent(User, Reward, Config, isGet);
};

FourSpiritXocDia.prototype.OnTurnOnTrigger = function () {
    try {
        for (var i = 0; i < this.GameServer.UserClient.length; i++) {
            if (Utility.CheckVariable(this.GameServer.UserClient[i], 'UserModel')) {
                var user = this.GameServer.UserClient[i].UserModel;
                this.EvtInitUserDataEvent(user);//Tạo data cho user
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('FourSpirit.prototype.OnTurnOnTrigger - try err: ' + e.stack);
    }

};

FourSpiritXocDia.prototype.EvtOnUserOutGame = function (User) {
    // if (!this.Run) return;
    // try {
    //     //#3
    //     this.GameServer.RedisAdapter.hset(this.DataKey, User.UserID + '', JSON.stringify(User.FourSpiritData));
    // } catch (e) {
    //     this.GameServer.Logger.Game().error('SlotCollectItem.prototype.EvtOnUserOutGame - try err: ' + e.stack);
    // }

};

FourSpiritXocDia.prototype.RecordEvent = function (User, Reward, RewardConfig, isGet) {
    var updateTime = +new Date();
    var history = {
        UpdateTime: updateTime,
        FourSpiritData: User.FourSpiritData,
        Reward: Reward,
        RewardConfig: RewardConfig,
        IsGet: isGet
    };
    history = JSON.stringify(history);
    this.GameServer.RedisAdapter.lpush(this.DataKey + ":Log", history);
};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
