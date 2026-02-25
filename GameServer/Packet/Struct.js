var Define = require('../../SharedModule/Binary').Define;

var LoginGameInfo = {
    Token: Define.StringDynamic
};

var LoginResponse = { //2001
    UserID: Define.UInt32,
    Gold: Define.UInt64,
    GameName: Define.StringDynamic,
    Level: Define.UInt32,
    Exp: Define.UInt64,
    StationID: Define.UInt8
};

var ListUserInDeskResponse = { //2002
    ListUserInDesk: Define.Object8,
    ListUserInDesk_Struct: {
        UserID: Define.UInt32,
        Gold: Define.UInt64,
        GameName: Define.StringDynamic,
        Level: Define.UInt32,
        StationID: Define.UInt8,
        PosX: Define.Float,
        PosY: Define.Float
    }
};

var ListUserInDeskResponse_2D = { //2002
    ListUserInDesk: Define.Object8,
    ListUserInDesk_Struct: {
        UserID: Define.UInt32,
        Gold: Define.UInt64,
        GameName: Define.StringDynamic,
        Exp: Define.UInt64,
        Level: Define.UInt32,
        StationID: Define.UInt8,
        PosX: Define.Float,
        PosY: Define.Float
    }
};

var UserComeResponse = { //2003
    UserID: Define.UInt32,
    Gold: Define.UInt64,
    GameName: Define.StringDynamic,
    Level: Define.UInt32,
    StationID: Define.UInt8,
    PosX: Define.Float,
    PosY: Define.Float
};

var UserComeResponse_2D = { //2003
    UserID: Define.UInt32,
    Gold: Define.UInt64,
    GameName: Define.StringDynamic,
    Level: Define.UInt32,
    Exp: Define.UInt64,
    StationID: Define.UInt8,
    PosX: Define.Float,
    PosY: Define.Float
};

var ShowMsgResponse = { //2004
    Message: Define.StringDynamic
};

var UserFireInfo = { //2005
    PosX: Define.UInt16,
    PosY: Define.UInt16,
    BulletMultiple: Define.UInt32,
    BulletID: Define.UInt32,
    LockedFishID: Define.UInt32
};

var UserFireResponse = { //2005
    StationID: Define.UInt8,
    PosX: Define.UInt16,
    PosY: Define.UInt16,
    BulletMultiple: Define.UInt32,
    LockedFishID: Define.UInt32,
    Gold: Define.UInt64
};

var SpawnFishResponse = { //2006
    ListFish: Define.Object8,
    ListFish_Struct: {
        FishID: Define.UInt32,
        FishKind: Define.UInt8,
        SpecialKind: Define.UInt8,
        PosX: Define.Float,
        PosY: Define.Float,
        PosZ: Define.Float,
        PathSeed: Define.UInt16,
        ItemID: Define.UInt32
    }
};

var SpawnFishResponse_2D = { //2006
    ListFish: Define.Object8,
    ListFish_Struct: {
        FishID: Define.UInt32,
        FishKind: Define.UInt8,
        IsRedFish: Define.UInt8,
        Position: Define.Object8,
        Position_Struct: {
            PosX: Define.Int16,
            PosY: Define.Int16
        },
        ItemID: Define.UInt32
    }
};

var CatchFishInfo = { //2007
    FishID: Define.UInt32,
    BulletMultiple: Define.UInt64
};

var CatchFishResponse = { //2007
    StationID: Define.UInt8,
    FishID: Define.UInt32,
    GoldReward: Define.UInt64,
    TotalGold: Define.UInt64,
    Level: Define.UInt32,
    Exp: Define.UInt64
};

var UserLeftResponse = { //2008
    StationID: Define.UInt8
};

var SpawnParadeFishResponse = { //2009
    ParadeKind: Define.UInt8,
    ParadePosition: Define.UInt8,
    ListFish: Define.Object8,
    ListFish_Struct: {
        FishID: Define.UInt32,
        FishKind: Define.UInt8,
        SpecialKind: Define.UInt8
    }
};

var SkillInfo = {//2010
    ListSkill: Define.Object8,
    ListSkill_Struct: {
        ID: Define.UInt8,
        NameSkill: Define.StringDynamic,
        TimeLostSkill: Define.UInt16,
        ScoreLostSkill: Define.UInt16,
        NumberFishGet: Define.UInt16,
        ScoreGetSkill: Define.UInt32,
        TimeEffect: Define.UInt8
    },
    CurrentSkill: Define.UInt8
};

var FireSkillRequest = {
    Angle: Define.Float,
    x: Define.Float,
    y: Define.Float
};

var FireSkillResponse = {//2011
    DeskStation: Define.UInt8,
    Angle: Define.Float,
    x: Define.Float,
    y: Define.Float,
    BulletID: Define.UInt8,
    SkillID: Define.UInt8
};

var SkillAppear = {//2012
    SkillID: Define.UInt8,
    SkillScore: Define.Float,
    IsUseSkill: Define.UInt8
};

var SkillCatchFish = {//2014
    BulletID: Define.UInt8,
    SkillID: Define.UInt8,
    ListFish: Define.Array8,
    ListFish_Type: Define.UInt32
};

var ClearFishResponse = {};

var SpawnBossFishResponse = { //2015
    FishID: Define.UInt32,
    FishKind: Define.UInt8,
    TotalGold:Define.UInt64,
    Position: Define.Object8,
    Position_Struct: { //3D parse nhưng ko lấy data
        PosX: Define.Int16,
        PosY: Define.Int16
    },
    StartTime:Define.UInt32,//milisecond
    PathSeed:Define.Int16
};

var CatchRedFishInfo = { //2017
    FishID: Define.UInt32,
    FishIDArray: Define.Array8,
    FishIDArray_Type: Define.UInt32,
    BulletMultiple: Define.UInt64
};

var CatchRedFishResponse = { //2017
    StationID: Define.UInt8,
    FishID: Define.UInt32,
    GoldReward: Define.UInt64,
    TotalGold: Define.UInt64,
    Level: Define.UInt32,
    Exp: Define.UInt64,
    FishIDArray: Define.Array8,
    FishIDArray_Type: Define.UInt32
};

var UpdateBossHPResponse = { //2018
    BossID: Define.UInt32,
    ValueHP: Define.UInt32,
    CurrentHP: Define.UInt32
};

var KickUserResponse = {//2019
    State:Define.UInt8, //0: ra login, 1: ra sảnh
    Msg:Define.StringDynamic
};

var BossDieResponse = { //2020
    FishID: Define.UInt32, // để diễn hiệu ứng cá boss trong bàn chết
    UserID: Define.UInt32, //Userid lasthit để biểu diễn tiền bay tới user
    GoldReward: Define.UInt64, // tiền thưởng boss
    GameName:Define.StringDynamic// chạy hiệu ứng ở các phòng
};

var BossLeaderBoard = { //2021
    BossID: Define.UInt32,
    ListUser: Define.Object8,
    ListUser_Struct:{
        UserID: Define.UInt32,
        UserName: Define.StringDynamic,
        Rank: Define.UInt8,
        Damage: Define.UInt64,
        GoldReward: Define.UInt64,
        CardReward: Define.UInt32,
        NumberOfCard: Define.UInt16
    }
};

var SpawnParadeFishResponse_REALTIME= { //2022
    ParadeKind: Define.UInt8,
    PathSeed: Define.UInt8,
    BirthTime: Define.UInt8,
    ListFish: Define.Object8,
    ListFish_Struct: {
        FishID: Define.UInt32,
        FishKind: Define.UInt8,
        SpecialKind: Define.UInt8
    }
};

var SpawnParadeFishResponse_2D = { //2022
    ParadeKind: Define.UInt8,
    SceneKind: Define.UInt8,
    ListFish: Define.Object8,
    ListFish_Struct: {
        FishID: Define.UInt32,
        FishKind: Define.UInt8,
        IsRedFish: Define.UInt8
    }
};

var HitFishEffectResponse = { //2023
    StationID: Define.UInt8,
    FishID: Define.UInt32,
    EffectID: Define.UInt8,
    GoldReward: Define.UInt64,
    TotalGold: Define.UInt64
};

var PlayRoomEffectResponse = { //2024
    EffectID: Define.UInt16
};

var StopRoomEffectResponse = { //2025
    EffectID: Define.UInt16
};

var GlobalBossUserSkillResponse = { //2026
    BossID: Define.UInt32,
    SkillID: Define.UInt8,
    Direction: Define.UInt8,
    TimeEffect: Define.UInt8,
    Distance: Define.UInt32
};

var OnUserChatInfo = { //2027
    StationID: Define.UInt8,
    ChatID: Define.UInt8
};

var GetRoomConfigResponse = { //2028
    ListGun: Define.Array8,
    ListGun_Type: Define.UInt32,
    ListFish: Define.Object8,
    ListFish_Struct: {
        FishKind: Define.UInt8,
        Speed: Define.UInt8,
        Width: Define.UInt16,
        Height: Define.UInt16
    }
};

var CatchBossInfo = { //2029
    FishID: Define.UInt32,
    BulletMultiple: Define.UInt32
};

module.exports = {
    LoginGameInfo: LoginGameInfo,
    LoginResponse: LoginResponse,
    ListUserInDeskResponse: ListUserInDeskResponse,
    UserComeResponse: UserComeResponse,
    ShowMsgResponse: ShowMsgResponse,
    UserFireInfo: UserFireInfo,
    UserFireResponse: UserFireResponse,
    SpawnFishResponse: SpawnFishResponse,
    CatchFishInfo: CatchFishInfo,
    CatchFishResponse: CatchFishResponse,
    UserLeftResponse: UserLeftResponse,
    SpawnParadeFishResponse: SpawnParadeFishResponse,

    SkillInfo: SkillInfo,
    FireSkill: FireSkillResponse,
    SkillAppear: SkillAppear,
    ClearFishResponse: ClearFishResponse,
    FireSkillRequest: FireSkillRequest,
    SkillCatchFish: SkillCatchFish,
    SpawnBossFishResponse: SpawnBossFishResponse,
    SpawnCrowdedFishResponse: SpawnFishResponse,
    KickUserResponse: KickUserResponse,
    CatchRedFishResponse: CatchRedFishResponse,
    CatchRedFishInfo: CatchRedFishInfo,
    UpdateBossHPResponse: UpdateBossHPResponse,
    BossDieResponse: BossDieResponse,
    BossLeaderBoard: BossLeaderBoard,
    SpawnParadeFishResponse_REALTIME: SpawnParadeFishResponse_REALTIME,
    HitFishEffectResponse: HitFishEffectResponse,
    PlayRoomEffectResponse: PlayRoomEffectResponse,
    StopRoomEffectResponse: StopRoomEffectResponse,
    GlobalBossUserSkillResponse: GlobalBossUserSkillResponse,
    OnUserChatInfo: OnUserChatInfo,
    OnUserChatResponse: OnUserChatInfo,

    ListUserInDeskResponse_2D: ListUserInDeskResponse,
    UserComeResponse_2D: UserComeResponse,
    SpawnFishResponse_2D: SpawnFishResponse_2D,
    SpawnParadeFishResponse_2D: SpawnParadeFishResponse_2D,
    SpawnCrowdedFishResponse_2D: SpawnFishResponse_2D,

    GetRoomConfigResponse : GetRoomConfigResponse,
    CatchBossInfo : CatchBossInfo
};