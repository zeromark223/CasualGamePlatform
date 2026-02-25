/**
 * Created by quinx on 12/17/2018.
 */

exports.CheckPair = function (_Cards) {
    if (_Cards.length == 2
        && _Cards[0].Score == _Cards[1].Score) {
        return 1;
    }

    return 0;
};

exports.CheckThreeOfAKind = function (_Cards) {
    if (_Cards.length != 3) {
        return 0;
    }

    if (_Cards[0].Score == _Cards[1].Score && _Cards[0].Score == _Cards[2].Score) {
        return 1;
    }

    return 0;
};

exports.CheckStraight = function (_Cards) {
    if (_Cards.length < 3) {
        return 0;
    }

    for (var i = 0; i < _Cards.length - 1; i++) {
        if ((_Cards[i].Score + 1 != _Cards[i + 1].Score)
            || _Cards[i].Score == 14) {
            return 0;
        }
    }

    return 1;
};

exports.CheckFourOfAKind = function (_Cards) {
    if (_Cards.length != 4) {
        return 0;
    }

    if (_Cards[0].Score == _Cards[1].Score
        && _Cards[0].Score == _Cards[2].Score
        && _Cards[0].Score == _Cards[3].Score
    ) {
        return 1;
    }

    return 0;
};

exports.CheckThreePairSequence = function (_Cards) {
    if (_Cards.length != 6) {
        return 0;
    }

    //Sorted

    //check Sequence
    if (_Cards[0].Score + 1 == _Cards[2].Score
        && _Cards[2].Score + 1 == _Cards[4].Score) {
        //check 3 pairs
        if (_Cards[0].Score == _Cards[1].Score
            && _Cards[2].Score == _Cards[3].Score
            && _Cards[4].Score == _Cards[5].Score
        ) {
            return 1;
        }
    }

    return 0;
};

exports.CheckFourPairSequence = function (_Cards) {
    if (_Cards.length != 8) {
        return 0;
    }

    //Sorted

    //check Sequence
    if (_Cards[0].Score + 1 == _Cards[2].Score
        && _Cards[2].Score + 1 == _Cards[4].Score
        && _Cards[4].Score + 1 == _Cards[6].Score
    ) {
        //check 3 pairs
        if (_Cards[0].Score == _Cards[1].Score
            && _Cards[2].Score == _Cards[3].Score
            && _Cards[4].Score == _Cards[5].Score
            && _Cards[6].Score == _Cards[7].Score
        ) {
            return 1;
        }
    }

    return 0;
};

exports.CheckFivePairSequence = function (_Cards) {
    if (_Cards.length != 10) {
        return 0;
    }

    //Sorted

    //check Sequence
    if (_Cards[0].Score + 1 == _Cards[2].Score
        && _Cards[2].Score + 1 == _Cards[4].Score
        && _Cards[4].Score + 1 == _Cards[6].Score
        && _Cards[6].Score + 1 == _Cards[8].Score
    ) {
        //check 3 pairs
        if (_Cards[0].Score == _Cards[1].Score
            && _Cards[2].Score == _Cards[3].Score
            && _Cards[4].Score == _Cards[5].Score
            && _Cards[6].Score == _Cards[7].Score
            && _Cards[8].Score == _Cards[9].Score
        ) {
            return 1;
        }
    }

    return 0;
};

exports.CheckIncluded_ThreePairSequence = function (Cards) {
    var Result = [];
    var _Cards = Cards.slice();
    var RequiredLen = 6;
    if (_Cards.length < RequiredLen) {
        return Result;
    }

    ///sắp xếp bài nhỏ tới lớn
    this.SortCards(_Cards);

    //bỏ tam cô
    this.Remove3rdCard(_Cards);

    var SubCards = this.SubCard(_Cards, RequiredLen);

    for (var i = 0; i < SubCards.length; i++) {
        if (this.CheckThreePairSequence(SubCards[i])) {
            Result.push(SubCards[i]);
        }
    }

    return Result;
};

exports.CheckIncluded_FourPairSequence = function (Cards) {
    var Result = [];
    var _Cards = Cards.slice();
    var RequiredLen = 8;
    if (_Cards.length < RequiredLen) {
        return Result;
    }

    //sắp xếp bài nhỏ tới lớn
    this.SortCards(_Cards);

    //bỏ tam cô
    this.Remove3rdCard(_Cards);

    var SubCards = this.SubCard(_Cards, RequiredLen);

    for (var i = 0; i < SubCards.length; i++) {
        if (this.CheckFourPairSequence(SubCards[i])) {
            Result.push(SubCards[i]);
        }
    }

    return Result;
};

exports.CheckIncluded_FivePairSequence = function (Cards) {
    var Result = [];
    var _Cards = Cards.slice();
    var RequiredLen = 10;
    if (_Cards.length < RequiredLen) {
        return Result;
    }

    //sắp xếp bài nhỏ tới lớn
    this.SortCards(_Cards);

    //bỏ tam cô
    this.Remove3rdCard(_Cards);

    var SubCards = this.SubCard(_Cards, RequiredLen);

    for (var i = 0; i < SubCards.length; i++) {
        if (this.CheckFivePairSequence(SubCards[i])) {
            Result.push(SubCards[i]);
        }
    }

    return Result;
};

exports.CheckIncluded_FourOfAKind = function (_Cards) {
    var Result = [];
    var RequiredLen = 4;
    if (_Cards.length < RequiredLen) {
        return Result;
    }

    //sắp xếp bài nhỏ tới lớn
    this.SortCards(_Cards);

    var SubCards = this.SubCard(_Cards, RequiredLen);

    for (var i = 0; i < SubCards.length; i++) {
        if (this.CheckFourOfAKind(SubCards[i])) {
            Result.push(SubCards[i]);
        }
    }

    return Result;
};

exports.CheckIncluded_Pair = function (Cards) {
    var Result = [];
    var _Cards = Cards.slice();
    var RequiredLen = 2;
    if (Cards.length < RequiredLen) {
        return Result;
    }

    //sắp xếp bài nhỏ tới lớn
    this.SortCards(_Cards);
    this.Remove3rdCard(_Cards);

    var SubCards = this.SubCard(_Cards, RequiredLen);

    for (var i = 0; i < SubCards.length; i++) {
        if (this.CheckPair(SubCards[i])) {
            Result.push(SubCards[i]);
        }
    }

    return Result;
};

exports.CheckIncluded_ThreeOfAKind = function (Cards) {
    var Result = [];
    var _Cards = Cards.slice();
    var RequiredLen = 3;
    if (Cards.length < RequiredLen) {
        return Result;
    }

    //sắp xếp bài nhỏ tới lớn
    this.SortCards(_Cards);
    //this.Remove3rdCard(_Cards);

    var SubCards = this.SubCard(_Cards, RequiredLen);

    for (var i = 0; i < SubCards.length; i++) {
        if (this.CheckThreeOfAKind(SubCards[i])) {
            Result.push(SubCards[i]);
        }
    }

    return Result;
};

exports.CheckIncluded_Straight = function (Cards, Len) {
    var Result = [];
    var _Cards = Cards.slice();
    var RequiredLen = Len;
    if (Cards.length < RequiredLen) {
        return Result;
    }

    //sắp xếp bài nhỏ tới lớn
    this.SortCards(_Cards);
    this.Remove2ndCard(_Cards);

    var SubCards = this.SubCard(_Cards, RequiredLen);

    for (var i = 0; i < SubCards.length; i++) {
        if (this.CheckStraight(SubCards[i])) {
            Result.push(SubCards[i]);
        }
    }

    return Result;
};

exports.GetSpecificCard = function (_Cards, Score) {
    var Result = [];
    for (var i = 0; i < _Cards.length; i++) {
        if (_Cards[i].Score == Score) {
            Result.push(_Cards[i]);
        }
    }
    return Result;
};

exports.Remove3rdCard = function (_Cards) {
    for (var i = _Cards.length - 1; i > -1; i--) {
        var Card = _Cards[i];
        var CardArray = this.GetSpecificCard(_Cards, Card.Score);

        if (CardArray.length > 2) {
            _Cards.splice(i, 1);
        }
    }
};

exports.Remove2ndCard = function (_Cards) {
    for (var i = 0; i < _Cards.length; i++) {
        var Card = _Cards[i];
        var CardArray = this.GetSpecificCard(_Cards, Card.Score);

        if (CardArray.length > 1) {
            _Cards.splice(i, 1);
            i--;
        }
    }
};

exports.CheckRoyalStraight = function (Cards) {
    if (Cards.length < 13) {
        return 0;
    }

    for (var i = 0; i < Cards.length - 1; i++) {
        if ((Cards[i].Score + 1 != Cards[i + 1].Score)) {
            return 0;
        }
    }

    return 1;
};

exports.CheckHangCo3Bich = function (Cards) {
    var _Cards = Cards.slice();
    var FourOfAKinds = this.CheckIncluded_FourOfAKind(_Cards);
    var ThreePairSequences = this.CheckIncluded_ThreePairSequence(_Cards);

    for (var i = 0; i < FourOfAKinds.length; i++) {
        if (FourOfAKinds[i][0].Score == 3
            && FourOfAKinds[i][0].Suit == 1) {
            return 1;
        }
    }

    for (var i = 0; i < ThreePairSequences.length; i++) {
        if (ThreePairSequences[i][0].Score == 3
            && ThreePairSequences[i][0].Suit == 1) {
            return 1;
        }
    }

    return 0;
};

exports.RemoveCards = function (Cards, RemoveCards) {
    for (var i = 0; i < Cards.length; i++) {
        for (var j = 0; j < RemoveCards.length; j++) {
            if (Cards[i].Score == RemoveCards[j].Score
                && Cards[i].Suit == RemoveCards[j].Suit) {
                Cards.splice(i, 1);
                i--;
                break;
            }
        }
    }
};

exports.GetBiggestSingle = function (Cards) {
    this.SortCards(Cards);

    return [Cards[Cards.length - 1]];
};

exports.GetBiggestPair = function (Cards) {
    var Pairs = this.CheckIncluded_Pair(Cards);

    if (Pairs.length > 0) {
        return Pairs[Pairs.length - 1];
    }
    else{
        return [];
    }

};

exports.GetBiggestThreeOfAKind = function (Cards) {
    var ThreeOfAKinds = this.CheckIncluded_ThreeOfAKind(Cards);
    if (ThreeOfAKinds.length > 0) {
        return ThreeOfAKinds[ThreeOfAKinds.length - 1];
    }
    else {
        return [];
    }
};

exports.GetBiggestStraight = function (Cards, Len) {
    var Straights = this.CheckIncluded_Straight(Cards, Len);
    if (Straights.length > 0) {
        return Straights[Straights.length - 1];
    }
    else {
        return [];
    }

};

exports.GetBiggestThreePairSequence = function(Cards){
    var ThreePairSequences = this.CheckIncluded_ThreePairSequence(Cards);
    if (ThreePairSequences.length > 0) {
        return ThreePairSequences[ThreePairSequences.length - 1];
    }
    else {
        return [];
    }
};

exports.GetBiggestFourPairSequence = function(Cards){
    var FourPairSequences = this.CheckIncluded_FourPairSequence(Cards);
    if (FourPairSequences.length > 0) {
        return FourPairSequences[FourPairSequences.length - 1];
    }
    else {
        return [];
    }
};

exports.GetBiggestFourOfAKind = function(Cards){
    var FourOfAKinds = this.CheckIncluded_FourOfAKind (Cards);
    if (FourOfAKinds.length > 0) {
        return FourOfAKinds[FourOfAKinds.length - 1];
    }
    else {
        return [];
    }
};

//input: _Cards danh sách bài
//input: numberOfCards số lá chuỗi con cần có
//VD: [1,2,3], 2 => [[1,2], [2,3]]
exports.SubCard = function (_Cards, numberOfCards) {
    var Result = [];

    for (var i = 0; i < _Cards.length - (numberOfCards - 1); i++) {
        var subCards = _Cards.slice(i, i + numberOfCards);
        Result.push(subCards);
    }

    return Result;
};

exports.SortCards = function (_Cards) {
    for (var i = 0; i < _Cards.length; i++) {
        for (var j = i; j < _Cards.length; j++) {
            if ((_Cards[i].Score * 10 + _Cards[i].Suit) > (_Cards[j].Score * 10 + _Cards[j].Suit)) {
                var temp = _Cards[i];
                _Cards[i] = _Cards[j];
                _Cards[j] = temp;
            }
        }
    }
};

exports.FindHighestCard = function (_Cards) {
    var HighestCard = _Cards[0];

    for (var i = 1; i < _Cards.length; i++) {
        if ((HighestCard.Score * 10 + HighestCard.Suit) < (_Cards[i].Score * 10 + _Cards[i].Suit)) {
            HighestCard = _Cards[i];
        }
    }

    return HighestCard;
};
