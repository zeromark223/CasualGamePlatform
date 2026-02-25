/**
 * Created by quinx on 8/16/2017.
 */


function SkillModel(UserModel, SkillInfo) {
    this.UserModel = UserModel;
    this.SkillInfo = SkillInfo;
    this.SkillScorePool = 0;

    this.ID = 0;
    this.TimeLostSkill = 0;
    this.ScoreGetSkill = 0;
    this.TimeEffect = 0;
    this.TimeCooldown = 0;
    this.PowerGun = 0;
    this.NumberFishGet = 0;
    this.ScoreLostSkill = 0;
    this.TimeLostSkill = 0;

    this.TimeUserKillFish = 0;
    this.IsActive = false;
    this.GoldLimit = 0;
    this.TimeUserFire = 0;
    this.LastedBulletID = -1;

    //anti cheat
    this.PrevSkill = -1;
}
module.exports = SkillModel;

SkillModel.prototype.SetSkill = function (SkillInfo) {
    this.ID = SkillInfo.ID;
    this.ScoreGetSkill = SkillInfo.ScoreGetSkill;
    this.TimeEffect = SkillInfo.TimeEffect;
    this.PowerGun = SkillInfo.PowerGun;
    this.NumberFishGet = SkillInfo.NumberFishGet;
    this.ScoreLostSkill = SkillInfo.ScoreLostSkill;
    this.TimeLostSkill = SkillInfo.TimeLostSkill;
    this.TimeCooldown = SkillInfo.TimeCooldown;
    this.GoldLimit = SkillInfo.GoldLimit;

    this.IsActive = false;
    this.TimeUserKillFish = +new Date();
    this.TimeUserFire = 0;
    this.TimerEndSkill = 0;
};

SkillModel.prototype.AddSkillScore = function (SkillScore) {
    try {
        this.SkillScorePool += SkillScore;

        if (this.SkillScorePool >= this.ScoreGetSkill) {
            this.SkillScorePool = this.ScoreGetSkill;
            //TODO: Active and Go to next skill
            this.IsActive = true;
            //Đếm tg nhảy qua skill mới
            this.SetTimerEndSkill();
        }
    }
    catch (e) {
        this.UserModel.GameServer.Logger.Game().error('SkillModel.prototype.AddSkillScore - try err: ' + e);
    }
};

SkillModel.prototype.SetTimerEndSkill = function () {
    try {
        //Kết thúc skill, request skill mới
        this.TimerEndSkill = setTimeout(function () {
            this.EndSkill();
        }.bind(this), this.TimeEffect * 1000);
    }
    catch (e) {
        this.UserModel.GameServer.Logger.Game().error('SkillModel.prototype.SetTimerEndSkill - try err: ' + e);
    }
};

SkillModel.prototype.UserFire = function () {
    try {
        var now = +new Date();
        var TimeCount = (now - this.TimeUserFire) / 1000;

        if (this.IsActive) {
            if (this.TimeUserFire == 0
                || TimeCount >= this.TimeCooldown) {
                this.TimeUserFire = now;
                this.LastedBulletID++;
                if(this.LastedBulletID > 10){
                    this.LastedBulletID = 0;
                }
                return true;
            }
        }
    }
    catch (e) {
        this.UserModel.GameServer.Logger.Game().error('SkillModel.prototype.UserFire - try err: ' + e);
    }

    return false;
};

SkillModel.prototype.UserCatchFish = function(){
    this.LastedBulletID = -1;
};

SkillModel.prototype.EndSkill = function(){
    this.IsActive = false;
    this.PrevSkill = this.ID;
    this.SkillInfo.CalcSkillEnd(this.UserModel);
};