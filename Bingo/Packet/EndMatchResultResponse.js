var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function EndMatchResultResponse (Dices,ResultText,TimeLeft,WinList) {
    return this.AddHeader(Define.EndMatchResult , new BinaryBuilder(
        {
            Dices: Dices,
            ResultText:ResultText, // Kết quả trước mã hóa
            TimeLeft:TimeLeft, // thời gian đếm ngược
            WinList:WinList
        },
        Struct.EndMatchResultResponse
    ));
}

module.exports = EndMatchResultResponse ;
EndMatchResultResponse.prototype = new Packet();
