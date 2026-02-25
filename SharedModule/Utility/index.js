/**
 * Created by ngocnpt on 26/05/2016.
 * All Utility Function add to this file.
 * Define global variable __endian before require this file.
 * Những Function tiện ích cho hết vào đây.
 * Phải Define biến global __endian trước khi require File này.
 * ********************************************************************************************************************
 */


/**
 * * Created by ngocnpt on 26/05/2016.
 * Convert String to Byte Array, msg(Dataview)  is ref, Return offset
 * @param {string} str
 * @param {Number} offset
 * @param {DataView} msg (ref)
 * @return {Number} offset
 */
exports.String2Bytes = function (str, offset, msg) {
    for (var j = 0; j < str.length; j++) {
        if (offset >= msg.byteLength) break;
        var charCode = str.charCodeAt(j);
        msg.setUint16(offset, charCode, __endian);
        offset += 2;
    }
    if (offset < msg.byteLength) {//break string
        msg.setUint16(offset, 0, __endian);
        offset += 2;
    }
    return offset;
};
/**
 * * Created by ngocnpt on 26/05/2016.
 * Convert Byte Array to String, msg(Dataview) is ref,Rerturn object {offset,str}
 * @param {Number} offset
 * @param {DataView} msg (ref)
 * @return {Object} Object
 */
exports.Bytes2String = function (offset, msg) {
    var str = '';
    for (; offset < msg.byteLength; i++) {
        var charCode = msg.getUint16(offset, __endian);
        if (charCode == 0) break;
        str += String.fromCharCode(charCode);
    }

    return {offset: offset, str: str};
};
/**
 * * Created by ngocnpt on 26/05/2016.
 * Prepare Data
 * @param {Number} DataLength
 * @return {DataView} Data
 */
exports.PrepareData = function (DataLength) {
    return new DataView(new ArrayBuffer(DataLength))
};
/**
 * * Created by ngocnpt on 01/07/2016.
 * Prepare Data
 * @param {String} str
 * *@param {String} endcoding
 * @return {DataView} Data
 */
exports.String2Buffer = function (str, endcoding) {
    var bufHeadStr = new Buffer(2);
    bufHeadStr.writeInt16LE(str.length, 0);
    var bufStr = new Buffer(str, endcoding);
    return Buffer.concat([bufHeadStr, bufStr]);
};

exports.AddZero = function (num) {
    return ('0' + num).slice(-2);
};

/**
 * * Created by ngocnpt on 28/06/2016.
 * Prepare Data
 * @return Hex length 64
 */
exports.GetUUID = function () {
    var buf = new Buffer(16);
    buf.writeDoubleBE(+new Date(), 0);
    buf.writeDoubleBE(Math.random(), 8);
    return buf.toString('hex');
};


/**
 * * Created by ngocnpt on 22/02/2017.
 * Check Variable With Att
 * @return boolean
 */
exports.CheckVariable = function () {
    if (typeof arguments[0] == 'undefined' || arguments[0] == null) return false;
    for (var i = 1; i < arguments.length; i++) {
        if (typeof arguments[0][arguments[i]] == 'undefined' || arguments[0][arguments[i]] == null) {
            return false;
        }

    }
    return true;
};

exports.GenSuffixDateSql = function () {
    var now = new Date();
    return this.GenSuffixDateSqlByDate(now);
};

exports.GenSuffixDateSqlByDate = function (now) {
    return "_" + now.getFullYear() + "_" + ("0" + (now.getMonth() + 1)).slice(-2) + "_" + ("0" + (now.getDate())).slice(-2);
};

exports.GenSuffixDateRedis = function () {
    var now = new Date();
    return now.getFullYear() + ":" + ("0" + (now.getMonth() + 1)).slice(-2) + ":" + ("0" + (now.getDate())).slice(-2);
};

/**
 * @return {string}
 */
exports.FormatDateTime = function (now) {
    return now.getFullYear() + '-' +
        ("0" + (now.getMonth() + 1)).slice(-2) + '-' +
        ("0" + (now.getDate())).slice(-2) + ' ' +
        ("0" + now.getHours()).slice(-2) + ':' +
        ("0" + now.getMinutes()).slice(-2) + ':' +
        ("0" + now.getSeconds()).slice(-2);
};
