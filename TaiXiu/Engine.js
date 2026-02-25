var minDice = 1;
var maxDice = 6;

exports.randomDice = function () {
    return Math.floor(Math.random()*maxDice)+minDice;
};

exports.compareBaoAny = function (d1,d2,d3) {
    return d1 ==  d2 && d2 == d3;
};

exports.compareBao = function (d1,d2,d3,check) {
    return this.compareBaoAny(d1,d2,d3) && d1 == check;
};

exports.compareXiuTai = function (sum) {
    return sum >= 4 && sum <= 10;
};

exports.compareChanLe = function (sum) {
  return sum % 2;
};

