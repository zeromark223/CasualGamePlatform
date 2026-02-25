var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UseSkillResponse(deskStation, angle, x, y, bulletID, skillID) {
    deskStation = deskStation || 0;
    angle = angle || 0;
    x = x || 0;
    y = y || 0;
    bulletID = bulletID || 0;
    skillID = skillID || 0;

    try {
        return this.AddHeader(Define.FireSkill, new BinaryBuilder(
            {
                DeskStation: deskStation,
                Angle: angle,
                x: x,
                y: y,
                BulletID: bulletID,
                SkillID: skillID
            },
            Struct.FireSkill
        ));
    } catch (e) {
        console.log('Packet -> UseSkillResponse - try err: ', e.stack);
    }

    return 0;
};

module.exports = UseSkillResponse;
UseSkillResponse.prototype = new Packet();