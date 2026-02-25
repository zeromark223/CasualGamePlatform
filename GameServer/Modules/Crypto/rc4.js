var sbox = [];
var mykey = [];
var key = [125, 577, 638, 345, 96, 724, 302, 95, 74, 522];

function encrypt(src, key) {
    var mtxt = [];
    for (var i = 0; i < src.length; ++i) {
        mtxt.push(src.charCodeAt(i));

    }
    console.log("mtxt " + mtxt);
    var mkey = [];
    for (var i = 0; i < key.length; ++i) {
        mkey.push(key.charCodeAt(i));
    }
    console.log("mkey " + mkey);
    var result = calculate(mtxt, mkey);

    return CharsToHex(result);

}
module.exports = function (src, key) {
    var mtxt = [];
    var mtxt1 = HexToChars(src);
    for (var i = 0; i < mtxt1.length; ++i) {
        mtxt.push(mtxt1.charCodeAt(i));

    }

    var mkey = [];
    for (var i = 0; i < key.length; ++i) {
        mkey.push(key.charCodeAt(i));
    }
    var result = calculate(mtxt, mkey);
    var rs = '';
    for (var i = 0; i < result.length; i++) {
        rs += String.fromCharCode(result[i]);
    }
    return rs;

};


function calculate(plaintxt, psw) {
    Initialize(psw);
    var i = 0;
    var j = 0;
    var len = plaintxt.length;
    var cipher = [];
    var k;
    var temp, cipherby;
    for (var a = 0; a < len; a++) {
        i = (i + 1) % 255;
        j = (j + sbox[i]) % 255;
        temp = sbox[i];
        sbox[i] = sbox[j];
        sbox[j] = temp;
        var idx = (sbox[i] + sbox[j]) % 255;
        k = sbox[idx];
        cipherby = (plaintxt[a] ^ k);
        cipher[a] = cipherby;
    }
    return cipher;
}
function Initialize(pwd) {
    var b = 0;
    var tempSwap;
    var intLength = pwd.length;

    for (var a = 0; a < 255; a++) {
        mykey[a] = pwd[(a % intLength)];
        sbox[a] = a;
    }

    for (var a = 0; a < 255; a++) {
        b = ((b + sbox[a] + mykey[a]) % 255);
        tempSwap = sbox[a];
        sbox[a] = sbox[b];
        sbox[b] = tempSwap;
    }
}
function CharsToHex(chars) {

    var result = "";
    var len = chars.length;
    for (var i = 0; i < len; i++) {
        result += chars[i].toString(16);
    }

    return result;
}
function HexToChars(hex) {
    var hex = hex.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
