var Utility = require('../../../SharedModule/Utility');

function Cards() {
    this.CardsList = [];
    this.PokerStarRule = {
        MauThau: 14 ^ 2,
        Doi: 14 ^ 3,
        Thu: 14 ^ 4,
        SamCo: 14 ^ 5,
        Sanh: 14 ^ 6,
        Thung: 14 ^ 7,
        CuLu: 14 ^ 8,
        TuQui: 14 ^ 9,
        ThungPhasanh: 14 ^ 10
    }
}

module.exports = Cards;

Cards.prototype.GenCardsBy = function (StartNum, EndNum, Type) {
    var cardList = [];
    for (var i = StartNum; i <= EndNum; i++) {
        for (var j = 0; j < Type.length; j++) {
            cardList.push({
                Num: i,
                Type: Type[j]
            })
        }
    }
    return cardList;
};

Cards.prototype.GenStandardCards = function () {
    var StartNum = 2;
    var EndNum = 14;
    var Type = [0, 1, 2, 3];//Bích, Chuồn, Cơ, Rô
    this.CardsList = this.CardsShuffle(this.GenCardsBy(StartNum, EndNum, Type));
    console.log(this.CardsList);
    return this.CardsList;
};

Cards.prototype.CardsShuffle = function (CardsList) {
    var j, x, i;
    for (i = CardsList.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = CardsList[i];
        CardsList[i] = CardsList[j];
        CardsList[j] = x;
    }
    return CardsList;
};

Cards.prototype.CardsPop = function (CardsList) {
    return CardsList.shift();
};

Cards.prototype.GetCardTypeByRule = function (CardsList, Rule) {
    switch (Rule) {
        case 'PokerStar':
            break;
        default:
            break;
    }
};

Cards.prototype.CardsOrderNum = function (CardsList) {
    CardsList.sort(function (a, b) {
        if (a.Num < b.Num)
            return -1;
        else if (a.Num == b.Num) {
            if (a.Type < b.Type) {
                return -1
            } else {
                return 1
            }
        } else {
            return 1
        }

    });
};

Cards.prototype.GetCardTypePokerStar = function (CardsList) {
    var CardsCloneList = [];
    for (var i = 0; i < CardsList.length; i++) {
        CardsCloneList.push(CardsList[i]);
    }
    var ResultList = [];
    this.CardsOrderNum(CardsCloneList, ResultList);
    //Thung Pha Sanh
    this.CalcThungPhaSanh(CardsCloneList, ResultList);
    //Tu Qui
    //Cu Lu
    //Thung
    //Sanh
    //Sam Co
    //Thu

    //Mau
    this.CalcMauThau(CardsCloneList, ResultList);

};

Cards.prototype.CalcMauThau = function (CardsList, ResultList) {
    //CardsList Must be ordered
    for (var i = 0; i < CardsList.length; i++) {
        ResultList.push({
            ID: this.PokerStarRule.MauThau,
            Num: CardsList[i].Num,
            Type: CardsList[i].Type
        })
    }
};

Cards.prototype.CalcDoi = function (CardsList) {
    for (var i = 0; i < CardsList.length; i++) {

    }
};

Cards.prototype.CalcThu = function () {

};

Cards.prototype.CalcSam = function () {

};

Cards.prototype.CalcCuLu = function () {

};


Cards.prototype.CalcSanh = function (CardsList) {
    var rsArray = [];
    var bkRsArray = [];
    if (CardsList.length < 5) return [];// sảnh tối thiểu 5 lá
    rsArray.push(CardsList[0]);
    if (CardsList[0].Num == 2 && CardsList[CardsList.length - 1].Num == 14) {
        //case sảnh 1 2 3 4 5
        rsArray.splice(0, 0, CardsList[CardsList.length - 1]); // insert vào đầu
    }
    for (var i = 1; i < CardsList.length; i++) {

        if (rsArray.length <= 0) continue;//Lổi
        if (CardsList[i].Num - 1 == rsArray[rsArray.length - 1].Num) {// số này liền nhau
            if (rsArray.length > 4) {
                rsArray.splice(0, 1);//xóa phần tử đầu đi để thêm phần tử mới lớn hơn
            }
            rsArray.push(CardsList[i]);
        } else {//ko liền mạch, reset array
            if (CardsList[i].Num == rsArray[rsArray.length - 1]) {// Bằng nhau
                continue;// bỏ qua (tùy rule)
                // if(CardsList[i].Type < rsArray[rsArray.length-1].Type ){
                //     continue;// bỏ qua
                // }else{
                //     rsArray[rsArray.length-1] = CardsList[i];
                // }
            } else {
                if (rsArray.length > 4) {// Đã đủ sảnh
                    console.log("hut");
                    bkRsArray = rsArray;
                }
                rsArray = [];
                console.log(">");
                rsArray.push(CardsList[i]);
            }

        }
    }
    if (bkRsArray.length > 0 && rsArray.length < 5) {
        rsArray = bkRsArray;
    }
    if (rsArray.length < 5) { // ko có sảnh
        return [];
    }

    return rsArray;
};

Cards.prototype.CalcThung = function (CardsList) {
    var rsArray = [];
    for (var i = 0; i < CardsList.length; i++) {
        if (!Utility.CheckVariable(rsArray[CardsList[i].Type])) {
            rsArray[CardsList[i].Type] = [];
        }
        if (rsArray[CardsList[i].Type].length > 4) {
            rsArray[CardsList[i].Type].splice(0, 1);
        }
        rsArray[CardsList[i].Type].push(CardsList[i]);
    }
    //handle Thùng
    for (var i = 0; i < rsArray.length; i++) {
        if (!Utility.CheckVariable(rsArray[i]) || rsArray[i].length < 5) {
            rsArray.splice(i, 1);
            i--;
        }
    }
    console.log("========================");
    console.log(rsArray);
};

Cards.prototype.CalcThungPhaSanh = function (CardsList, ResultList) {
    var sanh = this.CalcSanh(CardsList);
    return this.CalcThung(sanh);
};