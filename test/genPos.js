var startX = 51800;
var startY = 115000;
var endX = 53400;
var endY = 13000;
var count = 10;
var range = 2000;
var max = 0;
var decay = 10;
var pos = [];
var lastY = 0;
for(var i = 0; i < count;i++){
    var y = startY+(range*i-decay*i);
    lastY = y;
    pos.push(startX+','+y)
}
for(var i = 0; i < count;i++){
    var y = lastY-(range*i-decay*i);
    pos.push(endX+','+y)
}
console.log(pos);