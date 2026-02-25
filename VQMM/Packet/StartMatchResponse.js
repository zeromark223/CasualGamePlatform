var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function StartMatchResponse (EncryptedResult,TimeLeft,MatchID, NumberOfCards) {
    return this.AddHeader(Define.StartMatch , new BinaryBuilder(
        {
            EncryptedResult:EncryptedResult, // Kết quả đã mã hóa
            TimeLeft:TimeLeft, // Thời gian đếm ngược
            MatchID:MatchID, // Thời gian đếm ngược
            NumberOfCards: NumberOfCards
        },
        Struct.StartMatchResponse
    ));
}

module.exports = StartMatchResponse ;
StartMatchResponse.prototype = new Packet();
