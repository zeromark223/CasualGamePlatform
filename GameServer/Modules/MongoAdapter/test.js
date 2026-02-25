/**
 * Created by ngocnpt on 01/08/2016.
 */
var MongoAdapter = require('./index');
var Cfg = {
    Url:'mongodb://192.168.5.135:27017/CLCB'
};

MongoAdapter.Init(Cfg);

setTimeout(function(){
    MongoAdapter.GetUserInfo(123456,function(){

    });
    MongoAdapter.ChangeNickName(123456,'Vũ Văn Thành Đô',function(){

    });
},1000);


