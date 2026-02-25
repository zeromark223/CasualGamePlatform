var ReelConfig = require('./ReelConfig');
var args = process.argv.slice(2);
//console.log(args);
CalcWinList(args);
function CalcWinList(line) {
    var track = [];
    var wild = 0;
    for(var i = 0 ;i < line.length;i++){
        var id = +line[i];
        if(id == 1)wild++;
        if(typeof track[id] != 'undefined'){
            track[id] +=1;
        } else{
            track[id] = 1;
        }
    }
    for(var i = 0 ; i < track.length ;i++   ){
        if(track[i]>0 && i !=1){
            track[i]+=wild;
        }
    }
    var genTrack = 0;
    var genRatio = 0;
    for(var i = 0 ; i < track.length ;i++   ){
        if(track[i] > 2){
            if(genTrack == 0){
                genTrack = i;
                genRatio = GetRewardByIDAndCount(i,track[i]);
            }else{
                if(GetRewardByIDAndCount(i,track[i]) > genRatio){
                    genTrack = i;
                    genRatio = GetRewardByIDAndCount(i,track[i]);
                }
            }
        }
    }
    console.log("ID ",genTrack,genRatio);
}

function GetRewardByIDAndCount(ID, Count) {
    try {
        for (var i = 0; i < ReelConfig.Reward.length; i++) {
            if (ReelConfig.Reward[i].id == ID) {

                return ReelConfig.Reward[i].values[Count - 1];
            }
        }
    } catch (e) {

    }

    return 0;
};