/**
 * Created by ngocnpt on 10/08/2017.
 */
const clipboardy = require('clipboardy');
const encrytion = require('../SharedModule/encrytion');
var releaseConfig = require('./releaseConfig');


var foxSay = releaseConfig.FoxSay;
var startConfig = {
    s: 'abc',
    k: releaseConfig.Key,
    i: releaseConfig.IV
};
startConfig.s = clipboardy.readSync().toString().trim();
var che = encrytion.sha256(startConfig.s + foxSay);
console.log("che ", che);
var binary = encrytion.aesEncryptIV(JSON.stringify({
    k: startConfig.k,
    i: startConfig.i
}), che, che);
clipboardy.writeSync(binary.toString());

console.log(binary);
//

//
//
// // Paste
// console.log(clipboardy.readSync());
