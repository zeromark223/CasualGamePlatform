/**
 * Created by ngocnpt on 28/06/2016.
 */
module.exports = {
    LoginGame: 2001, //Gói đầu tiên, gửi login
    ListUserInDesk: 2002, // Trả về list User trong bàn chơi
    UserCome: 2003, // Báo user vào bàn cho user khác
    ShowMsg: 2004, // Show 1 msg
    UserFire: 2005, // Bắn đạn
    SpawnFish: 2006, // Thả cá
    CatchFish: 2007, // Đạn trúng cá thì gửi
    UserLeft: 2008, // User thoát bàn
    SpawnParadeFish: 2009, // Thả cá trận
    SendSkillInfo: 2010, // gửi skill info
    FireSkill: 2011, // user bắn skill
    SkillAppear: 2012, // kick hoat skill cho user
    ClearFish: 2013, // giải tán cá (khi ra cá trận hoặc abc xyz)
    SkillCatchFish: 2014, // Trúng cá bằn skill
    SpawnBossFish: 2015, // thả boss
    SpawnCrowdedFish: 2016, // Đéo nhớ
    CatchRedFish: 2017, // bắt cá đỏ (đéo nhớ có xài k)
    UpdateBossHPResponse: 2018, // Update máu boss (cơ bản là méo xài)
    KickUser:2019, // Kick user
    BossDie: 2020, // Báo boss chết
    SpawnParadeFish_REALTIME: 2022, // Đồng bộ cá trận
    HitFishEffect: 2023, // Hiệu ứng bắn cá (vd bắn boss rớt tiền or quà, server gửi để biểu diễn)
    PlayRoomEffect: 2024, // Hiệu ứng phòng (pause cá)
    StopRoomEffect: 2025, // Stop hiệu ứng
    GlobalBossUseSkill: 2026, // Boss múa skill bla bla.
    OnUserChat: 2027, // Giống emotion
    GetRoomConfig: 2028, // Lấy Config game
    CatchBoss:2029,
    PingPong: 2999
};