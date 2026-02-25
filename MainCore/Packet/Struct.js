var Define = require('../../SharedModule/Binary').Define;

var LoginGameInfo = {
    Token: Define.StringDynamic
};

var LoginResponse = { //4001
    UserID: Define.UInt32,
    Gold: Define.UInt64,
    GameName: Define.StringDynamic
};

var ShowMsgResponse = { //4003
    Message: Define.StringDynamic
};

var JackpotChangeType = { //4006 thay đổi hủ muốn update
    TotalBet: Define.UInt64
};

var JackpotUpdateResponse = {
    Gold:Define.UInt64
};

module.exports = {
    LoginGameInfo: LoginGameInfo,
    LoginResponse: LoginResponse,
    ShowMsgResponse: ShowMsgResponse,
    JackpotChangeType:JackpotChangeType,
    JackpotUpdateResponse:JackpotUpdateResponse
};
