var lang = {
    Login_ParseDataErr: {
        code: 1000,
        logMsg:  'Parse data login err 1000 ',
        userMsg: 'Đăng nhập thất bại (1000)',
        userMsgEn: 'Login Fail (1000)'
    },
    Login_CheckParamFail: {
        code: 1001,
        logMsg: 'Check param login err 1001 ',
        userMsg: 'Đăng nhập thất bại (1001)',
        userMsgEn: 'Login Fail (1001)'
    },
    Login_TokenTimeOut: {
        code: 1002,
        logMsg: 'Token Time Out 1002 ',
        userMsg: 'Đăng nhập thất bại (1002)',
        userMsgEn: 'Login Fail (1002)'
    },
    Login_TryCatchInsideCheckLogin: {
        code: 1003,
        logMsg: 'Try Catch 1003 ',
        userMsg: 'Đăng nhập thất bại (1003)',
        userMsgEn: 'Login Fail (1003)'
    },
    Login_TryCatchOutSideCheckLogin: {
        code: 1004,
        logMsg: 'Try Catch 1004 ',
        userMsg: 'Đăng nhập thất bại (1004)',
        userMsgEn: 'Login Fail (1004)'
    },
    Login_Duplicate: {
        code: 1005,
        logMsg: 'Duplicate login 1005 ',
        userMsg: 'Tài của bạn đang được đăng nhập ở nơi khác (1005)',
        userMsgEn: 'Your account has been login by another devices (1005)'
    },
    Login_CheckLoginError: {
        code: 1006,
        logMsg: 'Check login error  1006 ',
        userMsg: 'Đăng nhập thất bại (1006)',
        userMsgEn: 'Login Fail (1006)'
    },
    Login_ParseTokenError: {
        code: 1007,
        logMsg: 'Check login error  1007 ',
        userMsg: 'Đăng nhập thất bại (1007)',
        userMsgEn: 'Login Fail (1007)'
    },
    FindRoom_CheckParamFail: {
        code: 1008,
        logMsg: 'Find room err CheckParamFail 1008 ',
        userMsg: 'Tìm phòng thất bại (1008)',
        userMsgEn: 'Finding room fail (1008)'
    },
    FindRoom_KindNotFound: {
        code: 1009,
        logMsg: 'Find room KindNotFound 1009 ',
        userMsg: 'Không tìm thấy loại phòng này (1009)',
        userMsgEn: 'Can\'t find your room kind (1009)'
    },
    FindRoom_FullRoom: {
        code: 1010,
        logMsg: 'Find room FullRoom 1010 ',
        userMsg: 'Tất cả phòng chơi đã đầy (1010)',
        userMsgEn: 'Room Full (1010)'
    },
    DailyAward_NoAward: {
        code: 1011,
        logMsg: 'DailyAward_NoAward ',
        userMsg: 'Đã hết phần thưởng, hẹn bạn ngày mai nhé !',
        userMsgEn: 'Reward has been received, appointment you tomorrow'
    },
    OnlineAward_NoAward: {
        code: 1012,
        logMsg: 'OnlineAward_NoAward ',
        userMsg: 'Đã hết phần thưởng, hẹn bạn ngày mai nhé !',
        userMsgEn: 'Reward has been received, appointment you tomorrow'
    },
    OnlineAward_LimitGold: {
        code: 1013,
        logMsg: 'OnlineAward_LimitGold ',
        userMsg: 'Bạn đã quá giàu, hẹn bạn lần sau nhé !',
        userMsgEn: 'You are so rich, see you next time'
    },
    DailyAward_LimitGold: {
        code: 1014,
        logMsg: 'DailyAward_LimitGold ',
        userMsg: 'Hôm nay bạn đã quá giàu, hẹn bạn ngày mai nhé !',
        userMsgEn: 'You are so rich, see you tomorrow'
    },
    Login_GetGoldError: {
        code: 1015,
        logMsg: 'Check login Get Gold Error  1015 ',
        userMsg: 'Đăng nhập thất bại (1015)',
        userMsgEn: 'Login Fail (1015)'
    },
    InsertRoom_Duplicate: {
        code: 1016,
        logMsg: 'InsertRoom_Duplicate Error  1016 ',
        userMsg: 'Đăng nhập thất bại (1016)',
        userMsgEn: 'Login Fail (1016)'
    },
    InsertRoom_NotEnoughGold: {
        code: 1017,
        logMsg: 'InsertRoom_NotEnoughGold Error  1017 ',
        userMsg: 'Đăng nhập thất bại (1017)',
        userMsgEn: 'Login Fail (1017)'
    },
    InsertRoom_NotEnoughLevel: {
        code: 1018,
        logMsg: 'InsertRoom_NotEnoughLevel Error  1018 ',
        userMsg: 'Đăng nhập thất bại (1018)',
        userMsgEn: 'Login Fail (1018)'
    },
    InsertRoom_RoomFull: {
        code: 1019,
        logMsg: 'InsertRoom_RoomFull Error  1019 ',
        userMsg: 'Đăng nhập thất bại (1019)',
        userMsgEn: 'Login Fail (1019)'
    },
    MoneyTransfer_Error: {
        code: 1020,
        logMsg: 'MoneyTransfer_Error Error  1020 ',
        userMsg: 'Chuyển tiền thất bại (1020)',
        userMsgEn: 'Transfer money fail (1020)'
    }
};



var kq = '';
for(var l in lang){
    kq += lang[l]['userMsg']+'\r\n';
}
console.log(kq);