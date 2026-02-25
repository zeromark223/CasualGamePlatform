/**
 * Created by ngocnpt on 03-May-17.
 */
var Define = {
    Int8: 1,
    UInt8: 2,
    Int16: 3,
    UInt16: 4,
    Int32: 5,
    UInt32: 6,
    Int64: 7,
    UInt64: 8,
    Float: 9,
    Double: 10,
    StringDynamic: 11,
    Object8: 12,
    Array8: 13
};
var RequestAuth = {};
var ResponseAuth = {};
var LoginSuccess = {};

var LoginGameInfo = {//1001
    Token: Define.StringDynamic,
    AppVersion: Define.StringDynamic,
    LangCode: Define.UInt8
};

var LoginGameResponse = {//1001
    UserID: Define.UInt32,
    Gold: Define.UInt64,
    Level: Define.UInt32,
    GameName: Define.StringDynamic
};

var ShowMsgResponse = {//1002
    Msg: Define.StringDynamic
};

var UpdateGoldForUserResponse = {//1003
    Diamond: Define.UInt64,
    GameMoney: Define.UInt64
};

var KickUserResponse = {//1004
    State: Define.UInt8, //0: ra login, 1: ra sảnh
    Msg: Define.StringDynamic
};

var BroadcastResponse = {//1005
    Priority: Define.UInt8, // độ ưu tiên, càng cao càng lên trước
    Msg: Define.StringDynamic, // thông báo
    UrlLink: Define.StringDynamic // link khi nhấp vào
};


var JoinGameByKindID = { //1006
    KindID: Define.UInt32 // Mã game : Bắn cá tự do 1, bắn cá đấu trường 2, vip 3, đại gia 4
};

var JoinGameByKindIDResponse = {//1006
    Server: Define.StringDynamic,
    Token: Define.StringDynamic
};

var FunctionTrigger = {//1007
    FunctionID: Define.UInt8,//Online Award : 1, Daily Award : 2, Mail : 3 , Mission 4, Achievement 5
    Trigger: Define.UInt8
};

var OnlineAward_Get = {//1008 Nhận thông tin
    NextTime: Define.UInt32,
    MoneyAward: Define.UInt32,
    ErrorCode: Define.UInt8, // 0 thành công , 1 tien qua nhieu, 2 hết tiền
    AwardID: Define.UInt8
};


var DailyAward_Get = {//1010 Nhận thông tin
    MoneyAward: Define.UInt32,
    ErrorCode: Define.UInt8, // 0 thành công , 1 tien qua nhieu, 2 hết tiền
    AwardID: Define.UInt8
};

var GetGameConfigByGameIDResponse = {//1012
    GameID: Define.UInt32, // ID Game
    Config: Define.StringDynamic
};

var GetUserOnlineResponse = { //1013
    NumberOfUsers: Define.UInt32
};

var EffectGetAward = {
    CanGet: Define.UInt8
};

var MoneyHistoryRequest = {
    PageIndex: Define.UInt8
};

var MoneyHistoryResponse = {
    MaxPage: Define.UInt8,
    Detail: Define.Object8,
    Detail_Struct: {
        Time: Define.UInt64,
        MoneyChange: Define.Int64,
        RoomID: Define.UInt32,
        Description: Define.StringDynamic
    }
};

var MoneyTransNotificationResponse = {
    MessageList: Define.Array8,
    MessageList_Type: Define.StringDynamic
};

var ChangeLanguage = {// 1014 // 0 VN, 1 EN
    LangCode: Define.UInt8
};

var GetTopPlayerListAllResponse = {// 1015
    TopPlayerList: Define.Object8,
    TopPlayerList_Struct: {
        ID: Define.UInt8,
        Text: Define.StringDynamic
    }
};

var GetTopPlayerListByID = {// 1016
    ID: Define.UInt8
};

var GetTopPlayerListByIDResponse = {// 1016
    UserTopPos: Define.UInt32,
    UserScore: Define.UInt64,
    StartTime: Define.UInt64,
    EndTime: Define.UInt64,
    ListUser: Define.Object8,
    ListUser_Struct: {//Default Item đầu tiền là của user đó.
        UserID: Define.UInt32,
        GameName: Define.StringDynamic,
        Score: Define.UInt64,
        TopPos: Define.UInt32
    }
};

var GetTopPlayerListWithAvatarByID = {// 1026
    ID: Define.UInt8
};

var GetTopPlayerListWithAvatarByIDResponse = {// 1026
    UserTopPos: Define.UInt32,
    UserScore: Define.UInt64,
    StartTime: Define.UInt64,
    EndTime: Define.UInt64,
    ListUser: Define.Object8,
    ListUser_Struct: {//Default Item đầu tiền là của user đó.
        UserID: Define.UInt32,
        GameName: Define.StringDynamic,
        Score: Define.UInt64,
        TopPos: Define.UInt32,
        FID: Define.StringDynamic // FacebookID
    }
};

var GameListResponse = {//1017
    GameIDList: Define.Array8,
    GameIDList_Type: Define.UInt32
};

var ChangeGame = {//1018
    GameID: Define.UInt32 // ID Game
};

var TransferMoneyToGame = {//1019
    GameID: Define.UInt32, // ID Game
    Money: Define.UInt64
};

var TransferMoneyToGameResponse = {//1019
    ErrorCode: Define.UInt8
};

var JackpotUpdateResponse = {//1019
    GameID: Define.UInt32,
    KindID: Define.UInt32,
    JackpotValue: Define.UInt64
};

var MissionListResponse = {//1022
    List: Define.Object8,
    List_Struct: {
        ID: Define.UInt32,
        Title: Define.StringDynamic,
        Desc: Define.StringDynamic,
        Target: Define.UInt64,
        Completed: Define.UInt64,
        IsGet: Define.UInt8,
        RewardGold: Define.UInt64
    }
};

var MissionGetAward = {//1023
    ID: Define.UInt32
};

var MissionGetAwardResponse = {//1023
    ID: Define.UInt32,
    IsError: Define.UInt8 // 0 = Thành công , khác 0 là mã lỗi
};

var AchievementListResponse = {//1024
    List: Define.Object8,
    List_Struct: {
        ID: Define.UInt32,
        Title: Define.StringDynamic,
        Desc: Define.StringDynamic,
        Target: Define.UInt64,
        Completed: Define.UInt64,
        IsGet: Define.UInt8,
        RewardGold: Define.UInt64
    }
};


var AchievementGetAward = {//1025
    ID: Define.UInt32
};

var AchievementGetAwardResponse = {//1025
    ID: Define.UInt32,
    IsError: Define.UInt8 // 0 = Thành công , khác 0 là mã lỗi
};

var GetMasterConfigResponse = {//1027
    DailyLoginConfig: Define.Object8,
    DailyLoginConfig_Struct: {
        AwardID: Define.UInt8,
        GoldAward: Define.UInt64
    },
    OnlineAwardConfig: Define.Object8,
    OnlineAwardConfig_Struct: {
        AwardID: Define.UInt8,
        OnlineTime: Define.UInt16,
        GoldAward: Define.UInt64
    }
};

module.exports = {
    RequestAuth: RequestAuth,
    ResponseAuth: ResponseAuth,
    LoginSuccess: LoginSuccess,
    LoginGameInfo: LoginGameInfo,
    LoginGameResponse: LoginGameResponse,
    ShowMsgResponse: ShowMsgResponse,
    UpdateGoldForUserResponse: UpdateGoldForUserResponse,
    KickUserResponse: KickUserResponse,
    BroadcastResponse: BroadcastResponse,
    JoinGameByKindID: JoinGameByKindID,
    JoinGameByKindIDResponse: JoinGameByKindIDResponse,
    FunctionTrigger: FunctionTrigger,
    OnlineAward_Get: OnlineAward_Get,
    DailyAward_Get: DailyAward_Get,
    GetUserOnlineResponse: GetUserOnlineResponse,
    GetGameConfigByGameIDResponse: GetGameConfigByGameIDResponse,
    EffectGetAward: EffectGetAward,
    MoneyHistoryRequest: MoneyHistoryRequest,
    MoneyHistoryResponse: MoneyHistoryResponse,
    MoneyTransNotificationResponse: MoneyTransNotificationResponse,
    ChangeLanguage: ChangeLanguage,
    GetTopPlayerListAllResponse: GetTopPlayerListAllResponse,
    GetTopPlayerListByID: GetTopPlayerListByID,
    GetTopPlayerListByIDResponse: GetTopPlayerListByIDResponse,
    GetTopPlayerListWithAvatarByID: GetTopPlayerListWithAvatarByID,
    GetTopPlayerListWithAvatarByIDResponse: GetTopPlayerListWithAvatarByIDResponse,
    GameListResponse: GameListResponse,
    ChangeGame: ChangeGame,
    TransferMoneyToGame: TransferMoneyToGame,
    TransferMoneyToGameResponse: TransferMoneyToGameResponse,
    JackpotUpdateResponse: JackpotUpdateResponse,
    MissionListResponse: MissionListResponse,
    MissionGetAward: MissionGetAward,
    MissionGetAwardResponse: MissionGetAwardResponse,
    AchievementListResponse: AchievementListResponse,
    AchievementGetAward: AchievementGetAward,
    AchievementGetAwardResponse: AchievementGetAwardResponse,
    GetMasterConfigResponse: GetMasterConfigResponse

};

