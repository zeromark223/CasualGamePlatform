var config = require('./config');
var fs = require('fs');
if (!fs.copyFileSync) {
    console.log("Not Support this Node Version");
    process.exit(0);
}
var path = require('path');
var allFileInDir = fs.readdirSync(config.ScanDir);
//add full path
var scanDirFull = path.resolve(config.ScanDir);
var allFindDir = [];
for (var i = 0; i < allFileInDir.length; i++) {
    var p = path.join(scanDirFull, allFileInDir[i]);
    if (fs.lstatSync(p).isDirectory()) {
        console.log(p);
        var d = path.join(p, config.DestFolder);
        if (fs.existsSync(d)) {
            allFindDir.push(d);
        }
    }
}

if (config.IsRemoveFirst) {
    for (var i = 0; i < allFindDir.length; i++) {
        deleteAllFileInDir(allFindDir[i]);
    }
    console.log("Delete Completed");
}
var scrDir = path.resolve(config.SrcFolder);
for (var i = 0; i < allFindDir.length; i++) {
    copyAllFileDir2Dir(scrDir, allFindDir[i]);
}
console.log("Copy Completed");
console.log("Done !");

function deleteAllFileInDir(dirPath) {
    var list = fs.readdirSync(dirPath);
    for (var i = 0; i < list.length; i++) {
        fs.unlinkSync(path.join(dirPath, list[i]));
    }
}

function copyAllFileDir2Dir(scr, dst) {
    var list = fs.readdirSync(scr);
    for (var i = 0; i < list.length; i++) {

        if (fs.lstatSync(path.join(scr, list[i])).isDirectory()) {
            if (!fs.existsSync(path.join(dst, list[i]))) {
                fs.mkdirSync(path.join(dst, list[i]));
            }
            copyAllFileDir2Dir(path.join(scr, list[i]), path.join(dst, list[i]));
        } else {
            fs.copyFileSync(path.join(scr, list[i]), path.join(dst, list[i]));
        }

    }
}
