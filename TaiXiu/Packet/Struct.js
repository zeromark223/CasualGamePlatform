var Define = require('../../SharedModule/Binary').Define;

var LoginGameInfo = {
    Token: Define.StringDynamic
};

var LoginResponse = { //3001
    UserID: Define.UInt32,
    Gold: Define.UInt64,
    GameName: Define.StringDynamic
};

var GetRoomConfigResponse = { //3002
    MinBet: Define.UInt64,
    MaxBet: Define.UInt64,
    BetChip: Define.Array8,
    BetChip_Type: Define.UInt64

};

var ShowMsgResponse = { //3003
    Message: Define.StringDynamic
};

var UserBetInfo = { //3004
    BetList: Define.Object8,
    BetList_Struct: {
        ID: Define.StringDynamic,
        Money: Define.UInt64
    }
};

var UserBetResponse = { //3004
    ErrorCode: Define.UInt8 //0 thành công, 1 thất bại
};

var UpdateUserGoldResponse = { //3005 // Update Tiền cho User
    Money: Define.UInt64
};

var UpdateBetInfoResponse = { //3006 //Update tiền trên bàn
    BetList: Define.Object8,
    BetList_Struct: {
        ID: Define.StringDynamic,
        Money: Define.UInt64
    }
};

var StartMatchResponse = { //3007 //bắt đầu nhận cược
    EncryptedResult:Define.StringDynamic, // Kết quả đã mã hóa
    TimeLeft:Define.UInt16, // Thời gian đếm ngược
    MatchID:Define.UInt64
};

var EndMatchResultResponse = { //3008
    Dices: Define.Array8, // Kết quả xí ngầu
    Dices_Type: Define.UInt8,
    ResultText:Define.StringDynamic, // Kết quả trước mã hóa
    TimeLeft:Define.UInt16, // thời gian đếm ngược
    WinList: Define.Array8, // Kết quả xí ngầu
    WinList_Type: Define.StringDynamic
};

var UserResultResponse = { //3009
    BetList:Define.Object8,
    BetList_Struct: {
        ID: Define.StringDynamic, // ID Bet
        Money: Define.UInt64 // Tiền tổng thắng của cược này
    }
};

var MatchHistoryResponse = { //3010
    Result: Define.Array8, // Kết quả tổng
    Result_Type: Define.UInt8
};

var UserHistoryResponse = { //3011
    History:Define.Object8,
    History_Struct: {
        MatchID: Define.UInt64, // ID Bet
        BetList:Define.Object8,
        BetList_Struct: {
            ID: Define.StringDynamic, // ID Bet
            Money: Define.UInt64 // Tiền cược
        },
        Result: Define.Array8, // Kết quả xí ngầu
        Result_Type: Define.UInt8,
        TotalBet:Define.UInt64, // tổng tiền cược
        TotalWin:Define.UInt64 // tổng tiền thắng
    }
};

var TopUserWinResponse = { //3012
    ListUser: Define.Object8,
    ListUser_Struct: {
        GameName:Define.StringDynamic,
        TotalWin:Define.UInt64
    }
};

var GameChat = { //3013
    Msg:Define.StringDynamic
};

var GameChatResponse = { //3013
    UserID:Define.UInt32,
    GameName:Define.StringDynamic,
    Msg:Define.StringDynamic
};

var GetListUserResponse = { //3014
    ListUser: Define.Object8,
    ListUser_Struct: {
        UserID:Define.UInt32,
        GameName:Define.StringDynamic
    }
};

var UpdateUserBetListResponse = { //3015
    BetList: Define.Object8,
    BetList_Struct: {
        ID: Define.StringDynamic,
        Gold: Define.UInt64
    }
};

module.exports = {
    LoginGameInfo: LoginGameInfo,
    LoginResponse: LoginResponse,
    ShowMsgResponse:ShowMsgResponse,
    GetRoomConfigResponse: GetRoomConfigResponse,
    UserBetInfo: UserBetInfo,
    UserBetResponse: UserBetResponse,
    UpdateUserGoldResponse: UpdateUserGoldResponse,
    UpdateBetInfoResponse: UpdateBetInfoResponse,
    StartMatchResponse: StartMatchResponse,
    EndMatchResultResponse: EndMatchResultResponse,
    UserResultResponse: UserResultResponse,
    MatchHistoryResponse: MatchHistoryResponse,
    UserHistoryResponse: UserHistoryResponse,
    TopUserWinResponse: TopUserWinResponse,
    GameChat: GameChat,
    GameChatResponse: GameChatResponse,
    GetListUserResponse: GetListUserResponse,
    UpdateUserBetListResponse: UpdateUserBetListResponse,
};