var min = 1;
var max = 6;

function ranDice() {
    return Math.floor(Math.random()*max)+1;
}

function compareDiceB(d1,d2,d3) {
    if(d1 == d2 && d2 == d3 ){
        return true;
    }
}

function compareDice(d1,d2,d3) {
    if(compareDiceB(d1,d2,d3)){
        return false;
    }
    if(d1+d2+d3 >= 4 && d1+d2+d3 <= 10 ) {
        return true;
    }

}
var count = 1000*1000*100;
var seen = 0;
for(var i = 0 ; i < count;i++){
    if(compareDice(ranDice(),ranDice(),ranDice())){
        seen ++;
    }
}
//console.log(">>> ",seen,count/seen,count-seen);
console.log(">>> ",seen,seen/count,0.5-(seen/count));

//0.486
