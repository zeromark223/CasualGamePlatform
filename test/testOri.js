var Encryption = require('../SharedModule/encrytion');
var Config = require('../Config/GameConfig');
var dataLoginRoom = {
    UserID: 12345678,
    PubUserID: 99991234678,
    SessionID: 1,
    MasterID: 1,
    ChannelID: 1,
    GameName : 'NgocDepTrai',
    Time: +new Date(),
    ProviderID:0,
    PlatformID:0
};
var data = {
    AccountID:'nguyentc'
};
// var txtToken = 'bd0ea02290f074532e5e2a7294df39abbe019c824f29d51a90cac704bfc68ce008165b8403f18ca8adbab170ece74ab54f1b66f756d2379a39d232d1824bf539f607f514b4b740866c005c57e893a3f9603a6a36847b2ce8c56e7ba3b90395a676dbc3a83390031d543b2c17b35b147af928087dd65f80e1c06bdd965c7a21e810faa2ae75c37bdd2bd9076f19645556bebc3a3b0597c82fda57c7e6f9dec57d16351a1d7be9f22cb0629215e59f7cdc';
// // var token = Encryption.aesEncryptIV(JSON.stringify(dataLoginRoom), Config.KeyConfig.LoginKey, Config.KeyConfig.LoginIV);
// // console.log(token);
// var  LoginKey = "18c8cedd8c44b2f0dc5491f7616fe35f78c72241f7c3cdf2547d4d2dd50aa96f1";
// var    LoginIV = "bc8cf9428b7ee079073d3668eb06dcb838fcd5906e0fae0157ddb5cb481af9589e827"
//  var token = Encryption.aesDecryptIV(txtToken, LoginKey, LoginIV);
//  console.log("Token ",token);

var token = Encryption.aesEncryptIV(JSON.stringify(data), 'key771122', 'iv999888');
console.log(token);