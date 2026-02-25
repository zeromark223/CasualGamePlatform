/**
 * Created by quinx on 6/14/2017.
 */

var Packet = require('./Packet');
var Define = require('./Define');

function LocalPaymentShow() {
    return this.AddHeader(Define.LocalPaymentShow);
}
module.exports = LocalPaymentShow ;
LocalPaymentShow.prototype = new Packet();