var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function SkillAppearResponse(skillID, skillScore, isUseSkill) {
    skillID = skillID || 0;
    skillScore = skillScore || 0;
    isUseSkill = isUseSkill || 0;

    try {
        return this.AddHeader(Define.SkillAppear, new BinaryBuilder(
            {
                SkillID: skillID,
                SkillScore: skillScore,
                IsUseSkill: isUseSkill
            },
            Struct.SkillAppear
        ));
    } catch (e) {
        console.log('Packet -> SkillAppearResponse - try err: ', e.stack);
    }

    return 0;
};

module.exports = SkillAppearResponse;
SkillAppearResponse.prototype = new Packet();