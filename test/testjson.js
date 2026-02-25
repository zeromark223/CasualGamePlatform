var fs = require('fs');
var json = fs.readFileSync('./fishconfig.json');
var sqlAdapter = require('../GameServer/Modules/SQLAdapter');
var config = {
    connectionLimit:10,
    host: '192.168.0.223',
    user: 'root',
    password: '123456',
    database: 'bc68'
};
sqlAdapter.Init(config,console.log);

var objF = JSON.parse(json);
var newFish = [];
for(var i = 0; i <objF.Config.FishInfo.length;i++ ){
//for(var i = 0; i <1;i++ ){
    var fish = objF.Config.FishInfo[i];
    var bound = fish.BoundingBox.toString().split(',');
    var w = +bound[0];
    var h = +bound[1];
    var mulT = fish.multiple.split(',');
    var mul;
    var maxMul;
    if(mulT.length>1){
        mul = mulT[0];
        maxMul = mulT[1];
    }else{
        mul = mulT[0];
        maxMul = mulT[0];
    }
    //INSERT Into fishconfig(FishID,FishName,Speed,FishMultiple,MaxFishMultiple,Width,Height,Deep)
    //FishConfig_Insert
    var obj = {
        FishKind:+fish.FishKind,
        Name:fish.name,
        Speed:+fish.speed,
        FishMultiple:+mul,
        MaxFishMultiple:+maxMul,
        Width:w,
        Height:h
    };
    sqlAdapter.callSp('FishConfig_Insert',obj.FishKind,obj.Name,obj.Speed,obj.FishMultiple,obj.MaxFishMultiple,obj.Width,obj.Height,0);

}
fs.appendFileSync('newfish.txt',JSON.stringify(newFish));
console.log(newFish);