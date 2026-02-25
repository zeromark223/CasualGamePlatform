/**
 * - Đầu tiên gọi hàm SendSkillInfo khi user vào bàn: Trả về danh sách skill hiện có của game
 * - CalcSkillAppear: Được gọi khi bắn chết cá -> Tính toán điểm skill xuất hiện hoặc hết thời gian sử dụng skill
 * - FireBySkill: Sử dụng skill
 * - UseSkillCatchFish: Sử dụng skill bắt cá
 * */

var Utility = require('../../SharedModule/Utility');
var Packet = require('../Packet');
var SkillModel = require('../Model/SkillModel.js');

function SkillInfo(gameServer, desk) {
    this.GameServer = gameServer;
    this.Desk = desk;
};

module.exports = SkillInfo;

/**
 * User login dzo thì gửi về danh sách skill hiện có của server
 * - SkillID, SkillKind, TimeLostSkill, ScoreLostSkill, NumberFishGet
 * - SkillID đang sử dụng, score = 0
 * */
SkillInfo.prototype.SendSkillInfo = function (userModel) {
    try {
        if (this.GameServer.ListSkill.length > 0) {
            if (userModel.SkillModel == 0) {
                userModel.SkillModel = new SkillModel(userModel, this);
                userModel.SkillModel.SetSkill(this.GameServer.ListSkill[0]);
            }

            var currentSkill = userModel.SkillModel.ID;
            var msg = new Packet.SkillInfoResponse(this.GameServer.ListSkill, currentSkill);
            if (msg != 0) {
                this.GameServer.SendSocketBinary(userModel.Socket, msg);
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('SkillInfo.prototype.SendSkillInfo - try err: ' + e.stack);
    }
};

/**
 * Tính toán khả năng xuất hiện skill
 * - Nếu đang sử dụng skill thì kiểm tra xem hết thời gian chưa
 *      - Đã hết thời gian: tắt skill
 * - Nếu chưa được sử dụng skill
 *      - Kiểm tra next skill +/- điểm skill. Nếu điểm skill > score get skill
 *          - Bật skill, tìm skill tiếp theo
 * */
SkillInfo.prototype.CalcSkillAppear = function (userModel, fishScore) {
    try {
        if (Utility.CheckVariable(this.GameServer.ListSkill)) {
            if (this.GameServer.ListSkill.length > 0) {
                var SkillInfo = userModel.SkillModel;
                if (SkillInfo.IsActive == false) {

                    //trừ điểm skill khi không bắn trúng cá
                    var now = +new Date();
                    var second = (now - SkillInfo.TimeUserKillFish) / 1000;
                    var countTime = second - SkillInfo.TimeLostSkill;
                    if (countTime > 0) {
                        var ScoreLost = countTime * SkillInfo.ScoreLostSkill;
                        SkillInfo.SkillScorePool -= ScoreLost;
                        if (SkillInfo.SkillScorePool < 0) {
                            SkillInfo.SkillScorePool = 0;
                        }
                    }

                    //Cập nhật lại thời điểm bắn chết cá
                    SkillInfo.TimeUserKillFish = now;

                    //Cộng điểm skill
                    SkillInfo.AddSkillScore(fishScore);

                    var msg = new Packet.SkillAppearResponse(SkillInfo.ID, SkillInfo.SkillScorePool, SkillInfo.IsActive);
                    if (msg != 0) {
                        this.GameServer.SendSocketBinary(userModel.Socket, msg);
                    }

                    if (SkillInfo.IsActive) {
                        SkillInfo.SkillScorePool -= SkillInfo.ScoreGetSkill;
                    }
                }
            }
        }

    } catch (e) {
        this.GameServer.Logger.Game().error('SkillInfo.prototype.CalcSkillAppear - try err: ' + e.stack);
    }
};

/**
 * Tính toán khi hết thời gian sử dụng skill
 * - Reset current skill: gán lại skill mới
 * - Tính toán NextSkill, gửi skill hiện tại xuống client
 * */
SkillInfo.prototype.CalcSkillEnd = function (userModel) {
    try {
        var SkillInfo = userModel.SkillModel;
        SkillInfo.SetSkill(this.CalcNextSkill(SkillInfo.ID));

        var msg = new Packet.SkillAppearResponse(SkillInfo.ID, 0, false);
        if (msg != 0) {
            this.GameServer.SendSocketBinary(userModel.Socket, msg);
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('SkillInfo.prototype.CalcSkillEnd - try err: ' + e.stack);
    }
};

/**
 * Tìm skill tiếp theo
 * */
SkillInfo.prototype.CalcNextSkill = function (SkillID) {
    var nextSkill = 0;
    try {
        var index = this.FindSkillIndexBySkillID(SkillID);
        if (index > -1) {
            index++;
            if (index >= this.GameServer.ListSkill.length) {
                index = 0;
            }
            else {

            }
            nextSkill = this.GameServer.ListSkill[index];
        }

    } catch (e) {
        this.GameServer.Logger.Game().error('SkillInfo.prototype.CalcNextSkill - try err: ' + e.stack);
    }

    return nextSkill;
};

/**
 * Sử dụng skill
 * Kiểm tra skill có được sử dụng hay không
 * - Có: kiểm tra còn thời gian sử dụng không?
 *   - Còn: add dzô danh sách skill_bullet
 *   - Không: không ghi nhận đạn skill
 * */
SkillInfo.prototype.FireBySkill = function (userModel, angle, x, y) {
    try {
        var SkillInfo = userModel.SkillModel;
        if (Utility.CheckVariable(SkillInfo)) {
            var result = SkillInfo.UserFire();
            if (result) {
                var msg = new Packet.UseSkillResponse(userModel.StationID, angle, x, y, SkillInfo.LastedBulletID, SkillInfo.ID);
                if (msg != 0) {
                    this.Desk.SendAllPlayer(msg);
                }
            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('SkillInfo.prototype.FireBySkill - try err: ' + e.stack);
    }
};

/**
 * Sử dụng skill bắt cá
 * - Kiểm tra skill còn hiệu lực hay không?
 *      - Còn: Duyệt từng con cá client gửi lên
 * */
SkillInfo.prototype.UseSkillCatchFish = function (userModel, bulletID, skillID, lstFishID) {
    try {
        var SkillInfo = 0;

        //check vien dan cuoi cung
        if(skillID != userModel.SkillModel.ID){
            //check prev skill
            if(skillID == userModel.SkillModel.PrevSkill
            && userModel.SkillModel.PrevSkill != -1){
                //tim config cua prev skill
                SkillInfo = this.FindSkillBySkillID(userModel.SkillModel.PrevSkill);
                //Prev skill chi dung 1 lan
                userModel.SkillModel.PrevSkill = -1;
            }
            else{
                //khong hop le
                return;
            }
        }
        else{
            SkillInfo = userModel.SkillModel;
        }

        if (SkillInfo != 0 && Utility.CheckVariable(SkillInfo)) {
            if (bulletID == SkillInfo.LastedBulletID
                && SkillInfo.LastedBulletID != -1) {

                SkillInfo.UserCatchFish();
                var length = lstFishID.length;
                if (length > SkillInfo.NumberFishGet) {
                    length = SkillInfo.NumberFishGet;
                }

                var fish;
                var j;
                var totalMul = 0;
                for (j = 0; j < length; j++) {
                    fish = this.Desk.GetFishDetailInDesk(lstFishID[j]);
                    if (fish != 0) {
                        totalMul += fish.CalcMultiple;// Lấy multiple
                    }
                }
                var powerGun = this.CalcPowerGun(SkillInfo.GoldLimit,totalMul);
                for (j = 0; j < length; j++) {
                    this.Desk.OnCatchFishWithoutRemove(userModel, lstFishID[j], powerGun, 1, skillID);
                }

                //Ket thuc timer neu la skill 4
                if(SkillInfo.ID == 4){
                    clearTimeout(SkillInfo.TimerEndSkill);
                    SkillInfo.EndSkill();
                }

            }
        }
    } catch (e) {
        this.GameServer.Logger.Game().error('SkillInfo.prototype.UseSkillCatchFish - try err: ' + e.stack);
    }
};


SkillInfo.prototype.FindSkillIndexBySkillID = function (SkillID) {
    var index = -1;
    for (var i = 0; i < this.GameServer.ListSkill.length; i++) {
        if (this.GameServer.ListSkill[i].ID == SkillID) {
            index = i;
            break;
        }
    }
    return index;
};

SkillInfo.prototype.CalcPowerGun = function (goldLimit, totalMultiple) {
    if (goldLimit < 0) goldLimit = 0;
    if (totalMultiple <= 0) totalMultiple = 1;
    var powerGun = goldLimit / totalMultiple;
    return Math.floor(powerGun);
};

SkillInfo.prototype.FindSkillBySkillID = function(SkillID){

    for (var i = 0; i < this.GameServer.ListSkill.length; i++) {
        if (this.GameServer.ListSkill[i].ID == SkillID) {
            return this.GameServer.ListSkill[i];
        }
    }
    return 0;
};