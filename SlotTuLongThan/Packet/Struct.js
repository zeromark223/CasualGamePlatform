var Define = require('../../SharedModule/Binary').Define;

var LoginGameInfo = {
    Token: Define.StringDynamic
};

var LoginResponse = { //4001
    UserID: Define.UInt32,
    Gold: Define.UInt64,
    GameName: Define.StringDynamic
};

var GetRoomConfigResponse = { //4002
    ListBet: Define.Array8,
    ListBet_Type: Define.UInt64,//250, 500, 1000, 2500, 5000, 10000, 25000
    MaxLine: Define.UInt8
};

var ShowMsgResponse = { //4003
    Message: Define.StringDynamic
};


var RollingResultResponse = { //4004
    Result: Define.Array8,
    Result_Type: Define.UInt8,
    IsBonus: Define.UInt8, //Minigame
    IsJackpot: Define.UInt64,
    IsFreeSpin: Define.UInt8, // > 0 là số lần free spin
    TotalWin: Define.UInt64, //Tổng tiền thắng (ko bao gồm tiền thắng jackpot)
    CurrentGold: Define.UInt64, // Tiền hiện tại của User sau ván chơi này
    MatchID: Define.UInt32,
    WinLine: Define.Array8,
    WinLine_Type: Define.UInt8
};

var UserStartRoll = { //4005 // bắt đầu quay
    TotalBet: Define.UInt64,
    IsFreeSpin: Define.UInt8 // = 1 nếu là lượt quay miễn phí
};

var UserStartRollResponse = { //4005 // trả về khi bắt đầu quay
    ErrorCode: Define.UInt8
};

var JackpotChangeType = { //4006 thay đổi hủ muốn update
    TotalBet: Define.UInt64
};

var BonusMiniGameResultResponse = { //4009 // kết quả lật
    Gold: Define.UInt64 //0 = GameOver
};

var BonusMiniGameEndResultResponse = { //4010 //kết quả cuối cùng sau khi lật hết
    Gold: Define.UInt64,
    CurrentGold: Define.UInt64 // Tiền hiện tại của User sau ván chơi này
};

var UserStartRollByClientReel = { //4100 // bắt đầu quay
    TotalBet: Define.UInt64,
    IsFreeSpin: Define.UInt8, // = 1 nếu là lượt quay miễn phí
    Reel: Define.Array8,
    Reel_Type: Define.UInt8
};

// TopUserWin: 4011, //
//     RollHistory: 4012, //
//     Broadcast: 4013, //

var TopUserWinResponse = { //4011 // Top thắng lớn
    TopUserWinList:Define.Object8,
    TopUserWinList_Struct:{
        UserID:Define.UInt32,
        GameName:Define.StringDynamic, // Nickname
        WinLabel:Define.StringDynamic, // Kể quả Nổ Hủ, 5 Wild, Thường
        WinGold:Define.UInt64 // tổng thắng
    }
};

var RollHistoryResponse = { //4012 // Lịch sử
    RollHistoryList:Define.Object8,
    RollHistoryList_Struct:{
        MatchID:Define.UInt32, // phiên
        Time:Define.UInt64,
        TotalBet:Define.UInt32, // tổng cược
        LineCount:Define.UInt8, // Số dòng trúng
        WinGold:Define.UInt64 // tổng thắng
    }

};

var BroadcastResponse = { //4013 // Broadcast thắng lớn
    Msg: Define.StringDynamic
};

var JackpotUpdateResponse = {
    Gold:Define.UInt64
};

var CocktailUpdateResponse = { // 4014
    Percent : Define.UInt8
};

var CocktailFillUpResponse = { //4015
    Percent : Define.UInt8,
    Gold:Define.UInt64
};

module.exports = {
    LoginGameInfo: LoginGameInfo,
    LoginResponse: LoginResponse,
    ShowMsgResponse: ShowMsgResponse,
    RollingResultResponse: RollingResultResponse,
    GetRoomConfigResponse: GetRoomConfigResponse,
    UserStartRoll: UserStartRoll,
    UserStartRollResponse: UserStartRollResponse,
    JackpotChangeType: JackpotChangeType,
    JackpotUpdateResponse: JackpotUpdateResponse,
    BonusMiniGameResultResponse: BonusMiniGameResultResponse,
    BonusMiniGameEndResultResponse: BonusMiniGameEndResultResponse,
    UserStartRollByClientReel: UserStartRollByClientReel,
    TopUserWinResponse: TopUserWinResponse,
    RollHistoryResponse: RollHistoryResponse,
    BroadcastResponse: BroadcastResponse,
    CocktailUpdateResponse: CocktailUpdateResponse,
    CocktailFillUpResponse: CocktailFillUpResponse
};
