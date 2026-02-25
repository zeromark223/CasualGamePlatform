var Define = require('../../SharedModule/Binary').Define;

var LoginGameInfo = {
    Token: Define.StringDynamic
};

var LoginResponse = { //2001
    UserID: Define.UInt32,
    Gold: Define.UInt64,
    GameName: Define.StringDynamic
};

var GetRoomConfigResponse = { //3002
    ClassicalCardPrices: Define.Array8,
    ClassicalCardPrices_Type: Define.UInt32,
    //
    EasyCardPrices: Define.Array8,
    EasyCardPrices_Type: Define.UInt32,
    GoldRequired: Define.UInt32,
    ClassicalMaxCall: Define.UInt8,
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
        Money: Define.UInt64,
        PlayerCount: Define.UInt16
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
    Result: Define.Array16, // Kết quả tổng
    Result_Type: Define.UInt8
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

var UserEnterGameRequest = { //3003
    DeskMode: Define.UInt32,
    CardPrice: Define.UInt32,
    NumCard: Define.UInt8
};

var UserEnterGameResponse = { // 3003
    ErrorCode: Define.UInt8, // 0: thành công, 1: thất bại
    DeskState: Define.UInt8,
    TimeLeft: Define.UInt16, // Thời gian đếm ngược
    UserCards: Define.Object8,
    UserCards_Struct: {
        Card: Define.Array8,
        Card_Type: Define.UInt8
    },
    CalledValues: Define.Array8,
    CalledValues_Type: Define.UInt8,
    CalledLeft: Define.UInt8,
    //
    DeskMode: Define.UInt32,
    CardPrice: Define.UInt32
};

var UpdateGameStateResponse = {
    GameState: Define.UInt8,
    TimeLeft: Define.UInt8
};

var CallNumberResponse = {
    Number: Define.UInt8,
    CallLeft: Define.UInt32
};


var UpdateTreasureResponse = {
    Treasure: Define.UInt64
};
var KickUserToGameLobbyResponse = {
    ErrorCode: Define.UInt8
};
var GameResultResponse = {
    WinGold: Define.UInt64,
    MaxBingo: Define.UInt8,
    TotalChecked: Define.UInt32
};
var UserLeaveGameResponse = {
    ErrorCode: Define.UInt8
};

var UserHistoryResponse = { //2011
    History: Define.Object8,
    History_Struct: {
        MatchID: Define.UInt64,
        NumCard: Define.UInt8,
        CardPrice: Define.UInt32,
        NumBingoPerCard: Define.Array8,
        NumBingoPerCard_Type: Define.UInt8,
        WinGold: Define.UInt64,
        Time: Define.StringDynamic,
    }
};

var UserHistoryInfo = { //2011
    GameMode: Define.UInt32
};

var UpdatePlayingUserHasBingoResponse = {
    Data: Define.Object8,
    Data_Struct: {
        GameName: Define.StringDynamic,
        NumBingo: Define.UInt8
    }
};

var TopUserWinInfo = {
    GameMode: Define.UInt32
};

// var UpdateMaxTreasureResponse = {
//     Treasure: Define.UInt64
// };

var UpdateMaxTreasureResponse = {
    MaxTreasure: Define.UInt64,
    ListTreasureClassical: Define.Array8,
    ListTreasureClassical_Type: Define.UInt64,
    ListTreasureEasy: Define.Array8,
    ListTreasureEasy_Type: Define.UInt64
};

var TopUserWinAllModeResponse = {
    ListUser: Define.Object8,
    ListUser_Struct: {
        GameName: Define.StringDynamic,
        TotalWin: Define.UInt64
    }
};

var PlayNowResponse = {
    GameMode: Define.UInt32,
    CardPrice: Define.UInt32
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

    GameChat: GameChat,
    GameChatResponse: GameChatResponse,
    GetListUserResponse: GetListUserResponse,
    UpdateUserBetListResponse: UpdateUserBetListResponse,
    //
    UserEnterGameRequest: UserEnterGameRequest,
    UserEnterGameResponse: UserEnterGameResponse,
    UpdateGameStateResponse: UpdateGameStateResponse,
    CallNumberResponse: CallNumberResponse,
    UpdateTreasureResponse: UpdateTreasureResponse,
    KickUserToGameLobbyResponse: KickUserToGameLobbyResponse,
    GameResultResponse: GameResultResponse,
    UserLeaveGameResponse: UserLeaveGameResponse,
    UserHistoryResponse: UserHistoryResponse,
    UserHistoryInfo: UserHistoryInfo,
    UpdatePlayingUserHasBingoResponse: UpdatePlayingUserHasBingoResponse,
    TopUserWinResponse: TopUserWinResponse,
    TopUserWinAllModeResponse: TopUserWinAllModeResponse,
    TopUserWinInfo: TopUserWinInfo,
    UpdateMaxTreasureResponse: UpdateMaxTreasureResponse,
    PlayNowResponse: PlayNowResponse,
};