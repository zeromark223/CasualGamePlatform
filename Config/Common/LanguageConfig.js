/**
 * Created by ngocnpt on 23/05/2016.
 * Edit and Renew by ngocnpt on 09/04/2018.
 */
module.exports = {
    Login_ParseDataErr: {
        code: 1000,
        logMsg:  'Parse data login err 1000 ',
        userMsg: 'Đăng nhập thất bại (1000)',
        userMsgEn: 'Login Fail (1000)',
        userMsgRu: 'Логин не успешен (1000)'
    },
    Login_CheckParamFail: {
        code: 1001,
        logMsg: 'Check param login err 1001 ',
        userMsg: 'Đăng nhập thất bại (1001)',
        userMsgEn: 'Login Fail (1001)',
        userMsgRu: 'Логин не успешен (1001)'
    },
    Login_TokenTimeOut: {
        code: 1002,
        logMsg: 'Token Time Out 1002 ',
        userMsg: 'Đăng nhập thất bại (1002)',
        userMsgEn: 'Login Fail (1002)',
        userMsgRu: 'Логин не успешен (1002)'
    },
    Login_TryCatchInsideCheckLogin: {
        code: 1003,
        logMsg: 'Try Catch 1003 ',
        userMsg: 'Đăng nhập thất bại (1003)',
        userMsgEn: 'Login Fail (1003)',
        userMsgRu: 'Логин не успешен (1003)'
    },
    Login_TryCatchOutSideCheckLogin: {
        code: 1004,
        logMsg: 'Try Catch 1004 ',
        userMsg: 'Đăng nhập thất bại (1004)',
        userMsgEn: 'Login Fail (1004)',
        userMsgRu: 'Логин не успешен (1004)'
    },
    Login_Duplicate: {
        code: 1005,
        logMsg: 'Duplicate login 1005 ',
        userMsg: 'Tài của bạn đang được đăng nhập ở nơi khác (1005)',
        userMsgEn: 'Your account has been login by another devices (1005)',
        userMsgRu: 'Ваш аккаунт войден другой системой (1005)'
    },
    Login_CheckLoginError: {
        code: 1006,
        logMsg: 'Check login error  1006 ',
        userMsg: 'Đăng nhập thất bại (1006)',
        userMsgEn: 'Login Fail (1006)',
        userMsgRu: 'Логин не успешен (1006)'
    },
    Login_ParseTokenError: {
        code: 1007,
        logMsg: 'Check login error  1007 ',
        userMsg: 'Đăng nhập thất bại (1007)',
        userMsgEn: 'Login Fail (1007)',
        userMsgRu: 'Логин не успешен (1007)'
    },
    FindRoom_CheckParamFail: {
        code: 1008,
        logMsg: 'Find room err CheckParamFail 1008 ',
        userMsg: 'Tìm phòng thất bại (1008)',
        userMsgEn: 'Finding room fail (1008)',
        userMsgRu: 'no'
    },
    FindRoom_KindNotFound: {
        code: 1009,
        logMsg: 'Find room KindNotFound 1009 ',
        userMsg: 'Không tìm thấy loại phòng này (1009)',
        userMsgEn: 'Can\'t find your room kind (1009)',
        userMsgRu: 'no'
    },
    FindRoom_FullRoom: {
        code: 1010,
        logMsg: 'Find room FullRoom 1010 ',
        userMsg: 'Tất cả phòng chơi đã đầy (1010)',
        userMsgEn: 'Room Full (1010)',
        userMsgRu: 'Все комнаты полнаты (1010)'
    },
    DailyAward_NoAward: {
        code: 1011,
        logMsg: 'DailyAward_NoAward ',
        userMsg: 'Đã hết phần thưởng, hẹn bạn ngày mai nhé !',
        userMsgEn: 'Reward has been received, appointment you tomorrow',
        userMsgRu: 'Призы закончились, приходите завтра !'
    },
    OnlineAward_NoAward: {
        code: 1012,
        logMsg: 'OnlineAward_NoAward ',
        userMsg: 'Đã hết phần thưởng, hẹn bạn ngày mai nhé !',
        userMsgEn: 'Reward has been received, appointment you tomorrow',
        userMsgRu: 'Призы закончились, приходите завтра !'
    },
    OnlineAward_LimitGold: {
        code: 1013,
        logMsg: 'OnlineAward_LimitGold ',
        userMsg: 'Bạn đã quá giàu, hẹn bạn lần sau nhé !',
        userMsgEn: 'You are so rich, see you next time',
        userMsgRu: 'Вы уже богатый, приходите завтра !'
    },
    DailyAward_LimitGold: {
        code: 1014,
        logMsg: 'DailyAward_LimitGold ',
        userMsg: 'Hôm nay bạn đã quá giàu, hẹn bạn ngày mai nhé !',
        userMsgEn: 'You are so rich, see you tomorrow',
        userMsgRu: 'Вы уже богатый, приходите завтра !'
    },
    Login_GetGoldError: {
        code: 1015,
        logMsg: 'Check login Get Gold Error  1015 ',
        userMsg: 'Đăng nhập thất bại (1015)',
        userMsgEn: 'Login Fail (1015)',
        userMsgRu: 'Логин не успешен (1015)'
    },
    InsertRoom_Duplicate: {
        code: 1016,
        logMsg: 'InsertRoom_Duplicate Error  1016 ',
        userMsg: 'Đăng nhập thất bại (1016)',
        userMsgEn: 'Login Fail (1016)',
        userMsgRu: 'Логин не успешен (1016)'
    },
    InsertRoom_NotEnoughGold: {
        code: 1017,
        logMsg: 'InsertRoom_NotEnoughGold Error  1017 ',
        userMsg: 'Đăng nhập thất bại (1017)',
        userMsgEn: 'Login Fail (1017)',
        userMsgRu: 'Логин не успешен (1017)'
    },
    InsertRoom_NotEnoughLevel: {
        code: 1018,
        logMsg: 'InsertRoom_NotEnoughLevel Error  1018 ',
        userMsg: 'Đăng nhập thất bại (1018)',
        userMsgEn: 'Login Fail (1018)',
        userMsgRu: 'Логин не успешен (1018)'
    },
    InsertRoom_RoomFull: {
        code: 1019,
        logMsg: 'InsertRoom_RoomFull Error  1019 ',
        userMsg: 'Đăng nhập thất bại (1019)',
        userMsgEn: 'Login Fail (1019)',
        userMsgRu: 'Логин не успешен (1019)'
    },
    MoneyTransfer_Error: {
        code: 1020,
        logMsg: 'MoneyTransfer_Error Error  1020 ',
        userMsg: 'Chuyển tiền thất bại (1020)',
        userMsgEn: 'Transfer money fail (1020)',
        userMsgRu: 'Передача денег не успешена !( 1020 )'
    },
    TLMNLimitGold_Error: {
        code: 1021,
        logMsg: 'TLMNLimitGold_Error Error  1021 ',
        userMsg: 'Bạn cần tối thiểu %s (1021)',
        userMsgEn: 'Minimum %s is required (1021)',
        userMsgRu: 'Передача денег не успешена !( 1021 )'
    },
    GetGameConfig_Error: {
        code: 1022,
        logMsg: 'GetGameConfig_Error Error  1022 ',
        userMsg: 'Không tìm thấy game này (1022)',
        userMsgEn: 'Find Game Error (1022)',
        userMsgRu: 'Передача денег не успешена !( 1022 )'
    },
    Login_BetaAccessOnly: {
        code: 1024,
        logMsg: 'Login_BetaAccessOnly 1024 ',
        userMsg: 'Máy chủ đang bảo trì (1024)',
        userMsgEn: 'Server is maintaining (1024)',
        userMsgRu: 'Сервер обслуживает !( 1024 )'
    },
    Action_NotEnoughGold: {
        code: 1023,
        logMsg: 'Action_NotEnoughGold Error  1023 ',
        userMsg: 'Không đủ tiền (1023)',
        userMsgEn: 'Not Enough Gold (1023)',
        userMsgRu: 'Не хватает золота !(1023)'
    },	
    Baccarat_TimeUp: {
        code: 1024,
        logMsg: 'Bacarat_TimeUp Error  1024 ',
        userMsg: 'Đã hết giờ đặt cược, vui lòng chờ ván tiếp theo (1024)',
        userMsgEn: 'Time up, please wait for the next round (1024)',
        userMsgRu: 'Не хватает золота !(1024)'
    },
    Baccarat_RequiredMoney: {
        code: 1025,
        logMsg: 'Baccarat_RequiredMoney Error  1025 ',
        userMsg: 'Bạn phải có %s để tham gia cược (1025)',
        userMsgEn: 'Required %s to join (1025)',
        userMsgRu: 'Не хватает золота !(1025)'
    },
    Baccarat_BetBankerAndPlayer: {
        code: 1026,
        logMsg: 'Baccarat_BetBankerAndPlayer Error  1026 ',
        userMsg: 'Không được cược cả 2 cửa BankerWin và PlayerWin (1026)',
        userMsgEn: 'You can not bet for both BankerWin and PlayerWin (1026)',
        userMsgRu: 'Не хватает золота !(1026)'
    },
    Baccarat_BetTooSmall: {
        code: 1027,
        logMsg: 'Baccarat_BetTooSmall Error  1027 ',
        userMsg: 'Không được cược bé hơn %s (1027)',
        userMsgEn: 'You can not bet less than %s (1027)',
        userMsgRu: 'Не хватает золота !(1027)'
    },
    Baccarat_BetTooBig: {
        code: 1028,
        logMsg: 'Baccarat_BetTooBig Error  1028 ',
        userMsg: 'Tổng cược của bạn đã vượt mức  %s (1028)',
        userMsgEn: 'Your total bet is bigger than the limit %s (1028)',
        userMsgRu: 'Не хватает золота !(1028)'
    },
    Baccarat_NotEnoughMoney: {
        code: 1029,
        logMsg: 'Baccarat_NotEnoughMoney Error 1029',
        userMsg: 'Bạn không đủ tiền cược (1029)',
        userMsgEn: 'You do not have enough money (1029)',
        userMsgRu: 'Не хватает золота !(1029)'
    },
	LimitGoldPlayable_Error: {
        code: 1030,
        logMsg: 'LimitGoldPlayable_Error Error  1030 ',
        userMsg: 'Bạn cần tối thiểu %s để tham gia chơi (1030)',
        userMsgEn: 'Minimum %s is required to play (1030)',
        userMsgRu: 'Минимум% s требуется для игры !( 1030 )'
	}
};