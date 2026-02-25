var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function SkillInfoResponse(lstSkill, currentSkillID) {
    lstSkill = lstSkill || [];
    currentSkillID = currentSkillID || 0;

    try {
        return this.AddHeader(Define.SendSkillInfo, new BinaryBuilder(
            {
                ListSkill: lstSkill,
                CurrentSkill: currentSkillID
            },
            Struct.SkillInfo
        ));
    } catch (e) {
        console.log('Packet -> SkillInfoResponse - try err: ', e.stack);
    }

    return 0;
};

module.exports = SkillInfoResponse;
SkillInfoResponse.prototype = new Packet();