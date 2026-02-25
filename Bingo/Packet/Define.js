/**
 * Created by ngocnpt on 28/06/2016.
 */
module.exports = {
    LoginGame: 2001, //Gói đầu tiên, gửi login
    GetRoomConfig: 3002, // Lấy Config game
    ShowMsg: 2003, // Show Msg,
    PingPong: 2999,
    //
    UserBet: 2004,
    UpdateUserGold: 2005, // Update gold
    UpdateBetInfo: 2006, // Show Msg
    StartMatch: 2007,
    EndMatchResult: 2008,
    UserResult: 2009,
    MatchHistory: 2010,

    GameChat: 2013,
    GetListUser: 2014,
    UpdateUserBetList: 2015,
    //bingo
    UserEnterGame: 3003,
    UpdateGameState: 3004,
    CallNumber: 3005,
    UpdateTreasure: 3006,
    GameResultResponse: 3007,
    KickUserToGameLobbyResponse: 3008,
    LeaveRoom: 3009,
    UserHistory: 3010,
    TopUserWin: 3011,
    UpdatePlayingUserHasBingo: 3012,
    TopUserWinAllMode: 3013,
    UpdateMaxTreasureResponse: 3014,
    PlayNow: 3015,
};