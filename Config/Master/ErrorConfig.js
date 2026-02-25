/**
 * Created by ngocnpt on 23/05/2016.
 * Edit and Renew by ngocnpt on 09/04/2018.
 */
module.exports = {
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
    }
};