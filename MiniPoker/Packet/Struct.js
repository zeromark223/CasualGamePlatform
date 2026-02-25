var Define = require('../../SharedModule/Binary').Define;

var LoginGameInfo = {
    Token: Define.StringDynamic
};

var LoginResponse = { //2001
    UserID: Define.UInt32,
    Gold: Define.UInt64,
    GameName: Define.StringDynamic
};

var GetRoomConfigResponse = { //2002
    BetGoldList:Define.Array8,
    BetGoldList_Type: Define.UInt64,
    JackpotGold:Define.UInt64,
    WinRatio:Define.Object8,
    WinRatio_Struct:{
        ID:Define.UInt8,
        Ratio:Define.Double
    }
};

var UserSpin = { //2004
    GoldBet: Define.UInt64
};

var UserSpinDebug = { //2099
    GoldBet: Define.UInt64,
    CardsList:Define.Array8,
    CardsList_Type: Define.UInt8
};

var UserSpinResponse = { //2004
    MatchID: Define.UInt64,
    WinGold:Define.UInt64,
    CurrentGold:Define.UInt64,
    ResultList:Define.Array8,
    ResultList_Type: Define.UInt8,
    WinResult:Define.Int8,
    IsJackpot:Define.Int8
};

var UserHistoryResponse = { //2005
    History: Define.Object8,
    History_Struct: {
        MatchID: Define.UInt64,
        BetGold: Define.UInt64,
        WinGold: Define.UInt64,
        Time: Define.UInt64,
        Result:Define.Int8
    }
};

var TopUserWinResponse = { //2006
    TopUser: Define.Object8,
    TopUser_Struct: {
        GameName:Define.StringDynamic,
        MatchID: Define.UInt64,
        BetGold: Define.UInt64,
        WinGold: Define.UInt64,
        Time: Define.UInt64,
        Result:Define.Int8
    }
};


module.exports = {
    LoginGameInfo: LoginGameInfo,
    LoginResponse: LoginResponse,
    GetRoomConfigResponse: GetRoomConfigResponse,
    UserSpin:UserSpin,
    UserSpinDebug:UserSpinDebug,
    UserSpinResponse: UserSpinResponse,
    UserHistoryResponse: UserHistoryResponse,
    TopUserWinResponse: TopUserWinResponse
};