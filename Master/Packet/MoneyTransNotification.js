/**
 * Created by quinx on 9/6/2017.
 */
/**
 * Created by ngocnpt on 03-May-17.
 */
var Packet = require('./Packet');
var Define = require('./Define');
var Struct = require('./Struct');
var BinaryBuilder = require('../../SharedModule/Binary/BinaryBuilder');

function MoneyTransNotification(MessageList) {
    try {
        return this.AddHeader(Define.GetMoneyTransNotification, new BinaryBuilder(
            {
                MessageList: MessageList
            },
            Struct.MoneyTransNotificationResponse
        ));
    } catch (e) {
        console.log('Packet -> MoneyTransNotification - try err: ', e.stack);
    }

    return 0;
};

module.exports = MoneyTransNotification;
MoneyTransNotification.prototype = new Packet();
