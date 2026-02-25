/**
 * Created by quinx on 11/9/2017.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function GlobalBossUseSkill(BossID, SkillID, Direction, TimeEffect, Distance) {
    return this.AddHeader(Define.GlobalBossUseSkill, new BinaryBuilder(
        {
            BossID: BossID,
            SkillID: SkillID,
            Direction: Direction,
            TimeEffect: TimeEffect,
            Distance: Distance
        },
        Struct.GlobalBossUserSkillResponse
    ));

}
module.exports = GlobalBossUseSkill ;
GlobalBossUseSkill.prototype = new Packet();