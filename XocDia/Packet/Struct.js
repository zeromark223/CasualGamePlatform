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
    MinBet: Define.UInt64,
    MaxBet: Define.UInt64,
    RoomID: Define.UInt32
};

var ShowMsgResponse = { //2003
    Message: Define.StringDynamic
};

var UserBetInfo = { //2004
    BetList: Define.Object8,
    BetList_Struct: {
        ID: Define.UInt8,
        Money: Define.UInt64
    }
};

var UserBetResponse = { //2004
    ErrorCode: Define.UInt8 //0 thành công, 1 thất bại
};

var UpdateUserGoldResponse = { //2005 // Update Tiền cho User
    Money: Define.UInt64
};

var UpdateBetInfoResponse = { //2006 //Update tiền trên bàn
    BetList: Define.Object8,
    BetList_Struct: {
        ID: Define.UInt8,
        Money: Define.UInt64
    }
};

var StartMatchResponse = { //2007 //bắt đầu nhận cược
    EncryptedResult: Define.StringDynamic, // Kết quả đã mã hóa
    TimeLeft: Define.UInt16, // Thời gian đếm ngược
    MatchID: Define.UInt64
};

var EndMatchResultResponse = { //2008
    Dices: Define.Array8,
    Dices_Type: Define.UInt8,
    ResultText: Define.StringDynamic, // Kết quả trước mã hóa
    TimeLeft: Define.UInt16, // thời gian đếm ngược
    WinList: Define.Array8,
    WinList_Type: Define.UInt8
};

var UserResultResponse = { //2009
    BetList: Define.Object8,
    BetList_Struct: {
        ID: Define.UInt8, // ID Bet
        Money: Define.UInt64 // Tiền tổng thắng của cược này
    }
};

var MatchHistoryResponse = { //2010
    Result: Define.Array8, // Kết quả tổng
    Result_Type: Define.UInt8
};

var UserHistoryResponse = { //2011
    History: Define.Object8,
    History_Struct: {
        MatchID: Define.UInt64, // ID Bet
        BetList: Define.Object8,
        BetList_Struct: {
            ID: Define.UInt8, // ID Bet
            Money: Define.UInt64 // Tiền cược
        },
        Result: Define.UInt8, // Kết quả
        TotalBet: Define.UInt64, // tổng tiền cược
        TotalWin: Define.UInt64 // tổng tiền thắng
    }
};

var TopUserWinResponse = { //2012
    ListUser: Define.Object8,
    ListUser_Struct: {
        GameName: Define.StringDynamic,
        TotalWin: Define.UInt64
    }
};

var GameChat = { //2013
    Msg: Define.StringDynamic
};

var GameChatResponse = { //2013
    UserID: Define.UInt32,
    GameName: Define.StringDynamic,
    Msg: Define.StringDynamic
};

var GetListUserResponse = { //2014
    ListUser: Define.Object8,
    ListUser_Struct: {
        UserID: Define.UInt32,
        GameName: Define.StringDynamic
    }
};

var UpdateUserBetListResponse = { //2015
    BetList: Define.Object8,
    BetList_Struct: {
        ID: Define.UInt8,
        Gold: Define.UInt64
    }
};

module.exports = {
    LoginGameInfo: LoginGameInfo,
    LoginResponse: LoginResponse,
    ShowMsgResponse: ShowMsgResponse,
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