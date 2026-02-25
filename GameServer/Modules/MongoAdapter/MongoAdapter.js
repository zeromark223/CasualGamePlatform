var MongoClient = require('mongodb').MongoClient;


var DB = '';
var isConnected = false;

exports.Init = function(cfg){
    MongoClient.connect(cfg.Url, function(err, db) {
        if(!err){
            DB = db;
            isConnected = true;
        }
    });
};

exports.GetUserInfo = function(UserID,callback){
    if(isConnected){
        var UserInfo = DB.collection('UserInfo');
        UserInfo.find({UserID:UserID}).toArray(function(err, data) {
            try{
                if(!err){
                    if(data.length ==0){
                        InsertUserInfo(UserID,callback);
                    }else{

                        callback("0",data);
                    }

                }else{
                    callback('MongoErr',err);
                }
            }catch(e){
                callback('TryErr',e);
            }
        });
    }else{
        callback('isConnected',isConnected);
    }

};


function InsertUserInfo(UserID,callback){
    if(isConnected){
        var UserInfo = DB.collection('UserInfo');
        var userData = {
            UserID:UserID,
            FishUse:1,
            Nickname:'User'+UserID,
            Exp:0,
            Level:1,
            Avatar:'',
            ExpBounus:0,
            Kill:0,
            Dead:0
        };
        UserInfo.insert(userData,function(err,data){
            if(!err){
                callback("0",data.ops);
            }else{
                callback('MongoErr',err);
            }

        });
    }else{
        callback('isConnected',isConnected);
    }

}

exports.ChangeNickName = function(UserID,NickName,callback){
    if(isConnected){
        if(NickName.indexOf('User') == 0){// Chống trường hợp đặc tên của hệ thống
            callback("NameErr");
        }else{
            var UserInfo = DB.collection('UserInfo');
            UserInfo.findAndModify(
                {UserID: UserID}, // query
                [['_id','asc']],  // sort order
                {$set: {Nickname: NickName}}, // replacement, replaces only the field "hi"
                {}, // options
                function(err, object) {
                    if (!err){
                        callback("0",object);
                    }else{
                        callback("NoFind");
                    }
                });
        }


    }else{
        callback('isConnected',isConnected);
    }

};
exports.ChangeFishUse = function(UserID,FishUse,callback){
    if(isConnected){
        var UserInfo = DB.collection('UserInfo');
        UserInfo.findAndModify(
            {UserID: UserID}, // query
            [['_id','asc']],  // sort order
            {$set: {FishUse: FishUse}}, // replacement, replaces only the field "hi"
            {}, // options
            function(err, object) {
                if (!err){
                    callback("0",object);
                }else{
                    callback("NoFind");
                }
            });

    }else{
        callback('isConnected',isConnected);
    }

};
