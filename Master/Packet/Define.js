/**
 * Created by ngocnpt on 28/06/2016.
 */
module.exports  = {
    LoginGame:1001, // gói login
    ShowMsg:1002, // hói show popup msg cho user
    UpdateGoldForUser:1003, // update lại tiền của user
    KickUser:1004, // Kick user
    Broadcast:1005, // thông báo chạy chạy
    JoinGameByKindID:1006, // gói vào phòng theo KindID (gửi define sau)
    FunctionTrigger: 1007, // Lấy thông tin quà online
    OnlineAward_Get: 1008, // nhận quà online
    OnlineAward_GetAward: 1009, // nhận quà online
    DailyAward_Get: 1010, // lấy thông tin quà đăng nhập
    DailyAward_GetAward: 1011, // nhận quà đăng nhập
    GetGameConfigByGameID:1012, // Lấy danh sách game, và game config
    GetUserOnline: 1013, // lấy số lượng user online
    ChangeLanguage:1014, // Đổi ngôn ngữ
    GetTopPlayerListAll:1015, // Lấy DS Event
    GetTopPlayerListByID:1016, // Lấy top Event = ID
    GameList:1017, // Đổi ngôn ngữ
    ChangeGame:1018, // Đổi ngôn ngữ
    TransferMoneyToGame:1019, // Đổi ngôn ngữ
    JackpotUpdate:1020, // Update Jackpot
    LocalPaymentShow:1021, // show cửa hàng (nạp/đổi)
    MissionList:1022, // Lấy ds nv
    MissionGetAward:1023, // Nhận thưởng NV
    AchievementList:1024, // Lấy ds nv
    AchievementGetAward:1025, // Nhận thưởng NV
    GetTopPlayerListWithAvatarByID:1026, // Lấy top Event = ID Có Avatar (FacebookID);
    GetMasterConfig:1027, // Lấy top Event = ID Có Avatar (FacebookID);
    PingPong: 1999

};
