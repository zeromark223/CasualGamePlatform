//INSERT INTO bc68.fishconfig (Version, FishKind, FishName, Speed, FishMultiple, MaxFishMultiple, Width, Height, Deep) VALUES (1, 0, '{"vn":"Cá Ốc Sên","en":"Snail fish"}', 5, 2, 2, 50, 40, 0);
var fishconfig = require('../Config/GameConfig/FishConfig');
console.log(fishconfig.FishInfo);
var sql = 'INSERT INTO bc68.fishconfig (Version, FishKind, FishName, Speed, FishMultiple, MaxFishMultiple, Width, Height, Deep) VALUES (4, %s, \'{"vn":"Cá 3D","en":"3D fish"}\', 5, %s, %s, 50, 40, 0);';
var txt = "";
for(var fish in fishconfig.FishInfo){

    var f = fishconfig.FishInfo[fish].FishKind +"\t"+fishconfig.FishInfo[fish].FishMultiple;
    f = sql.replace('%s',fishconfig.FishInfo[fish].FishKind);
    f = f.replace('%s',fishconfig.FishInfo[fish].FishMultiple);
    if(fishconfig.FishInfo[fish].MaxFishMultiple){
        f = f.replace('%s',fishconfig.FishInfo[fish].MaxFishMultiple);
    }else{
        f = f.replace('%s',fishconfig.FishInfo[fish].FishMultiple);
    }
    txt += f + '\r\n';
}
console.log(txt);