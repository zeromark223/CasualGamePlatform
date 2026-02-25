var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function StartMatchResponse (EncryptedResult,TimeLeft,MatchID) {
    return this.AddHeader(Define.StartMatch , new BinaryBuilder(
        {
            EncryptedResult:EncryptedResult, // Kết quả đã mã hóa
            TimeLeft:TimeLeft, // Thời gian đếm ngược
            MatchID:MatchID
        },
        Struct.StartMatchResponse
    ));
}

module.exports = StartMatchResponse ;
StartMatchResponse.prototype = new Packet();
