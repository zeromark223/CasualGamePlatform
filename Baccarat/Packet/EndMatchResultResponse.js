var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function EndMatchResultResponse (PlayerCard, BankerCard,ResultText,TimeLeft,WinList) {
    return this.AddHeader(Define.EndMatchResult , new BinaryBuilder(
        {
            PlayerCard: PlayerCard,
            BankerCard: BankerCard,
            ResultText:ResultText, // Kết quả trước mã hóa
            TimeLeft:TimeLeft, // thời gian đếm ngược
            WinList:WinList
        },
        Struct.EndMatchResultResponse
    ));
}

module.exports = EndMatchResultResponse ;
EndMatchResultResponse.prototype = new Packet();
