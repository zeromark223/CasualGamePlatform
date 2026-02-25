var Define = require('../../SharedModule/Binary').Define;

var LoginGameInfo = {
    Token: Define.StringDynamic
};

var LoginResponse = { //6001
    UserID: Define.UInt32,
    Gold: Define.UInt64,
    GameName: Define.StringDynamic
};

var GetRoomListResponse = { //6002
    RoomList: Define.Array8,
    RoomList_Type: Define.UInt64
};

var JoinRoomInfo = { //6003
    RoomKind: Define.UInt8
};

var JoinRoomResponse = { //6003
    UserArray: Define.Object8,
    UserArray_Struct: {
        UserID: Define.UInt32,
        Position: Define.UInt8,
        Gold: Define.UInt64,
        DisplayName: Define.StringDynamic,
        NumberOfCard: Define.UInt8
    },
    DeskID: Define.UInt32,
    GoldBet: Define.UInt64
};

var ShowMsgResponse = { //6003
    Message: Define.StringDynamic
};

var UserBetInfo = { //6004
    BetList: Define.Object8,
    BetList_Struct: {
        ID: Define.UInt8,
        Money: Define.UInt64
    }
};

var UserBetResponse = { //6004
    ErrorCode: Define.UInt8 //0 thành công, 1 thất bại
};

var UpdateUserGoldResponse = { //6005 // Update Tiền cho User
    Money: Define.UInt64
};

var NewUserComeResponse = { //6006
    UserID: Define.UInt32,
    Position: Define.UInt8,
    Gold: Define.UInt64,
    DisplayName: Define.StringDynamic
};

var DealCardsResponse = { //6007 //chia bài
    MatchID: Define.UInt64,
    CardList: Define.Object8,
    CardList_Struct:{
        Score: Define.UInt8,
        Suit: Define.UInt8
    },
    MatchMember: Define.Array8,
    MatchMember_Type: Define.UInt32
};

var GiveCardInfo = { //6008 đánh bài
    Action: Define.UInt8,
    Cards: Define.Object8,
    Cards_Struct: {
        Score: Define.UInt8,
        Suit: Define.UInt8
    }
};

var GiveCardResponse = { //6008 đánh bài
    UserID: Define.UInt32,
    Action: Define.UInt8,
    EffectID: Define.UInt8,
    CardRemain: Define.UInt8,
    Cards: Define.Object8,
    Cards_Struct: {
        Score: Define.UInt8,
        Suit: Define.UInt8
    }
};

var UpdateTurnResponse = { //6009 cập nhật lượt chơi
    CurrentTurn: Define.UInt32,
    CountDown: Define.UInt8
};

var EndMatchResponse ={ //6010
    PlayerList: Define.Object8,
    PlayerList_Struct:{
        UserID: Define.UInt32,
        Cards: Define.Object8, //số bài còn lại
        Cards_Struct:{
            Score: Define.UInt8,
            Suit: Define.UInt8
        },
        GoldWin: Define.Int64, //tiền thắng thua
        TotalGold: Define.UInt64, //tổng tiền sau khi cộng
        WinType: Define.UInt8,
        Order: Define.UInt8
    },
    EffectTime: Define.UInt8
};

var UserChatInfo = { //6011
    Message: Define.StringDynamic
};

var UserChatResponse = { //6011
    UserID: Define.UInt32,
    Message: Define.StringDynamic
};

var SignToQuitResponse = { //6012
    Status: Define.UInt8
};

var GetGameStateResponse = { //6013
    MatchID: Define.UInt64,
    CardList: Define.Object8,
    CardList_Struct:{
        Score: Define.UInt8,
        Suit: Define.UInt8
    },

    UserArray: Define.Object8,
    UserArray_Struct: {
        UserID: Define.UInt32,
        Position: Define.UInt8,
        Gold: Define.UInt64,
        DisplayName: Define.StringDynamic,
        NumberOfCard: Define.UInt8
    },
    TableCards: Define.Object8,
    TableCards_Struct:{
        Score: Define.UInt8,
        Suit: Define.UInt8
    },

    GameState: Define.UInt8,
    CurrentTurn: Define.UInt32,
    TimeRemain: Define.UInt16
};

var UserOutResponse = { //6014
    UserID: Define.UInt32
};

var UpdateMoneyResponse = {
    //6015
    UserID: Define.UInt32,
    MoneyChange: Define.Int64,
    TotalMoney: Define.UInt64
};

var PreGameResponse = {
    //6016
    TimeRemain: Define.UInt32
};

var GeneralChatInfo = { //6017
    Message: Define.StringDynamic
};

var GeneralChatResponse = { //6017
    UserName: Define.StringDynamic,
    Message: Define.StringDynamic
};

var AdditionalTurnResponse  = { //6018
    Time: Define.UInt8
};

module.exports = {
    LoginGameInfo: LoginGameInfo,
    LoginResponse: LoginResponse,
    ShowMsgResponse:ShowMsgResponse,
    GetRoomListResponse: GetRoomListResponse,
    JoinRoomInfo: JoinRoomInfo,
    JoinRoomResponse: JoinRoomResponse,
    UserBetInfo: UserBetInfo,
    UserBetResponse: UserBetResponse,
    UpdateUserGoldResponse: UpdateUserGoldResponse,
    NewUserComeResponse: NewUserComeResponse,
    DealCardsResponse: DealCardsResponse,
    GiveCardInfo: GiveCardInfo,
    GiveCardResponse: GiveCardResponse,
    UpdateTurnResponse: UpdateTurnResponse,
    EndMatchResponse: EndMatchResponse,
    UserChatInfo: UserChatInfo,
    UserChatResponse: UserChatResponse,
    SignToQuitResponse: SignToQuitResponse,
    GetGameStateResponse: GetGameStateResponse,
    UserOutResponse: UserOutResponse,
    UpdateMoneyResponse: UpdateMoneyResponse,
    PreGameResponse: PreGameResponse,
    GeneralChatInfo: GeneralChatInfo,
    GeneralChatResponse: GeneralChatResponse,
    AdditionalTurnResponse: AdditionalTurnResponse
};