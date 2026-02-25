/**
 * Created by ngocnpt on 10/08/2017.
 */
var fs = require('fs');
const zlib = require('zlib');
var encrytion = require('./encrytion');
function zipFile(binary) {
    return zlib.gzipSync(binary);
}
function unZip(binary) {
   return zlib.unzipSync(binary);
}
function requireFromString(src, filename) {
    var Module = module.constructor;
    var m = new Module();
    m._compile(src, filename);
    return m.exports;
}

function requireFromZip(binary,filename) {
    return requireFromString(unZip(binary).toString(),filename);
}

function zipFileWithPass(fileName,key,iv,newFilename) {
    var binary = fs.readFileSync(fileName);
    binary = zipFile(binary);
    binary = encrytion.aesEncryptIV(binary,key,iv);
    fs.writeFileSync(newFilename,binary);
}

function requireZipWithPass(filename,key,iv) {
    var binary = fs.readFileSync(filename);
    binary = encrytion.aesDecryptIV(binary,key,iv);
    return requireFromZip(binary,filename);
}

function unZipWithPass(filename,key,iv) {
    var binary = fs.readFileSync(filename);
    console.log(binary);
    binary = encrytion.aesDecryptIV(binary,key,iv);

    return unZip(binary).toString();
}

exports.zipFileWithPass = zipFileWithPass;
exports.requireZipWithPass = requireZipWithPass;
exports.unZipWithPass = unZipWithPass;
