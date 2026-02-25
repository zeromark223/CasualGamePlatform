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

module.exports = {
    LoginGameInfo: LoginGameInfo,
    LoginResponse: LoginResponse,
    ShowMsgResponse:ShowMsgResponse,
    GetRoomConfigResponse: GetRoomConfigResponse
};