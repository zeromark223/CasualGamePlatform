var testArray = [];
var start = + new Date();
for(var i = 0 ; i < 25*1000000 ; i ++){
    if(Math.random()<0.2){
        testArray.push(Math.floor(Math.random()  - 3) + 4);
    }else{
        testArray.push(Math.floor(Math.random() * 19 - 10) + 11)
    }

}
var end = + new Date();
console.log(end-start);
