var Define = require('../../SharedModule/Binary').Define;

var LoginGameInfo = {
    Token: Define.StringDynamic
};

var LoginResponse = { //8001
    UserID: Define.UInt32,
    Gold: Define.UInt64,
    GameName: Define.StringDynamic
};

var GetRoomConfigResponse = { //8002
    GoldBet: Define.UInt32,
    FreeSpin: Define.UInt32,
    BigWheel: Define.Object8,
    BigWheel_Struct:{
        ID: Define.UInt8,
        Reward: Define.UInt64
    },

    SmallWheel: Define.Object8,
    SmallWheel_Struct:{
        ID: Define.UInt8,
        Reward: Define.UInt64,
        FreeSpin: Define.UInt32
    }
};

var ShowMsgResponse = { //8003
    Message: Define.StringDynamic
};

var UserSpinResponse = { //8004
    MatchID: Define.UInt64,
    BigWheelID: Define.UInt8,
    SmallWheelID: Define.UInt8,
    TotalReward: Define.UInt64,
    FreeSpin: Define.UInt32,
    TotalGold: Define.UInt64,
    TotalFreeSpin: Define.UInt32
};

var UserHistoryResponse = { //8005
    History: Define.Object8,
    History_Struct: {
        MatchID: Define.UInt64,
        TotalReward: Define.UInt64,
        FreeSpin: Define.UInt32,
        Time: Define.UInt64
    }
};

var TopUserWinResponse = { //8006
    TopUser: Define.Object8,
    TopUser_Struct: {
        MatchID: Define.UInt64,
        TotalReward: Define.UInt64,
        FreeSpin: Define.UInt32,
        Time: Define.UInt64,
        GameName: Define.StringDynamic
    }
};

var UpdateUserInfoResponse = { //8007
    FreeSpin: Define.UInt32,
    TotalGold: Define.UInt64
};

module.exports = {
    LoginGameInfo: LoginGameInfo,
    LoginResponse: LoginResponse,
    ShowMsgResponse:ShowMsgResponse,
    GetRoomConfigResponse: GetRoomConfigResponse,
    UserSpinResponse: UserSpinResponse,
    UserHistoryResponse: UserHistoryResponse,
    TopUserWinResponse: TopUserWinResponse,
    UpdateUserInfoResponse: UpdateUserInfoResponse
};