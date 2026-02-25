var cards = require('./Modules/Cards');
var c = new cards();

// var a = c.GenStandardCards();
// a = c.GetCardTypePokerStar(a);
// console.log(a);

cardList = [

];

function randomRange(start,end) {
    return Math.floor(Math.random()*(end-start))+start;
}

// for(var i = 0 ;i < randomRange(5,10);i++ ){
//     cardList.push({
//         Num:randomRange(1,15),
//         Type:randomRange(0,4)
//     })
// };
cardList.push({Num:14,Type:randomRange(0,4)});
for(var i = 2; i < 7 ; i++){
        cardList.push({
        Num:i,
        Type:randomRange(0,4)
    })
}
for(var i = 8; i < 12 ; i++){
    cardList.push({
        Num:i,
        Type:randomRange(0,4)
    })
}
c.CardsOrderNum(cardList);
console.log(cardList);
console.log(
    c.CalcThung(cardList)
);

function cloneArray(array) {
    var newArray = [];
    for (var i = 0; i < array.length; i++) {
        newArray.push(array[i]);
    }
    return newArray;
}

function findAndRemoveArray(array, property, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][property] == value) {
            var find = array[i];
            array.splice(i, 1);
            return find;
        }
    }
}