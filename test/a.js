// //var config = require('../Config/Common/AchievementConfig');
// //console.log(config);
//
// // var a = {
//
//
// //     BindingIP:'192.168.0.249',
// //     BindingPort:3125,
// //     AllowIPList :[''],
// //     Bacarat_IP:'35.240.208.213',
// //     Bacarat_Port: 8882
// // };
// //
// // console.log(JSON.stringify(a));
//
// var text = new Buffer("Thắng","utf-8");
// //var text = new Buffer("Thắng","utf-8");
// console.log(text.toString());
// text = new Buffer(text.toString(),"utf-8");
// console.log(text);

var pool = [];
for (var i = 0; i < 52; i++) {
    pool.push(i);
}
pool.sort(function () {
    return Math.random() - 0.5;
});
console.log(pool.toString());