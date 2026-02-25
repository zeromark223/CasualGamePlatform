var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function UserEnterGameResponse(Data) {
    return this.AddHeader(Define.UserEnterGame, new BinaryBuilder(
        {
            // ResponseData: Data
            ErrorCode: Data.ErrorCode,
            DeskState: Data.DeskState,
            TimeLeft: Data.TimeLeft,
            UserCards: Data.UserCards,
            CalledValues: Data.CalledValues,
            CalledLeft: Data.CalledLeft,
            //
            DeskMode: Data.DeskMode,
            CardPrice: Data.CardPrice
        },
        Struct.UserEnterGameResponse
    ));
}

module.exports = UserEnterGameResponse;
UserEnterGameResponse.prototype = new Packet();
