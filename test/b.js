// // // // // var fs = require('fs');
// // // // // var https  = require('https');
// // // // // var port = 1230;
// // // // // var WSSocketUser;
// // // // // var keyPath = './SSL.key';
// // // // // var certPath = './SSL.crt';
// // // // // const options = {
// // // // //     key: fs.readFileSync(keyPath),
// // // // //     cert: fs.readFileSync(certPath)
// // // // // };
// // // // //
// // // // // var webServer = https.createServer(options, function (req, res) {
// // // // //     res.writeHead(404);
// // // // //     res.end('');
// // // // // }).listen(port, '0.0.0.0');
// // // // //
// // // // // WSSocketUser = new WebSocket.Server({
// // // // //     server: webServer,
// // // // //     perMessageDeflate: false
// // // // // }, function (err) {
// // // // //    console.log(err);
// // // // // }.bind(this));
// // // // // WSSocketUser.on('connection', handleWSSUserEnter.bind(this, true));//Bind This vs IsWSS
// // // // // WSSocketUser.on('error', function (err) {
// // // // //     console.log(err)
// // // // // }.bind(this));
// // // // //
// // // // // function handleWSSUserEnter (IsWSS,Socket) {
// // // // //
// // // // // }
// // // //
// // // // // var rand = Math.random();
// // // // // var  x = (-GetStockRatio+1.5)/0.6;
// // // // // console.log("x ",x,GetStockRatio());
// // // // //
// // // // //
// // // // // function GetStockRatio() {
// // // // //     return 1.0;
// // // // // }
// // // //
// // // // // var CreateDate = new Date('2018-09-07 11:00:00');
// // // // // var test = Math.floor((new Date() - CreateDate) / (24 * 3600 * 1000)) + 1;
// // // // //
// // // // // var loginDay = 99999;
// // // // // var dayMiliSecond = (24*3600*1000);
// // // // // try{
// // // // //     var today = +new Date();
// // // // //     today = Math.floor(today / dayMiliSecond);
// // // // //     console.log(today);
// // // // //     var check = +new Date(CreateDate);
// // // // //     check =  Math.floor(check / dayMiliSecond) ;
// // // // //     console.log(check);
// // // // //     loginDay =  today-check+1;
// // // // // }catch (e){
// // // // //     console.log(e.stack);
// // // // // }
// // // // //
// // // // // console.log(loginDay,test);
// // // // // var Desc ='Charge Card';
// // // // // var desc = Desc.toLowerCase();
// // // // // desc = desc.split(' ').join('');//chargecard
// // // // // console.log(desc);
// // // //
// // // // var config = {
// // // //     402: {
// // // //         7: {
// // // //             5: 0.036,
// // // //             4: 0.0008,
// // // //             3: 0.00004
// // // //         }
// // // //     }
// // // //
// // // // };
// // // //
// // // // console.log(JSON.stringify(config));
// // //
// //
// // //
// // // function CharsToHex(chars) {
// // //     var result = "";
// // //     var len = chars.length;
// // //     for (var i = 0; i < len; i++) {
// // //         result += chars.charCodeAt(i).toString(16);
// // //     }
// // //     return result;
// // // }
// // //
// // // function HexToChars(hex) {
// // //     hex = hex.toString();//force conversion
// // //     var str = '';
// // //     for (var i = 0; i < hex.length; i += 2) {
// // //         var charCode = hex.charCodeAt(i) + hex.charCodeAt(i+1)*;
// // //         //console.log(charCode);
// // //         str += String.fromCharCode(charCode);
// // //     }
// // //
// // //     return str;
// // // }
// // //
// // // var key = "123456";
// // // var obj = {username: 'zeromark', password: 'forever'};
// // // var a = rc4(key, JSON.stringify(obj));
// // // var b = rc4(key, a);
// // // var c = CharsToHex(a);
// // // // console.log(c);
// // // // // console.log(">>", a);
// // // // // console.log(">>", HexToChars(c));
// // // //
// // // // c = HexToChars(c);
// // // // c = rc4(key, c);
// // // // console.log( c);
// // // var text = "ngoc";
// // // var char2hex = CharsToHex(text);
// // // var hex2char = HexToChars(char2hex);
// // // console.log(char2hex,hex2char);
// //
// //
// // function hex2a(hexx) {
// //     var hex = hexx.toString();//force conversion
// //     var str = '';
// //     for (var i = 0; (i < hex.length && hex.substr(i, 2) !== '00'); i += 2)
// //         str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
// //     return str;
// // }
// //
// // function a2hex(str) {
// //     var arr = [];
// //     for (var i = 0, l = str.length; i < l; i ++) {
// //         var hex = Number(str.charCodeAt(i)).toString(16);
// //         arr.push(hex);
// //     }
// //     return arr.join('');
// // }
// //
// // function rc4(key, str) {
// //     var s = [], j = 0, x, res = '';
// //     for (var i = 0; i < 256; i++) {
// //         s[i] = i;
// //     }
// //     for (i = 0; i < 256; i++) {
// //         j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
// //         x = s[i];
// //         s[i] = s[j];
// //         s[j] = x;
// //     }
// //     i = 0;
// //     j = 0;
// //     for (var y = 0; y < str.length; y++) {
// //         i = (i + 1) % 256;
// //         j = (j + s[i]) % 256;
// //         x = s[i];
// //         s[i] = s[j];
// //         s[j] = x;
// //         res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
// //     }
// //     return res;
// // }
// //
// // var key = "123456";
// // var obj = JSON.stringify({username: 'zeromark', password: 'forever'});
// // var a = rc4(key, obj);
// // var b = rc4(key, a);
// // var c = a2hex(a);
// // console.log(c);
// //
// // c = hex2a(c);
// // console.log(a);
// // console.log(c);
// // console.log(a2hex(obj),hex2a(a2hex(obj)));
// // // c = rc4(key, c);
// // // console.log( c);
// // //
// // // console.log("==========");
// // // var raw = hex2a('7bdab1441417bfd125208cdb4424bc82a53b1898a26d90ebc1d9be118822fcf66f5813e6156cf7a5353');
// // // var info = rc4(key,raw);
// // // console.log(info);
//
// // var en = require('../SharedModule/encrytion');
// //
// // en  = en.md5("apigateway_prod"+"ob$DvsKUvjgWmQUN");
// // console.log(en);
// //
// // var TimeCheck = new Date();
// // console.log(TimeCheck.getTimezoneOffset());
// // TimeCheck = +TimeCheck - (TimeCheck.getTimezoneOffset() * 1000);
// //
// // console.log(TimeCheck);
// // testne(new Date('2019-03-24'));
// // function testne(checkDate) {
// //     var difDay = 99999;
// //     var dayMiliSecond = (24 * 3600 * 1000);
// //     try {
// //         var today = +new Date();
// //         today = Math.floor(today / dayMiliSecond);
// //         var check = +new Date(checkDate);
// //         check = Math.floor(check / dayMiliSecond);
// //         difDay = today - check;
// //     } catch (e) {
// //         this.GameServer.Logger.Game().error('DeskCore.prototype.LoadUserInfo Err', e.stack);
// //     }
// //     console.log(difDay);
// //         ;
// // }
//
// // var a = new Buffer(8);
// // a.writeDoubleBE(0.9,0);
// // var b = toArrayBuffer(a);
// // b = new DataView(b);
// // console.log(b.getFloat64(0,1));
// // console.log(b.getFloat64(0,0));
// //
// // function toArrayBuffer(buf) {
// //     var ab = new ArrayBuffer(buf.length);
// //     var view = new Uint8Array(ab);
// //     for (var i = 0; i < buf.length; ++i) {
// //         view[i] = buf[i];
// //     }
// //     return ab;
// // }
//
// var c = {
//     VPConfig: [
//         {
//             GameList: [2, 4, 6],
//             Ratio: 1
//         },
//         {
//             GameList: [1],
//             Ratio: 1
//         },
//         {
//             GameList: ['agent'],
//             Ratio: 10
//         }
//     ],
//     VPConfigDefault: {
//         Ratio: 0
//     }
// };
// console.log(JSON.stringify(c));

